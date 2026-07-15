import type { AiProvider } from "./access-mode";

// PROVIDER-SPECIFIC types — copied from AI-Demo-Studio (Phase 3 minimal)
// LOCAL DELTA vs Studio: responseFormat / temperature for ISO structured JSON.

export type AllowedModel = {
  id: string;
  label: string;
  description: string;
  tier: "recommended" | "low_cost" | "higher_quality";
};

export type ProviderConfig = {
  id: AiProvider;
  displayName: string;
  enabled: boolean;
  browserDirectAvailable: boolean;
  browserDirectNote?: string;
  defaultModel: string;
  allowedModels: AllowedModel[];
  apiKeyHint: string;
  apiKeyHelpUrl?: string;
  promptOverride?: string;
};

export type NormalizedMessage = {
  role: "user" | "assistant";
  content: string;
};

export type NormalizedUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  totalTokens: number | null;
  raw?: unknown;
};

export type AiRequest = {
  accessMode: import("./access-mode").AccessMode;
  provider: AiProvider;
  apiKey?: string;
  model: string;
  systemPrompt: string;
  messages: NormalizedMessage[];
  maxOutputTokens?: number;
  /** LOCAL DELTA (ISO): OpenAI json_object mode. Candidate for Studio reverse-merge. */
  responseFormat?: { type: "json_object" };
  /** LOCAL DELTA (ISO): sampling temperature. Candidate for Studio reverse-merge. */
  temperature?: number;
};

export type AiResult = {
  text: string;
  provider: AiProvider;
  model: string;
  usage: NormalizedUsage;
  providerRequestId?: string;
};
