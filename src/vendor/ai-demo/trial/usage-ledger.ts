// CORE-CANDIDATE — server only
import { getRedis, trialKeys } from "./redis";
import type { TrialLedgerEntry } from "../types/trial";

const MAX_LEDGER_ENTRIES = 100;

/** Append metadata-only ledger entry. Never store bodies. */
export async function appendLedger(
  codeHash: string,
  entry: TrialLedgerEntry,
): Promise<void> {
  const redis = getRedis();
  const key = trialKeys.ledger(codeHash);
  await redis.lpush(key, entry);
  await redis.ltrim(key, 0, MAX_LEDGER_ENTRIES - 1);
}

export async function listLedger(
  codeHash: string,
  limit = 20,
): Promise<TrialLedgerEntry[]> {
  const redis = getRedis();
  const rows = await redis.lrange<TrialLedgerEntry>(
    trialKeys.ledger(codeHash),
    0,
    limit - 1,
  );
  return rows ?? [];
}
