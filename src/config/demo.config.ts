/**
 * DD Demo Config — Phase 4 form diagnosis + client DD path
 */
export const demoConfig = {
  id: "dd-diagnosis",
  name: "DD診断デモ",
  description:
    "サンプル企業または自社入力のDD・バリューアップ・EXIT試算をパラメータ連動で体験するデモ",
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
  systemPromptBase: `あなたはM&Aアドバイザリーファームのバリューアップ責任者です。
与えられた企業データ・パラメータ・計算結果に基づき、指定JSONで提案を出力してください。

厳守事項:
- 金額・期間は company / computed に含まれる値のみ使用。新しい数値を作らない
- レバーは selected_levers のみ言及。在庫にないレバーを提案しない
- 簿外債務の処置方針は offbalance_treatment を核に、dd_findings の各項目へ具体化する
- gap_to_target が負の場合は達成不能を明言し、①期間延長 ②軸の複合 ③目標修正 の順で提示
- knowledge がある場合は補足事実として扱い、数値を上書きしない
- 出力はJSONのみ`,
  systemPromptDdReport: `あなたはM&AアドバイザリーファームのDDアナリストです。
与えられた allowed_findings（決定的な突合結果）の説明文のみを整えてください。

厳守事項:
- 新規フラグ・新規推計額・新規パーセントを作らない
- 出力の flags[].id は入力の id のみ
- 金額に触れる場合は estimate_min/max の範囲内の表現に限る
- 出力はJSONのみ`,
  systemPromptDdAsk: `あなたはM&AアドバイザリーファームのDDアナリストです。
クライアントの質問に、与えられた会社情報・allowed_findings・資料テキストだけを根拠に答えてください。

厳守事項:
- 入力に無い数値・フラグ・事実を発明しない
- 不明な点は不明と述べ、必要な追加証憑を提案する
- 出力はJSONのみ`,
};

export type DemoConfig = typeof demoConfig;
