import {
  getRedis,
  trialKeys
} from "./chunk-CDUF3WGH.js";

// trial/trial-validator.ts
async function getTrialRecord(codeHash) {
  const redis = getRedis();
  const raw = await redis.get(trialKeys.code(codeHash));
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}
async function saveTrialRecord(record) {
  const redis = getRedis();
  await redis.set(trialKeys.code(record.codeHash), record);
}
function validateTrialState(record) {
  if (!record) {
    return {
      ok: false,
      code: "NOT_FOUND",
      message: "\u4F53\u9A13\u30B3\u30FC\u30C9\u304C\u7121\u52B9\u3067\u3059\u3002"
    };
  }
  if (record.revokedAt) {
    return {
      ok: false,
      code: "REVOKED",
      message: "\u3053\u306E\u4F53\u9A13\u30B3\u30FC\u30C9\u306F\u5931\u52B9\u3057\u3066\u3044\u307E\u3059\u3002"
    };
  }
  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return {
      ok: false,
      code: "EXPIRED",
      message: "\u4F53\u9A13\u671F\u9593\u304C\u7D42\u4E86\u3057\u3066\u3044\u307E\u3059\u3002"
    };
  }
  return { ok: true, record };
}
function toPublicStatus(record) {
  const expired = new Date(record.expiresAt).getTime() <= Date.now();
  const revoked = Boolean(record.revokedAt);
  return {
    remainingRequests: Math.max(
      0,
      record.policy.maxRequests - record.requestCount
    ),
    maxRequests: record.policy.maxRequests,
    expiresAt: record.expiresAt,
    spentJpy: record.spentJpy,
    hardCapJpy: record.policy.hardCapJpy,
    revoked,
    expired,
    label: record.label
  };
}

export {
  getTrialRecord,
  saveTrialRecord,
  validateTrialState,
  toPublicStatus
};
//# sourceMappingURL=chunk-3ZYPPO5O.js.map