// trial/hash.ts
import { createHash, randomBytes } from "crypto";
var CODE_BYTES = 18;
function generateTrialCode() {
  return randomBytes(CODE_BYTES).toString("base64url").replace(/=+$/, "");
}
function hashTrialCode(code) {
  return createHash("sha256").update(code.trim(), "utf8").digest("hex");
}
function shortHash(hash) {
  return hash.slice(0, 10);
}

export {
  generateTrialCode,
  hashTrialCode,
  shortHash
};
//# sourceMappingURL=chunk-N4UV5OCM.js.map