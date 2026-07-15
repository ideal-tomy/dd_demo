import { getPersona } from "../data/index.js";
import {
  getState,
  judgmentKey,
  setCurrentPhase,
} from "./state.js";
import { switchPersona, getCurrentPersona } from "./tabs.js";
import { switchPhase } from "./phases.js";
import { runAnalysis } from "./analysis.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mqMobile = window.matchMedia("(max-width: 820px)");
const DEMO_KEY = "logistics";
// 各スライドの表示秒数の倍率（ゆっくり読めるように 1.5 倍）。
const DWELL_MULT = 1.5;

function isMobile() {
  return mqMobile.matches;
}

/**
 * 各スライドは決定論的に状態を組み立てる（seek でどこへでも飛べる）。
 * animate は「再生中に前方へ進んだとき」だけ実行される演出。
 *
 * dim: "soft" | "none"  — スポット外の暗幕
 * captionMode: "compact" | "full" | "hidden" — 説明シートの出し方
 */
const STEPS = [
  {
    t: "AXEON DD Intelligence ガイドツアー",
    b: "DD支援 → PMI → バリューアップ → EXIT。同じ対象企業データが4フェーズを貫く流れを、実際の操作とともに順番にご覧いただきます。",
    phase: "dd",
    ran: false,
    target: null,
    dim: "soft",
    captionMode: "compact",
    autoMs: 3800,
  },
  {
    t: "① 対象企業をDBから選択",
    b: "登録済みの5業種から対象を選びます。今回は運送業「東和ロジスティクス」。選んだ企業データが、このあと全フェーズで一貫して使われます。",
    phase: "dd",
    ran: false,
    target: () => document.getElementById("industryTabs"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4200,
  },
  {
    t: "事前知識（prior）とデータルーム",
    b: "業種ごとの「当たり」と、勤怠・給与・社保・契約など11ソースを取り込みます。DD担当は自分の仮説も追加でき、突合チェックに加わります。",
    phase: "dd",
    ran: false,
    target: () => document.querySelector(".setup"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4600,
  },
  {
    t: "② 解析を実行",
    b: "ここを押すと、複数ソースを機械的に突合し、矛盾・言語・時系列の3種シグナルを抽出します。サンプリングではなく全数解析です。",
    phase: "dd",
    ran: false,
    target: () => document.getElementById("run"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 3200,
  },
  {
    t: "解析中 — シグナル抽出",
    b: "データルームの各ソースを突合しています。結果が下に現れます。",
    phase: "dd",
    ran: false,
    target: () => document.getElementById("scan"),
    dim: "none",
    captionMode: "hidden",
    autoMs: 800,
    animate: async () => {
      setCaptionMode("hidden");
      applyDim("none");
      const p = getCurrentPersona();
      // 解析開始前はボタン周辺を見せ、scan 表示後に追従
      const runBtn = document.getElementById("run");
      if (runBtn) {
        scrollEl(runBtn);
        positionSpotEl(runBtn);
      }
      runAnalysis(p);
      await waitFor(() => {
        const scan = document.getElementById("scan");
        return scan && scan.classList.contains("on");
      }, 2000);
      await raf();
      const scan = document.getElementById("scan");
      if (scan) {
        scrollEl(scan);
        positionSpotEl(scan);
      }
      await waitFor(() => getState(p.key).ran, 14000);
      const flags = document.getElementById("flags");
      if (flags) {
        scrollEl(flags);
        positionSpotEl(flags);
      }
      await delay(reduce ? 0 : isMobile() ? 500 : 700);
    },
  },
  {
    t: "検出フラグ ― 定量査定と発見系",
    b: "機械的に金額を推計できる「定量査定」と、突合で気づく「発見系」を同時に提示。どちらも根拠つきで並びます。",
    phase: "dd",
    ran: true,
    target: () => document.getElementById("summary"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4200,
  },
  {
    t: "定量査定 — 金額を機械推計",
    b: "矛盾シグナルから、推定エクスポージャー（簿外債務の幅）を機械的に算出した項目です。",
    phase: "dd",
    ran: true,
    target: () => document.querySelector(".flag.flag-quant"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4000,
  },
  {
    t: "発見系 — 突合・言語で気づくリスク",
    b: "金額を一律推計しにくいが、契約・言語・時系列の突合から発見したリスク項目です。",
    phase: "dd",
    ran: true,
    target: () => document.querySelector(".flag.flag-disc"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4000,
  },
  {
    t: "なぜフラグしたか ― 根拠と推論",
    b: "突合の根拠チェーンとAIの推論を順に確認します。定量項目は計算式と入力値まで開示し、説明可能性を担保します。",
    phase: "dd",
    ran: true,
    target: () => document.querySelector(".flag.flag-quant"),
    dim: "soft",
    captionMode: "compact",
    after: () => {
      const f = document.querySelector(".flag.flag-quant");
      if (f && !f.classList.contains("open")) f.classList.add("open");
    },
    autoMs: 1200,
    animate: async () => {
      setCaptionMode("hidden");
      const flag = document.querySelector(".flag.flag-quant");
      if (!flag) return;
      if (!flag.classList.contains("open")) flag.classList.add("open");
      await raf();
      const parts = [".srcwrap", ".gap", ".flagnode", ".inf"];
      const partDelay = reduce ? 0 : isMobile() ? 900 : 1100;
      for (const sel of parts) {
        if (!playing) return;
        const el = flag.querySelector(sel);
        if (!el) continue;
        scrollEl(el);
        positionSpotEl(el);
        await delay(partDelay);
      }
      // 最後はフラグ全体に戻す
      scrollEl(flag);
      positionSpotEl(flag);
      setCaptionMode(STEPS[idx].captionMode || "compact");
    },
  },
  {
    t: "③ 人間が検証して確定",
    b: "採用／要確認／誤検知を人間が判定。「採用」した額が確定簿外債務として集計され、そのまま次フェーズへ連携されます。",
    phase: "dd",
    ran: true,
    judged: true,
    target: () => document.getElementById("summary"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 4800,
  },
  {
    t: "④ PMI ― 最初の100日プラン",
    b: "確定したフラグが是正タスクに自動変換。担当・期日・解消額つきで、属人化の解体／データ基盤／標準化を進めます。",
    phase: "pmi",
    ran: true,
    judged: true,
    target: () => document.getElementById("phasePmi"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 5200,
  },
  {
    t: "⑤ バリューアップ ― 実態EBITDAの改善",
    b: "DD補正後の実態EBITDAに、労務適正化と業種別AI実装（運送なら配車・動態最適化）を積み上げ、企業価値そのものを引き上げます。",
    phase: "valueup",
    ran: true,
    judged: true,
    target: () => document.getElementById("phaseValueup"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 5200,
  },
  {
    t: "⑥ EXIT準備 ― EVブリッジ",
    b: "改善後EBITDA × マルチプル再評価で、Entry → Exit のEVブリッジを提示。テック化による高マルチプル売却を狙います。",
    phase: "exit",
    ran: true,
    judged: true,
    target: () => document.getElementById("phaseExit"),
    dim: "soft",
    captionMode: "compact",
    autoMs: 5200,
  },
  {
    t: "DDからAIを参加させ、EXITまで一気通貫に",
    b: "DDからAIを参加させることで、EXITまでAI活用と機械学習の環境を整えられます。分析ツールとしての活用から始まり、そのままEXITまでを強力にサポートすること——それが、最も効率の良いAIの参加タイミングです。",
    phase: "exit",
    ran: true,
    judged: true,
    target: null,
    dim: "none",
    captionMode: "compact",
    bright: true,
    autoMs: 7200,
  },
];

let root = null;
let idx = 0;
let playing = false;
let busy = false;
let onResize = null;
let sheetExpanded = false;
let activeSpotEl = null;

// rAF ベースの滞在タイマー（一時停止／再開とプログレスバーを同期）
let rafId = null;
let slideDur = 0;
let slideStart = 0;
let elapsedBeforePause = 0;

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

function dwellOf(step) {
  return (step.autoMs || 5200) * DWELL_MULT;
}

function setProgress(frac) {
  if (!root) return;
  const bar = root.querySelector(".tc-prog i");
  if (bar) bar.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
}

function tickDwell() {
  const el = elapsedBeforePause + (performance.now() - slideStart);
  const frac = slideDur ? el / slideDur : 1;
  setProgress(frac);
  if (frac >= 1) {
    rafId = null;
    go(1);
    return;
  }
  rafId = requestAnimationFrame(tickDwell);
}

function startDwell(dur) {
  cancelDwell();
  slideDur = dur;
  slideStart = performance.now();
  rafId = requestAnimationFrame(tickDwell);
}

function pauseDwell() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
    elapsedBeforePause += performance.now() - slideStart;
  }
}

function resumeDwell() {
  if (!playing || !slideDur) return;
  slideStart = performance.now();
  rafId = requestAnimationFrame(tickDwell);
}

function cancelDwell() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  elapsedBeforePause = 0;
}

function chromeHeight() {
  if (!root) return 0;
  const chrome = root.querySelector(".tour-chrome");
  return chrome ? chrome.getBoundingClientRect().height : 0;
}

function updateChromeVar() {
  const h = chromeHeight();
  document.documentElement.style.setProperty("--tour-chrome-h", h + "px");
}

function applyDim(dim) {
  if (!root) return;
  root.classList.remove("dim-soft", "dim-none", "bright");
  const d = dim || "soft";
  root.classList.add(d === "none" ? "dim-none" : "dim-soft");
  const s = STEPS[idx];
  if (s && s.bright) root.classList.add("bright");
}

function setCaptionMode(mode) {
  if (!root) return;
  const chrome = root.querySelector(".tour-chrome");
  if (!chrome) return;
  chrome.classList.remove("mode-full", "mode-compact", "mode-hidden", "is-collapsed");
  let m = mode || "compact";
  if (sheetExpanded && m === "compact") m = "full";
  chrome.classList.add("mode-" + m);
  if (m === "hidden") chrome.classList.add("is-collapsed");
  updateChromeVar();
}

function resolveCaptionMode(step) {
  if (sheetExpanded && step.captionMode !== "hidden") return "full";
  return step.captionMode || "compact";
}

function applyScrollMargin(el) {
  if (!el) return;
  el.style.scrollMarginBottom = "calc(var(--tour-chrome-h, 120px) + 12px)";
  el.style.scrollMarginTop = "12px";
}

function scrollEl(el) {
  if (!el) {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    return;
  }
  applyScrollMargin(el);
  el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
}

function scrollToTarget(s) {
  const el = s.target ? s.target() : null;
  scrollEl(el);
}

/**
 * 要素をスポット。ビューポート＋chrome高さを考慮して高さをクランプ。
 */
function positionSpotEl(el) {
  if (!root) return;
  activeSpotEl = el || null;
  const spot = root.querySelector(".tour-spot");
  const block = root.querySelector(".tour-block");
  const step = STEPS[idx];
  const dim = step ? step.dim || "soft" : "soft";
  applyDim(dim);

  if (!el) {
    spot.style.display = "none";
    if (dim === "none") {
      block.classList.remove("full");
    } else {
      block.classList.add("full");
    }
    return;
  }

  const r = el.getBoundingClientRect();
  const pad = isMobile() ? 6 : 10;
  const chromeH = chromeHeight();
  const maxBottom = window.innerHeight - Math.max(chromeH, 8) - 8;
  const minTop = 8;

  let top = Math.max(minTop, r.top - pad);
  let left = Math.max(8, r.left - pad);
  let width = Math.min(window.innerWidth - 16, r.width + pad * 2);
  let height = r.height + pad * 2;

  // 下端が chrome に食い込む場合は上へ寄せて高さをクランプ
  const maxH = isMobile()
    ? Math.min(window.innerHeight * 0.45, maxBottom - minTop)
    : maxBottom - minTop;
  if (height > maxH) height = Math.max(40, maxH);
  if (top + height > maxBottom) {
    top = Math.max(minTop, maxBottom - height);
  }
  if (top + height > maxBottom) {
    top = minTop;
    height = Math.max(40, maxBottom - top);
  }

  spot.style.display = "block";
  spot.style.top = top + "px";
  spot.style.left = left + "px";
  spot.style.width = width + "px";
  spot.style.height = height + "px";
  block.classList.remove("full");
}

function positionSpot(s) {
  const el = s && s.target ? s.target() : null;
  positionSpotEl(el);
}

async function seek(i, forward) {
  if (busy) return;
  if (i < 0 || i >= STEPS.length) return;
  cancelDwell();
  busy = true;
  idx = i;
  sheetExpanded = false;
  const s = STEPS[i];

  setDemoState(s);
  if (s.after) s.after();
  renderCaption();
  setCaptionMode(resolveCaptionMode(s));
  applyDim(s.dim || "soft");
  positionSpotEl(null);

  await raf();
  updateChromeVar();
  await delay(reduce ? 0 : 280);
  scrollToTarget(s);
  await delay(reduce ? 0 : 320);
  positionSpot(s);
  updateChromeVar();

  busy = false;

  if (playing) {
    if (forward && s.animate) {
      busy = true;
      await s.animate();
      busy = false;
      setCaptionMode(resolveCaptionMode(s));
      positionSpot(s);
      updateChromeVar();
      if (!playing) return;
    }
    startDwell(dwellOf(s));
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
    pauseDwell();
    return;
  }
  const s = STEPS[idx];
  // 解析ステップ（ran になる animate）が未実行なら再生時に走らせる
  if (s.animate && s.ran === false && !getState(DEMO_KEY).ran) {
    busy = true;
    await s.animate();
    busy = false;
    setCaptionMode(resolveCaptionMode(s));
    positionSpot(s);
    if (!playing) return;
    startDwell(dwellOf(s));
    return;
  }
  if (slideDur && elapsedBeforePause > 0) resumeDwell();
  else startDwell(dwellOf(s));
}

function renderCaption() {
  if (!root) return;
  const s = STEPS[idx];
  const chrome = root.querySelector(".tour-chrome");
  const dots = STEPS.map(
    (_, i) =>
      `<span class="d${i === idx ? " on" : ""}${i < idx ? " done" : ""}"></span>`
  ).join("");

  chrome.innerHTML = `
    <div class="tour-sheet" data-act="toggle-sheet" role="button" tabindex="0" aria-label="説明を展開">
      <div class="tc-top">
        <span class="tc-step">STEP ${idx + 1} / ${STEPS.length}</span>
        <div class="tc-dots">${dots}</div>
        <button class="tc-x" type="button" aria-label="ツアーを終了">✕</button>
      </div>
      <h4>${s.t}</h4>
      <p>${s.b}</p>
    </div>
    <div class="tc-prog" aria-hidden="true"><i></i></div>
    <div class="tc-controls">
      <button class="tc-btn" data-act="prev" type="button" ${idx === 0 ? "disabled" : ""}>◀ 前へ</button>
      <button class="tc-btn play" data-act="play" type="button">${playing ? "❙❙ 一時停止" : "▶ 再生"}</button>
      <button class="tc-btn" data-act="next" type="button">${idx === STEPS.length - 1 ? "もう一度 ⟲" : "次へ ▶"}</button>
    </div>`;

  setProgress(0);

  chrome.querySelector(".tc-x").addEventListener("click", (e) => {
    e.stopPropagation();
    close();
  });
  chrome.querySelector('[data-act="prev"]').addEventListener("click", (e) => {
    e.stopPropagation();
    go(-1);
  });
  chrome.querySelector('[data-act="play"]').addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlay();
  });
  chrome.querySelector('[data-act="next"]').addEventListener("click", (e) => {
    e.stopPropagation();
    if (idx === STEPS.length - 1) {
      playing = true;
      seek(0, true);
    } else {
      go(1);
    }
  });

  const sheet = chrome.querySelector(".tour-sheet");
  sheet.addEventListener("click", (e) => {
    if (e.target.closest(".tc-x")) return;
    // モバイル: compact ↔ full トグル
    if (STEPS[idx].captionMode === "hidden") return;
    sheetExpanded = !sheetExpanded;
    setCaptionMode(sheetExpanded ? "full" : "compact");
    if (activeSpotEl) positionSpotEl(activeSpotEl);
    else positionSpot(STEPS[idx]);
  });
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      sheet.click();
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

function handleResize() {
  updateChromeVar();
  if (activeSpotEl) positionSpotEl(activeSpotEl);
  else positionSpot(STEPS[idx]);
}

export function openTour() {
  if (root) return;
  root = document.createElement("div");
  root.className = "tour-root dim-soft";
  root.innerHTML = `
    <div class="tour-block full"></div>
    <div class="tour-spot"></div>
    <div class="tour-chrome mode-compact"></div>`;
  document.body.appendChild(root);
  document.body.classList.add("tour-active");

  root.querySelector(".tour-block").addEventListener("click", () => go(1));
  onResize = handleResize;
  window.addEventListener("resize", onResize);
  mqMobile.addEventListener("change", onResize);
  document.addEventListener("keydown", onKey);

  idx = 0;
  playing = true;
  sheetExpanded = false;
  seek(0, true);
}

export function close() {
  if (!root) return;
  cancelDwell();
  playing = false;
  window.removeEventListener("resize", onResize);
  mqMobile.removeEventListener("change", onResize);
  document.removeEventListener("keydown", onKey);
  document.documentElement.style.removeProperty("--tour-chrome-h");
  root.remove();
  root = null;
  activeSpotEl = null;
  document.body.classList.remove("tour-active");
}

export function initTour() {
  const btn = document.getElementById("tourBtn");
  if (btn) btn.addEventListener("click", openTour);
}
