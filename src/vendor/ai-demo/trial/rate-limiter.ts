// CORE-CANDIDATE — server only
import { getRedis, trialKeys } from "./redis";

function minuteBucket(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}${m}${day}${h}${min}`;
}

export async function checkAndIncrementRateLimit(
  codeHash: string,
  limitPerMinute: number,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const redis = getRedis();
  const key = trialKeys.rpm(codeHash, minuteBucket());
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 120);
  }
  if (count > limitPerMinute) {
    return {
      ok: false,
      message:
        "短い時間にリクエストが集中しています。少し待ってから再度お試しください。",
    };
  }
  return { ok: true };
}
