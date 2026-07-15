import { TrialRecord } from '../types/trial.js';
import '../types/access-mode.js';
import '../types/provider.js';

declare function getTrialRecord(codeHash: string): Promise<TrialRecord | null>;
declare function saveTrialRecord(record: TrialRecord): Promise<void>;
type TrialValidationResult = {
    ok: true;
    record: TrialRecord;
} | {
    ok: false;
    code: TrialRejectCode;
    message: string;
};
type TrialRejectCode = "NOT_FOUND" | "REVOKED" | "EXPIRED" | "REQUEST_LIMIT" | "HARD_CAP" | "RATE_LIMIT" | "CONCURRENCY" | "ALLOWLIST" | "KNOWLEDGE_LIMIT" | "INPUT_TOKEN_LIMIT" | "CONFIG" | "UNAUTHORIZED" | "FORBIDDEN";
declare function validateTrialState(record: TrialRecord | null): TrialValidationResult;
declare function toPublicStatus(record: TrialRecord): {
    remainingRequests: number;
    maxRequests: number;
    expiresAt: string;
    spentJpy: number;
    hardCapJpy: number;
    revoked: boolean;
    expired: boolean;
    label: string;
};

export { type TrialRejectCode, type TrialValidationResult, getTrialRecord, saveTrialRecord, toPublicStatus, validateTrialState };
