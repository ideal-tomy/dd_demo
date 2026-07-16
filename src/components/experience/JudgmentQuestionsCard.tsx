import type { JudgmentPhase, StrategyAxis } from "../../data/ma-companies";

type Props = {
  phase: JudgmentPhase;
  strategyAxis: StrategyAxis;
  questions: string[];
};

export function JudgmentQuestionsCard({
  phase,
  strategyAxis,
  questions,
}: Props) {
  if (questions.length === 0) return null;

  return (
    <aside
      className="dd-judgment-card"
      data-phase={phase}
      data-axis={strategyAxis}
    >
      <p className="dd-judgment-card__eyebrow">ここから先は、経営判断です</p>
      <ul className="dd-judgment-card__list">
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </aside>
  );
}
