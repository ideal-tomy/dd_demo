import { AiRequest, AiResult } from '../types/provider.js';
import '../types/access-mode.js';

declare function geminiAdapter(request: AiRequest): Promise<AiResult>;
declare function geminiConnectionTest(apiKey: string, model: string): Promise<AiResult>;

export { geminiAdapter, geminiConnectionTest };
