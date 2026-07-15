export type DdFormInput = {
  companyName: string;
  industry: string;
  revenue: string;
  employees: string;
  challenges: string;
  systems: string;
  freeText: string;
};

export type DdDiagnosisResult = {
  diagnosis: string;
  techOpportunity: string;
  developmentOptions: { title: string; summary: string }[];
  priority: { rank: number; item: string; rationale: string }[];
  investmentImpact: { investment: string; impact: string; note?: string };
  prototype: { name: string; scope: string; nextStep: string };
  roadmap: { phase: string; items: string[] }[];
};

export const EMPTY_FORM: DdFormInput = {
  companyName: "",
  industry: "",
  revenue: "",
  employees: "",
  challenges: "",
  systems: "",
  freeText: "",
};

export const SAMPLE_FORM: DdFormInput = {
  companyName: "株式会社サンプルテック",
  industry: "業務ソフトウェア / ITサービス",
  revenue: "年商 12億円",
  employees: "85名",
  challenges:
    "属人化した見積・提案、顧客データの分散、現場のDXテーマ選定が進まない",
  systems: "Excel / 基幹（オンプレ） / Salesforce（一部）",
  freeText: "まずは営業提案の品質とリードタイム短縮を優先したい。",
};

export const SAMPLE_RESULT: DdDiagnosisResult = {
  diagnosis:
    "提案・見積プロセスが属人化し、顧客データの分断により勝ちパターンの再現性が低い状態です。短期間で「提案下書きの標準化」から入るのが効果的です。",
  techOpportunity:
    "既存 Salesforce / Excel を起点に、業種テンプレート＋生成AIで提案ドラフトとリスク指摘を自動化する余地があります。フル刷新より「既存データに被せる」方が投資対効果が高いです。",
  developmentOptions: [
    {
      title: "提案ドラフト AI（チャット／フォーム）",
      summary: "企業プロファイルから提案骨子・差別化要点を即生成。",
    },
    {
      title: "見積根拠のチェックリスト化",
      summary: "過去案件の抜け漏れをルール＋LLMで指摘。",
    },
    {
      title: "顧客データ突合ビュー",
      summary: "基幹と CRM の差分を可視化し、商談準備時間を短縮。",
    },
  ],
  priority: [
    {
      rank: 1,
      item: "提案ドラフト AI の PoC",
      rationale: "売上インパクトが分かりやすく、2〜4週間で体験可能。",
    },
    {
      rank: 2,
      item: "顧客データ最小統合",
      rationale: "AIの入力品質を上げる土台になる。",
    },
    {
      rank: 3,
      item: "見積レビュー支援",
      rationale: "属人化リスク低減だが、業務ルール整備が先。",
    },
  ],
  investmentImpact: {
    investment: "PoC 200〜400万円 / 3ヶ月",
    impact: "提案リードタイム 30〜50%短縮、初回提案の再現性向上",
    note: "本試算はサンプル診断であり、実案件では追加調査が必要です。",
  },
  prototype: {
    name: "DD診断フォーム → 構造化カード",
    scope: "企業7項目入力から診断・優先度・ロードマップを JSON 出力",
    nextStep: "実顧客1社の匿名化データで精度検証し、営業同行デモへ",
  },
  roadmap: [
    {
      phase: "0–4週",
      items: ["入力項目確定", "プロンプト／JSONスキーマ固定", "社内パイロット"],
    },
    {
      phase: "1–3ヶ月",
      items: ["CRM連携", "提案テンプレ拡充", "KPIダッシュボード"],
    },
    {
      phase: "3–6ヶ月",
      items: ["見積レビュー拡張", "権限／監査ログ", "本番運用設計"],
    },
  ],
};
