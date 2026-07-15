import {
  getRedis,
  trialKeys
} from "./chunk-CDUF3WGH.js";

// trial/rate-limiter.ts
function minuteBucket(d = /* @__PURE__ */ new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${day}${h}${min}`;
}
async function checkAndIncrementRateLimit(codeHash, limitPerMinute) {
  const redis = getRedis();
  const key = trialKeys.rpm(codeHash, minuteBucket());
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 120);
  }
  if (count > limitPerMinute) {
    return {
      ok: false,
      message: "\u77ED\u3044\u6642\u9593\u306B\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u96C6\u4E2D\u3057\u3066\u3044\u307E\u3059\u3002\u5C11\u3057\u5F85\u3063\u3066\u304B\u3089\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002"
    };
  }
  return { ok: true };
}

export {
  checkAndIncrementRateLimit
};
//# sourceMappingURL=chunk-YXYG6IKU.js.map