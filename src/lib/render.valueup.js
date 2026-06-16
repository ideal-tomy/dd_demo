import { yen } from "./format.js";
import { getState } from "./state.js";
import { getValueupWaterfall } from "./derive.js";

const KIND_CLASS = { コスト: "k-cost", "AI実装": "k-ai", 再評価: "k-reval" };

export function renderValueup(persona) {
  const el = document.getElementById("valueupContent");
  if (!el) return;

  const state = getState(persona.key);
  if (!state.ran) {
    el.innerHTML = `<div class="phase-lock"><div class="lock-ico">🔒</div><p><b>DD解析を実行すると生成されます</b><br>DD補正後の実態EBITDAに、労務適正化と業種別AI実装による改善を積み上げます。</p></div>`;
    return;
  }

  const wf = getValueupWaterfall(persona, state);
  const maxBar = Math.max(wf.reportedEbitda, wf.exitEbitda, 1);

  const leverRows = wf.levers
    .map(
      (l) => `<div class="wf-lever">
        <div class="wf-lever-head"><span class="wf-kind ${KIND_CLASS[l.kind] || ""}">${l.kind}</span><b>${l.label}</b></div>
        <div class="wf-lever-amt">+${yen(l.ebitdaUp)}</div>
        <p class="wf-lever-note">${l.note}</p>
      </div>`
    )
    .join("");

  el.innerHTML = `
    <div class="vu-head">
      <h2>実態EBITDAの改善ウォーターフォール</h2>
      <p class="vu-sub">DDで確定した補正を反映し、PMIでの労務適正化と業種別AI実装で企業価値そのものを上げます。</p>
    </div>
    <div class="wf-chart">
      <div class="wf-bar-row">
        <span class="wf-label">報告EBITDA</span>
        <div class="wf-track"><i class="wf-fill base" style="width:${(wf.reportedEbitda / maxBar) * 100}%"></i></div>
        <span class="wf-val">${yen(wf.reportedEbitda)}</span>
      </div>
      <div class="wf-bar-row adj">
        <span class="wf-label">DD補正（確定簿外債務）</span>
        <div class="wf-track"><i class="wf-fill neg" style="width:${(Math.abs(wf.ddAdjustment) / maxBar) * 100}%"></i></div>
        <span class="wf-val neg">${yen(wf.ddAdjustment)}</span>
      </div>
      <div class="wf-bar-row">
        <span class="wf-label">実態EBITDA</span>
        <div class="wf-track"><i class="wf-fill mid" style="width:${(wf.adjustedEbitda / maxBar) * 100}%"></i></div>
        <span class="wf-val">${yen(wf.adjustedEbitda)}</span>
      </div>
      <div class="wf-levers">${leverRows}</div>
      <div class="wf-bar-row total">
        <span class="wf-label">改善後EBITDA</span>
        <div class="wf-track"><i class="wf-fill gold" style="width:${(wf.exitEbitda / maxBar) * 100}%"></i></div>
        <span class="wf-val gold">${yen(wf.exitEbitda)}</span>
      </div>
    </div>`;
}
