// CORE-CANDIDATE — server only
import { getRedis, trialKeys } from "./redis";

const LOCK_TTL_SEC = 90;

export async function acquireConcurrencyLock(
  codeHash: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const redis = getRedis();
  const key = trialKeys.lock(codeHash);
  // SET NX EX
  const result = await redis.set(key, "1", { nx: true, ex: LOCK_TTL_SEC });
  if (result !== "OK") {
    return {
      ok: false,
      message:
        "別のリクエストを処理中です。完了してから再度お試しください。",
    };
  }
  return { ok: true };
}

export async function releaseConcurrencyLock(codeHash: string): Promise<void> {
  const redis = getRedis();
  await redis.del(trialKeys.lock(codeHash));
}
