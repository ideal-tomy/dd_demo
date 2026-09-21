import { AiProvider, AccessMode } from './access-mode.js';

type AllowedModel = {
    id: string;
    label: string;
    description: string;
    tier: "recommended" | "low_cost" | "higher_quality";
};
type ProviderConfig = {
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
type NormalizedMessage = {
    role: "user" | "assistant";
    content: string;
};
type NormalizedUsage = {
    inputTokens: number | null;
    outputTokens: number | null;
    cachedInputTokens: number | null;
    totalTokens: number | null;
    raw?: unknown;
};
type AiRequest = {
    accessMode: AccessMode;
    provider: AiProvider;
    apiKey?: string;
    model: string;
    systemPrompt: string;
    messages: NormalizedMessage[];
    maxOutputTokens?: number;
    /** OpenAI json_object mode for structured answers. */
    responseFormat?: {
        type: "json_object";
    };
    /** Sampling temperature. */
    temperature?: number;
    /**
     * OpenAI reasoning models (gpt-5-nano 等).
     * Without this, reasoning can consume the entire max_completion_tokens budget
     * and leave message.content empty.
     */
    reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
};
type AiResult = {
    text: string;
    provider: AiProvider;
    model: string;
    usage: NormalizedUsage;
    providerRequestId?: string;
};

export type { AiRequest, AiResult, AllowedModel, NormalizedMessage, NormalizedUsage, ProviderConfig };
