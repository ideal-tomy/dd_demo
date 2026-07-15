import { useState } from "react";
import {
  DocumentIngestError,
  evaluateKnowledge,
  extractDocumentText,
} from "../../vendor/ai-demo/demo-core";
import type { MaCompany } from "../../data/ma-companies";

type Props = {
  company: MaCompany;
  extraPriors: string[];
  materials: string;
  analyzing: boolean;
  scanStep: string | null;
  onAddPrior: (text: string) => void;
  onMaterialsChange: (text: string) => void;
  onAnalyze: () => void;
};

export function ClientDdSetupPanel({
  company,
  extraPriors,
  materials,
  analyzing,
  scanStep,
  onAddPrior,
  onMaterialsChange,
  onAnalyze,
}: Props) {
  const [priorDraft, setPriorDraft] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);

  const materialsStatus = evaluateKnowledge(materials);
  const allPriors = [...company.industry_priors, ...extraPriors];

  async function onFile(file: File | null) {
    if (!file) return;
    setFileBusy(true);
    setFileError(null);
    setPreview(null);
    try {
      const extracted = await extractDocumentText(file, "knowledge");
      setPreview(extracted.text);
      setFileName(file.name);
      if (extracted.warning) setFileError(extracted.warning);
    } catch (err) {
      setFileName(null);
      if (err instanceof DocumentIngestError) {
        setFileError(err.message);
      } else {
        setFileError("ファイルの読み込みに失敗しました。");
      }
    } finally {
      setFileBusy(false);
    }
  }

  function applyPreview() {
    if (!preview?.trim()) return;
    const sep = materials.trim() ? "\n\n---\n\n" : "";
    onMaterialsChange(`${materials.trim()}${sep}${preview.trim()}`);
    setPreview(null);
    setFileName(null);
  }

  function submitPrior() {
    const t = priorDraft.trim();
    if (!t) return;
    onAddPrior(t);
    setPriorDraft("");
  }

  return (
    <section className="dd-card dd-dd-setup">
      <div className="dd-card__head">
        <h2>① DD準備 — 事前知識とデータルーム</h2>
        <p className="dd-muted">
          {company.name}（{company.industry}）— 解析の材料を整えます
        </p>
      </div>

      <div className="dd-setup-block">
        <div className="dd-setup-block__head">
          <h3>事前知識（業種 prior）</h3>
          <span className="dd-muted">{allPriors.length}件</span>
        </div>
        <div className="dd-prior-tags">
          {allPriors.map((p) => (
            <span key={p} className="dd-prior-tag">
              {p}
            </span>
          ))}
        </div>
        <div className="dd-prior-add">
          <input
            type="text"
            value={priorDraft}
            onChange={(e) => setPriorDraft(e.target.value)}
            placeholder="例: 倉庫の構内請負に偽装請負の疑い"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitPrior();
              }
            }}
          />
          <button type="button" className="dd-btn-ghost" onClick={submitPrior}>
            登録
          </button>
        </div>
        <p className="dd-muted dd-form-hint">
          仮説を追加できます。突合のチェックリストに加わります（フラグ金額は自動発明しません）。
        </p>
      </div>

      <div className="dd-setup-block">
        <div className="dd-setup-block__head">
          <h3>データルーム</h3>
          <span className="dd-muted">{company.data_room.length}ソース</span>
        </div>
        <ul className="dd-dataroom-list">
          {company.data_room.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="dd-muted dd-form-hint">
          デモでは業種テンプレの想定ソース一覧です。実ファイルの一括アップロードは不要です。
        </p>
      </div>

      <div className="dd-setup-block">
        <div className="dd-setup-block__head">
          <h3>追加資料（任意）</h3>
        </div>
        <p className="dd-muted dd-form-hint">
          自由記述や PDF 等の要点を入れると、解析後の質問・語り補強の材料になります。
        </p>
        <textarea
          rows={4}
          value={materials}
          onChange={(e) => onMaterialsChange(e.target.value)}
          placeholder="対象企業のメモ・追加資料の要点を貼り付け"
        />
        <div className="dd-context__meta">
          <span className="dd-muted">
            {materialsStatus.characters.toLocaleString()}文字
          </span>
          {materials.trim() ? (
            <button
              type="button"
              className="dd-link"
              onClick={() => onMaterialsChange("")}
            >
              クリア
            </button>
          ) : null}
        </div>
        {materialsStatus.message ? (
          <p
            className={
              materialsStatus.withinHardLimit ? "dd-warn" : "dd-error"
            }
          >
            {materialsStatus.message}
          </p>
        ) : null}

        <div className="dd-context__upload">
          <p className="dd-field-label">資料から読み込む</p>
          <p className="dd-muted">PDF（テキスト層）/ TXT / MD / CSV / YAML / JSON</p>
          <input
            type="file"
            accept=".pdf,.txt,.md,.csv,.yaml,.yml,.json"
            disabled={fileBusy}
            onChange={(e) => {
              void onFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          {fileBusy ? <p className="dd-muted">読み込み中…</p> : null}
          {fileError ? <p className="dd-error">{fileError}</p> : null}
          {preview != null ? (
            <div className="dd-context__preview">
              <p className="dd-muted">
                プレビュー{fileName ? `（${fileName}）` : ""} — 確認して適用
              </p>
              <pre className="dd-context__preview-text">{preview}</pre>
              <div className="dd-context__preview-actions">
                <button type="button" className="dd-btn" onClick={applyPreview}>
                  この内容を使う
                </button>
                <button
                  type="button"
                  className="dd-btn-ghost"
                  onClick={() => {
                    setPreview(null);
                    setFileName(null);
                  }}
                >
                  破棄
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {scanStep ? (
        <p className="dd-scan-status" aria-live="polite">
          {scanStep}
        </p>
      ) : null}

      <button
        type="button"
        className="dd-btn dd-btn--analyze"
        disabled={analyzing || !materialsStatus.withinHardLimit}
        onClick={onAnalyze}
      >
        {analyzing ? "解析中…" : "解析を実行"}
      </button>
    </section>
  );
}
