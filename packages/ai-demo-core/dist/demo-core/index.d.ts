export { DemoCoreConfig, KnowledgePolicy, RolePreset, configureDemoCore, getDemoCoreConfig, isDemoCoreConfigured } from './demo-core-config.js';
import { AiResult, AiRequest, NormalizedMessage, NormalizedUsage } from '../types/provider.js';
import { NormalizedError, InternalErrorCode } from '../types/errors.js';
import { TrialPublicStatus, TrialAskResponse } from '../types/trial.js';
import { AiProvider } from '../types/access-mode.js';
export { StudioSettings, clearAll, clearChatAndCost, getApiKey, getChatJson, getSessionCostJson, getSettings, getTrialCode, setApiKey, setChatJson, setSessionCostJson, setSettings, setTrialCode, storageKeys } from './storage.js';
export { countCharacters, estimateTokens, evaluateKnowledge } from './knowledge.js';

declare class AiTransportError extends Error {
    normalized: NormalizedError;
    constructor(normalized: NormalizedError);
}
type SendAiRequestExtra = {
    trialCode?: string;
    knowledgeCharCount?: number;
    estimatedInputTokens?: number;
};
type SendAiResult = AiResult & {
    costJpyOverride?: number | null;
    trialStatus?: Pick<TrialPublicStatus, "remainingRequests" | "expiresAt" | "spentJpy" | "maxRequests" | "hardCapJpy">;
};
/**
 * UI must call this — never call Provider SDKs / fetch directly from components.
 */
declare function sendAiRequest(request: AiRequest, extra?: SendAiRequestExtra): Promise<SendAiResult>;
declare function testConnection(request: Pick<AiRequest, "provider" | "apiKey" | "model">): Promise<{
    ok: true;
    result: AiResult;
} | {
    ok: false;
    error: NormalizedError;
}>;
/** Trial mode: validate code via status API (no Provider charge). */
declare function testTrialConnection(trialCode: string, provider: AiRequest["provider"]): Promise<{
    ok: true;
    status: TrialPublicStatus;
} | {
    ok: false;
    error: NormalizedError;
}>;

declare function byokDirectTransport(request: AiRequest): Promise<AiResult>;

type ManagedTrialRequest = {
    trialCode: string;
    provider: AiProvider;
    model: string;
    systemPrompt: string;
    messages: NormalizedMessage[];
    knowledgeCharCount: number;
    estimatedInputTokens: number;
    responseFormat?: {
        type: "json_object";
    };
    temperature?: number;
};
declare function fetchTrialStatus(trialCode: string): Promise<TrialPublicStatus>;
declare function managedTrialTransport(request: ManagedTrialRequest): Promise<AiResult & {
    trialMeta: Omit<TrialAskResponse, "text" | "usage" | "provider" | "model">;
}>;

type BuildPromptInput = {
    provider: AiProvider;
    roleId: string;
    customInstruction: string;
    knowledge: string;
};
/**
 * Appendix B-2: Keep system+knowledge prefix byte-stable within a session.
 * No timestamps, random values, or per-turn mutable values in the prefix.
 */
declare function buildSystemPrompt(input: BuildPromptInput): string;
/**
 * Appendix B-1: Only send the last N messages to the API.
 * Knowledge stays in system prompt — do not duplicate into history.
 */
declare function selectHistoryForApi(messages: NormalizedMessage[], maxHistoryMessages?: number): NormalizedMessage[];

type CostResult = {
    jpy: number | null;
    pricingUpdatedAt: string | null;
    unregisteredModel: boolean;
};
declare function calculateCost(provider: AiProvider, model: string, usage: NormalizedUsage): CostResult;
declare function formatJpy(value: number | null | undefined): string;

declare function normalizeError(provider: AiProvider, error: unknown): NormalizedError;
declare function connectionStatusFromError(code: InternalErrorCode): "auth_error" | "permission_error" | "model_unavailable" | "network_error" | "other_error";

declare function normalizeUsage(provider: AiProvider, raw: unknown): NormalizedUsage;

type IngestTarget = "knowledge" | "prompt";
type ExtractResult = {
    text: string;
    fileName: string;
    mimeOrExt: string;
    characterCount: number;
    warning?: string;
};
declare class DocumentIngestError extends Error {
    constructor(message: string);
}
/** Soft cap to keep browser extraction responsive. */
declare const MAX_FILE_BYTES: number;
declare const SUPPORTED_EXTENSIONS: Record<IngestTarget, readonly string[]>;
declare function acceptAttribute(target: IngestTarget): string;
declare function formatHelpLabel(target: IngestTarget): string;
declare function extractDocumentText(file: File, target: IngestTarget): Promise<ExtractResult>;

export { AiTransportError, DocumentIngestError, type ExtractResult, type IngestTarget, MAX_FILE_BYTES, SUPPORTED_EXTENSIONS, type SendAiRequestExtra, type SendAiResult, acceptAttribute, buildSystemPrompt, byokDirectTransport, calculateCost, connectionStatusFromError, extractDocumentText, fetchTrialStatus, formatHelpLabel, formatJpy, managedTrialTransport, normalizeError, normalizeUsage, selectHistoryForApi, sendAiRequest, testConnection, testTrialConnection };
