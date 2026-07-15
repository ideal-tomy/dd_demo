// CORE-CANDIDATE — server only
import {
  getTrialDefaultModel,
  getTrialDefaultProvider,
} from "../config/trial-policy.config";
import { calculateCost } from "../demo-core/pricing";
import { normalizeError } from "../demo-core/error-normalizer";
import {
  acquireConcurrencyLock,
  releaseConcurrencyLock,
} from "./concurrency-lock";
import { checkAndIncrementRateLimit } from "./rate-limiter";
import { runServerProviderRequest } from "./server-adapters";
import {
  estimateMaxCostJpy,
  releaseReservation,
  reserveSpend,
  settleSpend,
} from "./spend-reservation";
import {
  getTrialRecord,
  saveTrialRecord,
  toPublicStatus,
  validateTrialState,
  type TrialRejectCode,
} from "./trial-validator";
import { appendLedger } from "./usage-ledger";
import type { AiProvider } from "../types/access-mode";
import type {
  TrialAskRequestBody,
  TrialAskResponse,
  TrialPublicStatus,
  TrialRecord,
} from "../types/trial";

export class TrialGatewayError extends Error {
  code: TrialRejectCode;
  status: number;
  constructor(code: TrialRejectCode, message: string, status = 403) {
    super(message);
    this.name = "TrialGatewayError";
    this.code = code;
    this.status = status;
  }
}

function resolveProviderModel(
  record: TrialRecord,
  requested?: { provider?: AiProvider; model?: string },
): { provider: AiProvider; model: string } {
  const defaultProvider = getTrialDefaultProvider();
  const defaultModel = getTrialDefaultModel();
  let provider = requested?.provider ?? defaultProvider;
  let model = requested?.model ?? defaultModel;

  if (!record.policy.allowedProviders.includes(provider)) {
    provider = defaultProvider;
  }
  if (!record.policy.allowedProviders.includes(provider)) {
    throw new TrialGatewayError(
      "ALLOWLIST",
      "利用可能なAIが設定されていません。",
      503,
    );
  }
  if (!record.policy.allowedModels.includes(model)) {
    // Fall back to first allowed model for resolved provider, or default
    const forProvider = record.policy.allowedModels.filter((m) => {
      if (provider === "openai") return m.startsWith("gpt-");
      if (provider === "anthropic") return m.startsWith("claude-");
      return m.startsWith("gemini-");
    });
    model = forProvider[0] ?? record.policy.allowedModels[0] ?? defaultModel;
  }
  if (!record.policy.allowedModels.includes(model)) {
    throw new TrialGatewayError(
      "ALLOWLIST",
      "利用可能なモデルが設定されていません。",
      503,
    );
  }
  return { provider, model };
}

export async function getTrialStatusForCode(
  codeHash: string,
): Promise<TrialPublicStatus> {
  const record = await getTrialRecord(codeHash);
  const validated = validateTrialState(record);
  if (!validated.ok) {
    return {
      valid: false,
      remainingRequests: 0,
      maxRequests: record?.policy.maxRequests ?? 0,
      expiresAt: record?.expiresAt ?? "",
      spentJpy: record?.spentJpy ?? 0,
      hardCapJpy: record?.policy.hardCapJpy ?? 0,
      revoked: validated.code === "REVOKED",
      expired: validated.code === "EXPIRED",
      message: validated.message,
      label: record?.label,
    };
  }
  const pub = toPublicStatus(validated.record);
  return {
    valid: true,
    ...pub,
  };
}

