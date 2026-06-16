import { rangeYen, sumFlagRange } from "./format.js";
import { getCurrentKey, getState, judgmentKey } from "./state.js";
import { getPersona } from "../data/index.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function revenueFromFacts(facts) {
  const row = facts.find(([k]) => k === "売上");
  return row ? row[1] : "";
}

export function renderTopbar(persona) {
  const { company } = persona;
  const rev = revenueFromFacts(company.facts);
  const el = document.getElementById("topbarTarget");
  if (!el) return;
  el.innerHTML = `対象：<b>${company.name}</b> <span class="mono">／ ${company.industry} ／ 売上 ${rev.replace("¥", "")}</span>`;
}

export function renderCompany(persona) {
  const { company } = persona;
  document.getElementById("companyName").textContent = company.name;
  document.getElementById("companySub").textContent = company.sub;
  document.getElementById("profilePrior").textContent = company.profilePrior;

  const factsEl = document.getElementById("companyFacts");
  factsEl.innerHTML = company.facts
    .map(
      ([k, v]) =>
        `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>`
    )
    .join("");

  const n = persona.sources.length;
  document.getElementById("sourceCount").textContent = `${n} ソース`;
  document.getElementById("runSourceCount").textContent = `${n}ソース`;
}

export function getAllPriors(persona) {
  const state = getState(persona.key);
  return [...persona.priors, ...state.extraPriors];
}

export function renderPriors(persona) {
  const priors = getAllPriors(persona);
  const el = document.getElementById("priors");
  el.innerHTML = "";
  priors.forEach((p) => {
    const d = document.createElement("div");
    d.className = "prior" + (p.u ? " user" : "");
    d.innerHTML = '<span class="d"></span>' + p.t;
    el.appendChild(d);
  });
  document.getElementById("priorCount").textContent = priors.length + " 件";
}

export function renderSources(persona, scanned = false) {
  const el = document.getElementById("sources");
  el.innerHTML = "";
  persona.sources.forEach((s, i) => {
    const d = document.createElement("div");
    d.className = "src" + (scanned ? " scanned" : "");
    d.dataset.i = i;
    d.innerHTML =
      '<span class="dot"></span><span class="nm">' +
      s.n +
      '</span><span class="meta">' +
      s.m +
      "</span>";
    el.appendChild(d);
  });
}

export function resetResultsUI() {
  document.getElementById("scan").classList.remove("on");
  document.getElementById("summary").classList.remove("on");
  document.getElementById("rHead").classList.remove("on");
  document.getElementById("closing").classList.remove("on");
  document.getElementById("flags").innerHTML = "";
  document.getElementById("scanLine").innerHTML = "&nbsp;";
  document.getElementById("scanBar").style.width = "0%";
  document.getElementById("sCount").textContent = "0";
  document.getElementById("sRange").textContent = "¥0";
  document.getElementById("sConfirmed").textContent = "¥0";
  document.getElementById("rCount").textContent = "";
  document.getElementById("loopMsg").textContent =
    "採用・誤検知の判定が、次回類似案件の精度に反映されます";
}

export function revealResults(persona, animate = true) {
  const { flags } = persona;
  document.getElementById("summary").classList.add("on");
  document.getElementById("rHead").classList.add("on");
  document.getElementById("closing").classList.add("on");
  document.getElementById("rCount").textContent = "( " + flags.length + " 件 )";
  document.getElementById("sCount").textContent = flags.length;
  const { lo, hi } = sumFlagRange(flags);
  document.getElementById("sRange").textContent = rangeYen(lo, hi);
  renderFlags(persona, animate);
  updateSummary(persona);
}

function applyJudgmentUI(el, j) {
  el.classList.remove("j-ok", "j-fp");
  if (j === "ok") el.classList.add("j-ok");
  if (j === "fp") el.classList.add("j-fp");
  el.querySelectorAll(".judge button").forEach((b) => {
    b.classList.remove("sel-ok", "sel-rv", "sel-fp");
    if (b.dataset.j === j) b.classList.add("sel-" + j);
  });
  const st = el.querySelector(".judge .state");
  st.className = "state " + j;
  st.textContent =
    j === "ok"
      ? "✓ 採用 ― 確定額に算入"
      : j === "rv"
        ? "要確認に分類"
        : "誤検知 ― パターンを学習";
}

