import { judgmentKey } from "./state.js";

export function getConfirmedFlags(persona, state) {
  return persona.flags.filter((f) => state.judgments[judgmentKey(persona.key, f.id)] === "ok");
}

export function getConfirmedLiability(persona, state) {
  let lo = 0;
  let hi = 0;
  getConfirmedFlags(persona, state).forEach((f) => {
    if (f.amt) {
      lo += f.amt[0];
      hi += f.amt[1];
    }
  });
  return { lo, hi };
}

export function getConfirmedFlagIds(persona, state) {
  return new Set(getConfirmedFlags(persona, state).map((f) => f.id));
}

export function getPmiTasks(persona, state) {
  const confirmed = getConfirmedFlagIds(persona, state);
  const hasAny = confirmed.size > 0;
  return persona.pmi.tasks.filter((t) => {
    if (t.srcFlag === 0) return hasAny;
    return confirmed.has(t.srcFlag);
  });
}

export function getPmiResolveTotal(persona, state) {
  let lo = 0;
  let hi = 0;
  getPmiTasks(persona, state).forEach((t) => {
    if (t.resolveAmt) {
      lo += t.resolveAmt[0];
      hi += t.resolveAmt[1];
    }
  });
  return { lo, hi };
}

export function getValueupWaterfall(persona, state) {
  const { valueup } = persona;

  // 確定簿外債務は大半が「一時的な純資産・価格調整」項目。年間EBITDAへの
  // 恒常的補正は、採用したフラグの割合に応じて静的補正値をスケールして反映する。
  const amtFlags = persona.flags.filter((f) => f.amt);
  const confirmedAmt = getConfirmedFlags(persona, state).filter((f) => f.amt);
  const ratio = amtFlags.length ? confirmedAmt.length / amtFlags.length : 0;

  const ddAdjustment = Math.round(valueup.ddAdjustment * ratio);
  const adjustedEbitda = valueup.reportedEbitda + ddAdjustment;

  const leverTotal = valueup.levers.reduce((s, l) => s + l.ebitdaUp, 0);
  const exitEbitda = adjustedEbitda + leverTotal;

  const confirmed = getConfirmedLiability(persona, state);
  const confirmedMid = confirmed.lo && confirmed.hi ? Math.round((confirmed.lo + confirmed.hi) / 2) : 0;

  return {
    reportedEbitda: valueup.reportedEbitda,
    ddAdjustment,
    adjustedEbitda,
    levers: valueup.levers,
    leverTotal,
    exitEbitda,
    confirmedMid,
    ratio,
  };
}

export function getExitBridge(persona, state) {
  const wf = getValueupWaterfall(persona, state);
  const { exit } = persona;

  const entryEbitda = wf.adjustedEbitda;
  const exitEbitda = wf.exitEbitda;

  const entryEv = Math.round(entryEbitda * exit.entryMult);
  const ebitdaGainEv = Math.round((exitEbitda - entryEbitda) * exit.entryMult);
  const exitEv = Math.round(exitEbitda * exit.exitMult);
  const multGain = exitEv - Math.round(exitEbitda * exit.entryMult);

  return {
    entryEbitda,
    entryMult: exit.entryMult,
    exitEbitda,
    exitMult: exit.exitMult,
    story: exit.story,
    entryEv,
    ebitdaGain: ebitdaGainEv,
    multGain,
    exitEv,
    bridge: [
      { label: "Entry EV（実態EBITDA × マルチプル）", amt: entryEv },
      { label: "+ EBITDA改善（労務・AI施策）", amt: ebitdaGainEv },
      { label: "+ マルチプル再評価（テック化）", amt: multGain },
      { label: "Exit EV", amt: exitEv },
    ],
  };
}

export function countJudgments(persona, state) {
  let ok = 0;
  let rv = 0;
  let fp = 0;
  persona.flags.forEach((f) => {
    const j = state.judgments[judgmentKey(persona.key, f.id)];
    if (j === "ok") ok++;
    if (j === "rv") rv++;
    if (j === "fp") fp++;
  });
  return { ok, rv, fp };
}
