import {
  pricingConfig
} from "./chunk-UDZPZ6UO.js";

// demo-core/error-normalizer.ts
var MESSAGES = {
  AUTH_ERROR: {
    userMessage: "API\u30AD\u30FC\u304C\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    recommendedAction: "\u30AD\u30FC\u306E\u5165\u529B\u30DF\u30B9\u3084\u5931\u52B9\u304C\u306A\u3044\u304B\u78BA\u8A8D\u3057\u3001\u518D\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  PERMISSION_ERROR: {
    userMessage: "\u3053\u306E\u30AD\u30FC\u3067\u306F\u5229\u7528\u6A29\u9650\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u308B\u3088\u3046\u3067\u3059\u3002",
    recommendedAction: "Provider\u306E\u7BA1\u7406\u753B\u9762\u3067\u30E2\u30C7\u30EB\u5229\u7528\u6A29\u9650\u30FB\u8AB2\u91D1\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  MODEL_UNAVAILABLE: {
    userMessage: "\u9078\u629E\u3057\u305F\u30E2\u30C7\u30EB\u3092\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    recommendedAction: "\u5225\u306E\u30E2\u30C7\u30EB\u3092\u9078\u3076\u304B\u3001\u8A2D\u5B9A\u753B\u9762\u3067\u30E2\u30C7\u30EB\u3092\u5909\u66F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  RATE_LIMIT: {
    userMessage: "\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u6DF7\u307F\u5408\u3063\u3066\u3044\u308B\u305F\u3081\u3001\u4E00\u6642\u7684\u306B\u5236\u9650\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
    recommendedAction: "\u5C11\u3057\u5F85\u3063\u3066\u304B\u3089\u518D\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  QUOTA_EXCEEDED: {
    userMessage: "\u5229\u7528\u67A0\u307E\u305F\u306F\u6B8B\u9AD8\u306E\u4E0A\u9650\u306B\u9054\u3057\u305F\u53EF\u80FD\u6027\u304C\u3042\u308A\u307E\u3059\u3002",
    recommendedAction: "Provider\u5074\u306E\u5229\u7528\u72B6\u6CC1\u30FB\u8AB2\u91D1\u8A2D\u5B9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  CONTEXT_TOO_LARGE: {
    userMessage: "\u9001\u4FE1\u5185\u5BB9\u304C\u9577\u3059\u304E\u3066\u51E6\u7406\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
    recommendedAction: "\u30CA\u30EC\u30C3\u30B8\u3084\u4F1A\u8A71\u3092\u77ED\u304F\u3057\u3066\u3001\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002"
  },
  NETWORK_ERROR: {
    userMessage: "\u901A\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
    recommendedAction: "\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3001\u518D\u8A66\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  TIMEOUT: {
    userMessage: "\u5FDC\u7B54\u304C\u30BF\u30A4\u30E0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F\u3002",
    recommendedAction: "\u6642\u9593\u3092\u304A\u3044\u3066\u518D\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  },
  UNKNOWN: {
    userMessage: "\u4E00\u6642\u7684\u306A\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002",
    recommendedAction: "\u8A2D\u5B9A\u3092\u78BA\u8A8D\u306E\u3046\u3048\u3001\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002"
  }
};
function normalizeError(provider, error) {
  const providerLabel = provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Claude" : "Gemini";
  if (error instanceof TypeError || isNetworkLike(error)) {
    const base2 = MESSAGES.NETWORK_ERROR;
    return {
      code: "NETWORK_ERROR",
      provider,
      userMessage: `${providerLabel}\u3078\u306E${base2.userMessage}`,
      recommendedAction: base2.recommendedAction,
      technicalDetail: safeDetail(error)
    };
  }
  const status = extractStatus(error);
  const bodyText = extractBodyText(error).toLowerCase();
  const code = classify(status, bodyText);
  const base = MESSAGES[code];
  return {
    code,
    provider,
    userMessage: `${providerLabel}: ${base.userMessage}`,
    recommendedAction: base.recommendedAction,
    technicalDetail: safeDetail(error)
  };
}
function classify(status, body) {
  if (status === 401 || /invalid.?api.?key|authentication|unauthorized|api key not valid/.test(body)) {
    return "AUTH_ERROR";
  }
  if (status === 403 || /permission|forbidden|not allowed/.test(body)) {
    return "PERMISSION_ERROR";
  }
  if (status === 404 || /model.?not.?found|does not exist|not available|unknown model/.test(body)) {
    return "MODEL_UNAVAILABLE";
  }
  if (status === 429 || /rate.?limit|too many requests/.test(body)) {
    return "RATE_LIMIT";
  }
  if (/quota|insufficient.?quota|billing|credit/.test(body)) {
    return "QUOTA_EXCEEDED";
  }
  if (status === 413 || /context.?length|too.?large|maximum.?context|token.?limit/.test(body)) {
    return "CONTEXT_TOO_LARGE";
  }
  if (/timeout|timed out/.test(body)) {
    return "TIMEOUT";
  }
  return "UNKNOWN";
}
function extractStatus(error) {
  if (!error || typeof error !== "object") return null;
  const e = error;
  if (typeof e.status === "number") return e.status;
  if (typeof e.statusCode === "number") return e.statusCode;
  return null;
}
function extractBodyText(error) {
  if (!error || typeof error !== "object") return String(error ?? "");
  const e = error;
  if (typeof e.body === "string") return e.body;
  if (typeof e.message === "string") return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return "";
  }
}
function isNetworkLike(error) {
  if (!error || typeof error !== "object") return false;
  const msg = String(error.message ?? "").toLowerCase();
  return /failed to fetch|networkerror|load failed|cors/.test(msg);
}
function safeDetail(error) {
  let text = "";
  try {
    text = typeof error === "string" ? error : JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch {
    text = String(error);
  }
  return text.replace(/sk-[a-zA-Z0-9_-]{10,}/g, "[REDACTED]").replace(/AIza[a-zA-Z0-9_-]{10,}/g, "[REDACTED]").replace(/sk-ant-[a-zA-Z0-9_-]{10,}/g, "[REDACTED]").slice(0, 500);
}
function connectionStatusFromError(code) {
  switch (code) {
    case "AUTH_ERROR":
      return "auth_error";
    case "PERMISSION_ERROR":
      return "permission_error";
    case "MODEL_UNAVAILABLE":
      return "model_unavailable";
    case "NETWORK_ERROR":
      return "network_error";
    default:
      return "other_error";
  }
}

// demo-core/pricing.ts
function toJpy(amount, currency, usdToJpy = 150) {
  if (currency === "JPY") return amount;
  return amount * usdToJpy;
}
function calculateCost(provider, model, usage) {
  const entry = pricingConfig.providers.find((p) => p.providerId === provider);
  if (!entry) {
    return { jpy: null, pricingUpdatedAt: null, unregisteredModel: true };
  }
  const pricing = entry.models[model];
  if (!pricing) {
    return {
      jpy: null,
      pricingUpdatedAt: entry.updatedAt,
      unregisteredModel: true
    };
  }
  const input = usage.inputTokens ?? 0;
  const output = usage.outputTokens ?? 0;
  const cached = usage.cachedInputTokens ?? 0;
  const nonCachedInput = Math.max(0, input - cached);
  const cachedRate = pricing.cachedInputPer1M ?? pricing.inputPer1M;
  const raw = nonCachedInput / 1e6 * pricing.inputPer1M + cached / 1e6 * cachedRate + output / 1e6 * pricing.outputPer1M;
  return {
    jpy: toJpy(raw, pricing.currency, pricing.usdToJpy),
    pricingUpdatedAt: entry.updatedAt,
    unregisteredModel: false
  };
}
function formatJpy(value) {
  if (value == null || Number.isNaN(value)) return "\u2014";
  if (value < 0.01 && value > 0) return "\u7D04\xA50.01\u672A\u6E80";
  return `\u7D04\xA5${value.toFixed(value < 1 ? 2 : 1)}`;
}

export {
  normalizeError,
  connectionStatusFromError,
  calculateCost,
  formatJpy
};
//# sourceMappingURL=chunk-NC6D7SM7.js.map