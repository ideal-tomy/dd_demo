import { useCallback, useEffect, useState } from "react";
import {
  DD_ACCESS_MODE_LABELS,
  PRIMARY_ACCESS_MODES,
  type DdAccessMode,
} from "../../access/access-mode";
import {
  clearAll,
  getApiKey,
  getDdAccessMode,
  getDdModel,
  getDdProvider,
  getTrialCode,
  setApiKey,
  setDdAccessMode,
  setSettings,
  setTrialCode,
} from "../../access/dd-settings";
import {
  getEnabledProviders,
  getProviderConfig,
} from "../../vendor/ai-demo/config/provider.config";
import {
  testConnection,
  testTrialConnection,
} from "../../vendor/ai-demo/demo-core";
import type { AiProvider } from "../../vendor/ai-demo/types/access-mode";
import type { TrialPublicStatus } from "../../vendor/ai-demo/types/trial";

type Props = {
  open: boolean;
  onClose: () => void;
  trialPortalUrl?: string;
};

export function AccessModePanel({ open, onClose, trialPortalUrl }: Props) {
  const [mode, setMode] = useState<DdAccessMode>(() => getDdAccessMode());
  const [provider, setProvider] = useState<AiProvider>(() => getDdProvider());
  const [model, setModel] = useState(() => getDdModel());
  const [apiKeyDraft, setApiKeyDraft] = useState(() =>
    getApiKey(getDdProvider()),
  );
  const [trialDraft, setTrialDraft] = useState(() => getTrialCode());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialPublicStatus | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode(getDdAccessMode());
    setProvider(getDdProvider());
    setModel(getDdModel());
    setApiKeyDraft(getApiKey(getDdProvider()));
    setTrialDraft(getTrialCode());
  }, [open]);

  const applyMode = useCallback((next: DdAccessMode) => {
    setMode(next);
    setDdAccessMode(next);
    setStatusMsg(`モード: ${DD_ACCESS_MODE_LABELS[next]}`);
  }, []);

  const saveByok = useCallback(async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      setApiKey(provider, apiKeyDraft.trim());
      setSettings({ provider, model, accessMode: "byok-direct" });
      setDdAccessMode("byok-direct");
      setMode("byok-direct");
      const result = await testConnection({
        provider,
        apiKey: apiKeyDraft.trim(),
        model,
      });
      setStatusMsg(
        result.ok ? "APIキー接続に成功しました。" : result.error.userMessage,
      );
    } finally {
      setBusy(false);
    }
  }, [apiKeyDraft, model, provider]);

  const saveTrial = useCallback(async () => {
    setBusy(true);
    setStatusMsg(null);
    try {
      const code = trialDraft.trim();
      setTrialCode(code);
      setSettings({ accessMode: "managed-trial", provider: "openai" });
      setDdAccessMode("managed-trial");
      setMode("managed-trial");
      setProvider("openai");
      const result = await testTrialConnection(code, "openai");
      if (result.ok) {
        setTrialStatus(result.status);
        setStatusMsg(
          `体験コード有効。残り ${result.status.remainingRequests} / ${result.status.maxRequests} 回`,
        );
      } else {
        setTrialStatus(null);
        setStatusMsg(result.error.userMessage);
      }
    } finally {
      setBusy(false);
    }
  }, [trialDraft]);

  if (!open) return null;

  const providers = getEnabledProviders();
  const providerCfg = getProviderConfig(provider);

  return (
    <div className="dd-panel-backdrop" role="dialog" aria-modal="true">
      <div className="dd-panel">
        <div className="dd-panel__head">
          <h2>詳細設定</h2>
          <button type="button" className="dd-btn-ghost" onClick={onClose}>
            閉じる
          </button>
        </div>

        <label className="dd-field">
          <span>体験モード</span>
          <select
            value={mode}
            onChange={(e) => applyMode(e.target.value as DdAccessMode)}
          >
            {PRIMARY_ACCESS_MODES.map((m) => (
              <option key={m} value={m}>
                {DD_ACCESS_MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        {mode === "byok-direct" ? (
          <div className="dd-stack">
            <label className="dd-field">
              <span>Provider</span>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as AiProvider;
                  setProvider(p);
                  setApiKeyDraft(getApiKey(p));
                  const cfg = getProviderConfig(p);
                  if (cfg) setModel(cfg.defaultModel);
                }}
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="dd-field">
              <span>モデル</span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={providerCfg?.defaultModel}
              />
            </label>
            <label className="dd-field">
              <span>APIキー</span>
              <input
                type="password"
                value={apiKeyDraft}
                onChange={(e) => setApiKeyDraft(e.target.value)}
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="dd-btn"
              disabled={busy}
              onClick={() => void saveByok()}
            >
              APIキーを保存して接続確認
            </button>
          </div>
        ) : null}

        {mode === "managed-trial" ? (
          <div className="dd-stack">
            <p className="dd-muted">
              体験コードは Studio の共通ポータルで取得します（発行 UI
              は本デモにありません）。
            </p>
            {trialPortalUrl ? (
              <a
                className="dd-link"
                href={trialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                体験コードを取得 →
              </a>
            ) : null}
            <label className="dd-field">
              <span>体験コード</span>
              <input
                value={trialDraft}
                onChange={(e) => setTrialDraft(e.target.value)}
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              className="dd-btn"
              disabled={busy}
              onClick={() => void saveTrial()}
            >
              体験コードを保存して確認
            </button>
            {trialStatus ? (
              <p className="dd-muted">
                残り {trialStatus.remainingRequests} / {trialStatus.maxRequests}{" "}
                回
              </p>
            ) : null}
          </div>
        ) : null}

        {statusMsg ? <p className="dd-status">{statusMsg}</p> : null}

        <button
          type="button"
          className="dd-btn-ghost"
          onClick={() => {
            clearAll();
            setStatusMsg("保存データをクリアしました。");
          }}
        >
          設定をクリア
        </button>
      </div>
    </div>
  );
}
