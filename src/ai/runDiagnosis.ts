import { sendAiRequest } from "../vendor/ai-demo/demo-core";
import { estimateTokens } from "../vendor/ai-demo/demo-core/knowledge";
import {
  getApiKey,
  getDdAccessMode,
  getDdModel,
  getDdProvider,
  getTrialCode,
} from "../access/dd-settings";
import { buildDdAiRequest, formatFormAsUserMessage } from "./adapters/dd-input";
import { parseDdDiagnosisText } from "./adapters/dd-output";
import {
  SAMPLE_RESULT,
  type DdDiagnosisResult,
  type DdFormInput,
} from "./types";

export type RunDiagnosisOutcome = {
  result: DdDiagnosisResult;
  remainingRequests?: number;
  mode: string;
};

export async function runDiagnosis(
  form: DdFormInput,
): Promise<RunDiagnosisOutcome> {
  const mode = getDdAccessMode();

  if (mode === "sample") {
    return { result: SAMPLE_RESULT, mode };
  }

  const provider = mode === "managed-trial" ? "openai" : getDdProvider();
  const model = getDdModel();
  const request = buildDdAiRequest({
    form,
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

  const userMsg = formatFormAsUserMessage(form);
  const estimatedInputTokens =
    estimateTokens(request.systemPrompt) + estimateTokens(userMsg);

  const response = await sendAiRequest(request, {
    trialCode: mode === "managed-trial" ? trialCode : undefined,
    knowledgeCharCount: 0,
    estimatedInputTokens,
  });

  const result = parseDdDiagnosisText(response.text);
  return {
    result,
    mode,
    remainingRequests: response.trialStatus?.remainingRequests,
  };
}