export async function executeTrialAsk(
  codeHash: string,
  body: TrialAskRequestBody,
): Promise<TrialAskResponse> {
  let record = await getTrialRecord(codeHash);
  const validated = validateTrialState(record);
  if (!validated.ok) {
    throw new TrialGatewayError(validated.code, validated.message);
  }
  record = validated.record;

  if (record.requestCount >= record.policy.maxRequests) {
    throw new TrialGatewayError(
      "REQUEST_LIMIT",
      "体験の利用回数上限に達しました。",
    );
  }

  const rpm = await checkAndIncrementRateLimit(
    codeHash,
    record.policy.rateLimitPerMinute,
  );
  if (!rpm.ok) {
    throw new TrialGatewayError("RATE_LIMIT", rpm.message, 429);
  }

  const lock = await acquireConcurrencyLock(codeHash);
  if (!lock.ok) {
    throw new TrialGatewayError("CONCURRENCY", lock.message, 429);
  }

  let reservedJpy = 0;
  try {
    if (body.knowledgeCharCount > record.policy.knowledgeCharLimit) {
      throw new TrialGatewayError(
        "KNOWLEDGE_LIMIT",
        `ナレッジは${record.policy.knowledgeCharLimit.toLocaleString()}文字以内にしてください。`,
      );
    }
    if (body.estimatedInputTokens > record.policy.estimatedInputTokenLimit) {
      throw new TrialGatewayError(
        "INPUT_TOKEN_LIMIT",
        "入力量の上限を超えています。ナレッジや会話を短くしてください。",
      );
    }

    const { provider, model } = resolveProviderModel(record, {
      provider: body.provider,
      model: body.model,
    });

    const maxOut = record.policy.maxOutputTokens;
    const reserveAmount = estimateMaxCostJpy(
      provider,
      model,
      body.estimatedInputTokens,
      maxOut,
    );

    const reserved = await reserveSpend(record, reserveAmount);
    if (!reserved.ok) {
      throw new TrialGatewayError("HARD_CAP", reserved.message);
    }
    record = reserved.record;
    reservedJpy = reserved.reservedJpy;

    // Fresh check hard cap after reserve
    if (record.spentJpy >= record.policy.hardCapJpy) {
      record = await releaseReservation(record, reservedJpy);
      reservedJpy = 0;
      throw new TrialGatewayError(
        "HARD_CAP",
        "利用枠（金額上限）に達したため、これ以上ご利用いただけません。",
      );
    }

    let result;
    try {
      result = await runServerProviderRequest({
        provider,
        model,
        systemPrompt: body.systemPrompt,
        messages: body.messages,
        maxOutputTokens: maxOut,
        // LOCAL DELTA (ISO): structured JSON for ConformSystem answers
        responseFormat: { type: "json_object" },
        temperature: 0,
      });
    } catch (providerError) {
      const norm = normalizeError(provider, providerError);
      // If we somehow have usage on error object, ignore — adapters throw without usage
      record = await settleSpend(record, reservedJpy, 0);
      reservedJpy = 0;
      await appendLedger(codeHash, {
        at: new Date().toISOString(),
        status: "error",
        provider,
        model,
        errorCode: norm.code,
      });
      throw new TrialGatewayError(
        "CONFIG",
        norm.userMessage,
        502,
      );
    }

    const cost = calculateCost(provider, model, result.usage);
    const actualJpy = cost.jpy ?? 0;
    record = await settleSpend(record, reservedJpy, actualJpy);
    reservedJpy = 0;

    record = {
      ...record,
      requestCount: record.requestCount + 1,
    };
    await saveTrialRecord(record);

    await appendLedger(codeHash, {
      at: new Date().toISOString(),
      status: "success",
      provider,
      model,
      usage: result.usage,
      costJpy: cost.jpy,
    });

    const pub = toPublicStatus(record);
    return {
      text: result.text,
      provider,
      model,
      usage: result.usage,
      costJpy: cost.jpy,
      remainingRequests: pub.remainingRequests,
      maxRequests: pub.maxRequests,
      expiresAt: pub.expiresAt,
      spentJpy: pub.spentJpy,
      hardCapJpy: pub.hardCapJpy,
    };
  } catch (e) {
    if (reservedJpy > 0) {
      try {
        const fresh = await getTrialRecord(codeHash);
        if (fresh) await releaseReservation(fresh, reservedJpy);
      } catch {
        /* ignore */
      }
    }
    if (e instanceof TrialGatewayError) {
      await appendLedger(codeHash, {
        at: new Date().toISOString(),
        status: "rejected",
        errorCode: e.code,
      }).catch(() => undefined);
    }
    throw e;
  } finally {
    await releaseConcurrencyLock(codeHash).catch(() => undefined);
  }
}
