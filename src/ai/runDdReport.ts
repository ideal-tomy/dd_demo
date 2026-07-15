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
  buildDdReportAiRequest,
  formatDdReportUserMessage,
} from "./adapters/dd-report-input";
import { parseDdReportEnrichment } from "./adapters/dd-report-output";
import type { DdFlag } from "./scenario/build-dd-flags";
import type { MaCompany } from "../data/ma-companies";

export type RunDdReportOutcome = {
  flags: DdFlag[];
  summary: string;
  remainingRequests?: number;
  usedAi: boolean;
};

export async function enrichDdReport(input: {
  company: MaCompany;
  flags: DdFlag[];
  materials: string;
  extraPriors: string[];
}): Promise<RunDdReportOutcome> {
  const mode = getDdAccessMode();
  if (mode === "sample") {
    return { flags: input.flags, summary: "", usedAi: false };
  }

  const provider = mode === "managed-trial" ? "openai" : getDdProvider();
  const model = getDdModel();
  const request = buildDdReportAiRequest({
    ...input,
    provider,
    model,
    accessMode: mode,
    apiKey: mode === "byok-direct" ? getApiKey(provider) : undefined,
  });

  if (mode === "byok-direct" && !request.apiKey?.trim()) {
    return { flags: input.flags, summary: "", usedAi: false };
  }
  const trialCode = getTrialCode().trim();
  if (mode === "managed-trial" && !trialCode) {
    return { flags: input.flags, summary: "", usedAi: false };
  }

  const userMsg = formatDdReportUserMessage(
    input.company,
    input.flags,
    input.materials,
    input.extraPriors,
  );
  try {
    const response = await sendAiRequest(request, {
      trialCode: mode === "managed-trial" ? trialCode : undefined,
      knowledgeCharCount: countCharacters(input.materials),
      estimatedInputTokens:
        estimateTokens(request.systemPrompt) + estimateTokens(userMsg),
    });
    const parsed = parseDdReportEnrichment(response.text, input.flags);
    return {
      flags: parsed.flags,
      summary: parsed.summary,
      remainingRequests: response.trialStatus?.remainingRequests,
      usedAi: true,
    };
  } catch {
    return { flags: input.flags, summary: "", usedAi: false };
  }
}
