// CORE-CANDIDATE — server only
import { saveTrialRecord } from "./trial-validator";
import type { TrialRecord } from "../types/trial";
import type { AiProvider } from "../types/access-mode";
import { pricingConfig } from "../config/pricing.config";

/**
 * Worst-case cost estimate for reservation (input + max output at list price).
 */
export function estimateMaxCostJpy(
  provider: AiProvider,
  model: string,
  estimatedInputTokens: number,
  maxOutputTokens: number,
): number {
  const entry = pricingConfig.providers.find((p) => p.providerId === provider);
  const pricing = entry?.models[model];
  if (!pricing) {
    // Conservative fallback when model unregistered
    return 50;
  }
  const input = (estimatedInputTokens / 1_000_000) * pricing.inputPer1M;
  const output = (maxOutputTokens / 1_000_000) * pricing.outputPer1M;
  let raw = input + output;
  if (pricing.currency === "USD") {
    raw *= pricing.usdToJpy ?? 150;
  }
  // Small buffer for rounding
  return Math.ceil(raw * 100) / 100 + 0.01;
}

export type ReserveResult =
  | { ok: true; reservedJpy: number; record: TrialRecord }
  | { ok: false; message: string };

export async function reserveSpend(
  record: TrialRecord,
  reserveJpy: number,
): Promise<ReserveResult> {
  const available =
    record.policy.hardCapJpy - record.spentJpy - record.reservedJpy;
  if (reserveJpy > available + 1e-9) {
    return {
      ok: false,
      message: "利用枠（金額上限）に達したため、これ以上ご利用いただけません。",
    };
  }
  const next: TrialRecord = {
    ...record,
    reservedJpy: record.reservedJpy + reserveJpy,
  };
  await saveTrialRecord(next);
  return { ok: true, reservedJpy: reserveJpy, record: next };
}

/** Settle actual cost: release reservation, add actual to spent. */
export async function settleSpend(
  record: TrialRecord,
  reservedJpy: number,
  actualJpy: number,
): Promise<TrialRecord> {
  const next: TrialRecord = {
    ...record,
    reservedJpy: Math.max(0, record.reservedJpy - reservedJpy),
    spentJpy: record.spentJpy + Math.max(0, actualJpy),
  };
  await saveTrialRecord(next);
  return next;
}

/** Release reservation without charging (pre-provider rejection). */
export async function releaseReservation(
  record: TrialRecord,
  reservedJpy: number,
): Promise<TrialRecord> {
  const next: TrialRecord = {
    ...record,
    reservedJpy: Math.max(0, record.reservedJpy - reservedJpy),
  };
  await saveTrialRecord(next);
  return next;
}
