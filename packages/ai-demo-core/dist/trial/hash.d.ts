/** Generate high-entropy trial code (shown once at issuance). */
declare function generateTrialCode(): string;
declare function hashTrialCode(code: string): string;
declare function shortHash(hash: string): string;

export { generateTrialCode, hashTrialCode, shortHash };
