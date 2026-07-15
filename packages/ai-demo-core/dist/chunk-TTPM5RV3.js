import {
  saveTrialRecord
} from "./chunk-3ZYPPO5O.js";
import {
  pricingConfig
} from "./chunk-UDZPZ6UO.js";

// trial/spend-reservation.ts
function estimateMaxCostJpy(provider, model, estimatedInputTokens, maxOutputTokens) {
  const entry = pricingConfig.providers.find((p) => p.providerId === provider);
  const pricing = entry?.models[model];
  if (!pricing) {
    return 50;
  }
  const input = estimatedInputTokens / 1e6 * pricing.inputPer1M;
  const output = maxOutputTokens / 1e6 * pricing.outputPer1M;
  let raw = input + output;
  if (pricing.currency === "USD") {
    raw *= pricing.usdToJpy ?? 150;
  }
  return Math.ceil(raw * 100) / 100 + 0.01;
}
async function reserveSpend(record, reserveJpy) {
  const available = record.policy.hardCapJpy - record.spentJpy - record.reservedJpy;
  if (reserveJpy > available + 1e-9) {
    return {
      ok: false,
      message: "\u5229\u7528\u67A0\uFF08\u91D1\u984D\u4E0A\u9650\uFF09\u306B\u9054\u3057\u305F\u305F\u3081\u3001\u3053\u308C\u4EE5\u4E0A\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u305B\u3093\u3002"
    };
  }
  const next = {
    ...record,
    reservedJpy: record.reservedJpy + reserveJpy
  };
  await saveTrialRecord(next);
  return { ok: true, reservedJpy: reserveJpy, record: next };
}
async function settleSpend(record, reservedJpy, actualJpy) {
  const next = {
    ...record,
    reservedJpy: Math.max(0, record.reservedJpy - reservedJpy),
    spentJpy: record.spentJpy + Math.max(0, actualJpy)
  };
  await saveTrialRecord(next);
  return next;
}
async function releaseReservation(record, reservedJpy) {
  const next = {
    ...record,
    reservedJpy: Math.max(0, record.reservedJpy - reservedJpy)
  };
  await saveTrialRecord(next);
  return next;
}

export {
  estimateMaxCostJpy,
  reserveSpend,
  settleSpend,
  releaseReservation
};
//# sourceMappingURL=chunk-TTPM5RV3.js.map