import {
  getRedis,
  trialKeys
} from "./chunk-CDUF3WGH.js";

// trial/concurrency-lock.ts
var LOCK_TTL_SEC = 90;
async function acquireConcurrencyLock(codeHash) {
  const redis = getRedis();
  const key = trialKeys.lock(codeHash);
  const result = await redis.set(key, "1", { nx: true, ex: LOCK_TTL_SEC });
  if (result !== "OK") {
    return {
      ok: false,
      message: "\u5225\u306E\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u51E6\u7406\u4E2D\u3067\u3059\u3002\u5B8C\u4E86\u3057\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002"
    };
  }
  return { ok: true };
}
async function releaseConcurrencyLock(codeHash) {
  const redis = getRedis();
  await redis.del(trialKeys.lock(codeHash));
}

export {
  acquireConcurrencyLock,
  releaseConcurrencyLock
};
//# sourceMappingURL=chunk-XZI6ZOZX.js.map