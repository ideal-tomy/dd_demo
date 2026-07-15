import type { ExitComputed } from "../../ai/scenario/exit-model";

type Props = {
  computed: ExitComputed;
  highlight?: boolean;
};

function formatMillion(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("ja-JP")}百万円`;
}

function formatOku(millionYen: number): string {
  return `${(millionYen / 100).toFixed(1)}億円`;
}

export function ExitBridge({ computed, highlight }: Props) {
  const ok = computed.gapToTarget >= 0;
  const maxAbs = Math.max(
    ...computed.bridge.map((b) => Math.abs(b.value)),
    1,
  );

  return (
    <section className={highlight ? "dd-card dd-card--flash" : "dd-card"}>
      <div className="dd-card__head">
        <h2>EXITブリッジ</h2>
        <p className="dd-muted">フロント計算（AI非依存）・パラメータ操作で即時更新</p>
      </div>

      <div className="dd-bridge-summary">
        <div>
          <span className="dd-k">想定株式価値</span>
          <strong className="dd-v">{formatOku(computed.equityValue)}</strong>
          <span className="dd-muted">
            レンジ {formatOku(computed.equityValueRange[0])}〜
            {formatOku(computed.equityValueRange[1])}
          </span>
        </div>
        <div className={ok ? "dd-gap dd-gap--ok" : "dd-gap dd-gap--ng"}>
          <span className="dd-k">目標との差</span>
          <strong>
            {ok ? "+" : "−"}
            {formatOku(Math.abs(computed.gapToTarget))}
          </strong>
          <span>{ok ? "目標到達可能" : "ギャップあり — 期間延長／軸複合／目標修正"}</span>
        </div>
      </div>

      <ul className="dd-waterfall">
        {computed.bridge.map((row) => (
          <li key={row.label} className={`dd-waterfall__row dd-waterfall__row--${row.kind}`}>
            <span className="dd-waterfall__label">{row.label}</span>
            <div className="dd-waterfall__track">
              <i
                style={{
                  width: `${Math.min(100, (Math.abs(row.value) / maxAbs) * 100)}%`,
                }}
              />
            </div>
            <span className="dd-waterfall__val">
              {row.kind === "minus" || row.value < 0
                ? formatMillion(row.value)
                : row.kind === "plus"
                  ? formatMillion(row.value)
                  : `${row.value.toLocaleString("ja-JP")}百万円`}
            </span>
          </li>
        ))}
      </ul>

      <div className="dd-lever-chips">
        <span className="dd-k">選択レバー</span>
        {computed.selectedLevers.length === 0 ? (
          <span className="dd-muted">期間内に実行可能なレバーがありません</span>
        ) : (
          computed.selectedLevers.map((l) => (
            <span key={l.lever} className="dd-mini-chip">
              {l.lever}
              <em>+{Math.round(l.impactApplied)}</em>
            </span>
          ))
        )}
      </div>
    </section>
  );
}
