import { useMemo } from "react";
import type { MaCompany, StrategyAxis } from "../../data/ma-companies";
import {
  computeExit,
  type ExitComputed,
  type ScenarioParams,
} from "../../ai/scenario/exit-model";
import type { DdDiagnosisResult } from "../../ai/types";
import { AXIS_TONE } from "../../ai/types";
import {
  formatOku,
  formatOkuFull,
} from "../../lib/format-money";
import { AXIS_SHORT } from "./ResultDashboard";

type GapAction = {
  id: string;
  label: string;
  disabled: boolean;
  apply: () => void;
};

type Props = {
  company: MaCompany;
  params: ScenarioParams;
  computed: ExitComputed;
  result: DdDiagnosisResult | null;
  onParamsChange: (next: ScenarioParams) => void;
  usedActionIds: Set<string>;
  onUseAction: (id: string) => void;
};

function buildTags(company: MaCompany): { text: string; tone: "base" | "warn" }[] {
  const tags: { text: string; tone: "base" | "warn" }[] = [];
  const prior = company.profile_prior;
  const candidates = [
    "労働集約",
    "多拠点",
    "シフト制",
    "同族",
    "交替勤務",
    "非常勤",
    "重層下請",
    "パート",
    "全店賃借",
  ];
  for (const c of candidates) {
    if (prior.includes(c) && tags.length < 3) {
      tags.push({
        text: c === "同族" ? "同族経営" : c === "多拠点" ? "多拠点・シフト制" : c,
        tone: "base",
      });
    }
  }
  if (company.profile.ownership.includes("同族") && !tags.some((t) => t.text.includes("同族"))) {
    tags.push({ text: "同族経営", tone: "base" });
  }
  tags.push({
    text: `${company.profile.key_dependency.label} ${company.profile.key_dependency.value}`,
    tone: "warn",
  });
  return tags.slice(0, 4);
}

