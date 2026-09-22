import { memo, useEffect, useMemo, type ReactNode } from "react";
import { ReturnedTimeCounter } from "../experience/ReturnedTimeCounter";
import { CompanyPicker } from "../scenario/CompanyPicker";
import { ResultDashboard } from "../scenario/ResultDashboard";
import {
  computeExit,
  DEFAULT_PARAMS,
  type ScenarioParams,
} from "../../ai/scenario/exit-model";
import { buildSampleNarrative } from "../../ai/scenario/sample-narrative";
import { MA_COMPANIES, type StrategyAxis } from "../../data/ma-companies";
import {
  ReturnedTimeProvider,
  useReturnedTime,
} from "../../state/ReturnedTimeContext";
import type { DeviceId } from "./story";

const COMPANY = MA_COMPANIES[0];

function frameClass(id: DeviceId, stars: readonly DeviceId[]) {
  return `ki-device ki-monitor ki-${id}${stars.includes(id) ? " ki-active" : " ki-idle"}`;
}

function Monitor({
  id,
  tab,
  stars,
  children,
}: {
  id: DeviceId;
  tab: string;
  stars: readonly DeviceId[];
  children: ReactNode;
}) {
  return (
    <div className={frameClass(id, stars)}>
      <div className="ki-device-bar">
        AXEON DD <span>{tab}</span>
      </div>
      <div className="ki-monitor-body">{children}</div>
    </div>
  );
}

function SeedTime() {
  const { addOnComplete } = useReturnedTime();
  useEffect(() => {
    addOnComplete("sample_exit_view");
  }, [addOnComplete]);
  return null;
}

function IntroDash({
  axis,
  equityDiff,
  flash,
  variant,
  treatment = false,
}: {
  axis: StrategyAxis;
  equityDiff: number | null;
  flash: boolean;
  variant: "exit" | "axis" | "ask";
  treatment?: boolean;
}) {
  const params = useMemo<ScenarioParams>(
    () => ({ ...DEFAULT_PARAMS, strategyAxis: axis }),
    [axis],
  );
  const computed = useMemo(() => computeExit(COMPANY, params), [params]);
  const result = useMemo(
    () => buildSampleNarrative(COMPANY, params, computed),
    [params, computed],
  );

  const dash = (
    <ResultDashboard
      company={COMPANY}
      params={params}
      computed={computed}
      result={result}
      equityDiff={equityDiff}
      flashKpi={flash}
      flashBridge={false}
      flashOffbalance={flash}
      dataSource="sample"
      onAxisChange={() => {}}
      onOpenParams={() => {}}
    />
  );

  return (
    <div
      className={`dd-fill dd-${variant}${treatment ? " is-treatment" : ""}`}
    >
      {variant === "exit" ? (
        <CompanyPicker value={COMPANY} onChange={() => {}} />
      ) : null}
      {variant === "ask" ? (
        <ReturnedTimeProvider>
          <SeedTime />
          <div className="dd-ask-head">
            <p className="dd-eyebrow">AXEON DD INTELLIGENCE</p>
            <ReturnedTimeCounter defaultOpen />
          </div>
          {dash}
        </ReturnedTimeProvider>
      ) : (
        dash
      )}
    </div>
  );
}

export const IntroScreens = memo(function IntroScreens({
  phase,
  stars,
}: {
  phase: number;
  stars: readonly DeviceId[];
}) {
  const systemValue = useMemo(
    () => computeExit(COMPANY, DEFAULT_PARAMS).equityValue,
    [],
  );
  const restructureValue = useMemo(
    () =>
      computeExit(COMPANY, {
        ...DEFAULT_PARAMS,
        strategyAxis: "restructure",
      }).equityValue,
    [],
  );
  const equityDiff = restructureValue - systemValue;
  const treatment = phase === 3;

  return (
    <>
      <Monitor id="exit" tab="EXIT試算" stars={stars}>
        <IntroDash
          axis="system"
          equityDiff={null}
          flash={false}
          variant="exit"
        />
      </Monitor>
      <Monitor id="axis" tab="主軸切替" stars={stars}>
        <IntroDash
          axis="restructure"
          equityDiff={equityDiff}
          flash
          variant="axis"
          treatment={treatment}
        />
      </Monitor>
      <Monitor id="ask" tab="問いと時間" stars={stars}>
        <IntroDash
          axis="restructure"
          equityDiff={equityDiff}
          flash={false}
          variant="ask"
        />
      </Monitor>
    </>
  );
});
