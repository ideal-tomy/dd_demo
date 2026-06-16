import { PERSONA_ORDER, getPersona } from "../data/index.js";
import { getCurrentKey, setCurrentKey, getState, isScanning } from "./state.js";
import {
  renderPersona,
  resetResultsUI,
  revealResults,
  getCurrentPersona,
} from "./render.js";
import { refreshPhases } from "./phases.js";

let onSwitch = null;

export function initTabs(switchHandler) {
  onSwitch = switchHandler;
  const container = document.getElementById("industryTabs");
  if (!container) return;

  container.innerHTML = "";
  PERSONA_ORDER.forEach((key) => {
    const persona = getPersona(key);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "industry-tab";
    btn.dataset.key = key;
    btn.textContent = persona.label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", key === getCurrentKey() ? "true" : "false");
    if (key === getCurrentKey()) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (key === getCurrentKey() || isScanning()) return;
      switchPersona(key);
    });
    container.appendChild(btn);
  });
}

export function setTabsDisabled(disabled) {
  const container = document.getElementById("industryTabs");
  if (!container) return;
  container.classList.toggle("disabled", disabled);
}

function updateTabActive(key) {
  document.querySelectorAll(".industry-tab").forEach((btn) => {
    const active = btn.dataset.key === key;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

export function switchPersona(key) {
  if (isScanning()) return;

  setCurrentKey(key);
  updateTabActive(key);

  const persona = getPersona(key);
  const state = getState(key);

  resetResultsUI();
  renderPersona(persona);

  if (state.ran) {
    revealResults(persona, false);
  }

  refreshPhases(persona);

  if (onSwitch) onSwitch(key);
}

export { getCurrentPersona };
