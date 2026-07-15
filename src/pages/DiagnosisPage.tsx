import { useEffect, useMemo, useRef, useState } from "react";
import {
  AiTransportError,
  evaluateKnowledge,
} from "../vendor/ai-demo/demo-core";
import {
  getApiKey,
  getDdAccessMode,
  getDdProvider,
  getSettings,
  getTrialCode,
  setSettings,
} from "../access/dd-settings";
import { ExperienceModeBar } from "../components/access/ExperienceModeBar";
import { AccessModePanel } from "../components/access/AccessModePanel";
import { CompanyPicker } from "../components/scenario/CompanyPicker";
import { ClientCompanyForm } from "../components/scenario/ClientCompanyForm";
import { ClientDdSetupPanel } from "../components/scenario/ClientDdSetupPanel";
import { DdFlagReport } from "../components/scenario/DdFlagReport";
import { DdFollowupAsk } from "../components/scenario/DdFollowupAsk";
import { ParamsBottomSheet } from "../components/scenario/ParamsBottomSheet";
import { ResultDashboard } from "../components/scenario/ResultDashboard";
import { StorySections } from "../components/scenario/StorySections";
import type { DdAccessMode } from "../access/access-mode";
import {
  buildTrialPortalUrl,
  DD_DEMO_CATALOG_ID,
  DEFAULT_TRIAL_PORTAL_BASE,
} from "../access/trial-portal";
import { askDdFollowup } from "../ai/askDdFollowup";
import { runDiagnosis } from "../ai/runDiagnosis";
import { enrichDdReport } from "../ai/runDdReport";
import {
  emptyClientDraft,
  type ClientCompanyInput,
} from "../ai/scenario/build-client-company";
import {
  buildDdFlagsFromCompany,
  DD_SCAN_STEPS,
  summarizeDdFlags,
  type DdFlag,
  type DdFlagJudgment,
} from "../ai/scenario/build-dd-flags";
import {
  computeExit,
  DEFAULT_PARAMS,
  type ScenarioParams,
} from "../ai/scenario/exit-model";
import { buildSampleNarrative } from "../ai/scenario/sample-narrative";
import {
  MA_COMPANIES,
  type MaCompany,
  type StrategyAxis,
} from "../data/ma-companies";
import type { DdDiagnosisResult } from "../ai/types";
import "../styles/ai.css";

type DataSource = "sample" | "client";

