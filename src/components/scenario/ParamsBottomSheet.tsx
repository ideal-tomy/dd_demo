import {
  STRATEGY_AXIS_LABELS,
  type StrategyAxis,
} from "../../data/ma-companies";
import {
  HORIZON_OPTIONS,
  type ScenarioParams,
} from "../../ai/scenario/exit-model";
import { formatOkuFull } from "../../lib/format-money";

type Props = {
  open: boolean;
  value: ScenarioParams;
  onChange: (next: ScenarioParams) => void;
  onClose: () => void;
  exitMin?: number;
  exitMax?: number;
};

const AXES: StrategyAxis[] = ["system", "restructure", "strategy"];

export function ParamsBottomSheet({
  open,
  value,
  onChange,
  onClose,
  exitMin = 500,
  exitMax = 6000,
}: Props) {
  if (!open) return null;

  return (
    <div className="dd-sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dd-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="条件変更"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dd-sheet__handle" />
        <div className="dd-sheet__head">
          <h2>条件変更</h2>
          <button type="button" className="dd-btn-ghost dd-btn-sm" onClick={onClose}>
            閉じる
          </button>
        </div>

        <label className="dd-field">
          <span>
            EXIT目標{" "}
            <em className="dd-param-value">{formatOkuFull(value.exitTarget)}</em>
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
            <span>{formatOkuFull(exitMin)}</span>
            <span>{formatOkuFull(exitMax)}</span>
          </div>
        </label>

        <div className="dd-field">
          <span>バリューアップ期間</span>
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
          <div className="dd-axis-tabs dd-axis-tabs--sheet">
            {AXES.map((axis) => (
              <button
                key={axis}
                type="button"
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
      </div>
    </div>
  );
}
