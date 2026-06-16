import { getPersona } from "../data/index.js";
import {
  getState,
  getCurrentKey,
  judgmentKey,
  setCurrentPhase,
} from "./state.js";
import { switchPersona, getCurrentPersona } from "./tabs.js";
import { switchPhase } from "./phases.js";
import { runAnalysis } from "./analysis.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DEMO_KEY = "logistics";

/**
 * 各スライドは決定論的に状態を組み立てる（seek でどこへでも飛べる）。
 * animate は「再生中に前方へ進んだとき」だけ実行される演出。
 */
const STEPS = [
  {
    t: "AXEON DD Intelligence ガイドツアー",
    b: "DD支援 → PMI → バリューアップ → EXIT。同じ対象企業データが4フェーズを貫く流れを、実際の操作とともに順番にご覧いただきます。",
    phase: "dd",
    ran: false,
    target: null,
    autoMs: 4200,
  },
  {
    t: "① 対象企業をDBから選択",
    b: "登録済みの5業種から対象を選びます。今回は運送業「東和ロジスティクス」。選んだ企業データが、このあと全フェーズで一貫して使われます。",
    phase: "dd",
    ran: false,
    target: () => document.getElementById("industryTabs"),
    autoMs: 4600,
  },
  {
    t: "事前知識（prior）とデータルーム",
    b: "業種ごとの「当たり」と、勤怠・給与・社保・契約など11ソースを取り込みます。DD担当は自分の仮説も追加でき、突合チェックに加わります。",
    phase: "dd",
    ran: false,
    target: () => document.querySelector(".setup"),
    autoMs: 5200,
  },
  {
    t: "② 解析を実行",
    b: "複数ソースを機械的に突合し、矛盾・言語・時系列の3種シグナルを抽出します。サンプリングではなく全数解析です。",
    phase: "dd",
    ran: false,
    target: () => document.getElementById("run"),
    autoMs: 1000,
    animate: async () => {
      const p = getCurrentPersona();
      runAnalysis(p);
      await waitFor(() => getState(p.key).ran, 14000);
      await delay(reduce ? 0 : 700);
    },
  },
  {
    t: "検出フラグ ― 定量査定と発見系",
    b: "機械的に金額を推計できる「定量査定」と、突合で気づく「発見系」を同時に提示。どちらも根拠つきで並びます。",
    phase: "dd",
    ran: true,
    target: () => document.getElementById("flags"),
    autoMs: 5400,
  },
  {
    t: "なぜフラグしたか ― 根拠と計算の中身",
    b: "フラグを開くと、突合の根拠チェーンとAIの推論を確認できます。定量項目は計算式と入力値まで開示し、説明可能性を担保します。",
    phase: "dd",
    ran: true,
    target: () => document.querySelector(".flag.flag-quant"),
    after: () => {
      const f = document.querySelector(".flag.flag-quant");
      if (f && !f.classList.contains("open")) f.classList.add("open");
    },
    autoMs: 6000,
  },
  {
    t: "③ 人間が検証して確定",
    b: "採用／要確認／誤検知を人間が判定。「採用」した額が確定簿外債務として集計され、そのまま次フェーズへ連携されます。",
    phase: "dd",
    ran: true,
    judged: true,
    target: () => document.getElementById("summary"),
    autoMs: 5600,
  },
  {
    t: "④ PMI ― 最初の100日プラン",
    b: "確定したフラグが是正タスクに自動変換。担当・期日・解消額つきで、属人化の解体／データ基盤／標準化を進めます。",
    phase: "pmi",
    ran: true,
    judged: true,
    target: () => document.getElementById("phasePmi"),
    autoMs: 6000,
  },
  {
    t: "⑤ バリューアップ ― 実態EBITDAの改善",
    b: "DD補正後の実態EBITDAに、労務適正化と業種別AI実装（運送なら配車・動態最適化）を積み上げ、企業価値そのものを引き上げます。",
    phase: "valueup",
    ran: true,
    judged: true,
    target: () => document.getElementById("phaseValueup"),
    autoMs: 6000,
  },
  {
    t: "⑥ EXIT準備 ― EVブリッジ",
    b: "改善後EBITDA × マルチプル再評価で、Entry → Exit のEVブリッジを提示。テック化による高マルチプル売却を狙います。",
    phase: "exit",
    ran: true,
    judged: true,
    target: () => document.getElementById("phaseExit"),
    autoMs: 6000,
  },
  {
    t: "DDからEXITまで、一つのツールで一気通貫",
    b: "発見した簿外債務が、価格・是正・価値向上・売却ストーリーまで貫通します。これが AXEON の「指摘で止まらない」DDです。",
    phase: "exit",
    ran: true,
    judged: true,
    target: null,
    autoMs: 5200,
  },
];

let root = null;
let idx = 0;
let playing = false;
let busy = false;
let timer = null;
let onResize = null;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function raf() {
  return new Promise((r) => requestAnimationFrame(() => r()));
}
function waitFor(cond, timeout = 10000, interval = 150) {
  return new Promise((res) => {
    const t0 = Date.now();
    const id = setInterval(() => {
      if (cond() || Date.now() - t0 > timeout) {
        clearInterval(id);
        res();
      }
    }, interval);
  });
}

