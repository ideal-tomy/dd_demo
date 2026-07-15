// CORE-CANDIDATE — server only
import { getRedis, trialKeys } from "./redis";
import type { TrialRecord } from "../types/trial";

export async function getTrialRecord(
  codeHash: string,
): Promise<TrialRecord | null> {
  const redis = getRedis();
  const raw = await redis.get<TrialRecord | string>(trialKeys.code(codeHash));
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as TrialRecord;
    } catch {
      return null;
    }
  }
  return raw;
}

export async function saveTrialRecord(record: TrialRecord): Promise<void> {
  const redis = getRedis();
  await redis.set(trialKeys.code(record.codeHash), record);
}

export type TrialValidationResult =
  | { ok: true; record: TrialRecord }
  | { ok: false; code: TrialRejectCode; message: string };

export type TrialRejectCode =
  | "NOT_FOUND"
  | "REVOKED"
  | "EXPIRED"
  | "REQUEST_LIMIT"
  | "HARD_CAP"
  | "RATE_LIMIT"
  | "CONCURRENCY"
  | "ALLOWLIST"
  | "KNOWLEDGE_LIMIT"
  | "INPUT_TOKEN_LIMIT"
  | "CONFIG"
  | "UNAUTHORIZED";

export function validateTrialState(
  record: TrialRecord | null,
): TrialValidationResult {
  if (!record) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "体験コードが無効です。",
    };
  }
  if (record.revokedAt) {
    return {
      ok: false,
      code: "REVOKED",
      message: "この体験コードは失効しています。",
    };
  }
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return {
      ok: false,
      code: "EXPIRED",
      message: "体験期間が終了しています。",
    };
  }
  return { ok: true, record };
}

export function toPublicStatus(record: TrialRecord): {
  remainingRequests: number;
  maxRequests: number;
  expiresAt: string;
  spentJpy: number;
  hardCapJpy: number;
  revoked: boolean;
  expired: boolean;
  label: string;
} {
  const expired = new Date(record.expiresAt).getTime() <= Date.now();
  const revoked = Boolean(record.revokedAt);
  return {
    remainingRequests: Math.max(
      0,
      record.policy.maxRequests - record.requestCount,
    ),
    maxRequests: record.policy.maxRequests,
    expiresAt: record.expiresAt,
    spentJpy: record.spentJpy,
    hardCapJpy: record.policy.hardCapJpy,
    revoked,
    expired,
    label: record.label,
  };
}
