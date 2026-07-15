import { AiRequest, AiResult } from '../types/provider.js';
import '../types/access-mode.js';

declare function anthropicAdapter(request: AiRequest): Promise<AiResult>;
declare function anthropicConnectionTest(apiKey: string, model: string): Promise<AiResult>;

export { anthropicAdapter, anthropicConnectionTest };
