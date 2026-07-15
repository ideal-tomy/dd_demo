import { useMemo, useState } from "react";
import { AiTransportError } from "../vendor/ai-demo/demo-core";
import { ExperienceModeBar } from "../components/access/ExperienceModeBar";
import { AccessModePanel } from "../components/access/AccessModePanel";
import {
  DiagnosisForm,
  DiagnosisResultView,
} from "../components/DiagnosisPanels";
import { getDdAccessMode } from "../access/dd-settings";
import type { DdAccessMode } from "../access/access-mode";
import {
  buildTrialPortalUrl,
  DD_DEMO_CATALOG_ID,
  DEFAULT_TRIAL_PORTAL_BASE,
} from "../access/trial-portal";
import { runDiagnosis } from "../ai/runDiagnosis";
import {
  EMPTY_FORM,
  SAMPLE_FORM,
  type DdDiagnosisResult,
  type DdFormInput,
} from "../ai/types";
import "../styles/ai.css";

export function DiagnosisPage() {
  const [mode, setMode] = useState<DdAccessMode>(() => getDdAccessMode());
  const [accessOpen, setAccessOpen] = useState(false);
  const [form, setForm] = useState<DdFormInput>(EMPTY_FORM);
  const [result, setResult] = useState<DdDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  const trialPortalHref = useMemo(() => {
    const returnUrl =
      typeof window !== "undefined" ? `${window.location.origin}/ai` : undefined;
    return buildTrialPortalUrl({
      baseUrl: DEFAULT_TRIAL_PORTAL_BASE,
      demoId: DD_DEMO_CATALOG_ID,
      returnUrl,
    });
  }, []);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    try {
      const outcome = await runDiagnosis(form);
      setResult(outcome.result);
      setRemaining(
        typeof outcome.remainingRequests === "number"
          ? outcome.remainingRequests
          : null,
      );
    } catch (err) {
      setResult(null);
      if (err instanceof AiTransportError) {
        setError(err.normalized.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("診断に失敗しました。");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dd-ai">
      <header className="dd-ai-top">
        <div>
          <p className="dd-eyebrow">AXEON DD INTELLIGENCE</p>
          <h1>企業フォーム診断（AI）</h1>
          <p className="dd-muted">
            共通 Core で構造化 JSON を生成し、診断カードとして表示します。
          </p>
        </div>
        <div className="dd-ai-top__links">
          <a className="dd-link" href="/">
            ← 演出デモへ
          </a>
          <button
            type="button"
            className="dd-btn-ghost"
            onClick={() => setAccessOpen(true)}
          >
            詳細設定
          </button>
        </div>
      </header>

      <ExperienceModeBar
        mode={mode}
        onModeChange={setMode}
        onNeedSetup={() => setAccessOpen(true)}
        trialPortalUrl={trialPortalHref}
      />

      <DiagnosisForm
        value={form}
        onChange={setForm}
        onSubmit={() => void onSubmit()}
        onFillSample={() => setForm(SAMPLE_FORM)}
        busy={busy}
      />

      {remaining != null ? (
        <p className="dd-muted">体験コード 残り回数: {remaining}</p>
      ) : null}
      {error ? <p className="dd-error">{error}</p> : null}
      {result ? <DiagnosisResultView result={result} /> : null}

      <AccessModePanel
        open={accessOpen}
        onClose={() => {
          setAccessOpen(false);
          setMode(getDdAccessMode());
        }}
        trialPortalUrl={trialPortalHref}
      />
    </div>
  );
}
