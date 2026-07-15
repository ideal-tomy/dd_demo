import type { AiRequest } from "../../vendor/ai-demo/types/provider";
import type { AiProvider } from "../../vendor/ai-demo/types/access-mode";
import { demoConfig } from "../../config/demo.config";
import type { DdFormInput } from "../types";

export function buildDdSchemaHint(): string {
  return `Return ONLY JSON with this shape:
{
  "diagnosis": string,
  "techOpportunity": string,
  "developmentOptions": [{ "title": string, "summary": string }],
  "priority": [{ "rank": number, "item": string, "rationale": string }],
  "investmentImpact": { "investment": string, "impact": string, "note"?: string },
  "prototype": { "name": string, "scope": string, "nextStep": string },
  "roadmap": [{ "phase": string, "items": string[] }]
}
Rules:
- Japanese for all string values.
- developmentOptions: 2–4 items.
- priority: 3 items, ranks 1..3.
- roadmap: 2–4 phases.
- Be concrete and actionable; mark assumptions clearly.`;
}

export function formatFormAsUserMessage(form: DdFormInput): string {
  return [
    `企業名: ${form.companyName}`,
    `業種: ${form.industry}`,
    `売上規模: ${form.revenue}`,
    `従業員数: ${form.employees}`,
    `現在の課題: ${form.challenges}`,
    `利用中システム: ${form.systems}`,
    `自由記述: ${form.freeText || "（なし）"}`,
    "",
    "上記企業向けに Due Diligence / DX 診断を構造化 JSON で出力してください。",
  ].join("\n");
}

export type BuildDdAiRequestInput = {
  form: DdFormInput;
  provider: AiProvider;
  model: string;
  accessMode: "byok-direct" | "managed-trial";
  apiKey?: string;
};

export function buildDdAiRequest(input: BuildDdAiRequestInput): AiRequest {
  return {
    accessMode: input.accessMode,
    provider: input.provider,
    model: input.model,
    apiKey: input.apiKey,
    systemPrompt: `${demoConfig.systemPromptBase}\n\n${buildDdSchemaHint()}`,
    messages: [{ role: "user", content: formatFormAsUserMessage(input.form) }],
    responseFormat: { type: "json_object" },
    temperature: 0.3,
  };
}