function setDemoState(step) {
  const p = getPersona(DEMO_KEY);
  const st = getState(DEMO_KEY);
  st.ran = !!step.ran;
  st.scanning = false;
  st.judgments = {};
  if (step.judged) {
    p.flags.forEach((f) => {
      st.judgments[judgmentKey(DEMO_KEY, f.id)] = "ok";
    });
  }
  switchPersona(DEMO_KEY);
  setCurrentPhase(step.phase);
  switchPhase(step.phase);
}

function cancelTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function schedule() {
  cancelTimer();
  if (!playing) return;
  const s = STEPS[idx];
  timer = setTimeout(() => go(1), s.autoMs || 5200);
}

async function seek(i, forward) {
  if (busy) return;
  if (i < 0 || i >= STEPS.length) return;
  cancelTimer();
  busy = true;
  idx = i;
  const s = STEPS[i];

  setDemoState(s);
  if (s.after) s.after();
  renderCaption();
  positionSpot(null);

  await raf();
  await delay(reduce ? 0 : 280);
  scrollToTarget(s);
  await delay(reduce ? 0 : 320);
  positionSpot(s);

  busy = false;

  if (playing) {
    if (forward && s.animate) {
      busy = true;
      await s.animate();
      busy = false;
      positionSpot(s);
      if (!playing) return;
    }
    schedule();
  }
}

function go(d) {
  if (busy) return;
  const next = idx + d;
  if (next >= STEPS.length) {
    playing = false;
    updateControls();
    return;
  }
  seek(next, d > 0);
}

async function togglePlay() {
  playing = !playing;
  updateControls();
  if (!playing) {
    cancelTimer();
    return;
  }
  const s = STEPS[idx];
  if (s.animate && !getState(DEMO_KEY).ran) {
    busy = true;
    await s.animate();
    busy = false;
    positionSpot(s);
    if (!playing) return;
  }
  schedule();
}

function scrollToTarget(s) {
  const el = s.target ? s.target() : null;
  if (el) {
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
}

function positionSpot(s) {
  if (!root) return;
  const spot = root.querySelector(".tour-spot");
  const block = root.querySelector(".tour-block");
  const el = s && s.target ? s.target() : null;
  if (!el) {
    spot.style.display = "none";
    block.classList.add("full");
    return;
  }
  const r = el.getBoundingClientRect();
  const pad = 10;
  spot.style.display = "block";
  spot.style.top = Math.max(8, r.top - pad) + "px";
  spot.style.left = Math.max(8, r.left - pad) + "px";
  spot.style.width = Math.min(window.innerWidth - 16, r.width + pad * 2) + "px";
  spot.style.height = r.height + pad * 2 + "px";
  block.classList.remove("full");
}

function renderCaption() {
  if (!root) return;
  const s = STEPS[idx];
  const cap = root.querySelector(".tour-caption");
  const dots = STEPS.map(
    (_, i) =>
      `<span class="d${i === idx ? " on" : ""}${i < idx ? " done" : ""}"></span>`
  ).join("");
  cap.innerHTML = `
    <div class="tc-top">
      <span class="tc-step">STEP ${idx + 1} / ${STEPS.length}</span>
      <div class="tc-dots">${dots}</div>
      <button class="tc-x" type="button" aria-label="ツアーを終了">✕</button>
    </div>
    <h4>${s.t}</h4>
    <p>${s.b}</p>
    <div class="tc-controls">
      <button class="tc-btn" data-act="prev" type="button" ${idx === 0 ? "disabled" : ""}>◀ 前へ</button>
      <button class="tc-btn play" data-act="play" type="button">${playing ? "❙❙ 一時停止" : "▶ 再生"}</button>
      <button class="tc-btn" data-act="next" type="button">${idx === STEPS.length - 1 ? "もう一度 ⟲" : "次へ ▶"}</button>
    </div>`;

  cap.querySelector(".tc-x").addEventListener("click", close);
  cap.querySelector('[data-act="prev"]').addEventListener("click", () => go(-1));
  cap.querySelector('[data-act="play"]').addEventListener("click", togglePlay);
  cap.querySelector('[data-act="next"]').addEventListener("click", () => {
    if (idx === STEPS.length - 1) {
      playing = true;
      seek(0, true);
    } else {
      go(1);
    }
  });
}

function updateControls() {
  if (!root) return;
  const playBtn = root.querySelector('[data-act="play"]');
  if (playBtn) playBtn.textContent = playing ? "❙❙ 一時停止" : "▶ 再生";
}

function onKey(e) {
  if (!root) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowRight") go(1);
  else if (e.key === "ArrowLeft") go(-1);
  else if (e.key === " ") {
    e.preventDefault();
    togglePlay();
  }
}

export function openTour() {
  if (root) return;
  root = document.createElement("div");
  root.className = "tour-root";
  root.innerHTML = `
    <div class="tour-block full"></div>
    <div class="tour-spot"></div>
    <div class="tour-caption"></div>`;
  document.body.appendChild(root);
  document.body.classList.add("tour-active");

  root.querySelector(".tour-block").addEventListener("click", () => go(1));
  onResize = () => positionSpot(STEPS[idx]);
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKey);

  idx = 0;
  playing = true;
  seek(0, true);
}

export function close() {
  if (!root) return;
  cancelTimer();
  playing = false;
  window.removeEventListener("resize", onResize);
  document.removeEventListener("keydown", onKey);
  root.remove();
  root = null;
  document.body.classList.remove("tour-active");
}

export function initTour() {
  const btn = document.getElementById("tourBtn");
  if (btn) btn.addEventListener("click", openTour);
}
