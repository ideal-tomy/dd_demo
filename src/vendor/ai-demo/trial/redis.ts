// CORE-CANDIDATE — server only
import { Redis } from "@upstash/redis";

let cached: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function getRedis(): Redis {
  if (!isRedisConfigured()) {
    throw new TrialConfigError(
      "Upstash Redis が未設定です。UPSTASH_REDIS_REST_URL と UPSTASH_REDIS_REST_TOKEN を設定してください。",
    );
  }
  if (!cached) {
    cached = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return cached;
}

export class TrialConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrialConfigError";
  }
}

export const trialKeys = {
  code: (hash: string) => `trial:code:${hash}`,
  ledger: (hash: string) => `trial:ledger:${hash}`,
  rpm: (hash: string, minuteKey: string) => `trial:rpm:${hash}:${minuteKey}`,
  lock: (hash: string) => `trial:lock:${hash}`,
  index: () => `trial:index`,
};
