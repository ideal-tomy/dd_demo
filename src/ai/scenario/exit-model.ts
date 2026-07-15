import {
  mid,
  type MaCompany,
  type Range,
  type StrategyAxis,
  type ValueupLever,
} from "../../data/ma-companies";

/** 金額単位は JSON と同じく百万円 */
export type ScenarioParams = {
  exitTarget: number;
  horizonMonths: number;
  strategyAxis: StrategyAxis;
};

export type SelectedLever = ValueupLever & {
  impactApplied: number;
  achievementRate: number;
};

export type ExitComputed = {
  adjustedEbitdaCurrent: number;
  ebitdaPlan: number;
  selectedLevers: SelectedLever[];
  multiple: number;
  offbalanceAdjusted: number;
  onetimeGain: number;
  onetimeCost: number;
  equityValue: number;
  equityValueRange: Range;
  gapToTarget: number;
  bridge: { label: string; value: number; kind: "base" | "plus" | "minus" | "result" | "target" }[];
};

const OFFBALANCE_FACTOR: Record<StrategyAxis, number> = {
  system: 0.5,
  restructure: 0.4,
  strategy: 0.55,
};

function impactMid(lever: ValueupLever): number {
  return mid(lever.ebitda_impact);
}

/** 目標到達に必要なレバーを軸×期間で貪欲選択 */
export function selectLevers(
  company: MaCompany,
  params: ScenarioParams,
): SelectedLever[] {
  const pool = company.valueup_levers[params.strategyAxis] ?? [];
  const ranked = [...pool].sort((a, b) => {
    const effA = impactMid(a) / Math.max(a.months, 1);
    const effB = impactMid(b) / Math.max(b.months, 1);
    return effB - effA;
  });

  const selected: SelectedLever[] = [];
  for (const lever of ranked) {
    const rate = Math.min(1, params.horizonMonths / Math.max(lever.months, 1));
    if (rate <= 0) continue;
    // 期間内に全く立ち上がらない超長期レバーは除外（達成率20%未満）
    if (rate < 0.2 && lever.months > params.horizonMonths) continue;
    selected.push({
      ...lever,
      achievementRate: rate,
      impactApplied: impactMid(lever) * rate,
    });
  }
  return selected;
}

function computeOffbalance(company: MaCompany, axis: StrategyAxis): number {
  const factor = OFFBALANCE_FACTOR[axis];
  return company.dd_findings.quantitative.reduce((sum, f) => {
    return sum + mid(f.estimate) * factor;
  }, 0);
}

function computeMultiple(
  company: MaCompany,
  axis: StrategyAxis,
  leversComplete: boolean,
): number {
  const [lo, hi] = company.exit.ebitda_multiple;
  if (axis === "strategy" && leversComplete) {
    return hi + 0.25;
  }
  return mid([lo, hi]);
}

/**
 * EXIT試算（フロント決定的計算）。AIは数値を作らずこの結果を語る。
 */
