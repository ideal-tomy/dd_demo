import {
  normalizeUsage
} from "./chunk-XOUQUE6R.js";

// providers/openai-adapter.ts
var OPENAI_URL = "https://api.openai.com/v1/chat/completions";
async function openaiAdapter(request) {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }
  const body = {
    model: request.model,
    messages: [
      { role: "system", content: request.systemPrompt },
      ...request.messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    ],
    max_completion_tokens: request.maxOutputTokens ?? 2048
  };
  if (request.responseFormat) {
    body.response_format = request.responseFormat;
  }
  if (request.temperature !== void 0) {
    body.temperature = request.temperature;
  }
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${request.apiKey}`
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
    throw Object.assign(new Error("OpenAI request failed"), {
      status: res.status,
      body: rawText.slice(0, 2e3)
    });
  }
  const choices = json.choices;
  const text = choices?.[0]?.message?.content ?? "";
  return {
    text,
    provider: "openai",
    model: request.model,
    usage: normalizeUsage("openai", json.usage),
    providerRequestId: typeof json.id === "string" ? json.id : void 0
  };
}
async function openaiConnectionTest(apiKey, model) {
  return openaiAdapter({
    accessMode: "byok-direct",
    provider: "openai",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16
  });
}

export {
  openaiAdapter,
  openaiConnectionTest
};
//# sourceMappingURL=chunk-D5NX4H3Q.js.map