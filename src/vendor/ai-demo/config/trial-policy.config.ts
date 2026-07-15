/**
 * Phase 1.5 Managed Trial policy — Source of Truth for Gateway limits.
 * Phase 2: Managed Trial is OpenAI-only (BYOK may still use other providers).
 */
// CORE-CANDIDATE
import type { TrialPolicy } from "../types/trial";
import type { AiProvider } from "../types/access-mode";

export const trialPolicyConfig: TrialPolicy = {
  validityDays: 7,
  maxRequests: 10,
  publicBudgetLabelJpy: 500,
  hardCapJpy: 500,
  knowledgeCharLimit: 30000,
  estimatedInputTokenLimit: 40000,
  maxOutputTokens: 2000,
  rateLimitPerMinute: 5,
  maxConcurrency: 1,
  allowedProviders: ["openai"],
  allowedModels: ["gpt-5.4-nano", "gpt-5-nano"],
};

/** Trial always uses OpenAI regardless of env overrides for other providers. */
export function getTrialDefaultProvider(): AiProvider {
  return "openai";
}

export function getTrialDefaultModel(): string {
  const model = process.env.TRIAL_DEFAULT_MODEL || "gpt-5.4-nano";
  if (trialPolicyConfig.allowedModels.includes(model)) return model;
  return "gpt-5.4-nano";
}

export const managedTrialDesignNotes = {
  phase: "1.5",
  storeBodies: false as const,
  hardCapSourceOfTruth: "gateway",
  providerBudgetIsNotHardCap: true,
  persistence: "upstash-redis",
  trialProviders: "openai-only" as const,
};