export function renderFlags(persona, animate = true) {
  const wrap = document.getElementById("flags");
  wrap.innerHTML = "";
  const state = getState(persona.key);
  const personaKey = persona.key;

  persona.flags.forEach((f, idx) => {
    const el = document.createElement("div");
    el.className = "flag sig-" + f.type;
    el.dataset.id = f.id;
    const dotsHtml =
      '<div class="dots">' +
      [1, 2, 3]
        .map((n) => '<i class="' + (n <= f.confLv ? "f" : "") + '"></i>')
        .join("") +
      "</div>";
    const starHtml = f.isStar ? '<span class="star-badge">業種特有</span>' : "";
    const amtHtml = f.amt
      ? '<div class="label">推定エクスポージャー</div><div class="val">' +
        rangeYen(f.amt[0], f.amt[1]) +
        "</div>"
      : '<div class="label">' +
        f.struct.label +
        '</div><div class="val struct">' +
        f.struct.value +
        "</div>";
    const nodesHtml = f.nodes
      .map(
        (n) =>
          '<div class="srcrow"><span class="s">' +
          n.s +
          '</span><span class="val">' +
          n.v +
          "</span></div>"
      )
      .join("");
    el.innerHTML = `
      <div class="row">
        <div class="sig"><span class="badge">${f.type}</span><div class="conf">確信度</div>${dotsHtml}</div>
        <div class="mid">
          <h3>${f.title}${starHtml}</h3>
          <div class="glance">${f.glance}</div>
        </div>
        <div class="amt">${amtHtml}</div>
        <div class="chev"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>
      </div>
      <div class="detail"><div class="inner">
        <div class="chain">
          <div class="node srcwrap"><div class="nk">SOURCE A / B</div>${nodesHtml}</div>
          <div class="arrow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
          <div class="gap"><div class="bolt">⚡</div><div class="z">${f.gap}</div></div>
          <div class="arrow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
          <div class="node flagnode"><div class="nk">FLAG</div><div class="fl">${f.flagText}</div><div class="pr">prior: ${f.prior}</div></div>
        </div>
        <div class="inf"><span class="lab">AIの推論（なぜフラグしたか）</span>${f.inference}</div>
        <div class="deal">ディールへの接続：${f.deal}</div>
        <div class="judge">
          <span class="q">人間の検証：</span>
          <button data-j="ok">本物として採用</button>
          <button data-j="rv">要確認</button>
          <button data-j="fp">誤検知</button>
          <span class="state"></span>
        </div>
      </div></div>`;
    wrap.appendChild(el);
    el.querySelector(".row").addEventListener("click", () => el.classList.toggle("open"));
    el.querySelectorAll(".judge button").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        judge(persona, f.id, b.dataset.j, el);
      });
    });
    const jKey = judgmentKey(personaKey, f.id);
    if (state.judgments[jKey]) {
      applyJudgmentUI(el, state.judgments[jKey]);
    }
    if (animate) {
      setTimeout(() => el.classList.add("show"), reduce ? 0 : idx * 120);
    } else {
      el.classList.add("show");
    }
  });
}

export function judge(persona, flagId, j, el) {
  const state = getState(persona.key);
  const jKey = judgmentKey(persona.key, flagId);
  state.judgments[jKey] = j;
  applyJudgmentUI(el, j);
  updateSummary(persona);
}

export function updateSummary(persona) {
  const state = getState(persona.key);
  let lo = 0;
  let hi = 0;
  let okN = 0;
  let fpN = 0;
  persona.flags.forEach((f) => {
    const s = state.judgments[judgmentKey(persona.key, f.id)];
    if (s === "ok" && f.amt) {
      lo += f.amt[0];
      hi += f.amt[1];
      okN++;
    }
    if (s === "ok" && !f.amt) okN++;
    if (s === "fp") fpN++;
  });
  document.getElementById("sConfirmed").textContent = lo || hi ? rangeYen(lo, hi) : "¥0";
  const msg =
    okN || fpN
      ? "確定 " + okN + "件 ／ 誤検知 " + fpN + "件 ― 次回類似案件の事前知識に反映"
      : "採用・誤検知の判定が、次回類似案件の精度に反映されます";
  document.getElementById("loopMsg").textContent = msg;
}

export function toast(msg) {
  const t = document.getElementById("toast");
  t.innerHTML = msg;
  t.classList.add("on");
  setTimeout(() => t.classList.remove("on"), 2200);
}

export function renderPersona(persona) {
  renderTopbar(persona);
  renderCompany(persona);
  renderPriors(persona);
  const state = getState(persona.key);
  renderSources(persona, state.ran);
  document.getElementById("run").disabled = state.ran || state.scanning;
}

export function getCurrentPersona() {
  return getPersona(getCurrentKey());
}
