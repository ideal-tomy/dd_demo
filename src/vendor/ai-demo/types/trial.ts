/**
 * Phase 1.5 Managed Trial types
 */
import type { AiProvider, AccessMode } from "./access-mode";
import type { NormalizedUsage } from "./provider";

export type TrialPolicy = {
  validityDays: number;
  maxRequests: number;
  publicBudgetLabelJpy: number;
  hardCapJpy: number;
  knowledgeCharLimit: number;
  estimatedInputTokenLimit: number;
  maxOutputTokens: number;
  rateLimitPerMinute: number;
  maxConcurrency: number;
  allowedProviders: AiProvider[];
  allowedModels: string[];
};

export type TrialCodeFlow = {
  /** Client receives only the trial code, never Provider secrets. */
  credentialType: "trial-code";
  storageRecommendation: "hash-at-rest";
  revokeable: true;
};

export type TrialLedgerMetadata = {
  /** Standard policy: do NOT store request body, knowledge, or answer text. */
  storeBodies: false;
  storeUsage: true;
  storeCost: true;
  storeStatus: true;
};

/** Redis-persisted trial record (no plaintext code, no bodies). */
export type TrialRecord = {
  codeHash: string;
  label: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  requestCount: number;
  spentJpy: number;
  reservedJpy: number;
  policy: TrialPolicy;
};

export type TrialLedgerEntry = {
  at: string;
  status: "success" | "error" | "rejected";
  provider?: AiProvider;
  model?: string;
  usage?: NormalizedUsage;
  costJpy?: number | null;
  errorCode?: string;
  /** Never store bodies — metadata only */
};

export type TrialPublicStatus = {
  valid: boolean;
  label?: string;
  remainingRequests: number;
  maxRequests: number;
  expiresAt: string;
  spentJpy: number;
  hardCapJpy: number;
  revoked: boolean;
  expired: boolean;
  message?: string;
};

export type TrialAskRequestBody = {
  provider?: AiProvider;
  model?: string;
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  knowledgeCharCount: number;
  estimatedInputTokens: number;
};

export type TrialAskResponse = {
  text: string;
  provider: AiProvider;
  model: string;
  usage: NormalizedUsage;
  costJpy: number | null;
  remainingRequests: number;
  maxRequests: number;
  expiresAt: string;
  spentJpy: number;
  hardCapJpy: number;
};

export type StudioAccessMode = Extract<AccessMode, "byok-direct" | "managed-trial">;
