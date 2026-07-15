/**
 * CORE-CANDIDATE — server only
 * LOCAL DELTA (ISO): passes responseFormat json_object + temperature 0 for OpenAI structured answers.
 */
import { anthropicAdapter } from "../providers/anthropic-adapter";
import { geminiAdapter } from "../providers/gemini-adapter";
import { openaiAdapter } from "../providers/openai-adapter";
import type { AiProvider } from "../types/access-mode";
import type { AiRequest, AiResult, NormalizedMessage } from "../types/provider";

export function getServerApiKey(provider: AiProvider): string {
  const key =
    provider === "openai"
      ? process.env.OPENAI_API_KEY
      : provider === "anthropic"
        ? process.env.ANTHROPIC_API_KEY
        : process.env.GOOGLE_API_KEY;
  if (!key?.trim()) {
    throw Object.assign(
      new Error(`Server API key for ${provider} is not configured`),
      { status: 503, body: "provider_secret_missing" },
    );
  }
  return key.trim();
}

export async function runServerProviderRequest(input: {
  provider: AiProvider;
  model: string;
  systemPrompt: string;
  messages: NormalizedMessage[];
  maxOutputTokens: number;
  /** ISO structured JSON (OpenAI). */
  responseFormat?: { type: "json_object" };
  temperature?: number;
}): Promise<AiResult> {
  const apiKey = getServerApiKey(input.provider);
  const request: AiRequest = {
    accessMode: "managed-trial",
    provider: input.provider,
    apiKey,
    model: input.model,
    systemPrompt: input.systemPrompt,
    messages: input.messages,
    maxOutputTokens: input.maxOutputTokens,
    responseFormat: input.responseFormat,
    temperature: input.temperature,
  };

  switch (input.provider) {
    case "openai":
      return openaiAdapter({
        ...request,
        responseFormat: input.responseFormat ?? { type: "json_object" },
        temperature: input.temperature ?? 0,
      });
    case "anthropic":
      return anthropicAdapter(request);
    case "google":
      return geminiAdapter(request);
    default: {
      const _e: never = input.provider;
      throw new Error(`Unsupported provider: ${_e}`);
    }
  }
}
