// CORE-CANDIDATE
import { pricingConfig } from "../config/pricing.config";
import type { AiProvider } from "../types/access-mode";
import type { NormalizedUsage } from "../types/provider";

export type CostResult = {
  jpy: number | null;
  pricingUpdatedAt: string | null;
  unregisteredModel: boolean;
};

function toJpy(amount: number, currency: "JPY" | "USD", usdToJpy = 150): number {
  if (currency === "JPY") return amount;
  return amount * usdToJpy;
}

export function calculateCost(
  provider: AiProvider,
  model: string,
  usage: NormalizedUsage,
): CostResult {
  const entry = pricingConfig.providers.find((p) => p.providerId === provider);
  if (!entry) {
    return { jpy: null, pricingUpdatedAt: null, unregisteredModel: true };
  }

  const pricing = entry.models[model];
  if (!pricing) {
    return {
      jpy: null,
      pricingUpdatedAt: entry.updatedAt,
      unregisteredModel: true,
    };
  }

  const input = usage.inputTokens ?? 0;
  const output = usage.outputTokens ?? 0;
  const cached = usage.cachedInputTokens ?? 0;
  const nonCachedInput = Math.max(0, input - cached);

  const cachedRate =
    pricing.cachedInputPer1M ?? pricing.inputPer1M;

  const raw =
    (nonCachedInput / 1_000_000) * pricing.inputPer1M +
    (cached / 1_000_000) * cachedRate +
    (output / 1_000_000) * pricing.outputPer1M;

  return {
    jpy: toJpy(raw, pricing.currency, pricing.usdToJpy),
    pricingUpdatedAt: entry.updatedAt,
    unregisteredModel: false,
  };
}

export function formatJpy(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value < 0.01 && value > 0) return "約¥0.01未満";
  return `約¥${value.toFixed(value < 1 ? 2 : 1)}`;
}
