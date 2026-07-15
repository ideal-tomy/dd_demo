import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import { demoConfig } from "../../config/demo.config";
import type { DdFlag } from "../scenario/build-dd-flags";
import type { MaCompany } from "../../data/ma-companies";

export function buildDdReportSchemaHint(): string {
  return `Return ONLY JSON:
{
  "summary": string,
  "flags": [{ "id": string, "glance": string, "inference": string, "deal": string }]
}
Rules:
- Japanese only.
- flags[].id MUST be one of the allowed finding ids. Do not invent ids.
- Do NOT invent amounts, percentages, headcounts, or new flags.
- You may only rephrase glance/inference/deal using the provided finding facts.
- If materials exist, you may reference them as supplemental context without inventing numbers.
- Keep each inference to 2–4 sentences.`;
}

export function formatDdReportUserMessage(
  company: MaCompany,
  flags: DdFlag[],
  materials: string,
  extraPriors: string[],
): string {
  return JSON.stringify(
    {
      company: {
        name: company.name,
        industry: company.industry,
        profile: company.profile,
        profile_prior: company.profile_prior,
      },
      extra_priors: extraPriors,
      materials: materials.trim() || null,
      allowed_findings: flags.map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        confidence: f.confidence,
        estimate_min: f.estimate?.[0] ?? null,
        estimate_max: f.estimate?.[1] ?? null,
        prior: f.prior,
        sources: f.sources,
        gap: f.gap,
        glance: f.glance,
        inference: f.inference,
        deal: f.deal,
      })),
      instruction:
        "allowed_findings の文言（glance/inference/deal）を営業品質で整えてください。id は変えず、新しいフラグや数値は作らないでください。",
    },
    null,
    2,
  );
}

export function buildDdReportAiRequest(input: {
  company: MaCompany;
  flags: DdFlag[];
  materials: string;
  extraPriors: string[];
  provider: AiProvider;
  model: string;
  accessMode: "byok-direct" | "managed-trial";
  apiKey?: string;
}): AiRequest {
  return {
    accessMode: input.accessMode,
    provider: input.provider,
    model: input.model,
    apiKey: input.apiKey,
    systemPrompt: `${demoConfig.systemPromptDdReport}\n\n${buildDdReportSchemaHint()}`,
    messages: [
      {
        role: "user",
        content: formatDdReportUserMessage(
          input.company,
          input.flags,
          input.materials,
          input.extraPriors,
        ),
      },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.2,
  };
}
