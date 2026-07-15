// CORE-CANDIDATE / PROVIDER-SPECIFIC mappings — copied from AI-Demo-Studio
import type { AiProvider } from "../types/access-mode";
import type { NormalizedUsage } from "../types/provider";

export function normalizeUsage(
  provider: AiProvider,
  raw: unknown,
): NormalizedUsage {
  if (!raw || typeof raw !== "object") {
    return {
      inputTokens: null,
      outputTokens: null,
      cachedInputTokens: null,
      totalTokens: null,
      raw,
    };
  }

  const u = raw as Record<string, unknown>;

  if (provider === "openai") {
    const input =
      num(u.prompt_tokens) ??
      num(u.input_tokens) ??
      nested(u, "input_tokens");
    const output =
      num(u.completion_tokens) ??
      num(u.output_tokens) ??
      nested(u, "output_tokens");
    const cached =
      nested(u, "prompt_tokens_details", "cached_tokens") ??
      nested(u, "input_tokens_details", "cached_tokens") ??
      num(u.cached_tokens);
    const total = num(u.total_tokens) ?? sum(input, output);
    return {
      inputTokens: input,
      outputTokens: output,
      cachedInputTokens: cached,
      totalTokens: total,
      raw,
    };
  }

  if (provider === "anthropic") {
    const input = num(u.input_tokens);
    const output = num(u.output_tokens);
    const cached =
      num(u.cache_read_input_tokens) ?? num(u.cache_creation_input_tokens);
    return {
      inputTokens: input,
      outputTokens: output,
      cachedInputTokens: cached,
      totalTokens: sum(input, output),
      raw,
    };
  }

  // google
  const meta = (u.usageMetadata ?? u) as Record<string, unknown>;
  const input =
    num(meta.promptTokenCount) ?? num(meta.prompt_token_count);
  const output =
    num(meta.candidatesTokenCount) ?? num(meta.candidates_token_count);
  const cached =
    num(meta.cachedContentTokenCount) ??
    num(meta.cached_content_token_count);
  const total = num(meta.totalTokenCount) ?? sum(input, output);
  return {
    inputTokens: input,
    outputTokens: output,
    cachedInputTokens: cached,
    totalTokens: total,
    raw,
  };
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function nested(
  obj: Record<string, unknown>,
  ...path: string[]
): number | null {
  let cur: unknown = obj;
  for (const p of path) {
    if (!cur || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[p];
  }
  return num(cur);
}

function sum(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}
