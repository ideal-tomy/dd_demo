// CORE-CANDIDATE — client transport for managed-trial
import type { AiProvider } from "../types/access-mode";
import type { AiResult, NormalizedMessage } from "../types/provider";
import type { TrialAskResponse, TrialPublicStatus } from "../types/trial";

export type ManagedTrialRequest = {
  trialCode: string;
  provider: AiProvider;
  model: string;
  systemPrompt: string;
  messages: NormalizedMessage[];
  knowledgeCharCount: number;
  estimatedInputTokens: number;
};

export async function fetchTrialStatus(
  trialCode: string,
): Promise<TrialPublicStatus> {
  const res = await fetch("/api/trial/status", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${trialCode}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data?.error?.message ?? "status failed"), {
      status: res.status,
      body: JSON.stringify(data?.error ?? {}),
    });
  }
  return data as TrialPublicStatus;
}

export async function managedTrialTransport(
  request: ManagedTrialRequest,
): Promise<
  AiResult & {
    trialMeta: Omit<TrialAskResponse, "text" | "usage" | "provider" | "model">;
  }
> {
  const res = await fetch("/api/trial/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${request.trialCode}`,
    },
    body: JSON.stringify({
      provider: request.provider,
      model: request.model,
      systemPrompt: request.systemPrompt,
      messages: request.messages,
      knowledgeCharCount: request.knowledgeCharCount,
      estimatedInputTokens: request.estimatedInputTokens,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data?.error?.message ?? "trial ask failed"), {
      status: res.status,
      body: JSON.stringify(data?.error ?? {}),
    });
  }

  const result = data as TrialAskResponse;
  return {
    text: result.text,
    provider: result.provider,
    model: result.model,
    usage: result.usage,
    trialMeta: {
      costJpy: result.costJpy,
      remainingRequests: result.remainingRequests,
      maxRequests: result.maxRequests,
      expiresAt: result.expiresAt,
      spentJpy: result.spentJpy,
      hardCapJpy: result.hardCapJpy,
    },
  };
}
