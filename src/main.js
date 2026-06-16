import { assertPersonaData } from "./data/index.js";
import { getState } from "./lib/state.js";
import {
  renderPersona,
  renderPriors,
  toast,
  getCurrentPersona,
} from "./lib/render.js";
import { runAnalysis } from "./lib/analysis.js";
import { initTabs, switchPersona } from "./lib/tabs.js";

assertPersonaData();

initTabs();

const initial = getCurrentPersona();
renderPersona(initial);

document.getElementById("priorAdd").addEventListener("click", addPrior);
document.getElementById("priorInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPrior();
});

function addPrior() {
  const persona = getCurrentPersona();
  const state = getState(persona.key);
  const inp = document.getElementById("priorInput");
  const v = inp.value.trim();
  if (!v) return;
  state.extraPriors.push({ t: v, u: true });
  renderPriors(persona);
  inp.value = "";
  toast("仮説を登録しました <b>― 突合チェックに追加</b>");
}

document.getElementById("run").addEventListener("click", () => {
  runAnalysis(getCurrentPersona());
});

// Expose for debugging
window.__demo = { switchPersona, getCurrentPersona };
