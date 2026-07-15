import {
  normalizeUsage
} from "./chunk-XOUQUE6R.js";

// providers/gemini-adapter.ts
function geminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}
async function geminiAdapter(request) {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }
  const contents = request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const body = {
    systemInstruction: {
      parts: [{ text: request.systemPrompt }]
    },
    contents,
    generationConfig: {
      maxOutputTokens: request.maxOutputTokens ?? 2048
    }
  };
  const res = await fetch(geminiUrl(request.model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": request.apiKey
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
    throw Object.assign(new Error("Gemini request failed"), {
      status: res.status,
      body: rawText.slice(0, 2e3)
    });
  }
  const candidates = json.candidates;
  const text = candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return {
    text,
    provider: "google",
    model: request.model,
    usage: normalizeUsage("google", {
      usageMetadata: json.usageMetadata
    }),
    providerRequestId: void 0
  };
}
async function geminiConnectionTest(apiKey, model) {
  return geminiAdapter({
    accessMode: "byok-direct",
    provider: "google",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16
  });
}

export {
  geminiAdapter,
  geminiConnectionTest
};
//# sourceMappingURL=chunk-BRJXLYY7.js.map