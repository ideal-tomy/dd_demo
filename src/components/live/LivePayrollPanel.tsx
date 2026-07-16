import { useEffect, useRef, useState } from "react";
import { ExitPreviewTag } from "../experience/ExitPreviewTag";
import {
  LIVE_SCAN_STEPS,
  runLiveSampleReconcile,
  type ReconcileGap,
  type ReconcileResult,
} from "../../live/reconcilePayrollAttendance";

type Props = {
  onComplete: () => void;
};

export function LivePayrollPanel({ onComplete }: Props) {
  const [busy, setBusy] = useState(false);
  const [scanLines, setScanLines] = useState<string[]>([]);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<ReconcileGap | null>(null);
  const [showLog, setShowLog] = useState(false);
  const doneOnce = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    setEvidence(null);
    setScanLines([LIVE_SCAN_STEPS[0]]);
    setShowLog(false);

    let step = 0;
    await new Promise<void>((resolve) => {
      const tick = () => {
        step += 1;
        if (step >= LIVE_SCAN_STEPS.length) {
          resolve();
          return;
        }
        setScanLines((prev) => {
          const next = [...prev, LIVE_SCAN_STEPS[step]];
          return next.slice(-5);
        });
        timer.current = window.setTimeout(tick, 420);
      };
      timer.current = window.setTimeout(tick, 420);
    });

    try {
      const outcome = await runLiveSampleReconcile();
      setResult(outcome);
      setScanLines((prev) => prev);
      if (!doneOnce.current) {
        doneOnce.current = true;
        onComplete();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "実解析に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dd-card dd-live-panel">
      <div className="dd-card__head dd-card__head--row">
        <div>
          <h2>ライブ層 — 給与×勤怠の実解析</h2>
          <p className="dd-muted">
            同梱の架空CSVを突合します。処理は本物・結果は既知です。
          </p>
        </div>
        <span className="dd-live-badge">実解析</span>
      </div>

      {!result && !busy ? (
        <div className="dd-live-drop">
          <p>給与台帳CSV + 勤怠データをデータルームに投入</p>
          <button type="button" className="dd-btn" onClick={() => void run()}>
            サンプル資料を投入
          </button>
        </div>
      ) : null}

      {busy ? (
        <div className="dd-live-console" aria-live="polite">
          {scanLines.map((line) => (
            <p key={line} className="dd-live-console__line">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {result && !busy ? (
        <div className="dd-live-result">
          <p className="dd-muted">
            {result.summary.monthsChecked}ヶ月を突合 — 乖離{" "}
            {result.summary.gapCount}件 / 推計{" "}
            {result.summary.estimateLo}〜{result.summary.estimateHi}百万円相当
          </p>
          <ul className="dd-live-gaps">
            {result.gaps.map((g) => (
              <li key={`${g.employeeId}-${g.yearMonth}`}>
                <div>
                  <strong>
                    {g.yearMonth} {g.name}
                  </strong>
                  <span className="dd-muted">
                    {" "}
                    打刻{g.clockOtHours}h − 支給{g.otHoursPaid}h = +
                    {g.gapHours}h
                  </span>
                  <ExitPreviewTag />
                </div>
                <button
                  type="button"
                  className="dd-btn-ghost dd-btn-sm"
                  onClick={() => setEvidence(g)}
                >
                  根拠を見る
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="dd-link"
            onClick={() => setShowLog((v) => !v)}
          >
            {showLog
              ? "実況を閉じる"
              : `実況を見る(${LIVE_SCAN_STEPS.length}件)`}
          </button>
          {showLog ? (
            <div className="dd-live-console dd-live-console--done">
              {LIVE_SCAN_STEPS.map((line) => (
                <p key={line} className="dd-live-console__line">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="dd-btn-ghost dd-btn-sm"
            onClick={() => void run()}
          >
            再実行
          </button>
        </div>
      ) : null}

      {error ? <p className="dd-error">{error}</p> : null}

      {evidence ? (
        <div className="dd-evidence-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="dd-evidence-modal__scrim"
            aria-label="閉じる"
            onClick={() => setEvidence(null)}
          />
          <div className="dd-evidence-modal__panel">
            <h3>根拠 — {evidence.name} / {evidence.yearMonth}</h3>
            <p className="dd-muted">
              給与台帳 {evidence.payrollLine}行目 / 勤怠{" "}
              {evidence.attendanceLine}行目
            </p>
            <table className="dd-evidence-table">
              <tbody>
                <tr>
                  <th>打刻残業</th>
                  <td className="dd-evidence-table__hit">
                    {evidence.clockOtHours} 時間
                  </td>
                </tr>
                <tr>
                  <th>支給計上残業</th>
                  <td>{evidence.otHoursPaid} 時間</td>
                </tr>
                <tr>
                  <th>乖離</th>
                  <td className="dd-evidence-table__hit">
                    +{evidence.gapHours} 時間（約
                    {evidence.estimatedUnpaidYen.toLocaleString()}円）
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              type="button"
              className="dd-btn"
              onClick={() => setEvidence(null)}
            >
              発見に戻る
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
