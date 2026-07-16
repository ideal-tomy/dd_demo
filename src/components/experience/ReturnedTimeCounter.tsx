import { useEffect, useRef, useState } from "react";
import { formatReturnedHours } from "../../config/returned-time";
import { useReturnedTime } from "../../state/ReturnedTimeContext";

export function ReturnedTimeCounter() {
  const { totalHours, lines, basis } = useReturnedTime();
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState(totalHours);
  const prev = useRef(totalHours);

  useEffect(() => {
    if (totalHours === prev.current) return;
    const from = prev.current;
    const to = totalHours;
    prev.current = to;
    const start = performance.now();
    const dur = 400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - (1 - p) * (1 - p);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalHours]);

  return (
    <div className="dd-time-counter">
      <button
        type="button"
        className={`dd-time-counter__btn ${totalHours > 0 ? "dd-time-counter__btn--lit" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dd-time-counter__icon" aria-hidden="true">
          ⏱
        </span>
        <span className="dd-time-counter__label">返した時間</span>
        <span className="dd-time-counter__value">
          {formatReturnedHours(display)}h
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="dd-time-counter__scrim"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
          />
          <div className="dd-time-counter__pop" role="dialog">
            <p className="dd-time-counter__pop-title">このセッションの内訳</p>
            {lines.length === 0 ? (
              <p className="dd-muted">まだ代行した作業はありません</p>
            ) : (
              <ul className="dd-time-counter__list">
                {lines.map((l) => (
                  <li key={l.id}>
                    <span>{l.label}</span>
                    <strong>{formatReturnedHours(l.hours)}h</strong>
                  </li>
                ))}
              </ul>
            )}
            <p className="dd-time-counter__basis">算定根拠: {basis}</p>
            <p className="dd-time-counter__trial">試算です</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
