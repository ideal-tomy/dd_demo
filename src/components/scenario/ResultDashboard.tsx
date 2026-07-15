import { useState } from "react";
import {
  STRATEGY_AXIS_LABELS,
  type MaCompany,
  type StrategyAxis,
} from "../../data/ma-companies";
import type { ExitComputed, ScenarioParams } from "../../ai/scenario/exit-model";
import type { DdDiagnosisResult } from "../../ai/types";
import {
  formatMillion,
  formatOku,
  formatOkuFull,
  horizonLabel,
  toOku,
} from "../../lib/format-money";

export const AXIS_SHORT: Record<StrategyAxis, string> = {
  system: "システム効率化",
  restructure: "不採算整理",
  strategy: "戦略見直し",
};

const AXES: StrategyAxis[] = ["system", "restructure", "strategy"];

const BAR_COLORS = {
  ebitda: "#888780",
  lever: "#1D9E75",
  enterprise: "#378ADD",
  debt: "#E24B4A",
  equity: "#534AB7",
};

type Props = {
  company: MaCompany;
  params: ScenarioParams;
  computed: ExitComputed;
  result: DdDiagnosisResult | null;
  equityDiff: number | null;
  flashKpi: boolean;
  flashBridge: boolean;
  flashOffbalance: boolean;
  onAxisChange: (axis: StrategyAxis) => void;
  onOpenParams: () => void;
};

function severityTone(sev: string): "danger" | "warning" | "muted" {
  if (sev === "high") return "danger";
  if (sev === "mid") return "warning";
  return "muted";
}

