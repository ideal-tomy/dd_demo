import { rangeYen } from "./format.js";
import { getState } from "./state.js";
import { getPmiTasks, getPmiResolveTotal } from "./derive.js";

const THEME_CLASS = {
  労務: "t-labor",
  社保: "t-social",
  ガバナンス: "t-gov",
  データ基盤: "t-data",
  標準化: "t-std",
};

function statusLabel(status) {
  return status === "planned" ? "計画中" : status;
}

function wrapAction(text) {
  return String(text).replace(/([・×／/])/g, "$1<wbr>");
}

export function renderPmi(persona) {
  const el = document.getElementById("pmiContent");
  if (!el) return;

  const state = getState(persona.key);
  if (!state.ran) {
    el.innerHTML = `<div class="phase-lock"><div class="lock-ico">🔒</div><p><b>DD解析を実行すると生成されます</b><br>定量査定・発見系のフラグを検証し「採用」すると、100日プランの是正タスクが自動連携されます。</p></div>`;
    return;
  }

  const tasks = getPmiTasks(persona, state);
  const { lo, hi } = getPmiResolveTotal(persona, state);
  const headline = String(persona.pmi?.headline || "最初の100日").replace(
    " ― ",
    " ―<br>"
  );

  const rows = tasks
    .map((t) => {
      const amt = t.resolveAmt ? rangeYen(t.resolveAmt[0], t.resolveAmt[1]) : "―";
      const themeCls = THEME_CLASS[t.theme] || "";
      const flagRef = t.srcFlag ? `#${t.srcFlag}` : "横断";
      return `<tr>
        <td><span class="pmi-theme ${themeCls}">${t.theme}</span></td>
        <td class="pmi-action">${wrapAction(t.action)}<span class="pmi-ref">DD flag ${flagRef}</span></td>
        <td>${t.owner}</td>
        <td class="mono">${t.due}</td>
        <td class="mono amt">${amt}</td>
        <td><span class="pmi-status">${statusLabel(t.status)}</span></td>
      </tr>`;
    })
    .join("");

  const cards = tasks
    .map((t) => {
      const amt = t.resolveAmt ? rangeYen(t.resolveAmt[0], t.resolveAmt[1]) : "―";
      const themeCls = THEME_CLASS[t.theme] || "";
      const flagRef = t.srcFlag ? `#${t.srcFlag}` : "横断";
      return `<article class="pmi-card">
        <div class="pmi-card__top">
          <span class="pmi-theme ${themeCls}">${t.theme}</span>
          <span class="pmi-status">${statusLabel(t.status)}</span>
        </div>
        <h3 class="pmi-card__action">${wrapAction(t.action)}</h3>
        <p class="pmi-ref">DD flag ${flagRef}</p>
        <dl class="pmi-card__meta">
          <div><dt>担当</dt><dd>${t.owner}</dd></div>
          <div><dt>期限</dt><dd class="mono">${t.due}</dd></div>
          <div><dt>解消額</dt><dd class="mono amt">${amt}</dd></div>
        </dl>
      </article>`;
    })
    .join("");

  el.innerHTML = `
    <div class="pmi-head">
      <h2>${headline}</h2>
      <p class="pmi-sub">DDで確定した簿外債務・リスクを、最初の100日で是正。のれん毀損を防ぎ、バリューアップの土台を作ります。</p>
      <div class="pmi-kpi">
        <div class="kpi"><span class="k">是正タスク</span><span class="v">${tasks.length} 件</span></div>
        <div class="kpi"><span class="k">解消見込（簿外債務）</span><span class="v gold">${lo || hi ? rangeYen(lo, hi) : "―"}</span></div>
      </div>
    </div>
    <div class="pmi-table-wrap">
      <table class="pmi-table">
        <thead><tr><th>テーマ</th><th>アクション</th><th>担当</th><th>期限</th><th>解消額</th><th>状態</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="pmi-cards">${cards}</div>
    <p class="pmi-note">※ 「採用」したDDフラグに紐づくタスクのみ表示。判定を変更するとタスク一覧が連動更新されます。</p>
    <p class="phase-next">
      <button type="button" class="phase-next-btn" data-go-phase="valueup">バリューアップを見る</button>
    </p>`;
}
