import type { DdDiagnosisResult, DdFormInput } from "../ai/types";

type FormProps = {
  value: DdFormInput;
  onChange: (next: DdFormInput) => void;
  onSubmit: () => void;
  onFillSample: () => void;
  busy: boolean;
};

const FIELDS: { key: keyof DdFormInput; label: string; rows?: number }[] = [
  { key: "companyName", label: "企業名" },
  { key: "industry", label: "業種" },
  { key: "revenue", label: "売上規模" },
  { key: "employees", label: "従業員数" },
  { key: "challenges", label: "現在の課題", rows: 3 },
  { key: "systems", label: "利用中システム", rows: 2 },
  { key: "freeText", label: "自由記述", rows: 3 },
];

export function DiagnosisForm({
  value,
  onChange,
  onSubmit,
  onFillSample,
  busy,
}: FormProps) {
  return (
    <form
      className="dd-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="dd-form__grid">
        {FIELDS.map((f) => (
          <label key={String(f.key)} className="dd-field">
            <span>{f.label}</span>
            {f.rows ? (
              <textarea
                rows={f.rows}
                value={value[f.key]}
                onChange={(e) =>
                  onChange({ ...value, [f.key]: e.target.value })
                }
                required={f.key !== "freeText"}
              />
            ) : (
              <input
                value={value[f.key]}
                onChange={(e) =>
                  onChange({ ...value, [f.key]: e.target.value })
                }
                required
              />
            )}
          </label>
        ))}
      </div>
      <div className="dd-form__actions">
        <button type="button" className="dd-btn-ghost" onClick={onFillSample}>
          サンプル企業を入れる
        </button>
        <button type="submit" className="dd-btn" disabled={busy}>
          {busy ? "診断中…" : "診断を実行"}
        </button>
      </div>
    </form>
  );
}

export function DiagnosisResultView({ result }: { result: DdDiagnosisResult }) {
  return (
    <div className="dd-result">
      <section>
        <h3>Diagnosis</h3>
        <p>{result.diagnosis}</p>
      </section>
      <section>
        <h3>Tech Opportunity</h3>
        <p>{result.techOpportunity}</p>
      </section>
      <section>
        <h3>Development Options</h3>
        <ul>
          {result.developmentOptions.map((o: DdDiagnosisResult["developmentOptions"][number]) => (
            <li key={o.title}>
              <strong>{o.title}</strong>
              <span>{o.summary}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Priority</h3>
        <ol>
          {result.priority
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map((p) => (
              <li key={`${p.rank}-${p.item}`}>
                <strong>
                  #{p.rank} {p.item}
                </strong>
                <span>{p.rationale}</span>
              </li>
            ))}
        </ol>
      </section>
      <section>
        <h3>Investment &amp; Impact</h3>
        <p>
          <strong>Investment:</strong> {result.investmentImpact.investment}
        </p>
        <p>
          <strong>Impact:</strong> {result.investmentImpact.impact}
        </p>
        {result.investmentImpact.note ? (
          <p className="dd-muted">{result.investmentImpact.note}</p>
        ) : null}
      </section>
      <section>
        <h3>Prototype</h3>
        <p>
          <strong>{result.prototype.name}</strong>
        </p>
        <p>{result.prototype.scope}</p>
        <p className="dd-muted">Next: {result.prototype.nextStep}</p>
      </section>
      <section>
        <h3>Roadmap</h3>
        <ul>
          {result.roadmap.map((r) => (
            <li key={r.phase}>
              <strong>{r.phase}</strong>
              <span>{r.items.join(" · ")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
