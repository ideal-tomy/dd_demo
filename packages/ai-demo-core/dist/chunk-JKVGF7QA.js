import {
  checkAndIncrementRateLimit
} from "./chunk-YXYG6IKU.js";
import {
  runServerProviderRequest
} from "./chunk-PHQIV4PL.js";
import {
  estimateMaxCostJpy,
  releaseReservation,
  reserveSpend,
  settleSpend
} from "./chunk-TTPM5RV3.js";
import {
  appendLedger
} from "./chunk-R6DXPPGN.js";
import {
  getTrialRecord,
  saveTrialRecord,
  toPublicStatus,
  validateTrialState
} from "./chunk-3ZYPPO5O.js";
import {
  acquireConcurrencyLock,
  releaseConcurrencyLock
} from "./chunk-XZI6ZOZX.js";
import {
  getTrialDefaultModel,
  getTrialDefaultProvider
} from "./chunk-OSAU4LDY.js";
import {
  calculateCost,
  normalizeError
} from "./chunk-NC6D7SM7.js";

// trial/gateway.ts
var TrialGatewayError = class extends Error {
  code;
  status;
  constructor(code, message, status = 403) {
    super(message);
    this.name = "TrialGatewayError";
    this.code = code;
    this.status = status;
  }
};
function resolveProviderModel(record, requested) {
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
      "\u5229\u7528\u53EF\u80FD\u306AAI\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
      503
    );
  }
  if (!record.policy.allowedModels.includes(model)) {
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
      "\u5229\u7528\u53EF\u80FD\u306A\u30E2\u30C7\u30EB\u304C\u8A2D\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002",
      503
    );
  }
  return { provider, model };
}
async function getTrialStatusForCode(codeHash) {
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
      label: record?.label
    };
  }
  const pub = toPublicStatus(validated.record);
  return {
    valid: true,
    ...pub
  };
}
async function executeTrialAsk(codeHash, body) {
  let record = await getTrialRecord(codeHash);
  const validated = validateTrialState(record);
  if (!validated.ok) {
    throw new TrialGatewayError(validated.code, validated.message);
  }
  record = validated.record;
  if (record.requestCount >= record.policy.maxRequests) {
    throw new TrialGatewayError(
      "REQUEST_LIMIT",
      "\u4F53\u9A13\u306E\u5229\u7528\u56DE\u6570\u4E0A\u9650\u306B\u9054\u3057\u307E\u3057\u305F\u3002"
    );
  }
  const rpm = await checkAndIncrementRateLimit(
    codeHash,
    record.policy.rateLimitPerMinute
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
        `\u30CA\u30EC\u30C3\u30B8\u306F${record.policy.knowledgeCharLimit.toLocaleString()}\u6587\u5B57\u4EE5\u5185\u306B\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
      );
    }
    if (body.estimatedInputTokens > record.policy.estimatedInputTokenLimit) {
      throw new TrialGatewayError(
        "INPUT_TOKEN_LIMIT",
        "\u5165\u529B\u91CF\u306E\u4E0A\u9650\u3092\u8D85\u3048\u3066\u3044\u307E\u3059\u3002\u30CA\u30EC\u30C3\u30B8\u3084\u4F1A\u8A71\u3092\u77ED\u304F\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    }
    const { provider, model } = resolveProviderModel(record, {
      provider: body.provider,
      model: body.model
    });
    const maxOut = record.policy.maxOutputTokens;
    const reserveAmount = estimateMaxCostJpy(
      provider,
      model,
      body.estimatedInputTokens,
      maxOut
    );
    const reserved = await reserveSpend(record, reserveAmount);
    if (!reserved.ok) {
      throw new TrialGatewayError("HARD_CAP", reserved.message);
    }
    record = reserved.record;
    reservedJpy = reserved.reservedJpy;
    if (record.spentJpy >= record.policy.hardCapJpy) {
      record = await releaseReservation(record, reservedJpy);
      reservedJpy = 0;
      throw new TrialGatewayError(
        "HARD_CAP",
        "\u5229\u7528\u67A0\uFF08\u91D1\u984D\u4E0A\u9650\uFF09\u306B\u9054\u3057\u305F\u305F\u3081\u3001\u3053\u308C\u4EE5\u4E0A\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u305B\u3093\u3002"
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
        responseFormat: body.responseFormat,
        temperature: body.temperature
      });
    } catch (providerError) {
      const norm = normalizeError(provider, providerError);
      record = await settleSpend(record, reservedJpy, 0);
      reservedJpy = 0;
      await appendLedger(codeHash, {
        at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "error",
        provider,
        model,
        errorCode: norm.code
      });
      throw new TrialGatewayError(
        "CONFIG",
        norm.userMessage,
        502
      );
    }
    const cost = calculateCost(provider, model, result.usage);
    const actualJpy = cost.jpy ?? 0;
    record = await settleSpend(record, reservedJpy, actualJpy);
    reservedJpy = 0;
    record = {
      ...record,
      requestCount: record.requestCount + 1
    };
    await saveTrialRecord(record);
    await appendLedger(codeHash, {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "success",
      provider,
      model,
      usage: result.usage,
      costJpy: cost.jpy
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
      hardCapJpy: pub.hardCapJpy
    };
  } catch (e) {
    if (reservedJpy > 0) {
      try {
        const fresh = await getTrialRecord(codeHash);
        if (fresh) await releaseReservation(fresh, reservedJpy);
      } catch {
      }
    }
    if (e instanceof TrialGatewayError) {
      await appendLedger(codeHash, {
        at: (/* @__PURE__ */ new Date()).toISOString(),
        status: "rejected",
        errorCode: e.code
      }).catch(() => void 0);
    }
    throw e;
  } finally {
    await releaseConcurrencyLock(codeHash).catch(() => void 0);
  }
}

export {
  TrialGatewayError,
  getTrialStatusForCode,
  executeTrialAsk
};
//# sourceMappingURL=chunk-JKVGF7QA.js.map