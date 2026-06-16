/** @typedef {{ ran: boolean, judgments: Record<string, string>, extraPriors: Array<{t:string,u:boolean}>, scanning?: boolean }} PersonaRuntimeState */

/** @type {Record<string, PersonaRuntimeState>} */
const personaStates = {};

let currentKey = "logistics";
/** @type {"dd"|"pmi"|"valueup"|"exit"} */
let currentPhase = "dd";

export const PHASES = [
  { key: "dd", label: "DD支援", sub: "買収前" },
  { key: "pmi", label: "PMI", sub: "最初の100日" },
  { key: "valueup", label: "バリューアップ", sub: "保有期間" },
  { key: "exit", label: "EXIT", sub: "売却前" },
];

export function getCurrentKey() {
  return currentKey;
}

export function setCurrentKey(key) {
  currentKey = key;
}

export function getCurrentPhase() {
  return currentPhase;
}

export function setCurrentPhase(phase) {
  currentPhase = phase;
}

export function getState(key = currentKey) {
  if (!personaStates[key]) {
    personaStates[key] = { ran: false, judgments: {}, extraPriors: [], scanning: false };
  }
  return personaStates[key];
}

export function judgmentKey(personaKey, flagId) {
  return `${personaKey}:${flagId}`;
}

export function isScanning() {
  return getState().scanning === true;
}

export function setScanning(value) {
  getState().scanning = value;
}

export function isDdComplete(key = currentKey) {
  return getState(key).ran === true;
}
