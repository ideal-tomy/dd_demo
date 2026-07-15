import type { MaCompany, Range } from "../../data/ma-companies";

export type DdFlagCategory = "定量" | "発見";

export type DdFlagJudgment = "ok" | "review" | "false" | null;

export type DdFlag = {
  id: string;
  title: string;
  category: DdFlagCategory;
  confidence: "高" | "中" | "低";
  estimate: Range | null;
  prior: string;
  sources: { label: string; value: string }[];
  gap: string;
  glance: string;
  inference: string;
  deal: string;
};

export type DdFlagReportSummary = {
  count: number;
  estimateLo: number;
  estimateHi: number;
};

function severityToConf(
  severity: string,
): DdFlag["confidence"] {
  if (severity === "high") return "高";
  if (severity === "low") return "低";
  return "中";
}

/** MaCompany の決定的 findings からストーリー風フラグを生成（AIは金額を作らない） */
export function buildDdFlagsFromCompany(company: MaCompany): DdFlag[] {
  const room = company.data_room;
  const priors = company.industry_priors;

  const quantitative: DdFlag[] = company.dd_findings.quantitative.map(
    (f, i) => {
      const srcA = room[i % Math.max(room.length, 1)] ?? "データルーム";
      const srcB =
        room[(i + 1) % Math.max(room.length, 1)] ?? "関連証憑";
      const prior = priors[i % Math.max(priors.length, 1)] ?? company.profile_prior;
      return {
        id: `q-${i}`,
        title: f.item,
        category: "定量",
        confidence: severityToConf(f.severity),
        estimate: f.estimate,
        prior,
        sources: [
          { label: srcA, value: "突合対象" },
          { label: srcB, value: "突合対象" },
        ],
        gap: `推計レンジ ${f.estimate[0]}〜${f.estimate[1]}百万円`,
        glance: `${f.item}について、業種 prior「${prior}」とデータルーム証憑の突合で乖離が検出されました。`,
        inference: `${company.name}（${company.industry}）のデータルーム上、${srcA}と${srcB}の突合により「${f.item}」の候補が立ちました。推計は業種テンプレのレンジ内（${f.estimate[0]}〜${f.estimate[1]}百万円）に固定し、実査で確定します。`,
        deal: "価格調整・特別補償・エスクローの検討対象。確定まで表明保証の整理が必要。",
      };
    },
  );

  const discovered: DdFlag[] = company.dd_findings.discovered.map((text, i) => {
    const prior =
      priors[(quantitative.length + i) % Math.max(priors.length, 1)] ??
      company.profile_prior;
    const srcA =
      room[(quantitative.length + i) % Math.max(room.length, 1)] ??
      "データルーム";
    return {
      id: `d-${i}`,
      title: text.length > 28 ? `${text.slice(0, 28)}…` : text,
      category: "発見",
      confidence: "中",
      estimate: null,
      prior,
      sources: [
        { label: srcA, value: "文書・契約レビュー" },
        { label: "事前知識（業種prior）", value: prior },
      ],
      gap: "定量化前（構造リスク）",
      glance: text,
      inference: `発見系論点: ${text}。業種 prior（${prior}）と整合し、価格交渉・表明保証・クロージング条件の論点候補です。金額は実査後に確定します。`,
      deal: "表明保証・開示スケジュール・クロージング条件でカバーを検討。",
    };
  });

  return [...quantitative, ...discovered];
}

export function summarizeDdFlags(flags: DdFlag[]): DdFlagReportSummary {
  let lo = 0;
  let hi = 0;
  for (const f of flags) {
    if (!f.estimate) continue;
    lo += f.estimate[0];
    hi += f.estimate[1];
  }
  return { count: flags.length, estimateLo: lo, estimateHi: hi };
}

export const DD_SCAN_STEPS = [
  "データルーム証憑と業種 prior を照合中…",
  "定量候補（勤怠・給与・契約）を突合中…",
  "発見系シグナルを抽出中…",
  "推計レンジを業種テンプレ内に固定中…",
  "フラグカードを生成中…",
] as const;
