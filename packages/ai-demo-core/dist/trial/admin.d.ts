import { TrialRecord } from '../types/trial.js';
import '../types/access-mode.js';
import '../types/provider.js';

declare function assertAdminSecret(header: string | null): void;
declare function createTrial(input: {
    label?: string;
}): Promise<{
    plaintextCode: string;
    record: TrialRecord;
    shortId: string;
}>;
declare function revokeTrial(codeHashOrPlain: string): Promise<boolean>;
declare function listTrials(limit?: number): Promise<Array<{
    shortId: string;
    codeHash: string;
    label: string;
    createdAt: string;
    expiresAt: string;
    remainingRequests: number;
    maxRequests: number;
    spentJpy: number;
    revoked: boolean;
    expired: boolean;
}>>;

export { assertAdminSecret, createTrial, listTrials, revokeTrial };
