/**
 * DD Demo Config — Phase 4 form diagnosis
 */
export const demoConfig = {
  id: "dd-diagnosis",
  name: "DD診断デモ",
  description: "企業フォーム入力から診断・ロードマップを構造化出力するデモ",
  storageNamespace: "dd",
  defaultRoleId: "dd-analyst",
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
  defaultAccessMode: "sample" as const,
  defaultProvider: "openai" as const,
  defaultModel: "gpt-5-nano",
  systemPromptBase: `あなたは M&A / Due Diligence 向けの技術・業務診断アシスタントです。
入力された企業情報だけを根拠に、日本語で実務的な提案を行ってください。
事実がない場合は推測と明記し、過度な断定は避けてください。`,
};

export type DemoConfig = typeof demoConfig;
