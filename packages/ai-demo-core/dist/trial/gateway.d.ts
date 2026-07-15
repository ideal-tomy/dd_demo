import { TrialRejectCode } from './trial-validator.js';
import { TrialAskRequestBody, TrialAskResponse, TrialPublicStatus } from '../types/trial.js';
import '../types/access-mode.js';
import '../types/provider.js';

declare class TrialGatewayError extends Error {
    code: TrialRejectCode;
    status: number;
    constructor(code: TrialRejectCode, message: string, status?: number);
}
declare function getTrialStatusForCode(codeHash: string): Promise<TrialPublicStatus>;
declare function executeTrialAsk(codeHash: string, body: TrialAskRequestBody): Promise<TrialAskResponse>;

export { TrialGatewayError, executeTrialAsk, getTrialStatusForCode };
