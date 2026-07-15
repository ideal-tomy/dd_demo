declare function acquireConcurrencyLock(codeHash: string): Promise<{
    ok: true;
} | {
    ok: false;
    message: string;
}>;
declare function releaseConcurrencyLock(codeHash: string): Promise<void>;

export { acquireConcurrencyLock, releaseConcurrencyLock };
