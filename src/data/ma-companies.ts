import raw from "./ma-demo-companies.json";
import {
  getQuestionsForCompany,
  type CompanyQuestions,
  type JudgmentPhase,
} from "./ma-demo-questions";

export type StrategyAxis = "system" | "restructure" | "strategy";
export type { JudgmentPhase, CompanyQuestions };

export type Range = [number, number];

export type QuantitativeFinding = {
  item: string;
  estimate: Range;
  /** JSON 上は severity。UI では信頼度ラベルとして表示 */
  severity: "high" | "mid" | "low" | string;
};

export type ValueupLever = {
  lever: string;
  ebitda_impact: Range;
  months: number;
  capex?: number;
  onetime_cost?: number;
  onetime_gain?: Range;
  /** 実働デモがある場合のみ。例: product_flow_minato */
  demo_id?: string;
};

export type MaCompany = {
  id: string;
  industry: string;
  name: string;
  profile: {
    business: string;
    sites: string;
    ownership: string;
    revenue: number;
    ordinary_income: number;
    employees: number;
    key_dependency: { label: string; value: string };
    extra: { label: string; value: string };
  };
  profile_prior: string;
  industry_priors: string[];
  data_room: string[];
  financials: {
    ebitda: number;
    depreciation: number;
    owner_addback: number;
    net_debt: number;
  };
  dd_findings: {
    quantitative: QuantitativeFinding[];
    discovered: string[];
  };
  valueup_levers: Record<StrategyAxis, ValueupLever[]>;
  offbalance_treatment: Record<StrategyAxis, string>;
  /** フェーズ×主軸の問い在庫（レバーと同じ思想） */
  questions: CompanyQuestions;
  exit: {
    ebitda_multiple: Range;
    buyer_types: string[];
    note: string;
  };
};

type MaCompaniesFile = {
  schema_version: string;
  unit: string;
  note: string;
  companies: Omit<MaCompany, "questions">[];
};

const data = raw as unknown as MaCompaniesFile;

function attachQuestions(
  company: Omit<MaCompany, "questions">,
): MaCompany {
  const questions = getQuestionsForCompany(company.id);
  if (!questions) {
    throw new Error(`questions missing for company: ${company.id}`);
  }
  return { ...company, questions };
}

export const MA_UNIT = data.unit;
export const MA_COMPANIES: MaCompany[] = data.companies.map(attachQuestions);

export const STRATEGY_AXIS_LABELS: Record<StrategyAxis, string> = {
  system: "システム導入による効率化",
  restructure: "不採算事業・部署の整理",
  strategy: "基本戦略の見直し",
};

export function getCompanyById(id: string): MaCompany | undefined {
  return MA_COMPANIES.find((c) => c.id === id);
}

export function mid(range: Range): number {
  return (range[0] + range[1]) / 2;
}
