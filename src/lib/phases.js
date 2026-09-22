import { PHASES, getCurrentPhase, setCurrentPhase, isDdComplete, isScanning } from "./state.js";
import { renderPhaseContent } from "./renderPhases.js";

let onPhaseChange = null;

const PANEL_IDS = {
  dd: "phaseDd",
  pmi: "phasePmi",
  valueup: "phaseValueup",
  exit: "phaseExit",
};

export function initPhases(handler) {
  onPhaseChange = handler;
  const container = document.getElementById("phaseStepper");
  if (!container) return;
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-go-phase]");
    if (!btn) return;
    switchPhase(btn.dataset.goPhase);
  });

  container.innerHTML = "";
  PHASES.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "phase-step";
    btn.dataset.phase = p.key;
    btn.innerHTML = `<span class="num">${i + 1}</span><span class="lbl"><b>${p.label}</b><small>${p.sub}</small></span>`;
    btn.setAttribute("aria-selected", p.key === getCurrentPhase() ? "true" : "false");
    if (p.key === getCurrentPhase()) btn.classList.add("active");
    btn.addEventListener("click", () => switchPhase(p.key));
    container.appendChild(btn);
    if (i < PHASES.length - 1) {
      const conn = document.createElement("span");
      conn.className = "phase-conn";
      conn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      container.appendChild(conn);
    }
  });
  updatePhaseLocks();
}

function updatePhaseLocks() {
  const ddDone = isDdComplete();
  document.querySelectorAll(".phase-step").forEach((btn) => {
    const phase = btn.dataset.phase;
    const locked = phase !== "dd" && !ddDone;
    btn.classList.toggle("locked", locked);
    btn.disabled = locked || isScanning();
  });
}

function showPhasePanel(phase) {
  ["dd", "pmi", "valueup", "exit"].forEach((k) => {
    const el = document.getElementById("phase" + k.charAt(0).toUpperCase() + k.slice(1));
    if (el) el.classList.toggle("on", k === phase);
  });
}

function scrollPhaseIntoView(phase) {
  const el = document.getElementById(PANEL_IDS[phase]);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
}

export function switchPhase(phase, opts = {}) {
  if (phase !== "dd" && !isDdComplete()) return;
  if (isScanning()) return;

  setCurrentPhase(phase);
  document.querySelectorAll(".phase-step").forEach((btn) => {
    const active = btn.dataset.phase === phase;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  showPhasePanel(phase);
  if (opts.scroll !== false) scrollPhaseIntoView(phase);
  if (onPhaseChange) onPhaseChange(phase);
}

export function refreshPhases(persona) {
  updatePhaseLocks();
  renderPhaseContent(persona);
  showPhasePanel(getCurrentPhase());
}

export { updatePhaseLocks };
