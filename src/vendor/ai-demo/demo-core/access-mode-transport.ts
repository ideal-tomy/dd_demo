// CORE-CANDIDATE
import { anthropicAdapter } from "../providers/anthropic-adapter";
import { geminiAdapter } from "../providers/gemini-adapter";
import { openaiAdapter } from "../providers/openai-adapter";
import type { AiRequest, AiResult } from "../types/provider";

export async function byokDirectTransport(
  request: AiRequest,
): Promise<AiResult> {
  switch (request.provider) {
    case "openai":
      return openaiAdapter(request);
    case "anthropic":
      return anthropicAdapter(request);
    case "google":
      return geminiAdapter(request);
    default: {
      const _exhaustive: never = request.provider;
      throw new Error(`Unsupported provider: ${_exhaustive}`);
    }
  }
}
