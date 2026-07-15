import {
  STRATEGY_AXIS_LABELS,
  type MaCompany,
  type StrategyAxis,
} from "../../data/ma-companies";

type Props = {
  company: MaCompany;
  axis: StrategyAxis;
  highlight?: boolean;
};

export function OffbalancePanel({ company, axis, highlight }: Props) {
  const treatment = company.offbalance_treatment[axis];

  return (
    <section className={highlight ? "dd-card dd-card--flash" : "dd-card"}>
      <div className="dd-card__head">
        <h2>簿外債務と処置方針</h2>
        <p className="dd-muted">
          主軸「{STRATEGY_AXIS_LABELS[axis]}」に連動（JSON即時反映）
        </p>
      </div>

      <div className="dd-treatment">
        <p>{treatment}</p>
      </div>

      <ul className="dd-findings">
        {company.dd_findings.quantitative.map((f) => (
          <li key={f.item}>
            <div className="dd-findings__top">
              <strong>{f.item}</strong>
              <span className={`dd-conf dd-conf--${f.severity}`}>
                {f.severity}
              </span>
            </div>
            <span className="dd-muted">
              推計 {f.estimate[0]}〜{f.estimate[1]}百万円
            </span>
          </li>
        ))}
      </ul>

      <div className="dd-discovered">
        <span className="dd-k">発見系</span>
        <ul>
          {company.dd_findings.discovered.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
