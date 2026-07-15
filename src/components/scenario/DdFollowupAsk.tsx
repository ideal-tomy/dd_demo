import { useState } from "react";

type Props = {
  disabled: boolean;
  busy: boolean;
  needSetup: boolean;
  answer: string | null;
  citations: string[];
  onNeedSetup: () => void;
  onAsk: (question: string) => Promise<void>;
};

export function DdFollowupAsk({
  disabled,
  busy,
  needSetup,
  answer,
  citations,
  onNeedSetup,
  onAsk,
}: Props) {
  const [q, setQ] = useState("");

  async function submit() {
    const text = q.trim();
    if (!text) return;
    await onAsk(text);
  }

  return (
    <section className="dd-card dd-followup">
      <div className="dd-card__head">
        <h2>この結果について聞く</h2>
        <p className="dd-muted">
          解析フラグと追加資料だけを根拠に回答します（新しい金額は作りません）
        </p>
      </div>
      {needSetup ? (
        <p className="dd-muted">
          APIキーまたは体験コードが必要です。
          <button type="button" className="dd-link" onClick={onNeedSetup}>
            詳細設定を開く
          </button>
        </p>
      ) : null}
      <div className="dd-followup__row">
        <input
          type="text"
          value={q}
          disabled={disabled || busy}
          onChange={(e) => setQ(e.target.value)}
          placeholder="例: 未払残業は価格調整でどの程度見るべきか？"
          maxLength={400}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <button
          type="button"
          className="dd-btn"
          disabled={disabled || busy || !q.trim()}
          onClick={() => void submit()}
        >
          {busy ? "回答中…" : "質問する"}
        </button>
      </div>
      {answer ? (
        <div className="dd-followup__answer">
          <p>{answer}</p>
          {citations.length > 0 ? (
            <ul className="dd-followup__cite">
              {citations.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
