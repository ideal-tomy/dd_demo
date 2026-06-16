import { yen } from "./format.js";
import { getState } from "./state.js";
import { getExitBridge } from "./derive.js";

export function renderExit(persona) {
  const el = document.getElementById("exitContent");
  if (!el) return;

  const state = getState(persona.key);
  if (!state.ran) {
    el.innerHTML = `<div class="phase-lock"><div class="lock-ico">🔒</div><p><b>DD解析を実行すると生成されます</b><br>改善後EBITDAとマルチプル再評価から、Entry→ExitのEVブリッジを表示します。</p></div>`;
    return;
  }

  const br = getExitBridge(persona, state);
  const maxEv = br.exitEv;

  const steps = br.bridge
    .map((s, i) => {
      const isLast = i === br.bridge.length - 1;
      const pct = maxEv ? Math.round((s.amt / maxEv) * 100) : 0;
      return `<div class="ev-step${isLast ? " final" : ""}">
        <div class="ev-step-head"><span class="ev-lbl">${s.label}</span><span class="ev-amt">${yen(s.amt)}</span></div>
        <div class="ev-bar"><i style="width:${pct}%"></i></div>
      </div>`;
    })
    .join("");

  el.innerHTML = `
    <div class="exit-head">
      <h2>売却ストーリー &amp; EVブリッジ</h2>
      <p class="exit-story">${br.story}</p>
      <div class="exit-mults">
        <div class="em"><span class="k">Entry</span><span class="v">${yen(br.entryEbitda)} × ${br.entryMult}x</span></div>
        <div class="em arr">→</div>
        <div class="em"><span class="k">Exit</span><span class="v gold">${yen(br.exitEbitda)} × ${br.exitMult}x</span></div>
      </div>
    </div>
    <div class="ev-bridge">${steps}</div>
    <p class="exit-note">※ DDで「採用」した確定額に応じて Entry EV・改善幅が連動。テック-enabled プラットフォームとしての再評価で高マルチプル売却を想定。</p>`;
}
