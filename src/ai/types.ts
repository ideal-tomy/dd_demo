import type { MaCompany } from "../data/ma-companies";
import type { ExitComputed, ScenarioParams } from "./scenario/exit-model";
import type { StrategyAxis } from "../data/ma-companies";

/** AI（およびサンプル語り）の出力スキーマ — 設計書 §5 */
export type DdDiagnosisResult = {
  diagnosis: string;
  planNarrative: string;
  leverDetails: { lever: string; rationale: string; kpi: string }[];
  offbalancePlan: { item: string; treatment: string; timing: string }[];
  exitStory: string;
  roadmap: { phase1: string; phase2: string; phase3: string };
  gapAdvice: string | null;
  risks: string[];
};

export type DiagnosisContext = {
  company: MaCompany;
  params: ScenarioParams;
  computed: ExitComputed;
};

export const AXIS_TONE: Record<
  StrategyAxis,
  { roadmapStyle: string; riskHint: string }
> = {
  system: {
    roadmapStyle: "導入→定着→効果測定",
    riskHint: "定着しないリスク・CAPEX負担",
  },
  restructure: {
    roadmapStyle: "意思決定→実行→固定費確定",
    riskHint: "一時費用・人員影響・レピュテーション",
  },
  strategy: {
    roadmapStyle: "仮説→検証→スケール",
    riskHint: "時間リスク・実行力依存",
  },
};
