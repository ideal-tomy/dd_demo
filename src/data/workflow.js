/** @typedef {"定量"|"発見"} FlagCategory */
/** @typedef {"労務"|"社保"|"ガバナンス"|"データ基盤"|"標準化"} PmiTheme */
/** @typedef {"コスト"|"AI実装"|"再評価"} LeverKind */

const QUANT_TITLES = /未払残業代|社会保険|退職給付|未消化有給|有給引当/;

export const FLAG8_UNUSED_LEAVE = {
  title: "未消化有給の引当不足",
  type: "矛盾",
  conf: "中",
  confLv: 2,
  glance: "未消化有給日数×平均賃金から見込む要引当に対し、計上が過少。",
  flagText: "有給引当不足",
  deal: "<b>実態純資産の補正</b>項目。PMIで有給管理を標準化。",
};

const WORKFLOW = {
  logistics: {
    flagMeta: {
      1: {
        cat: "定量",
        calc: {
          formula: "対象人数 × 月平均差分時間 × 平均時給 × 遡及月数",
          inputs: [
            { k: "対象人数", v: "120名（ドライバー）" },
            { k: "月平均差分", v: "約18h/人" },
            { k: "平均時給", v: "¥2,100" },
            { k: "遡及", v: "36ヶ月（順次60）" },
          ],
        },
      },
      2: {
        cat: "定量",
        calc: {
          formula: "未加入人数 × 標準報酬月額 × 保険料率 × 遡及月数（事業主負担）",
          inputs: [
            { k: "未加入", v: "18名" },
            { k: "平均標準報酬", v: "¥220,000" },
            { k: "遡及", v: "24ヶ月" },
          ],
        },
      },
      7: {
        cat: "定量",
        calc: {
          formula: "対象人数 × 退職金単価（規程ベース）− 計上済引当",
          inputs: [
            { k: "勤続15年以上", v: "22名" },
            { k: "要支給見込", v: "¥7,000万" },
            { k: "計上済引当", v: "¥3,500万" },
          ],
        },
      },
      8: {
        cat: "定量",
        calc: {
          formula: "未消化有給日数 × 平均日額賃金 − 計上済引当",
          inputs: [
            { k: "未消化日数（平均）", v: "12.4日/人" },
            { k: "対象", v: "180名" },
            { k: "不足引当", v: "¥1,200万" },
          ],
        },
        amt: [1200, 1200],
        prior: "勤怠×有給管理×未消化",
        nodes: [
          { s: "勤怠・有給取得記録", v: "未消化 平均12.4日" },
          { s: "有給引当金", v: "計上 過少" },
        ],
        gap: "見込 > 計上",
        inference:
          "従業員名簿・勤怠・有給取得記録から未消化有給を集計し、平均日額賃金で要引当を算出。計上済み有給引当が過少。",
      },
    },
    pmi: {
      headline: "最初の100日 ― 属人化の解体・データ基盤・標準化",
      tasks: [
        { srcFlag: 1, action: "固定残業超過の自動清算ルールを全3拠点に展開", owner: "人事部長", due: "Day 45", status: "planned", resolveAmt: [12000, 16000], theme: "労務" },
        { srcFlag: 2, action: "社保加入要件該当者18名の一括加入手続き", owner: "労務担当", due: "Day 30", status: "planned", resolveAmt: [1500, 2000], theme: "社保" },
        { srcFlag: 4, action: "東和商事借入の連帯保証解除をクロージング条件に", owner: "CFO", due: "Day 60", status: "planned", resolveAmt: [8000, 8000], theme: "ガバナンス" },
        { srcFlag: 5, action: "主要荷主△△物流のCoC同意取得", owner: "営業本部長", due: "Day 20", status: "planned", resolveAmt: null, theme: "ガバナンス" },
        { srcFlag: 0, action: "デジタコ×給与台帳の自動突合ダッシュボード構築", owner: "DX推進", due: "Day 90", status: "planned", resolveAmt: null, theme: "データ基盤" },
        { srcFlag: 8, action: "有給取得促進・残日数可視化の全社標準化", owner: "人事部長", due: "Day 70", status: "planned", resolveAmt: [1200, 1200], theme: "標準化" },
      ],
    },
    valueup: {
      reportedEbitda: 14000,
      ddAdjustment: -8500,
      levers: [
        { label: "労務適正化の持続コスト削減", kind: "コスト", ebitdaUp: 1200, note: "残業代適正化・社保適正加入による人件費効率化" },
        { label: "配車・動態最適化AI", kind: "AI実装", ebitdaUp: 2800, note: "空車率削減・拘束時間管理の自動化" },
        { label: "荷主ポートフォリオ分散", kind: "再評価", ebitdaUp: 500, note: "特定荷主依存32%→25%へのリスク低減" },
      ],
    },
    exit: {
      entryEbitda: 5500,
      entryMult: 5.5,
      exitEbitda: 9500,
      exitMult: 10.5,
      story: "テック-enabled 物流プラットフォーム ― データ駆動の配車・労務コンプライアンスを武器に高マルチプルで売却",
      bridge: [
        { label: "Entry EV（実態EBITDA × マルチプル）", amt: 30250 },
        { label: "+ EBITDA改善（労務・AI施策）", amt: 4000 },
        { label: "+ マルチプル再評価（テック化）", amt: 50250 },
        { label: "Exit EV", amt: 99750 },
      ],
    },
  },

  manufacturing: {
    flagMeta: {
      1: { cat: "定量", calc: { formula: "対象人数 × 月平均差分 × 平均時給 × 遡及月数", inputs: [{ k: "対象", v: "140名" }, { k: "差分", v: "約20h/人" }, { k: "遡及", v: "36ヶ月" }] } },
      4: { cat: "定量", calc: { formula: "勤続20年以上 × 退職金単価 − 計上引当", inputs: [{ k: "対象", v: "31名" }, { k: "不足", v: "¥4,000万" }] } },
      8: { cat: "定量", calc: { formula: "未消化有給日数 × 平均日額 − 計上引当", inputs: [{ k: "未消化平均", v: "11.2日" }, { k: "不足", v: "¥900万" }] }, amt: [900, 900], prior: "交替勤務×有給未消化", nodes: [{ s: "勤怠・有給記録", v: "未消化 平均11.2日" }, { s: "有給引当金", v: "計上 過少" }], gap: "見込 > 計上", inference: "交替勤務で有給取得が遅れ、未消化が蓄積。要引当に対し計上が過少。" },
    },
    pmi: {
      headline: "最初の100日 ― 品質・環境・労務の標準化",
      tasks: [
        { srcFlag: 1, action: "段取り・交替引継ぎ時間の労働時間算入ルール整備", owner: "工場長", due: "Day 40", status: "planned", resolveAmt: [12000, 16000], theme: "労務" },
        { srcFlag: 3, action: "主力工場の土壌汚染予備調査の実施", owner: "環境担当", due: "Day 30", status: "planned", resolveAmt: [5000, 8000], theme: "ガバナンス" },
        { srcFlag: 6, action: "構内請負契約の適正化・指揮命令の見直し", owner: "法務・人事", due: "Day 70", status: "planned", resolveAmt: [2000, 3000], theme: "労務" },
        { srcFlag: 0, action: "品質会議・是正処置のテンプレート化", owner: "品質保証", due: "Day 80", status: "planned", resolveAmt: null, theme: "標準化" },
        { srcFlag: 8, action: "有給取得計画の全社展開", owner: "人事部長", due: "Day 65", status: "planned", resolveAmt: [900, 900], theme: "標準化" },
      ],
    },
    valueup: {
      reportedEbitda: 18000,
      ddAdjustment: -7200,
      levers: [
        { label: "労務・品質コストの適正化", kind: "コスト", ebitdaUp: 1000, note: "残業適正化・リコール予防による品質コスト削減" },
        { label: "不良検知・予知保全AI", kind: "AI実装", ebitdaUp: 3500, note: "段取り時間削減・不良率低減" },
      ],
    },
    exit: {
      entryEbitda: 10800,
      entryMult: 5.0,
      exitEbitda: 15300,
      exitMult: 9.5,
      story: "スマートファクトリー化した精密加工メーカーとして再評価",
      bridge: [
        { label: "Entry EV", amt: 54000 },
        { label: "+ EBITDA改善", amt: 4500 },
        { label: "+ マルチプル再評価", amt: 90500 },
        { label: "Exit EV", amt: 145350 },
      ],
    },
  },

  care: {
    flagMeta: {
      1: { cat: "定量", calc: { formula: "対象 × 移動・記録時間差分 × 時給 × 遡及", inputs: [{ k: "対象", v: "320名" }, { k: "差分", v: "月23h" }, { k: "遡及", v: "36ヶ月" }] } },
      2: { cat: "定量", calc: { formula: "未加入 × 標準報酬 × 料率 × 遡及", inputs: [{ k: "未加入", v: "23名" }, { k: "遡及", v: "24ヶ月" }] } },
      6: { cat: "定量", calc: { formula: "退職金見込 + 有給引当見込 − 計上", inputs: [{ k: "退職金不足", v: "¥2,000万" }, { k: "有給不足", v: "¥1,000万" }] } },
      8: { cat: "定量", calc: { formula: "未消化有給 × 日額 − 計上引当", inputs: [{ k: "未消化平均", v: "14.8日" }, { k: "対象", v: "320名" }, { k: "不足", v: "¥1,000万" }] }, amt: [1000, 1000], prior: "訪問×直行直帰×有給未消化", nodes: [{ s: "訪問記録・有給残", v: "未消化 平均14.8日" }, { s: "有給引当金", v: "計上 過少" }], gap: "見込 > 計上", inference: "直行直帰・多拠点運営で有給取得が困難。未消化が蓄積し引当不足。" },
    },
    pmi: {
      headline: "最初の100日 ― 配置基準遵守・記録の標準化",
      tasks: [
        { srcFlag: 1, action: "移動・記録時間の労働時間算入と打刻ルール統一", owner: "各事業所長", due: "Day 35", status: "planned", resolveAmt: [8000, 12000], theme: "労務" },
        { srcFlag: 3, action: "加算算定の再検証・体制届の修正（12事業所）", owner: "介護報酬担当", due: "Day 25", status: "planned", resolveAmt: [3000, 8000], theme: "ガバナンス" },
        { srcFlag: 4, action: "処遇改善加算の配分実績是正", owner: "人事部長", due: "Day 50", status: "planned", resolveAmt: [1500, 2500], theme: "労務" },
        { srcFlag: 0, action: "12事業所の人員配置基準モニタリングダッシュボード", owner: "DX推進", due: "Day 90", status: "planned", resolveAmt: null, theme: "データ基盤" },
        { srcFlag: 8, action: "シフト最適化による有給取得促進", owner: "人事部長", due: "Day 60", status: "planned", resolveAmt: [1000, 1000], theme: "標準化" },
      ],
    },
    valueup: {
      reportedEbitda: 12000,
      ddAdjustment: -5800,
      levers: [
        { label: "労務・報酬コンプライアンス改善", kind: "コスト", ebitdaUp: 900, note: "返還リスク低減・残業適正化" },
        { label: "記録自動化・シフト最適化AI", kind: "AI実装", ebitdaUp: 3200, note: "記録時間削減・配置基準の自動チェック" },
      ],
    },
    exit: {
      entryEbitda: 6200,
      entryMult: 5.5,
      exitEbitda: 10300,
      exitMult: 10.0,
      story: "デジタル介護プラットフォーム ― 配置基準コンプライアンスとAI運営効率",
      bridge: [
        { label: "Entry EV", amt: 34100 },
        { label: "+ EBITDA改善", amt: 4100 },
        { label: "+ マルチプル再評価", amt: 64800 },
        { label: "Exit EV", amt: 103000 },
      ],
    },
  },

  construction: {
    flagMeta: {
      1: { cat: "定量", calc: { formula: "対象 × 残業差分 × 時給 × 遡及", inputs: [{ k: "対象", v: "90名" }, { k: "差分", v: "月25h" }, { k: "遡及", v: "36ヶ月" }] } },
      6: { cat: "定量", calc: { formula: "勤続15年以上の退職金見込 − 計上", inputs: [{ k: "不足", v: "¥3,000万" }] } },
      8: { cat: "定量", calc: { formula: "未消化有給 × 日額 − 計上", inputs: [{ k: "未消化平均", v: "16.2日" }, { k: "不足", v: "¥800万" }] }, amt: [800, 800], prior: "現場監督×長時間×有給未消化", nodes: [{ s: "勤怠・有給残", v: "未消化 平均16.2日" }, { s: "有給引当金", v: "計上 過少" }], gap: "見込 > 計上", inference: "現場監督の長時間労働で有給取得が困難。未消化蓄積による引当不足。" },
    },
    pmi: {
      headline: "最初の100日 ― 原価管理・JV精査の標準化",
      tasks: [
        { srcFlag: 2, action: "進行18件の原価再評価・工事損失引当の計上", owner: "工事管理部", due: "Day 20", status: "planned", resolveAmt: [5000, 8000], theme: "ガバナンス" },
        { srcFlag: 4, action: "一人親方契約の適正化・常用の見直し", owner: "法務・現場", due: "Day 60", status: "planned", resolveAmt: [2000, 4000], theme: "労務" },
        { srcFlag: 5, action: "JV3件の連帯責任条項精査・開示", owner: "CFO", due: "Day 40", status: "planned", resolveAmt: null, theme: "ガバナンス" },
        { srcFlag: 0, action: "工事台帳・実行予算の統一フォーマット展開", owner: "工事管理部", due: "Day 85", status: "planned", resolveAmt: null, theme: "標準化" },
        { srcFlag: 8, action: "現場監督の労働時間・有給管理の標準化", owner: "人事部長", due: "Day 55", status: "planned", resolveAmt: [800, 800], theme: "労務" },
      ],
    },
    valueup: {
      reportedEbitda: 15000,
      ddAdjustment: -6500,
      levers: [
        { label: "原価超過・労務リスクの低減", kind: "コスト", ebitdaUp: 1100, note: "工事損失の早期検知・残業適正化" },
        { label: "実行予算管理・原価予測AI", kind: "AI実装", ebitdaUp: 3000, note: "進行工事の赤字早期アラート" },
      ],
    },
    exit: {
      entryEbitda: 8500,
      entryMult: 5.5,
      exitEbitda: 12600,
      exitMult: 10.0,
      story: "データドリブン建設会社 ― 実行予算AIと原価透明性で高マルチプル",
      bridge: [
        { label: "Entry EV", amt: 46750 },
        { label: "+ EBITDA改善", amt: 4100 },
        { label: "+ マルチプル再評価", amt: 75150 },
        { label: "Exit EV", amt: 126000 },
      ],
    },
  },

  retail: {
    flagMeta: {
      1: { cat: "定量", calc: { formula: "対象 × 残業差分 × 時給 × 遡及", inputs: [{ k: "対象", v: "110名" }, { k: "差分", v: "月20h" }, { k: "遡及", v: "36ヶ月" }] } },
      2: { cat: "定量", calc: { formula: "未加入 × 標準報酬 × 料率 × 遡及", inputs: [{ k: "未加入", v: "19名" }, { k: "遡及", v: "24ヶ月" }] } },
      6: { cat: "定量", calc: { formula: "発行残高 × 利用率 − 計上引当", inputs: [{ k: "ポイント未使用残", v: "あり" }, { k: "不足", v: "¥2,000〜4,000万" }] } },
      8: { cat: "定量", calc: { formula: "未消化有給 × 日額 − 計上", inputs: [{ k: "未消化平均", v: "10.5日" }, { k: "不足", v: "¥700万" }] }, amt: [700, 700], prior: "パート多数×有給未消化", nodes: [{ s: "勤怠・有給残", v: "未消化 平均10.5日" }, { s: "有給引当金", v: "計上 過少" }], gap: "見込 > 計上", inference: "パート・アルバイト中心で有給管理が不十分。未消化蓄積による引当不足。" },
    },
    pmi: {
      headline: "最初の100日 ― 在庫・リベート・労務の標準化",
      tasks: [
        { srcFlag: 3, action: "全SKU棚卸実査・評価減の実施", owner: "物流部長", due: "Day 25", status: "planned", resolveAmt: [5000, 10000], theme: "ガバナンス" },
        { srcFlag: 4, action: "未払リベートの計上ルール整備・期末調整", owner: "経理部長", due: "Day 45", status: "planned", resolveAmt: [3000, 5000], theme: "ガバナンス" },
        { srcFlag: 2, action: "パート19名の社保一括加入", owner: "労務担当", due: "Day 35", status: "planned", resolveAmt: [2000, 3000], theme: "社保" },
        { srcFlag: 0, action: "在庫×販売のリアルタイム突合ダッシュボード", owner: "DX推進", due: "Day 80", status: "planned", resolveAmt: null, theme: "データ基盤" },
        { srcFlag: 8, action: "8店舗の有給・シフト管理標準化", owner: "店舗運営部", due: "Day 55", status: "planned", resolveAmt: [700, 700], theme: "標準化" },
      ],
    },
    valueup: {
      reportedEbitda: 9000,
      ddAdjustment: -5500,
      levers: [
        { label: "在庫・リベートコストの適正化", kind: "コスト", ebitdaUp: 800, note: "滞留削減・リベート計上の適正化" },
        { label: "需要予測・在庫最適化AI", kind: "AI実装", ebitdaUp: 2500, note: "欠品率削減・廃棄ロス低減" },
      ],
    },
    exit: {
      entryEbitda: 3500,
      entryMult: 5.0,
      exitEbitda: 6800,
      exitMult: 9.5,
      story: "データドリブン卸・小売プラットフォーム ― 在庫最適化と需要予測で再評価",
      bridge: [
        { label: "Entry EV", amt: 17500 },
        { label: "+ EBITDA改善", amt: 3300 },
        { label: "+ マルチプル再評価", amt: 54150 },
        { label: "Exit EV", amt: 64600 },
      ],
    },
  },
};

