// config/provider.config.ts
var providerConfigs = [
  {
    id: "openai",
    displayName: "OpenAI",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote: "\u30D6\u30E9\u30A6\u30B6\u76F4\u63A5\u901A\u4FE1\u306F\u53EF\u80FD\u3067\u3059\u304C\u3001\u516C\u5F0F\u306B\u306F\u975E\u63A8\u5968\u3067\u3059\u3002\u30C7\u30E2\u5C02\u7528\u30AD\u30FC\u3092\u63A8\u5968\u3057\u307E\u3059\u3002",
    defaultModel: "gpt-5.4-nano",
    allowedModels: [
      {
        id: "gpt-5.4-nano",
        label: "\u8EFD\u91CF\u30FB\u304A\u3059\u3059\u3081",
        description: "\u30D0\u30E9\u30F3\u30B9\u91CD\u8996\u306E\u8EFD\u91CF\u30E2\u30C7\u30EB",
        tier: "recommended"
      },
      {
        id: "gpt-5-nano",
        label: "\u4F4E\u30B3\u30B9\u30C8",
        description: "\u6700\u4F4E\u30B3\u30B9\u30C8\u5019\u88DC",
        tier: "low_cost"
      }
    ],
    apiKeyHint: "OpenAI API\u30AD\u30FC\uFF08sk- \u3067\u59CB\u307E\u308B\u30AD\u30FC\uFF09\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    apiKeyHelpUrl: "https://platform.openai.com/api-keys",
    promptOverride: "\u56DE\u7B54\u306F\u6BB5\u843D\u3092\u5206\u3051\u3001\u5FC5\u8981\u306A\u3089\u7B87\u6761\u66F8\u304D\u3067\u6574\u7406\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  {
    id: "anthropic",
    displayName: "Claude",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote: "\u30D6\u30E9\u30A6\u30B6\u76F4\u63A5\u306B\u306F anthropic-dangerous-direct-browser-access \u30D8\u30C3\u30C0\u30FC\u304C\u5FC5\u8981\u3067\u3059\u3002",
    defaultModel: "claude-haiku-4-5",
    allowedModels: [
      {
        id: "claude-haiku-4-5",
        label: "\u8EFD\u91CF\u30FB\u304A\u3059\u3059\u3081",
        description: "Claude Haiku \u7CFB\u306E\u8EFD\u91CF\u30E2\u30C7\u30EB",
        tier: "recommended"
      }
    ],
    apiKeyHint: "Anthropic API\u30AD\u30FC\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    apiKeyHelpUrl: "https://console.anthropic.com/settings/keys",
    promptOverride: "\u4E8B\u5B9F\u3068\u63A8\u6E2C\u3092\u5206\u3051\u3001\u53C2\u7167\u30C7\u30FC\u30BF\u306B\u306A\u3044\u5185\u5BB9\u306F\u660E\u78BA\u306B\u65AD\u3063\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  {
    id: "google",
    displayName: "Gemini",
    enabled: true,
    browserDirectAvailable: true,
    browserDirectNote: "API\u30AD\u30FC\u306F x-goog-api-key \u30D8\u30C3\u30C0\u30FC\u3067\u9001\u4FE1\u3057\u307E\u3059\uFF08URL\u30AF\u30A8\u30EA\u7981\u6B62\uFF09\u3002",
    // Confirmed candidate; override if Task 00 finds preview ID only
    defaultModel: "gemini-3.1-flash-lite",
    allowedModels: [
      {
        id: "gemini-3.1-flash-lite",
        label: "\u8EFD\u91CF\u30FB\u304A\u3059\u3059\u3081",
        description: "Gemini Flash Lite\uFF08Stable\u5019\u88DC\uFF09",
        tier: "recommended"
      },
      {
        id: "gemini-3.1-flash-lite-preview",
        label: "Preview",
        description: "Stable\u304C\u4F7F\u3048\u306A\u3044\u74B0\u5883\u5411\u3051Preview ID",
        tier: "low_cost"
      }
    ],
    apiKeyHint: "Google AI Studio \u306E API\u30AD\u30FC\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    apiKeyHelpUrl: "https://aistudio.google.com/apikey",
    promptOverride: "\u56DE\u7B54\u306E\u5192\u982D\u3067\u7D50\u8AD6\u3092\u8FF0\u3079\u3001\u7D9A\u3044\u3066\u6839\u62E0\u3092\u77ED\u304F\u793A\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  }
];
function getProviderConfig(id) {
  return providerConfigs.find((p) => p.id === id);
}
function getEnabledProviders() {
  return providerConfigs.filter((p) => p.enabled && p.browserDirectAvailable);
}

export {
  providerConfigs,
  getProviderConfig,
  getEnabledProviders
};
//# sourceMappingURL=chunk-3VEQGIIN.js.map