import { getAllPriors, revealResults } from "./render.js";
import { getState, setScanning } from "./state.js";
import { setTabsDisabled } from "./tabs.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function runAnalysis(persona) {
  const state = getState(persona.key);
  if (state.ran || state.scanning) return;

  state.scanning = true;
  setScanning(true);
  setTabsDisabled(true);
  document.getElementById("run").disabled = true;

  const scan = document.getElementById("scan");
  scan.classList.add("on");

  const priorCount = getAllPriors(persona).length;
  const steps = persona.scanSteps.map((s) => s.replace("{priorCount}", String(priorCount)));

  const dots = [...document.querySelectorAll(".src .dot")];
  let i = 0;
  const bar = document.getElementById("scanBar");
  const line = document.getElementById("scanLine");

  function tick() {
    if (i < steps.length) {
      line.innerHTML = '<span class="a">▸</span> ' + steps[i];
      bar.style.width = Math.round(((i + 1) / steps.length) * 100) + "%";
      if (dots[i]) dots[i].parentElement.classList.add("scanned");
      if (dots[i + 5]) dots[i + 5].parentElement.classList.add("scanned");
      i++;
      setTimeout(tick, reduce ? 60 : 520);
    } else {
      dots.forEach((d) => d.parentElement.classList.add("scanned"));
      setTimeout(finish, reduce ? 60 : 400);
    }
  }

  function finish() {
    state.ran = true;
    state.scanning = false;
    setScanning(false);
    setTabsDisabled(false);
    document.getElementById("scan").classList.remove("on");
    revealResults(persona, true);
  }

  tick();
}
