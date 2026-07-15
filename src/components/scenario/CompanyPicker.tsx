import {
  MA_COMPANIES,
  type MaCompany,
} from "../../data/ma-companies";

type Props = {
  value: MaCompany;
  onChange: (company: MaCompany) => void;
};

export function CompanyPicker({ value, onChange }: Props) {
  return (
    <section className="dd-card dd-card--compact">
      <div className="dd-card__head dd-card__head--row">
        <h2>対象企業</h2>
        <p className="dd-muted">タップで切替</p>
      </div>
      <div className="dd-company-tabs" role="tablist">
        {MA_COMPANIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === value.id}
            className={c.id === value.id ? "dd-chip dd-chip--on" : "dd-chip"}
            onClick={() => onChange(c)}
          >
            <span className="dd-chip__ind">{c.industry}</span>
            <span className="dd-chip__name">
              {c.name.replace("株式会社", "").replace("工業", "")}
            </span>
          </button>
        ))}
      </div>
      <dl className="dd-profile__stats dd-profile__stats--compact">
        <div>
          <dt>売上</dt>
          <dd>{(value.profile.revenue / 100).toFixed(0)}億</dd>
        </div>
        <div>
          <dt>EBITDA</dt>
          <dd>{value.financials.ebitda}百万</dd>
        </div>
        <div>
          <dt>従業員</dt>
          <dd>{value.profile.employees}名</dd>
        </div>
        <div>
          <dt>{value.profile.key_dependency.label}</dt>
          <dd>{value.profile.key_dependency.value}</dd>
        </div>
      </dl>
    </section>
  );
}
