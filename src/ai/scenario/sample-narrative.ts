import {
  STRATEGY_AXIS_LABELS,
  type MaCompany,
  type StrategyAxis,
} from "../../data/ma-companies";
import { AXIS_TONE, type DdDiagnosisResult } from "../types";
import type { ExitComputed, ScenarioParams } from "./exit-model";

function yenOku(millionYen: number): string {
  const oku = millionYen / 100;
  if (oku >= 10) return `${oku.toFixed(0)}億円`;
  return `${oku.toFixed(1)}億円`;
}

function buildOffbalancePlan(
  company: MaCompany,
  axis: StrategyAxis,
): DdDiagnosisResult["offbalancePlan"] {
  const core = company.offbalance_treatment[axis];
  return company.dd_findings.quantitative.map((f, i) => {
    const timing =
      axis === "restructure"
        ? i === 0
          ? "クロージング前〜100日"
          : "保有1年以内"
        : axis === "system"
          ? i === 0
            ? "0〜6ヶ月（是正投資）"
            : "6〜12ヶ月"
          : i === 0
            ? "契約再交渉サイクルに合わせる"
            : "12〜24ヶ月";
    return {
      item: f.item,
      treatment: `${core}（当該項目の推計 ${f.estimate[0]}〜${f.estimate[1]}百万円）`,
      timing,
    };
  });
}

/** サンプルモード用：APIなしで設計どおりの語りを生成 */
export function buildSampleNarrative(
  company: MaCompany,
  params: ScenarioParams,
  computed: ExitComputed,
): DdDiagnosisResult {
  const axisLabel = STRATEGY_AXIS_LABELS[params.strategyAxis];
  const tone = AXIS_TONE[params.strategyAxis];
  const topFinding = company.dd_findings.quantitative[0];
  const discovered = company.dd_findings.discovered.slice(0, 2).join("／");

  const leverDetails = computed.selectedLevers.map((l) => ({
    lever: l.lever,
    rationale: `${axisLabel}の主軸として、EBITDA押し上げ約${Math.round(l.impactApplied)}百万円（達成率${Math.round(l.achievementRate * 100)}%）を見込む。`,
    kpi:
      params.strategyAxis === "system"
        ? "稼働率・リードタイム・人件費率"
        : params.strategyAxis === "restructure"
          ? "固定費削減額・撤退完了率"
          : "新規売上比率・依存度低下",
  }));

  const gapAdvice =
    computed.gapToTarget < 0
      ? `現状パラメータではEXIT目標 ${yenOku(params.exitTarget)} に対し約 ${yenOku(Math.abs(computed.gapToTarget))} 不足。①期間延長 ②戦略軸の複合 ③目標修正 の順で再検討してください。`
      : null;

  return {
    diagnosis: `${company.name}（${company.industry}）は${company.profile_prior} DD定量では「${topFinding?.item ?? "簿外候補"}」が主要論点で、発見系では ${discovered || "契約・ガバナンス上の留意点"} が確認されています。`,
    planNarrative: `バリューアップの主軸を「${axisLabel}」に置き、${params.horizonMonths}ヶ月で想定株式価値 ${yenOku(computed.equityValue)}（レンジ ${yenOku(computed.equityValueRange[0])}〜${yenOku(computed.equityValueRange[1])}）を狙います。簿外債務は軸固有の処置方針で価格調整額を抑え、${company.exit.note}`,
    leverDetails,
    offbalancePlan: buildOffbalancePlan(company, params.strategyAxis),
    exitStory: `想定買い手は ${company.exit.buyer_types.join("／")}。訴求は計画EBITDA ${computed.ebitdaPlan}百万円 × ${computed.multiple}x と、簿外の処置進捗です。`,
    roadmap: {
      phase1: `${tone.roadmapStyle}の第1段: 選択レバーの着手とDD確定項目の処置設計`,
      phase2: `効果の定着とKPIモニタリング（主レバーの達成率を引き上げ）`,
      phase3: `EXIT準備 — データルーム整備と買い手別ストーリーの固定`,
    },
    gapAdvice,
    risks: [
      tone.riskHint,
      "簿外推計はレンジであり、実査で上下する可能性",
      "マルチプルは買い手類型・市場環境で変動",
    ],
  };
}