export function DiagnosisPage() {
  const [mode, setMode] = useState<DdAccessMode>(() => getDdAccessMode());
  const [accessOpen, setAccessOpen] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>("sample");
  const [clientDraft, setClientDraft] = useState<ClientCompanyInput>(() =>
    emptyClientDraft(),
  );
  const [clientApplied, setClientApplied] = useState(false);
  const [clientAnalyzed, setClientAnalyzed] = useState(false);
  const [company, setCompany] = useState<MaCompany>(MA_COMPANIES[0]);
  const [params, setParams] = useState<ScenarioParams>(DEFAULT_PARAMS);
  const [materials, setMaterials] = useState(
    () => getSettings().knowledge ?? "",
  );
  const [extraPriors, setExtraPriors] = useState<string[]>([]);
  const [flags, setFlags] = useState<DdFlag[]>([]);
  const [judgments, setJudgments] = useState<Record<string, DdFlagJudgment>>(
    {},
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState<string | null>(null);
  const [askBusy, setAskBusy] = useState(false);
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askCitations, setAskCitations] = useState<string[]>([]);
  const [result, setResult] = useState<DdDiagnosisResult | null>(() => {
    const initial = computeExit(MA_COMPANIES[0], DEFAULT_PARAMS);
    return buildSampleNarrative(MA_COMPANIES[0], DEFAULT_PARAMS, initial);
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [flashKpi, setFlashKpi] = useState(false);
  const [flashBridge, setFlashBridge] = useState(false);
  const [flashOffbalance, setFlashOffbalance] = useState(false);
  const [equityDiff, setEquityDiff] = useState<number | null>(null);
  const [usedActionIds, setUsedActionIds] = useState<Set<string>>(
    () => new Set(),
  );

  const prevAxis = useRef(params.strategyAxis);
  const prevEquity = useRef<number | null>(null);
  const prevCompanyId = useRef(company.id);
  const flashTimer = useRef<number | null>(null);
  const scanTimer = useRef<number | null>(null);

  const computed = useMemo(
    () => computeExit(company, params),
    [company, params],
  );

  const materialsStatus = useMemo(
    () => evaluateKnowledge(materials),
    [materials],
  );

  const flagSummary = useMemo(() => summarizeDdFlags(flags), [flags]);

  const formBlocked = dataSource === "client" && !clientApplied;
  const exitBlocked =
    dataSource === "client" && (!clientApplied || !clientAnalyzed);
  const showExit = dataSource === "sample" || clientAnalyzed;

  const trialPortalHref = useMemo(() => {
    const returnUrl =
      typeof window !== "undefined" ? `${window.location.origin}/ai` : undefined;
    return buildTrialPortalUrl({
      baseUrl: DEFAULT_TRIAL_PORTAL_BASE,
      demoId: DD_DEMO_CATALOG_ID,
      returnUrl,
    });
  }, []);

  const askNeedsSetup =
    mode === "sample" ||
    (mode === "byok-direct" && !getApiKey(getDdProvider()).trim()) ||
    (mode === "managed-trial" && !getTrialCode().trim());

  function pulse(setters: Array<(v: boolean) => void>) {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    for (const s of setters) s(true);
    flashTimer.current = window.setTimeout(() => {
      for (const s of setters) s(false);
    }, 1200);
  }

  function applyCompany(next: MaCompany) {
    setCompany(next);
    setUsedActionIds(new Set());
    const nextComputed = computeExit(next, params);
    setResult(buildSampleNarrative(next, params, nextComputed));
    prevEquity.current = null;
    setEquityDiff(null);
    pulse([setFlashKpi, setFlashBridge, setFlashOffbalance]);
  }

  function onDataSourceChange(next: DataSource) {
    if (next === dataSource) return;
    setDataSource(next);
    setClientApplied(false);
    setClientAnalyzed(false);
    setFlags([]);
    setJudgments({});
    setExtraPriors([]);
    setAskAnswer(null);
    setAskCitations([]);
    setUsedActionIds(new Set());
    setError(null);
    if (next === "sample") {
      applyCompany(MA_COMPANIES[0]);
    }
  }

  function onMaterialsChange(value: string) {
    setMaterials(value);
    setSettings({ knowledge: value });
  }

  // サンプル語り追従
  useEffect(() => {
    if (mode !== "sample") return;
    if (exitBlocked) return;
    setResult(buildSampleNarrative(company, params, computed));
  }, [mode, company, params, computed, exitBlocked]);

  // 企業切替
  useEffect(() => {
    if (prevCompanyId.current === company.id) return;
    prevCompanyId.current = company.id;
    if (exitBlocked) return;
    setResult(buildSampleNarrative(company, params, computed));
    setUsedActionIds(new Set());
    prevEquity.current = null;
    setEquityDiff(null);
    pulse([setFlashKpi, setFlashBridge, setFlashOffbalance]);
  }, [company, params, computed, exitBlocked]);

  useEffect(() => {
    if (exitBlocked) return;
    if (
      prevEquity.current != null &&
      prevEquity.current !== computed.equityValue
    ) {
      setEquityDiff(computed.equityValue - prevEquity.current);
      pulse([setFlashKpi, setFlashBridge]);
    }
    prevEquity.current = computed.equityValue;
  }, [computed.equityValue, exitBlocked]);

  useEffect(() => {
    if (prevAxis.current !== params.strategyAxis) {
      prevAxis.current = params.strategyAxis;
      if (!exitBlocked) {
        pulse([setFlashOffbalance, setFlashKpi]);
      }
    }
  }, [params.strategyAxis, exitBlocked]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      if (scanTimer.current) window.clearTimeout(scanTimer.current);
    };
  }, []);

  function onAxisChange(axis: StrategyAxis) {
    setParams((p) => ({ ...p, strategyAxis: axis }));
  }

  async function runClientAnalysis() {
    if (!clientApplied) return;
    setAnalyzing(true);
    setError(null);
    setAskAnswer(null);
    setAskCitations([]);

    const baseFlags = buildDdFlagsFromCompany(company);
    let step = 0;
    setScanStep(DD_SCAN_STEPS[0]);

    await new Promise<void>((resolve) => {
      const tick = () => {
        step += 1;
        if (step >= DD_SCAN_STEPS.length) {
          setScanStep(null);
          resolve();
          return;
        }
        setScanStep(DD_SCAN_STEPS[step]);
        scanTimer.current = window.setTimeout(tick, 450);
      };
      scanTimer.current = window.setTimeout(tick, 450);
    });

    let nextFlags = baseFlags;
    if (mode !== "sample") {
      const enriched = await enrichDdReport({
        company,
        flags: baseFlags,
        materials,
        extraPriors,
      });
      nextFlags = enriched.flags;
      if (typeof enriched.remainingRequests === "number") {
        setRemaining(enriched.remainingRequests);
      }
    }

    setFlags(nextFlags);
    setJudgments({});
    setClientAnalyzed(true);
    setResult(buildSampleNarrative(company, params, computed));
    pulse([setFlashKpi, setFlashBridge, setFlashOffbalance]);
    setAnalyzing(false);
  }

  async function onAsk(question: string) {
    setAskBusy(true);
    setError(null);
    try {
      const outcome = await askDdFollowup({
        company,
        flags,
        materials,
        extraPriors,
        question,
      });
      setAskAnswer(outcome.answer);
      setAskCitations(outcome.citations);
      if (typeof outcome.remainingRequests === "number") {
        setRemaining(outcome.remainingRequests);
      }
    } catch (err) {
      if (err instanceof AiTransportError) {
        setError(err.normalized.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("質問への回答に失敗しました。");
      }
    } finally {
      setAskBusy(false);
    }
  }

  async function onUpdateProposal() {
    if (exitBlocked) {
      setError(
        dataSource === "client"
          ? "先に対象企業を設定し「解析を実行」してください。"
          : "先に対象企業を設定してください。",
      );
      return;
    }
    if (!materialsStatus.withinHardLimit) {
      setError("追加資料が上限を超えています。短くしてから更新してください。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const outcome = await runDiagnosis({
        company,
        params,
        computed,
        knowledge: dataSource === "client" ? materials : "",
      });
      setResult(outcome.result);
      pulse([setFlashKpi]);
      setRemaining(
        typeof outcome.remainingRequests === "number"
          ? outcome.remainingRequests
          : null,
      );
    } catch (err) {
      if (err instanceof AiTransportError) {
        setError(err.normalized.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("提案の更新に失敗しました。");
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
          <h1>DD → バリューアップ → EXIT</h1>
          <p className="dd-muted">
            {dataSource === "sample"
              ? "サンプル企業で EXIT／バリューアップ試算を動かします。"
              : "自社情報を設定し、DD解析のあと同じ試算画面へ進みます。"}
          </p>
        </div>
        <div className="dd-ai-top__links">
          <a className="dd-link" href="/">
            ← ストーリーデモへ
          </a>
          <button
            type="button"
            className="dd-btn-ghost dd-btn-sm"
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

      <section className="dd-card dd-card--compact">
        <div className="dd-card__head dd-card__head--row">
          <h2>データの入れ方</h2>
          <p className="dd-muted">サンプル or 自社</p>
        </div>
        <div className="dd-source-tabs" role="tablist" aria-label="データソース">
          <button
            type="button"
            role="tab"
            aria-selected={dataSource === "sample"}
            className={
              dataSource === "sample" ? "dd-tab dd-tab--on" : "dd-tab"
            }
            onClick={() => onDataSourceChange("sample")}
          >
            サンプル企業
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={dataSource === "client"}
            className={
              dataSource === "client" ? "dd-tab dd-tab--on" : "dd-tab"
            }
            onClick={() => onDataSourceChange("client")}
          >
            自社で入力
          </button>
        </div>
      </section>

      {dataSource === "sample" ? (
        <CompanyPicker
          value={company}
          onChange={(c) => {
            applyCompany(c);
          }}
        />
      ) : (
        <ClientCompanyForm
          applied={clientApplied}
          draft={clientDraft}
          onDraftChange={setClientDraft}
          onApply={(c) => {
            setClientApplied(true);
            setClientAnalyzed(false);
            setFlags([]);
            setJudgments({});
            setExtraPriors([]);
            setAskAnswer(null);
            applyCompany(c);
          }}
        />
      )}

      {dataSource === "client" && clientApplied ? (
        <ClientDdSetupPanel
          company={company}
          extraPriors={extraPriors}
          materials={materials}
          analyzing={analyzing}
          scanStep={scanStep}
          onAddPrior={(text) =>
            setExtraPriors((prev) =>
              prev.includes(text) ? prev : [...prev, text],
            )
          }
          onMaterialsChange={onMaterialsChange}
          onAnalyze={() => void runClientAnalysis()}
        />
      ) : null}

      {formBlocked ? (
        <p className="dd-muted dd-blocked-hint">
          対象企業情報を入力し「対象企業として設定」を押すと、DD準備へ進みます。
        </p>
      ) : null}

      {dataSource === "client" && clientAnalyzed && flags.length > 0 ? (
        <>
          <DdFlagReport
            companyName={company.name}
            industry={company.industry}
            flags={flags}
            summary={flagSummary}
            judgments={judgments}
            onJudgment={(id, value) =>
              setJudgments((prev) => ({ ...prev, [id]: value }))
            }
          />
          <DdFollowupAsk
            disabled={askNeedsSetup}
            busy={askBusy}
            needSetup={askNeedsSetup}
            answer={askAnswer}
            citations={askCitations}
            onNeedSetup={() => setAccessOpen(true)}
            onAsk={onAsk}
          />
        </>
      ) : null}

      {showExit ? (
        <div className="dd-results-stack">
          {dataSource === "client" ? (
            <p className="dd-muted dd-form-hint">
              ② バリューアップ → EXIT — 解析結果を踏まえた試算
            </p>
          ) : null}
          <ResultDashboard
            company={company}
            params={params}
            computed={computed}
            result={result}
            equityDiff={equityDiff}
            flashKpi={flashKpi}
            flashBridge={flashBridge}
            flashOffbalance={flashOffbalance}
            onAxisChange={onAxisChange}
            onOpenParams={() => setParamsOpen(true)}
          />

          <StorySections
            company={company}
            params={params}
            computed={computed}
            result={result}
            onParamsChange={setParams}
            usedActionIds={usedActionIds}
            onUseAction={(id) =>
              setUsedActionIds((prev) => new Set([...prev, id]))
            }
          />

          <div className="dd-actions-bar">
            <p className="dd-muted">
              {mode === "sample"
                ? "サンプル: 操作で即時反映"
                : "API: 試算は即時、語りは再生成"}
            </p>
            <button
              type="button"
              className="dd-btn"
              disabled={
                busy || exitBlocked || !materialsStatus.withinHardLimit
              }
              onClick={() => void onUpdateProposal()}
            >
              {busy ? "更新中…" : "提案を更新"}
            </button>
          </div>
        </div>
      ) : dataSource === "client" && clientApplied && !clientAnalyzed ? (
        <p className="dd-muted dd-blocked-hint">
          「解析を実行」すると、フラグ報告のあと EXIT 試算が表示されます。
        </p>
      ) : null}

      {remaining != null ? (
        <p className="dd-muted">体験コード 残り回数: {remaining}</p>
      ) : null}
      {error ? <p className="dd-error">{error}</p> : null}

      <ParamsBottomSheet
        open={paramsOpen}
        value={params}
        onChange={setParams}
        onClose={() => setParamsOpen(false)}
      />

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
