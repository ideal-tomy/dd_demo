/**
 * PROVIDER-SPECIFIC — copied from AI-Demo-Studio (Phase 3 minimal)
 *
 * LOCAL DELTA vs Studio:
 * - Supports AiRequest.responseFormat (json_object) for ISO structured answers
 * - Supports AiRequest.temperature
 * Candidate for reverse-merge into Studio Core.
 */
import { normalizeUsage } from "../demo-core/usage-normalizer";
import type { AiRequest, AiResult } from "../types/provider";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function openaiAdapter(request: AiRequest): Promise<AiResult> {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }

  const body: Record<string, unknown> = {
    model: request.model,
    messages: [
      { role: "system", content: request.systemPrompt },
      ...request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
    max_completion_tokens: request.maxOutputTokens ?? 2048,
  };

  if (request.responseFormat) {
    body.response_format = request.responseFormat;
  }
  if (request.temperature !== undefined) {
    body.temperature = request.temperature;
  }

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${request.apiKey}`,
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
    throw Object.assign(new Error("OpenAI request failed"), {
      status: res.status,
      body: rawText.slice(0, 2000),
    });
  }

  const choices = json.choices as
    | Array<{ message?: { content?: string } }>
    | undefined;
  const text = choices?.[0]?.message?.content ?? "";

  return {
    text,
    provider: "openai",
    model: request.model,
    usage: normalizeUsage("openai", json.usage),
    providerRequestId: typeof json.id === "string" ? json.id : undefined,
  };
}

/** Minimal completion for connection test (Appendix B-3). */
export async function openaiConnectionTest(
  apiKey: string,
  model: string,
): Promise<AiResult> {
  return openaiAdapter({
    accessMode: "byok-direct",
    provider: "openai",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16,
  });
}
