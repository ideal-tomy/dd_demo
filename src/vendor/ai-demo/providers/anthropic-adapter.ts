// PROVIDER-SPECIFIC
import { normalizeUsage } from "../demo-core/usage-normalizer";
import type { AiRequest, AiResult } from "../types/provider";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MAX_TOKENS = 2048;

export async function anthropicAdapter(request: AiRequest): Promise<AiResult> {
  if (!request.apiKey) {
    throw Object.assign(new Error("API key required"), { status: 401 });
  }

  // Appendix C-1: max_tokens is required; default when optional AiRequest omits it
  const maxTokens = request.maxOutputTokens ?? DEFAULT_MAX_TOKENS;

  const body = {
    model: request.model,
    max_tokens: maxTokens,
    system: request.systemPrompt,
    messages: request.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": request.apiKey,
      "anthropic-version": "2023-06-01",
      // Appendix C-1: required for browser direct
      "anthropic-dangerous-direct-browser-access": "true",
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
    throw Object.assign(new Error("Anthropic request failed"), {
      status: res.status,
      body: rawText.slice(0, 2000),
    });
  }

  const content = json.content as
    | Array<{ type?: string; text?: string }>
    | undefined;
  const text =
    content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("") ?? "";

  return {
    text,
    provider: "anthropic",
    model: request.model,
    usage: normalizeUsage("anthropic", json.usage),
    providerRequestId:
      typeof json.id === "string" ? json.id : undefined,
  };
}

export async function anthropicConnectionTest(
  apiKey: string,
  model: string,
): Promise<AiResult> {
  return anthropicAdapter({
    accessMode: "byok-direct",
    provider: "anthropic",
    apiKey,
    model,
    systemPrompt: "Reply with OK only.",
    messages: [{ role: "user", content: "ping" }],
    maxOutputTokens: 16,
  });
}