export function computeExit(
  company: MaCompany,
  params: ScenarioParams,
): ExitComputed {
  const adjustedEbitdaCurrent =
    company.financials.ebitda + company.financials.owner_addback;

  let selectedLevers = selectLevers(company, params);
  let ebitdaPlan =
    adjustedEbitdaCurrent +
    selectedLevers.reduce((s, l) => s + l.impactApplied, 0);

  const offbalanceAdjusted = computeOffbalance(company, params.strategyAxis);
  const leversComplete = selectedLevers.every((l) => l.achievementRate >= 1);
  const multiple = computeMultiple(company, params.strategyAxis, leversComplete);

  // 目標に届かない場合でもレバー全採用済み。足りる場合は余剰レバーを削る（デモで「必要数が増減」）
  const equityAt = (ebitda: number, levers: SelectedLever[]) => {
    const gain = levers.reduce(
      (s, l) => s + (l.onetime_gain ? mid(l.onetime_gain) * l.achievementRate : 0),
      0,
    );
    const cost = levers.reduce(
      (s, l) => s + (l.onetime_cost ?? 0) * l.achievementRate,
      0,
    );
    return (
      ebitda * multiple -
      company.financials.net_debt -
      offbalanceAdjusted +
      gain -
      cost
    );
  };

  // 貪欲に最小セットへ削減（後ろから落とす）
  let trimmed = [...selectedLevers];
  while (trimmed.length > 1) {
    const without = trimmed.slice(0, -1);
    const ebitda =
      adjustedEbitdaCurrent + without.reduce((s, l) => s + l.impactApplied, 0);
    if (equityAt(ebitda, without) >= params.exitTarget) {
      trimmed = without;
    } else {
      break;
    }
  }
  selectedLevers = trimmed;
  ebitdaPlan =
    adjustedEbitdaCurrent +
    selectedLevers.reduce((s, l) => s + l.impactApplied, 0);

  const onetimeGainFinal = selectedLevers.reduce((s, l) => {
    if (!l.onetime_gain) return s;
    return s + mid(l.onetime_gain) * l.achievementRate;
  }, 0);
  const onetimeCostFinal = selectedLevers.reduce((s, l) => {
    return s + (l.onetime_cost ?? 0) * l.achievementRate;
  }, 0);

  const equityValue =
    ebitdaPlan * multiple -
    company.financials.net_debt -
    offbalanceAdjusted +
    onetimeGainFinal -
    onetimeCostFinal;

  const loMult = company.exit.ebitda_multiple[0];
  const hiMult =
    params.strategyAxis === "strategy" && leversComplete
      ? company.exit.ebitda_multiple[1] + 0.25
      : company.exit.ebitda_multiple[1];
  const equityValueRange: Range = [
    Math.round(
      ebitdaPlan * loMult -
        company.financials.net_debt -
        offbalanceAdjusted +
        onetimeGainFinal -
        onetimeCostFinal,
    ),
    Math.round(
      ebitdaPlan * hiMult -
        company.financials.net_debt -
        offbalanceAdjusted +
        onetimeGainFinal -
        onetimeCostFinal,
    ),
  ];

  const gapToTarget = equityValue - params.exitTarget;

  const bridge: ExitComputed["bridge"] = [
    { label: "現状EBITDA（調整後）", value: adjustedEbitdaCurrent, kind: "base" },
    {
      label: "バリューアップ積み上げ",
      value: ebitdaPlan - adjustedEbitdaCurrent,
      kind: "plus",
    },
    { label: "計画EBITDA", value: ebitdaPlan, kind: "result" },
    {
      label: `× マルチプル ${multiple.toFixed(2)}x`,
      value: ebitdaPlan * multiple,
      kind: "result",
    },
    { label: "純有利子負債", value: -company.financials.net_debt, kind: "minus" },
    { label: "簿外債務調整", value: -offbalanceAdjusted, kind: "minus" },
  ];
  if (onetimeGainFinal > 0) {
    bridge.push({ label: "一時売却益等", value: onetimeGainFinal, kind: "plus" });
  }
  if (onetimeCostFinal > 0) {
    bridge.push({ label: "一時費用", value: -onetimeCostFinal, kind: "minus" });
  }
  bridge.push({ label: "想定株式価値", value: equityValue, kind: "result" });
  bridge.push({ label: "EXIT目標", value: params.exitTarget, kind: "target" });

  return {
    adjustedEbitdaCurrent: Math.round(adjustedEbitdaCurrent),
    ebitdaPlan: Math.round(ebitdaPlan),
    selectedLevers,
    multiple: Math.round(multiple * 100) / 100,
    offbalanceAdjusted: Math.round(offbalanceAdjusted),
    onetimeGain: Math.round(onetimeGainFinal),
    onetimeCost: Math.round(onetimeCostFinal),
    equityValue: Math.round(equityValue),
    equityValueRange,
    gapToTarget: Math.round(gapToTarget),
    bridge: bridge.map((b) => ({ ...b, value: Math.round(b.value) })),
  };
}

export const DEFAULT_PARAMS: ScenarioParams = {
  exitTarget: 3000, // 30億円
  horizonMonths: 36,
  strategyAxis: "system",
};

export const HORIZON_OPTIONS = [
  { months: 24, label: "2年" },
  { months: 36, label: "3年" },
  { months: 60, label: "5年" },
] as const;
