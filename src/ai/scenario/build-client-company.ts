import {
  MA_COMPANIES,
  type MaCompany,
  type Range,
} from "../../data/ma-companies";

export type ClientCompanyInput = {
  name: string;
  industry: string;
  revenue: number;
  ordinaryIncome: number;
  employees: number;
  dependencyValue: string;
};

export const CLIENT_INDUSTRIES = [
  "運送",
  "製造",
  "介護",
  "建設",
  "小売",
] as const;

export type ClientIndustry = (typeof CLIENT_INDUSTRIES)[number];

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;

function roundYen(n: number): number {
  return Math.max(1, Math.round(n));
}

function scaleRange(range: Range, scale: number): Range {
  return [roundYen(range[0] * scale), roundYen(range[1] * scale)];
}

function scaleLevers(
  levers: MaCompany["valueup_levers"],
  scale: number,
): MaCompany["valueup_levers"] {
  const mapAxis = (list: MaCompany["valueup_levers"]["system"]) =>
    list.map((l) => ({
      ...l,
      ebitda_impact: scaleRange(l.ebitda_impact, scale),
      capex: l.capex != null ? roundYen(l.capex * scale) : undefined,
      onetime_cost:
        l.onetime_cost != null ? roundYen(l.onetime_cost * scale) : undefined,
      onetime_gain:
        l.onetime_gain != null ? scaleRange(l.onetime_gain, scale) : undefined,
    }));

  return {
    system: mapAxis(levers.system),
    restructure: mapAxis(levers.restructure),
    strategy: mapAxis(levers.strategy),
  };
}

export function getTemplateByIndustry(industry: string): MaCompany {
  const found = MA_COMPANIES.find((c) => c.industry === industry);
  if (!found) {
    return MA_COMPANIES[0];
  }
  return found;
}

export function getDependencyLabel(industry: string): string {
  return getTemplateByIndustry(industry).profile.key_dependency.label;
}

/**
 * 業種サンプルをテンプレにし、フォーム値で MaCompany を合成する。
 * レバー／簿外処置／prior／findings は継承。金額は売上比でスケール。
 */
export function buildClientCompany(input: ClientCompanyInput): MaCompany {
  const template = getTemplateByIndustry(input.industry);
  const revenue = Math.max(1, input.revenue);
  const ordinaryIncome = Math.max(0, input.ordinaryIncome);
  const employees = Math.max(1, Math.round(input.employees));

  const rawScale = revenue / Math.max(template.profile.revenue, 1);
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale));

  const incomeRatio =
    template.profile.ordinary_income > 0
      ? template.financials.ebitda / template.profile.ordinary_income
      : 1.5;
  const ebitda = roundYen(
    ordinaryIncome > 0
      ? ordinaryIncome * incomeRatio
      : template.financials.ebitda * scale,
  );

  return {
    id: "client-custom",
    industry: template.industry,
    name: input.name.trim() || "御社（仮）",
    profile: {
      business: template.profile.business,
      sites: template.profile.sites,
      ownership: template.profile.ownership,
      revenue,
      ordinary_income: ordinaryIncome,
      employees,
      key_dependency: {
        label: template.profile.key_dependency.label,
        value:
          input.dependencyValue.trim() ||
          template.profile.key_dependency.value,
      },
      extra: template.profile.extra,
    },
    profile_prior: template.profile_prior,
    industry_priors: [...template.industry_priors],
    data_room: [...template.data_room],
    financials: {
      ebitda,
      depreciation: roundYen(template.financials.depreciation * scale),
      owner_addback: roundYen(template.financials.owner_addback * scale),
      net_debt: roundYen(template.financials.net_debt * scale),
    },
    dd_findings: {
      quantitative: template.dd_findings.quantitative.map((f) => ({
        ...f,
        estimate: scaleRange(f.estimate, scale),
      })),
      discovered: [...template.dd_findings.discovered],
    },
    valueup_levers: scaleLevers(template.valueup_levers, scale),
    offbalance_treatment: { ...template.offbalance_treatment },
    exit: {
      ebitda_multiple: [...template.exit.ebitda_multiple] as Range,
      buyer_types: [...template.exit.buyer_types],
      note: template.exit.note,
    },
  };
}

export function emptyClientDraft(
  industry: ClientIndustry = "運送",
): ClientCompanyInput {
  const template = getTemplateByIndustry(industry);
  return {
    name: "",
    industry,
    revenue: template.profile.revenue,
    ordinaryIncome: template.profile.ordinary_income,
    employees: template.profile.employees,
    dependencyValue: template.profile.key_dependency.value,
  };
}