export function getWorkflow(key) {
  return WORKFLOW[key];
}

export function inferCategory(flag) {
  if (flag.cat) return flag.cat;
  return QUANT_TITLES.test(flag.title) ? "定量" : "発見";
}

export function enrichPersona(base) {
  const wf = WORKFLOW[base.key];
  if (!wf) return base;

  const flags = base.flags.map((f) => {
    const meta = wf.flagMeta?.[f.id] || {};
    const cat = meta.cat || inferCategory(f);
    const enriched = { ...f, cat, ...(meta.calc ? { calc: meta.calc } : {}) };
    return enriched;
  });

  const flag8 = wf.flagMeta?.[8];
  if (flag8 && !flags.find((f) => f.id === 8)) {
    flags.push({
      id: 8,
      ...FLAG8_UNUSED_LEAVE,
      ...flag8,
      title: FLAG8_UNUSED_LEAVE.title,
      type: FLAG8_UNUSED_LEAVE.type,
      conf: FLAG8_UNUSED_LEAVE.conf,
      confLv: FLAG8_UNUSED_LEAVE.confLv,
      glance: FLAG8_UNUSED_LEAVE.glance,
      flagText: FLAG8_UNUSED_LEAVE.flagText,
      deal: FLAG8_UNUSED_LEAVE.deal,
      inference: flag8.inference || FLAG8_UNUSED_LEAVE.inference,
    });
  }

  return {
    ...base,
    flags,
    pmi: wf.pmi,
    valueup: wf.valueup,
    exit: wf.exit,
  };
}
