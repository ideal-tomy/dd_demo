/**
 * CORE-CANDIDATE — reuse entry for product_flow Phase 3+.
 */
export {
  sendAiRequest,
  testConnection,
  testTrialConnection,
  AiTransportError,
} from "./ai-transport";
export type { SendAiRequestExtra, SendAiResult } from "./ai-transport";

export { byokDirectTransport } from "./access-mode-transport";
export {
  fetchTrialStatus,
  managedTrialTransport,
} from "./managed-trial-transport";

export {
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  clearAll,
  clearChatAndCost,
} from "./storage";
export type { StudioSettings } from "./storage";

export { calculateCost, formatJpy } from "./pricing";
export {
  countCharacters,
  estimateTokens,
  evaluateKnowledge,
} from "./knowledge";
export { normalizeError, connectionStatusFromError } from "./error-normalizer";
export { normalizeUsage } from "./usage-normalizer";

export {
  extractDocumentText,
  acceptAttribute,
  formatHelpLabel,
  DocumentIngestError,
  MAX_FILE_BYTES,
  SUPPORTED_EXTENSIONS,
} from "./document-text-ingest";
export type { IngestTarget, ExtractResult } from "./document-text-ingest";
