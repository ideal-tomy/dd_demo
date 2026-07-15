import { sendAiRequest } from "@axeon/ai-demo-core/demo-core";
import {
  countCharacters,
  estimateTokens,
} from "@axeon/ai-demo-core/demo-core/knowledge";
import {
  getApiKey,
  getDdAccessMode,
  getDdModel,
  getDdProvider,
  getTrialCode,
} from "../access/dd-settings";
import {
  buildDdAskAiRequest,
  formatDdAskUserMessage,
} from "./adapters/dd-ask-input";
import { parseDdAskText, type DdAskResult } from "./adapters/dd-ask-output";
import type { DdFlag } from "./scenario/build-dd-flags";
import type { MaCompany } from "../data/ma-companies";

export type AskDdFollowupOutcome = DdAskResult & {
  remainingRequests?: number;
};

export async function askDdFollowup(input: {
  company: MaCompany;
  flags: DdFlag[];
  materials: string;
  extraPriors: string[];
  question: string;
}): Promise<AskDdFollowupOutcome> {
  const mode = getDdAccessMode();
  if (mode === "sample") {
    throw new Error(
      "自由質問には APIキー または 体験コード が必要です。詳細設定から接続してください。",
    );
  }

  const provider = mode === "managed-trial" ? "openai" : getDdProvider();
  const model = getDdModel();
  const request = buildDdAskAiRequest({
    ...input,
    provider,
    model,
    accessMode: mode,
    apiKey: mode === "byok-direct" ? getApiKey(provider) : undefined,
  });

  if (mode === "byok-direct" && !request.apiKey?.trim()) {
    throw new Error("APIキーを詳細設定で保存してください。");
  }
  const trialCode = getTrialCode().trim();
  if (mode === "managed-trial" && !trialCode) {
    throw new Error("体験コードを詳細設定で保存してください。");
  }

  const userMsg = formatDdAskUserMessage(
    input.company,
    input.flags,
    input.materials,
    input.extraPriors,
    input.question,
  );
  const knowledgeChars =
    countCharacters(input.materials) + countCharacters(input.question);

  const response = await sendAiRequest(request, {
    trialCode: mode === "managed-trial" ? trialCode : undefined,
    knowledgeCharCount: knowledgeChars,
    estimatedInputTokens:
      estimateTokens(request.systemPrompt) + estimateTokens(userMsg),
  });

  const parsed = parseDdAskText(response.text);
  return {
    ...parsed,
    remainingRequests: response.trialStatus?.remainingRequests,
  };
}
