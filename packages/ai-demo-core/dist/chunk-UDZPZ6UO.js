// config/pricing.config.ts
var pricingConfig = {
  providers: [
    {
      providerId: "openai",
      updatedAt: "2026-07-14",
      models: {
        "gpt-5.4-nano": {
          inputPer1M: 15,
          outputPer1M: 120,
          cachedInputPer1M: 1.5,
          currency: "JPY"
        },
        "gpt-5-nano": {
          inputPer1M: 8,
          outputPer1M: 60,
          cachedInputPer1M: 0.8,
          currency: "JPY"
        }
      }
    },
    {
      providerId: "anthropic",
      updatedAt: "2026-07-14",
      models: {
        "claude-haiku-4-5": {
          inputPer1M: 120,
          outputPer1M: 600,
          currency: "JPY"
        }
      }
    },
    {
      providerId: "google",
      updatedAt: "2026-07-14",
      models: {
        "gemini-3.1-flash-lite": {
          inputPer1M: 12,
          outputPer1M: 48,
          currency: "JPY"
        },
        "gemini-3.1-flash-lite-preview": {
          inputPer1M: 12,
          outputPer1M: 48,
          currency: "JPY"
        }
      }
    }
  ]
};

export {
  pricingConfig
};
//# sourceMappingURL=chunk-UDZPZ6UO.js.map