export function ResultDashboard({
  company,
  params,
  computed,
  result,
  equityDiff,
  flashKpi,
  flashBridge,
  flashOffbalance,
  onAxisChange,
  onOpenParams,
}: Props) {
  const [openLever, setOpenLever] = useState<number | null>(null);
  const [openOb, setOpenOb] = useState<number | null>(null);

  const ok = computed.gapToTarget >= 0;
  const leverImpact = computed.ebitdaPlan - computed.adjustedEbitdaCurrent;
  const enterprise = computed.ebitdaPlan * computed.multiple;
  const debtTotal =
    company.financials.net_debt +
    computed.offbalanceAdjusted +
    computed.onetimeCost -
    computed.onetimeGain;

  const bars = [
    { l: "EBITDA現状", v: computed.adjustedEbitdaCurrent, c: BAR_COLORS.ebitda },
    { l: "レバー効果", v: Math.max(leverImpact, 0), c: BAR_COLORS.lever },
    { l: "事業価値", v: enterprise / 100, c: BAR_COLORS.enterprise },
    { l: "負債・簿外", v: Math.max(debtTotal, 0) / 100, c: BAR_COLORS.debt },
    { l: "株式価値", v: Math.max(toOku(computed.equityValue), 0.1), c: BAR_COLORS.equity },
  ];
  // Normalize bar heights for visual comparison (mix of scales) — use relative within type
  const heights = [
    computed.adjustedEbitdaCurrent,
    Math.max(leverImpact, 1),
    enterprise,
    Math.max(debtTotal, 1),
    Math.max(computed.equityValue, 1),
  ];
  const maxH = Math.max(...heights);

  const maxLever = Math.max(
    ...computed.selectedLevers.map((l) => l.impactApplied),
    1,
  );
  const maxOb = Math.max(
    ...company.dd_findings.quantitative.map((f) => f.estimate[1]),
    1,
  );

  const obPlan = result?.offbalancePlan ?? [];

  return (
    <section className="dd-dash">
      <div className="dd-dash__top">
        <div>
          <p className="dd-dash__meta">
            {company.name.replace("株式会社", "")} / {company.industry}
          </p>
          <p className="dd-dash__goal">
            EXIT試算 {formatOkuFull(params.exitTarget)}目標・
            {horizonLabel(params.horizonMonths)}
          </p>
        </div>
        <button type="button" className="dd-btn-ghost dd-btn-sm" onClick={onOpenParams}>
          条件変更 ↗
        </button>
      </div>

      <div className="dd-axis-pills" role="tablist">
        {AXES.map((axis) => (
          <button
            key={axis}
            type="button"
            role="tab"
            aria-selected={params.strategyAxis === axis}
            className={
              params.strategyAxis === axis
                ? "dd-pill dd-pill--on"
                : "dd-pill"
            }
            onClick={() => onAxisChange(axis)}
          >
            {AXIS_SHORT[axis]}
          </button>
        ))}
      </div>

      <div className={`dd-kpi-row ${flashKpi ? "dd-flash" : ""}`}>
        <div className="dd-kpi">
          <p className="dd-kpi__label">想定株式価値</p>
          <p className="dd-kpi__num">
            {formatOku(computed.equityValue, { unit: false })}
            <span>億</span>
          </p>
          <p
            className={
              equityDiff == null
                ? "dd-kpi__diff"
                : equityDiff >= 0
                  ? "dd-kpi__diff dd-kpi__diff--up"
                  : "dd-kpi__diff dd-kpi__diff--down"
            }
          >
            {equityDiff == null
              ? "前回比 —"
              : equityDiff >= 0
                ? `▲ +${formatOku(equityDiff)}`
                : `▼ ${formatOku(equityDiff)}`}
          </p>
        </div>
        <div className={`dd-kpi ${ok ? "dd-kpi--ok" : "dd-kpi--ng"}`}>
          <p className="dd-kpi__label">目標とのギャップ</p>
          <p className="dd-kpi__num">
            {ok ? "+" : "−"}
            {formatOku(Math.abs(computed.gapToTarget), { unit: false })}
            <span>億</span>
          </p>
          <p className="dd-kpi__diff">
            {ok ? "目標到達可能" : "未達 — 期間延長を検討"}
          </p>
        </div>
      </div>

      <p className="dd-sec-label">EXITブリッジ</p>
      <div className={`dd-vbars ${flashBridge ? "dd-flash" : ""}`}>
        <div className="dd-vbars__chart">
          {bars.map((b, i) => (
            <div key={b.l} className="dd-vbars__col">
              <div
                className="dd-vbars__bar"
                style={{
                  height: `${Math.max(8, Math.round((heights[i] / maxH) * 88))}px`,
                  background: b.c,
                }}
              />
            </div>
          ))}
        </div>
        <div className="dd-vbars__labels">
          {bars.map((b) => (
            <div key={b.l}>{b.l}</div>
          ))}
        </div>
      </div>

      <p className="dd-sec-label">
        バリューアップレバー{" "}
        <span className="dd-sec-hint">タップで詳細</span>
      </p>
      <div className="dd-expand-list">
        {computed.selectedLevers.length === 0 ? (
          <p className="dd-muted">期間内に実行可能なレバーがありません</p>
        ) : (
          computed.selectedLevers.map((l, i) => {
            const detail = result?.leverDetails.find((d) => d.lever === l.lever);
            const open = openLever === i;
            return (
              <button
                key={l.lever}
                type="button"
                className="dd-expand-row"
                onClick={() => setOpenLever(open ? null : i)}
              >
                <div className="dd-expand-row__main">
                  <span>{l.lever}</span>
                  <strong>
                    +{formatMillion(l.impactApplied)}
                    <em>百万</em>
                  </strong>
                </div>
                <div className="dd-bar-track">
                  <i
                    style={{
                      width: `${Math.round((l.impactApplied / maxLever) * 100)}%`,
                      background: BAR_COLORS.lever,
                    }}
                  />
                </div>
                {open ? (
                  <p className="dd-expand-row__detail">
                    {detail?.rationale ??
                      `${STRATEGY_AXIS_LABELS[params.strategyAxis]}のレバー（達成率${Math.round(l.achievementRate * 100)}%）`}
                    {detail?.kpi ? (
                      <>
                        <br />
                        KPI: {detail.kpi}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      <p className="dd-sec-label">
        簿外債務と処置{" "}
        <span className="dd-sec-hint">レンジ=推計幅</span>
      </p>
      <div
        className={`dd-expand-list ${flashOffbalance ? "dd-flash" : ""}`}
      >
        <p className="dd-treatment-line">
          {company.offbalance_treatment[params.strategyAxis]}
        </p>
        {company.dd_findings.quantitative.map((f, i) => {
          const plan = obPlan[i];
          const open = openOb === i;
          const tone = severityTone(f.severity);
          return (
            <button
              key={f.item}
              type="button"
              className="dd-expand-row"
              onClick={() => setOpenOb(open ? null : i)}
            >
              <div className="dd-expand-row__main">
                <span>
                  <i className={`dd-dot dd-dot--${tone}`} />
                  {f.item.length > 22 ? `${f.item.slice(0, 22)}…` : f.item}
                </span>
                <strong className="dd-expand-row__range">
                  {f.estimate[0]}〜{f.estimate[1]}百万
                </strong>
              </div>
              <div className="dd-bar-track dd-bar-track--range">
                <i
                  className={`dd-range-seg dd-range-seg--${tone}`}
                  style={{
                    left: `${Math.round((f.estimate[0] / maxOb) * 100)}%`,
                    width: `${Math.max(4, Math.round(((f.estimate[1] - f.estimate[0]) / maxOb) * 100))}%`,
                  }}
                />
              </div>
              {open ? (
                <p className="dd-expand-row__detail dd-expand-row__detail--ob">
                  処置: {plan?.treatment ?? company.offbalance_treatment[params.strategyAxis]}
                  <br />
                  時期: {plan?.timing ?? "—"}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
