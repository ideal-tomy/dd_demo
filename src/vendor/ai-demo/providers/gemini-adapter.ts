// PROVIDER-SPECIFIC
import { normalizeUsage } from "../demo-core/usage-normalizer";
import type { AiRequest, AiResult } from "../types/provider";

/**
 * Appendix C-2: Use x-goog-api-key header only.
 * Never put API key in URL query (?key=) — violates NFR-002.
 */
function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
}

export async function geminiAdapter(request: AiRequest): Promise<AiResult> {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }

  const contents = request.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    systemInstruction: {
      parts: [{ text: request.systemPrompt }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: request.maxOutputTokens ?? 2048,
    },
  };

  const res = await fetch(geminiUrl(request.model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": request.apiKey,
    },
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(rawText) as Record<string, unknown>;
  } catch {
    json = { raw: rawText };
  }

  if (!res.ok) {
    throw Object.assign(new Error("Gemini request failed"), {
      status: res.status,
      body: rawText.slice(0, 2000),
    });
  }

  const candidates = json.candidates as
    | Array<{ content?: { parts?: Array<{ text?: string }> } }>
    | undefined;
  const text =
    candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  return {
    text,
    provider: "google",
    model: request.model,
    usage: normalizeUsage("google", {
      usageMetadata: json.usageMetadata,
    }),
    providerRequestId: undefined,
  };
}

export async function geminiConnectionTest(
  apiKey: string,
  model: string,
): Promise<AiResult> {
  return geminiAdapter({
    accessMode: "byok-direct",
    provider: "google",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16,
  });
}
