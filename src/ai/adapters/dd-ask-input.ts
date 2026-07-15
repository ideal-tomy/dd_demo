import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import { demoConfig } from "../../config/demo.config";
import type { DdFlag } from "../scenario/build-dd-flags";
import type { MaCompany } from "../../data/ma-companies";

export function buildDdAskSchemaHint(): string {
  return `Return ONLY JSON:
{
  "answer": string,
  "citations": string[]
}
Rules:
- Japanese only.
- Answer using ONLY company profile, allowed_findings, extra_priors, and materials.
- Do NOT invent amounts, new flags, or facts not in the input.
- If unknown, say so clearly and suggest what DD evidence would confirm it.
- citations: short references to finding ids or source labels (max 5).`;
}

export function formatDdAskUserMessage(
  company: MaCompany,
  flags: DdFlag[],
  materials: string,
  extraPriors: string[],
  question: string,
): string {
  return JSON.stringify(
    {
      question,
      company: {
        name: company.name,
        industry: company.industry,
        profile: company.profile,
        profile_prior: company.profile_prior,
        financials: company.financials,
      },
      extra_priors: extraPriors,
      materials: materials.trim() || null,
      allowed_findings: flags.map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        estimate_min: f.estimate?.[0] ?? null,
        estimate_max: f.estimate?.[1] ?? null,
        prior: f.prior,
        gap: f.gap,
        glance: f.glance,
        inference: f.inference,
      })),
      instruction:
        "question に日本語で答えてください。allowed_findings に無い数値・論点は作らないでください。",
    },
    null,
    2,
  );
}

export function buildDdAskAiRequest(input: {
  company: MaCompany;
  flags: DdFlag[];
  materials: string;
  extraPriors: string[];
  question: string;
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
    systemPrompt: `${demoConfig.systemPromptDdAsk}\n\n${buildDdAskSchemaHint()}`,
    messages: [
      {
        role: "user",
        content: formatDdAskUserMessage(
          input.company,
          input.flags,
          input.materials,
          input.extraPriors,
          input.question,
        ),
      },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.2,
  };
}
