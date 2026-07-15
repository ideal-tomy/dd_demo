import { useMemo, useState } from "react";
import {
  DocumentIngestError,
  evaluateKnowledge,
  extractDocumentText,
} from "@axeon/ai-demo-core/demo-core";

type Props = {
  knowledge: string;
  confirmQuestion: string;
  onKnowledgeChange: (value: string) => void;
  onConfirmQuestionChange: (value: string) => void;
  /** sample モードでは AI 未送信の注意を出す */
  sampleMode?: boolean;
};

export function ClientContextPanel({
  knowledge,
  confirmQuestion,
  onKnowledgeChange,
  onConfirmQuestionChange,
  sampleMode = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);

  const status = useMemo(() => evaluateKnowledge(knowledge), [knowledge]);

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
    const sep = knowledge.trim() ? "\n\n---\n\n" : "";
    onKnowledgeChange(`${knowledge.trim()}${sep}${preview.trim()}`);
    setPreview(null);
    setFileName(null);
  }

  return (
    <section className="dd-card dd-context">
      <button
        type="button"
        className="dd-context__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <h2>ナレッジ・確認したいこと</h2>
          <p className="dd-muted">
            {status.characters > 0
              ? `${status.characters.toLocaleString()}文字`
              : "任意 — 補足資料や確認事項を追加"}
            {confirmQuestion.trim() ? " · 確認あり" : ""}
          </p>
        </div>
        <span className="dd-context__chevron" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div className="dd-context__body">
          {sampleMode ? (
            <p className="dd-muted dd-form-hint">
              サンプルモードでは画面に保持のみ。語りへの反映は APIキー / 体験コードで「提案を更新」してください。
            </p>
          ) : (
            <p className="dd-muted dd-form-hint">
              「提案を更新」時に AI へ送ります。数値は試算結果を優先し、ナレッジは補足として扱います。
            </p>
          )}

          <label className="dd-field">
            <span>ナレッジ（社内メモ・DDメモなど）</span>
            <textarea
              rows={5}
              value={knowledge}
              onChange={(e) => onKnowledgeChange(e.target.value)}
              placeholder="ここに対象企業情報や追加メモを貼り付け"
            />
          </label>

          <div className="dd-context__meta">
            <span className="dd-muted">
              {status.characters.toLocaleString()}文字 / 推定 約
              {status.estimatedTokens.toLocaleString()} tokens
            </span>
            {knowledge.trim() ? (
              <button
                type="button"
                className="dd-link"
                onClick={() => onKnowledgeChange("")}
              >
                クリア
              </button>
            ) : null}
          </div>
          {status.message ? (
            <p className={status.withinHardLimit ? "dd-warn" : "dd-error"}>
              {status.message}
            </p>
          ) : null}

          <div className="dd-context__upload">
            <p className="dd-field-label">資料から読み込む</p>
            <p className="dd-muted">
              PDF（テキスト層）/ TXT / MD / CSV / YAML / JSON
            </p>
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
                  <button
                    type="button"
                    className="dd-btn"
                    onClick={applyPreview}
                  >
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

          <label className="dd-field">
            <span>確認したいこと（任意・短文）</span>
            <input
              type="text"
              value={confirmQuestion}
              onChange={(e) => onConfirmQuestionChange(e.target.value)}
              placeholder="例: この依存度でもEXITは現実的か？"
              maxLength={200}
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
