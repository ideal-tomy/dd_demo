import { sendAiRequest } from "../vendor/ai-demo/demo-core";
import {
  countCharacters,
  estimateTokens,
} from "../vendor/ai-demo/demo-core/knowledge";
import {
  getApiKey,
  getDdAccessMode,
  getDdModel,
  getDdProvider,
  getTrialCode,
} from "../access/dd-settings";
import {
  buildDdAiRequest,
  formatScenarioUserMessage,
} from "./adapters/dd-input";
import { parseDdDiagnosisText } from "./adapters/dd-output";
import { buildSampleNarrative } from "./scenario/sample-narrative";
import type { ExitComputed, ScenarioParams } from "./scenario/exit-model";
import type { MaCompany } from "../data/ma-companies";
import type { DdDiagnosisResult } from "./types";

export type RunDiagnosisOutcome = {
  result: DdDiagnosisResult;
  remainingRequests?: number;
  mode: string;
};

export type RunDiagnosisInput = {
  company: MaCompany;
  params: ScenarioParams;
  computed: ExitComputed;
  knowledge?: string;
};

export async function runDiagnosis(
  input: RunDiagnosisInput,
): Promise<RunDiagnosisOutcome> {
  const mode = getDdAccessMode();
  const { company, params, computed } = input;
  const knowledge = input.knowledge?.trim() ?? "";

  if (mode === "sample") {
    return {
      result: buildSampleNarrative(company, params, computed),
      mode,
    };
  }

  const provider = mode === "managed-trial" ? "openai" : getDdProvider();
  const model = getDdModel();
  const request = buildDdAiRequest({
    company,
    params,
    computed,
    provider,
    model,
    accessMode: mode,
    apiKey: mode === "byok-direct" ? getApiKey(provider) : undefined,
    knowledge,
  });

  if (mode === "byok-direct" && !request.apiKey?.trim()) {
    throw new Error("APIキーを詳細設定で保存してください。");
  }

  const trialCode = getTrialCode().trim();
  if (mode === "managed-trial" && !trialCode) {
    throw new Error("体験コードを詳細設定で保存してください。");
  }

  const userMsg = formatScenarioUserMessage(company, params, computed, {
    knowledge,
  });
  const estimatedInputTokens =
    estimateTokens(request.systemPrompt) + estimateTokens(userMsg);

  const response = await sendAiRequest(request, {
    trialCode: mode === "managed-trial" ? trialCode : undefined,
    knowledgeCharCount: countCharacters(knowledge),
    estimatedInputTokens,
  });

  const result = parseDdDiagnosisText(response.text);
  return {
    result,
    mode,
    remainingRequests: response.trialStatus?.remainingRequests,
  };
}
