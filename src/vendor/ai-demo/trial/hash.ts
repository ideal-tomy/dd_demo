// CORE-CANDIDATE — server only
import { createHash, randomBytes } from "crypto";

const CODE_BYTES = 18; // 24 chars base64url-ish

/** Generate high-entropy trial code (shown once at issuance). */
export function generateTrialCode(): string {
  return randomBytes(CODE_BYTES)
    .toString("base64url")
    .replace(/=+$/, "");
}

export function hashTrialCode(code: string): string {
  return createHash("sha256").update(code.trim(), "utf8").digest("hex");
}

export function shortHash(hash: string): string {
  return hash.slice(0, 10);
}
