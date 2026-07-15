// demo-core/usage-normalizer.ts
function normalizeUsage(provider, raw) {
  if (!raw || typeof raw !== "object") {
    return {
      inputTokens: null,
      outputTokens: null,
      cachedInputTokens: null,
      totalTokens: null,
      raw
    };
  }
  const u = raw;
  if (provider === "openai") {
    const input2 = num(u.prompt_tokens) ?? num(u.input_tokens) ?? nested(u, "input_tokens");
    const output2 = num(u.completion_tokens) ?? num(u.output_tokens) ?? nested(u, "output_tokens");
    const cached2 = nested(u, "prompt_tokens_details", "cached_tokens") ?? nested(u, "input_tokens_details", "cached_tokens") ?? num(u.cached_tokens);
    const total2 = num(u.total_tokens) ?? sum(input2, output2);
    return {
      inputTokens: input2,
      outputTokens: output2,
      cachedInputTokens: cached2,
      totalTokens: total2,
      raw
    };
  }
  if (provider === "anthropic") {
    const input2 = num(u.input_tokens);
    const output2 = num(u.output_tokens);
    const cached2 = num(u.cache_read_input_tokens) ?? num(u.cache_creation_input_tokens);
    return {
      inputTokens: input2,
      outputTokens: output2,
      cachedInputTokens: cached2,
      totalTokens: sum(input2, output2),
      raw
    };
  }
  const meta = u.usageMetadata ?? u;
  const input = num(meta.promptTokenCount) ?? num(meta.prompt_token_count);
  const output = num(meta.candidatesTokenCount) ?? num(meta.candidates_token_count);
  const cached = num(meta.cachedContentTokenCount) ?? num(meta.cached_content_token_count);
  const total = num(meta.totalTokenCount) ?? sum(input, output);
  return {
    inputTokens: input,
    outputTokens: output,
    cachedInputTokens: cached,
    totalTokens: total,
    raw
  };
}
function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function nested(obj, ...path) {
  let cur = obj;
  for (const p of path) {
    if (!cur || typeof cur !== "object") return null;
    cur = cur[p];
  }
  return num(cur);
}
function sum(a, b) {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

export {
  normalizeUsage
};
//# sourceMappingURL=chunk-XOUQUE6R.js.map