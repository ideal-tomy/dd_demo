import { AiProvider } from '../types/access-mode.js';
import { NormalizedMessage, AiResult } from '../types/provider.js';

declare function getServerApiKey(provider: AiProvider): string;
declare function runServerProviderRequest(input: {
    provider: AiProvider;
    model: string;
    systemPrompt: string;
    messages: NormalizedMessage[];
    maxOutputTokens: number;
    responseFormat?: {
        type: "json_object";
    };
    temperature?: number;
}): Promise<AiResult>;

export { getServerApiKey, runServerProviderRequest };
