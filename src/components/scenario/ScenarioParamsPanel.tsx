import {
  STRATEGY_AXIS_LABELS,
  type StrategyAxis,
} from "../../data/ma-companies";
import {
  HORIZON_OPTIONS,
  type ScenarioParams,
} from "../../ai/scenario/exit-model";

type Props = {
  value: ScenarioParams;
  onChange: (next: ScenarioParams) => void;
  exitMin?: number;
  exitMax?: number;
};

const AXES: StrategyAxis[] = ["system", "restructure", "strategy"];

function formatOku(millionYen: number): string {
  return `${(millionYen / 100).toFixed(0)}億円`;
}

export function ScenarioParamsPanel({
  value,
  onChange,
  exitMin = 1000,
  exitMax = 6000,
}: Props) {
  return (
    <section className="dd-card">
      <div className="dd-card__head">
        <h2>シナリオパラメータ</h2>
        <p className="dd-muted">
          変えると試算が即時更新。AI語りは「提案を更新」で再生成します
        </p>
      </div>

      <label className="dd-field">
        <span>
          EXIT目標金額{" "}
          <em className="dd-param-value">{formatOku(value.exitTarget)}</em>
        </span>
        <input
          type="range"
          min={exitMin}
          max={exitMax}
          step={100}
          value={value.exitTarget}
          onChange={(e) =>
            onChange({ ...value, exitTarget: Number(e.target.value) })
          }
        />
        <div className="dd-range-labels">
          <span>{formatOku(exitMin)}</span>
          <span>{formatOku(exitMax)}</span>
        </div>
      </label>

      <div className="dd-field">
        <span>バリューアップ目標期間</span>
        <div className="dd-seg">
          {HORIZON_OPTIONS.map((h) => (
            <button
              key={h.months}
              type="button"
              className={
                value.horizonMonths === h.months
                  ? "dd-seg__btn dd-seg__btn--on"
                  : "dd-seg__btn"
              }
              onClick={() => onChange({ ...value, horizonMonths: h.months })}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dd-field">
        <span>バリューアップ主軸</span>
        <div className="dd-axis-tabs" role="tablist">
          {AXES.map((axis) => (
            <button
              key={axis}
              type="button"
              role="tab"
              aria-selected={value.strategyAxis === axis}
              className={
                value.strategyAxis === axis
                  ? "dd-axis-tab dd-axis-tab--on"
                  : "dd-axis-tab"
              }
              onClick={() => onChange({ ...value, strategyAxis: axis })}
            >
              {STRATEGY_AXIS_LABELS[axis]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
