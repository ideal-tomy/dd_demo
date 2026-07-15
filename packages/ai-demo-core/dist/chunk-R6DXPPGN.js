import {
  getRedis,
  trialKeys
} from "./chunk-CDUF3WGH.js";

// trial/usage-ledger.ts
var MAX_LEDGER_ENTRIES = 100;
async function appendLedger(codeHash, entry) {
  const redis = getRedis();
  const key = trialKeys.ledger(codeHash);
  await redis.lpush(key, entry);
  await redis.ltrim(key, 0, MAX_LEDGER_ENTRIES - 1);
}
async function listLedger(codeHash, limit = 20) {
  const redis = getRedis();
  const rows = await redis.lrange(
    trialKeys.ledger(codeHash),
    0,
    limit - 1
  );
  return rows ?? [];
}

export {
  appendLedger,
  listLedger
};
//# sourceMappingURL=chunk-R6DXPPGN.js.map