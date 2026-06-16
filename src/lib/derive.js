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
  const confirmed = getConfirmedLiability(persona, state);
  const confirmedMid = confirmed.lo && confirmed.hi ? Math.round((confirmed.lo + confirmed.hi) / 2) : 0;

  const ddAdj = confirmedMid > 0 ? -confirmedMid : valueup.ddAdjustment;
  const adjustedEbitda = valueup.reportedEbitda + ddAdj;

  const leverTotal = valueup.levers.reduce((s, l) => s + l.ebitdaUp, 0);
  const exitEbitda = adjustedEbitda + leverTotal;

  return {
    reportedEbitda: valueup.reportedEbitda,
    ddAdjustment: ddAdj,
    adjustedEbitda,
    levers: valueup.levers,
    leverTotal,
    exitEbitda,
    confirmedMid,
  };
}

export function getExitBridge(persona, state) {
  const wf = getValueupWaterfall(persona, state);
  const { exit } = persona;

  const entryEbitda = wf.confirmedMid > 0 ? wf.adjustedEbitda : exit.entryEbitda;
  const exitEbitda = wf.confirmedMid > 0 ? wf.exitEbitda : exit.exitEbitda;

  const entryEv = Math.round(entryEbitda * exit.entryMult);
  const ebitdaGain = exitEbitda - entryEbitda;
  const exitEvBase = Math.round(exitEbitda * exit.entryMult);
  const multGain = Math.round(exitEbitda * exit.exitMult) - exitEvBase;
  const exitEv = Math.round(exitEbitda * exit.exitMult);

  return {
    entryEbitda,
    entryMult: exit.entryMult,
    exitEbitda,
    exitMult: exit.exitMult,
    story: exit.story,
    entryEv,
    ebitdaGain,
    multGain,
    exitEv,
    bridge: [
      { label: "Entry EV（実態EBITDA × マルチプル）", amt: entryEv },
      { label: "+ EBITDA改善（労務・AI施策）", amt: ebitdaGain * exit.entryMult },
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
