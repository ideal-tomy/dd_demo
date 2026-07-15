import { useEffect, useState } from "react";
import {
  MA_COMPANIES,
  type MaCompany,
} from "../../data/ma-companies";

type Props = {
  value: MaCompany;
  onChange: (company: MaCompany) => void;
};

export function CompanyPicker({ value, onChange }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    setDetailOpen(false);
  }, [value.id]);

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

      <button
        type="button"
        className="dd-company-detail-toggle"
        aria-expanded={detailOpen}
        onClick={() => setDetailOpen((v) => !v)}
      >
        <span>企業情報を見る</span>
        <span aria-hidden>{detailOpen ? "▴" : "▾"}</span>
      </button>

      {detailOpen ? (
        <div className="dd-company-detail">
          <p className="dd-company-detail__name">{value.name}</p>
          <dl className="dd-company-detail__facts">
            <div>
              <dt>事業</dt>
              <dd>{value.profile.business}</dd>
            </div>
            <div>
              <dt>拠点</dt>
              <dd>{value.profile.sites}</dd>
            </div>
            <div>
              <dt>資本</dt>
              <dd>{value.profile.ownership}</dd>
            </div>
            <div>
              <dt>経常利益</dt>
              <dd>{value.profile.ordinary_income}百万円</dd>
            </div>
            <div>
              <dt>{value.profile.extra.label}</dt>
              <dd>{value.profile.extra.value}</dd>
            </div>
            <div>
              <dt>純有利子負債</dt>
              <dd>{value.financials.net_debt}百万円</dd>
            </div>
          </dl>

          <div className="dd-company-detail__block">
            <h3>業種プロファイル（prior）</h3>
            <p>{value.profile_prior}</p>
          </div>

          <div className="dd-company-detail__block">
            <h3>業種 prior（{value.industry_priors.length}）</h3>
            <div className="dd-prior-tags">
              {value.industry_priors.map((p) => (
                <span key={p} className="dd-prior-tag">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="dd-company-detail__block">
            <h3>想定データルーム（{value.data_room.length}）</h3>
            <ul className="dd-dataroom-list">
              {value.data_room.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="dd-company-detail__block">
            <h3>DD定量候補</h3>
            <ul className="dd-findings-list">
              {value.dd_findings.quantitative.map((f) => (
                <li key={f.item}>
                  <span className="dd-findings-list__title">{f.item}</span>
                  <span className="dd-muted">
                    {f.estimate[0]}〜{f.estimate[1]}百万円 · {f.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dd-company-detail__block">
            <h3>発見系候補</h3>
            <ul className="dd-findings-list">
              {value.dd_findings.discovered.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <p className="dd-muted dd-form-hint">
            下の試算・語りは、このサンプル企業データ（金額レンジ内）を根拠にしています。
          </p>
        </div>
      ) : null}
    </section>
  );
}
