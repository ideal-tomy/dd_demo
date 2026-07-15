// CORE-CANDIDATE
import { demoConfig } from "../config/demo.config";

export function countCharacters(text: string): number {
  return [...text].length;
}

/** Rough estimate; prefer honesty over precision. Japanese-heavy heuristic. */
export function estimateTokens(text: string): number {
  let cjk = 0;
  let other = 0;
  for (const ch of text) {
    if (/[\u3000-\u9fff\uF900-\uFAFF]/.test(ch)) cjk += 1;
    else other += 1;
  }
  return Math.ceil(cjk * 1.5 + other / 4);
}

export type KnowledgeStatus = {
  characters: number;
  estimatedTokens: number;
  withinHardLimit: boolean;
  showWarning: boolean;
  message?: string;
};

export function evaluateKnowledge(text: string): KnowledgeStatus {
  const { warningFrom, hardLimit } = demoConfig.knowledgePolicy;
  const characters = countCharacters(text);
  const estimatedTokens = estimateTokens(text);
  const withinHardLimit = characters <= hardLimit;
  const showWarning = characters >= warningFrom && withinHardLimit;

  let message: string | undefined;
  if (!withinHardLimit) {
    message = `現在の簡易ナレッジモードでは${hardLimit.toLocaleString()}文字まで入力できます。内容を短くするか、本番向けの文書検索構成をご相談ください。`;
  } else if (showWarning) {
    message =
      "ナレッジ量が多くなっています。回答速度・利用コスト・回答精度に影響する場合があります。";
  }

  return {
    characters,
    estimatedTokens,
    withinHardLimit,
    showWarning,
    message,
  };
}
