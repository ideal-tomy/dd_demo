// PROVIDER-SPECIFIC
import type { ProviderConfig } from "../types/provider";

export const providerConfigs: ProviderConfig[] = [
  {
    id: "openai",
    displayName: "OpenAI",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote:
      "ブラウザ直接通信は可能ですが、公式には非推奨です。デモ専用キーを推奨します。",
    defaultModel: "gpt-5.4-nano",
    allowedModels: [
      {
        id: "gpt-5.4-nano",
        label: "軽量・おすすめ",
        description: "バランス重視の軽量モデル",
        tier: "recommended",
      },
      {
        id: "gpt-5-nano",
        label: "低コスト",
        description: "最低コスト候補",
        tier: "low_cost",
      },
    ],
    apiKeyHint: "OpenAI APIキー（sk- で始まるキー）を入力してください。",
    apiKeyHelpUrl: "https://platform.openai.com/api-keys",
    promptOverride:
      "回答は段落を分け、必要なら箇条書きで整理してください。",
  },
  {
    id: "anthropic",
    displayName: "Claude",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote:
      "ブラウザ直接には anthropic-dangerous-direct-browser-access ヘッダーが必要です。",
    defaultModel: "claude-haiku-4-5",
    allowedModels: [
      {
        id: "claude-haiku-4-5",
        label: "軽量・おすすめ",
        description: "Claude Haiku 系の軽量モデル",
        tier: "recommended",
      },
    ],
    apiKeyHint: "Anthropic APIキーを入力してください。",
    apiKeyHelpUrl: "https://console.anthropic.com/settings/keys",
    promptOverride:
      "事実と推測を分け、参照データにない内容は明確に断ってください。",
  },
  {
    id: "google",
    displayName: "Gemini",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote:
      "APIキーは x-goog-api-key ヘッダーで送信します（URLクエリ禁止）。",
    // Confirmed candidate; override if Task 00 finds preview ID only
    defaultModel: "gemini-3.1-flash-lite",
    allowedModels: [
      {
        id: "gemini-3.1-flash-lite",
        label: "軽量・おすすめ",
        description: "Gemini Flash Lite（Stable候補）",
        tier: "recommended",
      },
      {
        id: "gemini-3.1-flash-lite-preview",
        label: "Preview",
        description: "Stableが使えない環境向けPreview ID",
        tier: "low_cost",
      },
    ],
    apiKeyHint: "Google AI Studio の APIキーを入力してください。",
    apiKeyHelpUrl: "https://aistudio.google.com/apikey",
    promptOverride:
      "回答の冒頭で結論を述べ、続いて根拠を短く示してください。",
  },
];

export function getProviderConfig(id: string): ProviderConfig | undefined {
  return providerConfigs.find((p) => p.id === id);
}

export function getEnabledProviders(): ProviderConfig[] {
  return providerConfigs.filter((p) => p.enabled && p.browserDirectAvailable);
}
