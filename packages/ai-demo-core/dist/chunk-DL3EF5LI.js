import {
  normalizeUsage
} from "./chunk-XOUQUE6R.js";

// providers/anthropic-adapter.ts
var ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
var DEFAULT_MAX_TOKENS = 2048;
async function anthropicAdapter(request) {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }
  const maxTokens = request.maxOutputTokens ?? DEFAULT_MAX_TOKENS;
  const body = {
    model: request.model,
    max_tokens: maxTokens,
    system: request.systemPrompt,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  };
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": request.apiKey,
      "anthropic-version": "2023-06-01",
      // Appendix C-1: required for browser direct
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body)
  });
  const rawText = await res.text();
  let json = {};
  try {
    json = JSON.parse(rawText);
  } catch {
    json = { raw: rawText };
  }
  if (!res.ok) {
    throw Object.assign(new Error("Anthropic request failed"), {
      status: res.status,
      body: rawText.slice(0, 2e3)
    });
  }
  const content = json.content;
  const text = content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("") ?? "";
  return {
    text,
    provider: "anthropic",
    model: request.model,
    usage: normalizeUsage("anthropic", json.usage),
    providerRequestId: typeof json.id === "string" ? json.id : void 0
  };
}
async function anthropicConnectionTest(apiKey, model) {
  return anthropicAdapter({
    accessMode: "byok-direct",
    provider: "anthropic",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16
  });
}

export {
  anthropicAdapter,
  anthropicConnectionTest
};
//# sourceMappingURL=chunk-DL3EF5LI.js.map