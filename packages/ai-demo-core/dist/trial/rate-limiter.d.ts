declare function checkAndIncrementRateLimit(codeHash: string, limitPerMinute: number): Promise<{
    ok: true;
} | {
    ok: false;
    message: string;
}>;

export { checkAndIncrementRateLimit };