export function StorySections({
  company,
  params,
  computed,
  result,
  onParamsChange,
  usedActionIds,
  onUseAction,
}: Props) {
  const tags = useMemo(() => buildTags(company), [company]);
  const topFinding = company.dd_findings.quantitative[0];
  const debtBundle =
    company.financials.net_debt +
    computed.offbalanceAdjusted +
    computed.onetimeCost -
    computed.onetimeGain;

  const pct = Math.min(
    100,
    Math.round((computed.equityValue / Math.max(params.exitTarget, 1)) * 100),
  );
  const reached = computed.gapToTarget >= 0;
  const meterTone = reached ? "ok" : pct > 60 ? "warn" : "danger";

  const actions = useMemo((): GapAction[] => {
    const list: GapAction[] = [];

    if (params.horizonMonths < 60) {
      const next = computeExit(company, { ...params, horizonMonths: 60 });
      const delta = next.equityValue - computed.equityValue;
      list.push({
        id: "horizon-60",
        label: `期間を5年に延長する → ${delta >= 0 ? "+" : ""}${formatOku(delta)}`,
        disabled: usedActionIds.has("horizon-60"),
        apply: () => onParamsChange({ ...params, horizonMonths: 60 }),
      });
    }

    const otherAxes = (["system", "restructure", "strategy"] as StrategyAxis[]).filter(
      (a) => a !== params.strategyAxis,
    );
    let best: { axis: StrategyAxis; delta: number } | null = null;
    for (const axis of otherAxes) {
      const next = computeExit(company, { ...params, strategyAxis: axis });
      const delta = next.equityValue - computed.equityValue;
      if (!best || delta > best.delta) best = { axis, delta };
    }
    if (best && best.delta > 0) {
      const id = `axis-${best.axis}`;
      list.push({
        id,
        label: `${AXIS_SHORT[best.axis]}へ切替 → +${formatOku(best.delta)}`,
        disabled: usedActionIds.has(id),
        apply: () => onParamsChange({ ...params, strategyAxis: best!.axis }),
      });
    } else if (params.strategyAxis !== "system") {
      const next = computeExit(company, { ...params, strategyAxis: "system" });
      const delta = next.equityValue - computed.equityValue;
      list.push({
        id: "axis-system",
        label: `システム軸を複合する → ${delta >= 0 ? "+" : ""}${formatOku(delta)}`,
        disabled: usedActionIds.has("axis-system"),
        apply: () => onParamsChange({ ...params, strategyAxis: "system" }),
      });
    }

    const market = Math.max(
      800,
      Math.round(computed.equityValueRange[1] / 100) * 100,
    );
    if (params.exitTarget > market) {
      list.push({
        id: "target-market",
        label: `目標を実勢レンジに修正 → ${formatOku(market)}`,
        disabled: usedActionIds.has("target-market"),
        apply: () => onParamsChange({ ...params, exitTarget: market }),
      });
    }

    return list.slice(0, 3);
  }, [company, params, computed, usedActionIds, onParamsChange]);

  const roadmap = result?.roadmap ?? {
    phase1: "選択レバー着手と簿外処置設計",
    phase2: "KPI定着と効果測定",
    phase3: "データルーム整備とEXITストーリー固定",
  };
  const tone = AXIS_TONE[params.strategyAxis];
  const risks = result?.risks?.length
    ? result.risks
    : [
        tone.riskHint,
        "簿外推計はレンジであり、実査で上下する",
        "マルチプルは買い手類型・市場で変動",
      ];

  const buyerHooks = company.exit.buyer_types.map((b, i) => {
    const hooks = [
      company.exit.note,
      "拠点網と実行力",
      "簿外処置後のクリーンさ",
    ];
    return { buyer: b, hook: hooks[i] ?? company.exit.note };
  });

  return (
    <section className="dd-story">
      <p className="dd-sec-label">診断 — この会社の型</p>
      <div className="dd-tags">
        {tags.map((t) => (
          <span
            key={t.text}
            className={t.tone === "warn" ? "dd-tag dd-tag--warn" : "dd-tag"}
          >
            {t.text}
          </span>
        ))}
      </div>
      <div className="dd-issue-hero">
        <p className="dd-kpi__label">主要論点</p>
        <p className="dd-issue-hero__title">
          {topFinding?.item ?? "簿外候補"}
          <span>
            {topFinding
              ? `${topFinding.estimate[0]}〜${topFinding.estimate[1]}百万`
              : ""}
          </span>
        </p>
      </div>
      <ul className="dd-flag-list">
        {company.dd_findings.discovered.map((d, i) => (
          <li key={d}>
            <i className={i === 0 ? "dd-flag dd-flag--danger" : "dd-flag dd-flag--warn"} />
            <span>
              {d}
              {i === 0 ? (
                <em> EXIT設計に直結</em>
              ) : d.includes("転嫁") || d.includes("改善") || d.includes("ロス") ? (
                <em className="dd-em-ok"> 改善余地</em>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      <p className="dd-sec-label">EXITストーリー</p>
      <div className="dd-formula">
        <div>
          <strong>
            {computed.ebitdaPlan}
            <span>百万</span>
          </strong>
          <span>計画EBITDA</span>
        </div>
        <i>×</i>
        <div>
          <strong>{computed.multiple.toFixed(2)}x</strong>
          <span>想定倍率</span>
        </div>
        <i>−</i>
        <div>
          <strong className="dd-num-danger">
            {formatOku(debtBundle, { unit: false })}
            <span>億</span>
          </strong>
          <span>負債・簿外</span>
        </div>
        <i>=</i>
        <div>
          <strong className="dd-num-ok">
            {formatOku(computed.equityValue, { unit: false })}
            <span>億</span>
          </strong>
          <span>株式価値</span>
        </div>
      </div>
      <div className="dd-buyers">
        {buyerHooks.map((b) => (
          <div key={b.buyer} className="dd-buyer">
            <strong>{b.buyer}</strong>
            <span>刺さる点: {b.hook}</span>
          </div>
        ))}
      </div>

      <p className="dd-sec-label">ロードマップ</p>
      <ol className="dd-timeline">
        <li className="dd-timeline__item dd-timeline__item--done">
          <strong>
            Phase 1 <em>0〜12ヶ月</em>
          </strong>
          <span>{roadmap.phase1}</span>
        </li>
        <li className="dd-timeline__item dd-timeline__item--mid">
          <strong>
            Phase 2 <em>12〜36ヶ月</em>
          </strong>
          <span>{roadmap.phase2}</span>
        </li>
        <li className="dd-timeline__item">
          <strong>
            Phase 3 <em>36〜60ヶ月</em>
          </strong>
          <span>{roadmap.phase3}</span>
        </li>
      </ol>

      <p className="dd-sec-label">目標達成メーター</p>
      <div className="dd-meter">
        <div className="dd-meter__head">
          <span>
            現在 <strong>{formatOku(computed.equityValue)}</strong>
          </span>
          <span>
            目標 <strong>{formatOku(params.exitTarget)}</strong>
          </span>
        </div>
        <div className="dd-meter__track">
          <i
            className={`dd-meter__fill dd-meter__fill--${meterTone}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={reached ? "dd-meter__msg dd-meter__msg--ok" : "dd-meter__msg"}>
          {reached
            ? "目標達成の試算です"
            : `あと${formatOkuFull(Math.abs(computed.gapToTarget))}。下の対処をタップすると試算が変わります`}
        </p>
        <div className="dd-meter__actions">
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className="dd-action-btn"
              disabled={a.disabled}
              onClick={() => {
                a.apply();
                onUseAction(a.id);
              }}
            >
              {a.label}
            </button>
          ))}
          {actions.length === 0 ? (
            <p className="dd-muted">追加の対処候補はありません。条件変更から調整できます。</p>
          ) : null}
        </div>
      </div>

      <p className="dd-sec-label">リスク</p>
      <ul className="dd-risk-list">
        {risks.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <p className="dd-disclaimer">
        サンプル企業は事前診断済みのシナリオです。実案件では追加調査が必要です。
      </p>
    </section>
  );
}
