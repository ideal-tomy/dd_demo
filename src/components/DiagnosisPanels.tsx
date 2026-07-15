import type { DdDiagnosisResult } from "../ai/types";

type Props = {
  result: DdDiagnosisResult;
  highlight?: boolean;
};

export function DiagnosisResultView({ result, highlight }: Props) {
  return (
    <div className={highlight ? "dd-result dd-card--flash" : "dd-result"}>
      <section>
        <h3>Diagnosis</h3>
        <p>{result.diagnosis}</p>
      </section>
      <section>
        <h3>Value-up Plan</h3>
        <p>{result.planNarrative}</p>
      </section>
      <section>
        <h3>Levers</h3>
        <ul>
          {result.leverDetails.map((l) => (
            <li key={l.lever}>
              <strong>{l.lever}</strong>
              <span>{l.rationale}</span>
              {l.kpi ? <span className="dd-muted">KPI: {l.kpi}</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Off-balance Treatment</h3>
        <ul>
          {result.offbalancePlan.map((o) => (
            <li key={o.item}>
              <strong>{o.item}</strong>
              <span>{o.treatment}</span>
              {o.timing ? (
                <span className="dd-muted">Timing: {o.timing}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>EXIT Story</h3>
        <p>{result.exitStory}</p>
      </section>
      <section>
        <h3>Roadmap</h3>
        <ol className="dd-roadmap">
          <li>
            <strong>Phase 1</strong>
            <span>{result.roadmap.phase1}</span>
          </li>
          <li>
            <strong>Phase 2</strong>
            <span>{result.roadmap.phase2}</span>
          </li>
          <li>
            <strong>Phase 3</strong>
            <span>{result.roadmap.phase3}</span>
          </li>
        </ol>
      </section>
      {result.gapAdvice ? (
        <section className="dd-gap-advice">
          <h3>Gap Advice</h3>
          <p>{result.gapAdvice}</p>
        </section>
      ) : null}
      <section>
        <h3>Risks</h3>
        <ul>
          {result.risks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <p className="dd-muted">
        本試算はサンプル診断であり、実案件では追加調査が必要です。
      </p>
    </div>
  );
}
