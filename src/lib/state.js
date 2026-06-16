/** @typedef {{ ran: boolean, judgments: Record<string, string>, extraPriors: Array<{t:string,u:boolean}>, scanning?: boolean }} PersonaRuntimeState */

/** @type {Record<string, PersonaRuntimeState>} */
const personaStates = {};

let currentKey = "logistics";

export function getCurrentKey() {
  return currentKey;
}

export function setCurrentKey(key) {
  currentKey = key;
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
