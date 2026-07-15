import type { AiRequest } from "@axeon/ai-demo-core/types/provider";
import type { AiProvider } from "@axeon/ai-demo-core/types/access-mode";
import { demoConfig } from "../../config/demo.config";
import {
  STRATEGY_AXIS_LABELS,
  type MaCompany,
} from "../../data/ma-companies";
import type { ExitComputed, ScenarioParams } from "../scenario/exit-model";

export function buildDdSchemaHint(): string {
  return `Return ONLY JSON with this shape:
{
  "diagnosis": string,
  "plan_narrative": string,
  "lever_details": [{ "lever": string, "rationale": string, "kpi": string }],
  "offbalance_plan": [{ "item": string, "treatment": string, "timing": string }],
  "exit_story": string,
  "roadmap": { "phase1": string, "phase2": string, "phase3": string },
  "gap_advice": string | null,
  "risks": string[]
}
Rules:
- Japanese for all string values.
- Amounts/periods must use ONLY values from company / computed. Do NOT invent new numbers.
- Mention ONLY levers in selected_levers.
- offbalance_plan must expand offbalance_treatment[strategy_axis] onto each dd_findings.quantitative item.
- If gap_to_target is negative, set gap_advice with ①期間延長 ②軸の複合 ③目標修正. Otherwise null.
- risks: 2–3 items.
- Be concrete; no markdown.
- knowledge (if present) is supplemental fact only; never override company/computed numbers with it.`;
}

export type ScenarioMessageExtras = {
  knowledge?: string;
};

export function formatScenarioUserMessage(
  company: MaCompany,
  params: ScenarioParams,
  computed: ExitComputed,
  extras: ScenarioMessageExtras = {},
): string {
  const axis = params.strategyAxis;
  const knowledge = extras.knowledge?.trim() ?? "";

  return JSON.stringify(
    {
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        profile: company.profile,
        profile_prior: company.profile_prior,
        financials: company.financials,
        dd_findings: company.dd_findings,
        offbalance_treatment: company.offbalance_treatment[axis],
        exit: company.exit,
      },
      params: {
        exit_target: params.exitTarget,
        horizon_months: params.horizonMonths,
        strategy_axis: axis,
        strategy_axis_label: STRATEGY_AXIS_LABELS[axis],
      },
      computed: {
        selected_levers: computed.selectedLevers.map((l) => ({
          lever: l.lever,
          ebitda_impact_applied: l.impactApplied,
          months: l.months,
          achievement_rate: l.achievementRate,
        })),
        ebitda_plan: computed.ebitdaPlan,
        equity_value: computed.equityValue,
        equity_value_range: computed.equityValueRange,
        gap_to_target: computed.gapToTarget,
        offbalance_adjusted: computed.offbalanceAdjusted,
        multiple: computed.multiple,
      },
      ...(knowledge ? { knowledge } : {}),
      instruction:
        "与えられた企業データ・パラメータ・計算結果に基づき、指定JSONでバリューアップ提案を出力してください。ナレッジがある場合は補足事実として扱い、数値は company/computed のみを使ってください。",
    },
    null,
    2,
  );
}

export type BuildDdAiRequestInput = {
  company: MaCompany;
  params: ScenarioParams;
  computed: ExitComputed;
  provider: AiProvider;
  model: string;
  accessMode: "byok-direct" | "managed-trial";
  apiKey?: string;
  knowledge?: string;
};

export function buildDdAiRequest(input: BuildDdAiRequestInput): AiRequest {
  return {
    accessMode: input.accessMode,
    provider: input.provider,
    model: input.model,
    apiKey: input.apiKey,
    systemPrompt: `${demoConfig.systemPromptBase}\n\n${buildDdSchemaHint()}`,
    messages: [
      {
        role: "user",
        content: formatScenarioUserMessage(
          input.company,
          input.params,
          input.computed,
          { knowledge: input.knowledge },
        ),
      },
    ],
    responseFormat: { type: "json_object" },
    temperature: 0.3,
  };
}
