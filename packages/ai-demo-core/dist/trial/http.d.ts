declare function extractBearer(req: {
    headers: {
        get(name: string): string | null;
    };
}): string | null;
declare function codeHashFromBearer(req: {
    headers: {
        get(name: string): string | null;
    };
}): string;
type TrialErrorJson = {
    status: number;
    body: {
        error: {
            code: string;
            message: string;
        };
    };
};
declare function trialErrorPayload(error: unknown): TrialErrorJson;

export { type TrialErrorJson, codeHashFromBearer, extractBearer, trialErrorPayload };
