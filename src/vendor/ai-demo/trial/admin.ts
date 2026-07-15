// CORE-CANDIDATE — server only
import { trialPolicyConfig } from "../config/trial-policy.config";
import { generateTrialCode, hashTrialCode, shortHash } from "./hash";
import { getRedis, trialKeys, TrialConfigError } from "./redis";
import {
  getTrialRecord,
  saveTrialRecord,
  toPublicStatus,
} from "./trial-validator";
import type { TrialRecord } from "../types/trial";

export function assertAdminSecret(header: string | null): void {
  const expected = process.env.TRIAL_ADMIN_SECRET;
  if (!expected?.trim()) {
    throw new TrialConfigError(
      "TRIAL_ADMIN_SECRET が未設定です。運営者シークレットを環境変数に設定してください。",
    );
  }
  if (!header || header !== expected) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
}

export async function createTrial(input: {
  label?: string;
}): Promise<{ plaintextCode: string; record: TrialRecord; shortId: string }> {
  const plaintextCode = generateTrialCode();
  const codeHash = hashTrialCode(plaintextCode);
  const now = new Date();
  const expires = new Date(
    now.getTime() + trialPolicyConfig.validityDays * 24 * 60 * 60 * 1000,
  );

  const record: TrialRecord = {
    codeHash,
    label: input.label?.trim() || "Trial",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    requestCount: 0,
    spentJpy: 0,
    reservedJpy: 0,
    policy: { ...trialPolicyConfig },
  };

  await saveTrialRecord(record);
  const redis = getRedis();
  await redis.zadd(trialKeys.index(), {
    score: now.getTime(),
    member: codeHash,
  });

  return {
    plaintextCode,
    record,
    shortId: shortHash(codeHash),
  };
}

export async function revokeTrial(codeHashOrPlain: string): Promise<boolean> {
  // Accept hash or plaintext code
  let hash = codeHashOrPlain.trim();
  if (hash.length < 60) {
    // likely plaintext
    hash = hashTrialCode(codeHashOrPlain);
  }
  const record = await getTrialRecord(hash);
  if (!record) return false;
  if (record.revokedAt) return true;
  record.revokedAt = new Date().toISOString();
  await saveTrialRecord(record);
  return true;
}

export async function listTrials(limit = 50): Promise<
  Array<{
    shortId: string;
    codeHash: string;
    label: string;
    createdAt: string;
    expiresAt: string;
    remainingRequests: number;
    maxRequests: number;
    spentJpy: number;
    revoked: boolean;
    expired: boolean;
  }>
> {
  const redis = getRedis();
  const hashes = await redis.zrange<string[]>(trialKeys.index(), 0, limit - 1, {
    rev: true,
  });
  const list = Array.isArray(hashes) ? hashes : [];
  const out = [];
  for (const codeHash of list) {
    const record = await getTrialRecord(String(codeHash));
    if (!record) continue;
    const pub = toPublicStatus(record);
    out.push({
      shortId: shortHash(record.codeHash),
      codeHash: record.codeHash,
      label: pub.label,
      createdAt: record.createdAt,
      expiresAt: pub.expiresAt,
      remainingRequests: pub.remainingRequests,
      maxRequests: pub.maxRequests,
      spentJpy: pub.spentJpy,
      revoked: pub.revoked,
      expired: pub.expired,
    });
  }
  return out;
}
