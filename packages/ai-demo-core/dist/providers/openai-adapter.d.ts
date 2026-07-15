import { AiRequest, AiResult } from '../types/provider.js';
import '../types/access-mode.js';

declare function openaiAdapter(request: AiRequest): Promise<AiResult>;
/** Minimal completion for connection test (Appendix B-3). */
declare function openaiConnectionTest(apiKey: string, model: string): Promise<AiResult>;

export { openaiAdapter, openaiConnectionTest };
