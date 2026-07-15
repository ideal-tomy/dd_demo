import { Redis } from '@upstash/redis';

declare function isRedisConfigured(): boolean;
declare function getRedis(): Redis;
declare class TrialConfigError extends Error {
    constructor(message: string);
}
declare const trialKeys: {
    code: (hash: string) => string;
    ledger: (hash: string) => string;
    rpm: (hash: string, minuteKey: string) => string;
    lock: (hash: string) => string;
    index: () => string;
    /** Public /trial issue rate limit (per IP, per hour) */
    issueHour: (ipHash: string, hourKey: string) => string;
};

export { TrialConfigError, getRedis, isRedisConfigured, trialKeys };
