// CORE-CANDIDATE
import { byokDirectTransport } from "./access-mode-transport";
import {
  fetchTrialStatus,
  managedTrialTransport,
} from "./managed-trial-transport";
import { normalizeError } from "./error-normalizer";
import type { AiRequest, AiResult } from "../types/provider";
import type { NormalizedError } from "../types/errors";
import type { TrialPublicStatus } from "../types/trial";

export class AiTransportError extends Error {
  normalized: NormalizedError;
  constructor(normalized: NormalizedError) {
    super(normalized.userMessage);
    this.name = "AiTransportError";
    this.normalized = normalized;
  }
}

export type SendAiRequestExtra = {
  trialCode?: string;
  knowledgeCharCount?: number;
  estimatedInputTokens?: number;
};

export type SendAiResult = AiResult & {
  costJpyOverride?: number | null;
  trialStatus?: Pick<
    TrialPublicStatus,
    "remainingRequests" | "expiresAt" | "spentJpy" | "maxRequests" | "hardCapJpy"
  >;
};

/**
 * UI must call this — never call Provider SDKs / fetch directly from components.
 */
export async function sendAiRequest(
  request: AiRequest,
  extra?: SendAiRequestExtra,
): Promise<SendAiResult> {
  try {
    if (request.accessMode === "byok-direct") {
      return await byokDirectTransport(request);
    }

    if (request.accessMode === "managed-trial") {
      if (!extra?.trialCode) {
        throw Object.assign(new Error("Trial code required"), {
          status: 401,
          body: "trial_code_missing",
        });
      }
      const result = await managedTrialTransport({
        trialCode: extra.trialCode,
        provider: request.provider,
        model: request.model,
        systemPrompt: request.systemPrompt,
        messages: request.messages,
        knowledgeCharCount: extra.knowledgeCharCount ?? 0,
        estimatedInputTokens: extra.estimatedInputTokens ?? 0,
      });
      return {
    text: result.text,
    provider: result.provider,
    model: result.model,
    usage: result.usage,
    costJpyOverride: result.trialMeta.costJpy,
    trialStatus: {
      remainingRequests: result.trialMeta.remainingRequests,
      expiresAt: result.trialMeta.expiresAt,
      spentJpy: result.trialMeta.spentJpy,
      maxRequests: result.trialMeta.maxRequests,
      hardCapJpy: result.trialMeta.hardCapJpy,
    },
  };
    }

    throw Object.assign(
      new Error(`Access mode "${request.accessMode}" is not implemented`),
      { status: 501, body: "client-proxy not available yet" },
    );
  } catch (error) {
    if (error instanceof AiTransportError) throw error;
    throw new AiTransportError(normalizeError(request.provider, error));
  }
}

export async function testConnection(
  request: Pick<AiRequest, "provider" | "apiKey" | "model">,
): Promise<{ ok: true; result: AiResult } | { ok: false; error: NormalizedError }> {
  try {
    const result = await sendAiRequest({
      accessMode: "byok-direct",
      provider: request.provider,
      apiKey: request.apiKey,
      model: request.model,
      systemPrompt: "Reply with OK only.",
      messages: [{ role: "user", content: "ping" }],
      maxOutputTokens: 16,
    });
    return { ok: true, result };
  } catch (e) {
    if (e instanceof AiTransportError) {
      return { ok: false, error: e.normalized };
    }
    return {
      ok: false,
      error: normalizeError(request.provider, e),
    };
  }
}

/** Trial mode: validate code via status API (no Provider charge). */
export async function testTrialConnection(
  trialCode: string,
  provider: AiRequest["provider"],
): Promise<
  | { ok: true; status: TrialPublicStatus }
  | { ok: false; error: NormalizedError }
> {
  try {
    const status = await fetchTrialStatus(trialCode);
    if (!status.valid) {
      return {
        ok: false,
        error: {
          code: "AUTH_ERROR",
          provider,
          userMessage: status.message ?? "体験コードを確認できませんでした。",
          recommendedAction: "コードの入力ミスや期限・失効がないか確認してください。",
        },
      };
    }
    return { ok: true, status };
  } catch (e) {
    if (e instanceof AiTransportError) {
      return { ok: false, error: e.normalized };
    }
    return { ok: false, error: normalizeError(provider, e) };
  }
}
