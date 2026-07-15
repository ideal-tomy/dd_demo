import { TrialLedgerEntry } from '../types/trial.js';
import '../types/access-mode.js';
import '../types/provider.js';

/** Append metadata-only ledger entry. Never store bodies. */
declare function appendLedger(codeHash: string, entry: TrialLedgerEntry): Promise<void>;
declare function listLedger(codeHash: string, limit?: number): Promise<TrialLedgerEntry[]>;

export { appendLedger, listLedger };
