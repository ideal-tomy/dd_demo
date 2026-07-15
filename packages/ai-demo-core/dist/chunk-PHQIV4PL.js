import {
  anthropicAdapter
} from "./chunk-DL3EF5LI.js";
import {
  geminiAdapter
} from "./chunk-BRJXLYY7.js";
import {
  openaiAdapter
} from "./chunk-D5NX4H3Q.js";

// trial/server-adapters.ts
function getServerApiKey(provider) {
  const key = provider === "openai" ? process.env.OPENAI_API_KEY : provider === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.GOOGLE_API_KEY;
  if (!key?.trim()) {
    throw Object.assign(
      new Error(`Server API key for ${provider} is not configured`),
      { status: 503, body: "provider_secret_missing" }
    );
  }
  return key.trim();
}
async function runServerProviderRequest(input) {
  const apiKey = getServerApiKey(input.provider);
  const request = {
    accessMode: "managed-trial",
    provider: input.provider,
    apiKey,
    model: input.model,
    systemPrompt: input.systemPrompt,
    messages: input.messages,
    maxOutputTokens: input.maxOutputTokens,
    responseFormat: input.responseFormat,
    temperature: input.temperature
  };
  switch (input.provider) {
    case "openai":
      return openaiAdapter(request);
    case "anthropic":
      return anthropicAdapter(request);
    case "google":
      return geminiAdapter(request);
    default: {
      const _e = input.provider;
      throw new Error(`Unsupported provider: ${_e}`);
    }
  }
}

export {
  getServerApiKey,
  runServerProviderRequest
};
//# sourceMappingURL=chunk-PHQIV4PL.js.map