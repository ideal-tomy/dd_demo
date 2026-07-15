// trial/redis.ts
import { Redis } from "@upstash/redis";
var cached = null;
function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
function getRedis() {
  if (!isRedisConfigured()) {
    throw new TrialConfigError(
      "Upstash Redis \u304C\u672A\u8A2D\u5B9A\u3067\u3059\u3002UPSTASH_REDIS_REST_URL \u3068 UPSTASH_REDIS_REST_TOKEN \u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    );
  }
  if (!cached) {
    cached = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
  }
  return cached;
}
var TrialConfigError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "TrialConfigError";
  }
};
var trialKeys = {
  code: (hash) => `trial:code:${hash}`,
  ledger: (hash) => `trial:ledger:${hash}`,
  rpm: (hash, minuteKey) => `trial:rpm:${hash}:${minuteKey}`,
  lock: (hash) => `trial:lock:${hash}`,
  index: () => `trial:index`,
  /** Public /trial issue rate limit (per IP, per hour) */
  issueHour: (ipHash, hourKey) => `trial:issue:${ipHash}:${hourKey}`
};

export {
  isRedisConfigured,
  getRedis,
  TrialConfigError,
  trialKeys
};
//# sourceMappingURL=chunk-CDUF3WGH.js.map