import { TrialRecord } from '../types/trial.js';
import { AiProvider } from '../types/access-mode.js';
import '../types/provider.js';

/**
 * Worst-case cost estimate for reservation (input + max output at list price).
 */
declare function estimateMaxCostJpy(provider: AiProvider, model: string, estimatedInputTokens: number, maxOutputTokens: number): number;
type ReserveResult = {
    ok: true;
    reservedJpy: number;
    record: TrialRecord;
} | {
    ok: false;
    message: string;
};
declare function reserveSpend(record: TrialRecord, reserveJpy: number): Promise<ReserveResult>;
/** Settle actual cost: release reservation, add actual to spent. */
declare function settleSpend(record: TrialRecord, reservedJpy: number, actualJpy: number): Promise<TrialRecord>;
/** Release reservation without charging (pre-provider rejection). */
declare function releaseReservation(record: TrialRecord, reservedJpy: number): Promise<TrialRecord>;

export { type ReserveResult, estimateMaxCostJpy, releaseReservation, reserveSpend, settleSpend };
