import {
  getTrialRecord,
  saveTrialRecord,
  toPublicStatus
} from "./chunk-3ZYPPO5O.js";
import {
  TrialConfigError,
  getRedis,
  trialKeys
} from "./chunk-CDUF3WGH.js";
import {
  generateTrialCode,
  hashTrialCode,
  shortHash
} from "./chunk-N4UV5OCM.js";
import {
  trialPolicyConfig
} from "./chunk-OSAU4LDY.js";

// trial/admin.ts
function assertAdminSecret(header) {
  const expected = process.env.TRIAL_ADMIN_SECRET;
  if (!expected?.trim()) {
    throw new TrialConfigError(
      "TRIAL_ADMIN_SECRET \u304C\u672A\u8A2D\u5B9A\u3067\u3059\u3002\u904B\u55B6\u8005\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8\u3092\u74B0\u5883\u5909\u6570\u306B\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    );
  }
  if (!header || header !== expected) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}
async function createTrial(input) {
  const plaintextCode = generateTrialCode();
  const codeHash = hashTrialCode(plaintextCode);
  const now = /* @__PURE__ */ new Date();
  const expires = new Date(
    now.getTime() + trialPolicyConfig.validityDays * 24 * 60 * 60 * 1e3
  );
  const record = {
    codeHash,
    label: input.label?.trim() || "Trial",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    requestCount: 0,
    spentJpy: 0,
    reservedJpy: 0,
    policy: { ...trialPolicyConfig }
  };
  await saveTrialRecord(record);
  const redis = getRedis();
  await redis.zadd(trialKeys.index(), {
    score: now.getTime(),
    member: codeHash
  });
  return {
    plaintextCode,
    record,
    shortId: shortHash(codeHash)
  };
}
async function revokeTrial(codeHashOrPlain) {
  let hash = codeHashOrPlain.trim();
  if (hash.length < 60) {
    hash = hashTrialCode(codeHashOrPlain);
  }
  const record = await getTrialRecord(hash);
  if (!record) return false;
  if (record.revokedAt) return true;
  record.revokedAt = (/* @__PURE__ */ new Date()).toISOString();
  await saveTrialRecord(record);
  return true;
}
async function listTrials(limit = 50) {
  const redis = getRedis();
  const hashes = await redis.zrange(trialKeys.index(), 0, limit - 1, {
    rev: true
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
      expired: pub.expired
    });
  }
  return out;
}

export {
  assertAdminSecret,
  createTrial,
  revokeTrial,
  listTrials
};
//# sourceMappingURL=chunk-AQV4HXPG.js.map