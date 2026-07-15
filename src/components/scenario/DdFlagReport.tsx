import type {
  DdFlag,
  DdFlagJudgment,
  DdFlagReportSummary,
} from "../../ai/scenario/build-dd-flags";

type Props = {
  companyName: string;
  industry: string;
  flags: DdFlag[];
  summary: DdFlagReportSummary;
  judgments: Record<string, DdFlagJudgment>;
  onJudgment: (id: string, value: DdFlagJudgment) => void;
};

function yenRange(lo: number, hi: number): string {
  return `${lo}〜${hi}百万円`;
}

export function DdFlagReport({
  companyName,
  industry,
  flags,
  summary,
  judgments,
  onJudgment,
}: Props) {
  const quant = flags.filter((f) => f.category === "定量");
  const disc = flags.filter((f) => f.category === "発見");

  return (
    <section className="dd-card dd-flag-report">
      <div className="dd-card__head">
        <h2>① DD支援 — 解析結果</h2>
        <p className="dd-muted">
          {companyName} / {industry} — 定量査定＋発見系
        </p>
      </div>

      <div className="dd-flag-summary">
        <div>
          <p className="dd-eyebrow">検出フラグ</p>
          <p className="dd-flag-summary__num">{summary.count}件</p>
        </div>
        <div>
          <p className="dd-eyebrow">簿外推計レンジ</p>
          <p className="dd-flag-summary__num">
            {summary.estimateLo > 0
              ? yenRange(summary.estimateLo, summary.estimateHi)
              : "—"}
          </p>
        </div>
      </div>

      {quant.length > 0 ? (
        <div className="dd-flag-group">
          <h3>定量 ({quant.length})</h3>
          {quant.map((f) => (
            <FlagCard
              key={f.id}
              flag={f}
              judgment={judgments[f.id] ?? null}
              onJudgment={onJudgment}
            />
          ))}
        </div>
      ) : null}

      {disc.length > 0 ? (
        <div className="dd-flag-group">
          <h3>発見系 ({disc.length})</h3>
          {disc.map((f) => (
            <FlagCard
              key={f.id}
              flag={f}
              judgment={judgments[f.id] ?? null}
              onJudgment={onJudgment}
            />
          ))}
        </div>
      ) : null}

      <p className="dd-muted dd-form-hint">
        本結果は業種テンプレ＋スケールに基づくデモ査定です。実案件では追加調査が必要です。
      </p>
    </section>
  );
}

function FlagCard({
  flag,
  judgment,
  onJudgment,
}: {
  flag: DdFlag;
  judgment: DdFlagJudgment;
  onJudgment: (id: string, value: DdFlagJudgment) => void;
}) {
  return (
    <article className="dd-flag-card">
      <div className="dd-flag-card__top">
        <div>
          <span className="dd-flag-badge">{flag.category}</span>
          <span className="dd-flag-conf">確信度 {flag.confidence}</span>
        </div>
        {flag.estimate ? (
          <p className="dd-flag-amt">
            {flag.estimate[0]}〜{flag.estimate[1]}百万円
          </p>
        ) : (
          <p className="dd-flag-amt dd-muted">構造リスク</p>
        )}
      </div>
      <h4>{flag.title}</h4>
      <p className="dd-flag-glance">{flag.glance}</p>
      <p className="dd-muted">prior: {flag.prior}</p>

      <div className="dd-flag-nodes">
        {flag.sources.map((s) => (
          <div key={s.label} className="dd-flag-node">
            <span className="dd-eyebrow">{s.label}</span>
            <span>{s.value}</span>
          </div>
        ))}
      </div>
      <p className="dd-flag-gap">
        <strong>gap</strong> {flag.gap}
      </p>
      <div className="dd-flag-inf">
        <span className="dd-eyebrow">推論（なぜフラグしたか）</span>
        <p>{flag.inference}</p>
      </div>
      <p className="dd-flag-deal">{flag.deal}</p>

      <div className="dd-flag-judge" role="group" aria-label="人間検証">
        {(
          [
            ["ok", "採用"],
            ["review", "要確認"],
            ["false", "誤検知"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            className={
              judgment === v
                ? "dd-flag-judge__btn dd-flag-judge__btn--on"
                : "dd-flag-judge__btn"
            }
            onClick={() => onJudgment(flag.id, judgment === v ? null : v)}
          >
            {label}
          </button>
        ))}
      </div>
    </article>
  );
}
