import { useMemo, useState, type FormEvent } from "react";
import {
  buildClientCompany,
  CLIENT_INDUSTRIES,
  emptyClientDraft,
  getDependencyLabel,
  type ClientCompanyInput,
  type ClientIndustry,
} from "../../ai/scenario/build-client-company";
import type { MaCompany } from "../../data/ma-companies";

type Props = {
  applied: boolean;
  draft: ClientCompanyInput;
  onDraftChange: (draft: ClientCompanyInput) => void;
  onApply: (company: MaCompany) => void;
};

export function ClientCompanyForm({
  applied,
  draft,
  onDraftChange,
  onApply,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const dependencyLabel = useMemo(
    () => getDependencyLabel(draft.industry),
    [draft.industry],
  );

  function update<K extends keyof ClientCompanyInput>(
    key: K,
    value: ClientCompanyInput[K],
  ) {
    onDraftChange({ ...draft, [key]: value });
    setError(null);
  }

  function onIndustryChange(industry: ClientIndustry) {
    const next = emptyClientDraft(industry);
    next.name = draft.name;
    onDraftChange(next);
    setError(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      setError("会社名を入力してください。");
      return;
    }
    if (!(draft.revenue > 0)) {
      setError("売上（百万円）を入力してください。");
      return;
    }
    if (!(draft.employees > 0)) {
      setError("従業員数を入力してください。");
      return;
    }
    const company = buildClientCompany(draft);
    onApply(company);
    setError(null);
  }

  return (
    <section className="dd-card">
      <div className="dd-card__head dd-card__head--row">
        <h2>対象企業情報を入力</h2>
        <p className="dd-muted">
          {applied ? "設定済み" : "未設定 — 下のボタンで確定"}
        </p>
      </div>
      <p className="dd-muted dd-form-hint">
        業種に応じた prior・データルーム・簿外候補を自動付与します。検知は次の「解析を実行」で行います。
      </p>
      <form className="dd-client-form" onSubmit={onSubmit}>
        <label className="dd-field">
          <span>会社名</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="例: 御社ホールディングス"
            autoComplete="organization"
          />
        </label>

        <label className="dd-field">
          <span>業種</span>
          <select
            value={draft.industry}
            onChange={(e) => onIndustryChange(e.target.value as ClientIndustry)}
          >
            {CLIENT_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </label>

        <div className="dd-field-row">
          <label className="dd-field">
            <span>売上（百万円）</span>
            <input
              type="number"
              min={1}
              step={10}
              value={draft.revenue || ""}
              onChange={(e) => update("revenue", Number(e.target.value) || 0)}
            />
          </label>
          <label className="dd-field">
            <span>経常利益（百万円）</span>
            <input
              type="number"
              min={0}
              step={5}
              value={draft.ordinaryIncome || ""}
              onChange={(e) =>
                update("ordinaryIncome", Number(e.target.value) || 0)
              }
            />
          </label>
        </div>

        <div className="dd-field-row">
          <label className="dd-field">
            <span>従業員数</span>
            <input
              type="number"
              min={1}
              step={1}
              value={draft.employees || ""}
              onChange={(e) => update("employees", Number(e.target.value) || 0)}
            />
          </label>
          <label className="dd-field">
            <span>{dependencyLabel}</span>
            <input
              type="text"
              value={draft.dependencyValue}
              onChange={(e) => update("dependencyValue", e.target.value)}
              placeholder="例: 32%"
            />
          </label>
        </div>

        {error ? <p className="dd-error">{error}</p> : null}

        <button type="submit" className="dd-btn">
          対象企業として設定
        </button>
      </form>
    </section>
  );
}
