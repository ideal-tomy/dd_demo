import { AiProvider } from '../types/access-mode.js';
import { StudioAccessMode } from '../types/trial.js';
import '../types/provider.js';

type StudioSettings = {
    accessMode: StudioAccessMode | string;
    provider: AiProvider;
    model: string;
    roleId: string;
    customInstruction: string;
    knowledge: string;
    setupComplete: boolean;
    connectionStatus: string;
};
declare const storageKeys: {
    apiKey: (provider: AiProvider) => string;
    trialCode: () => string;
    settings: () => string;
    chat: () => string;
    sessionCost: () => string;
};
/** API keys: sessionStorage only (not long-lived by default). */
declare function getApiKey(provider: AiProvider): string;
declare function setApiKey(provider: AiProvider, apiKey: string): void;
/** Trial code: sessionStorage only. */
declare function getTrialCode(): string;
declare function setTrialCode(code: string): void;
declare function getSettings(): StudioSettings;
declare function setSettings(partial: Partial<StudioSettings>): StudioSettings;
declare function getChatJson(): string | null;
declare function setChatJson(json: string): void;
declare function getSessionCostJson(): string | null;
declare function setSessionCostJson(json: string): void;
/** Clears only this app's storage keys for the active brand/demo. */
declare function clearAll(): void;
declare function clearChatAndCost(): void;

export { type StudioSettings, clearAll, clearChatAndCost, getApiKey, getChatJson, getSessionCostJson, getSettings, getTrialCode, setApiKey, setChatJson, setSessionCostJson, setSettings, setTrialCode, storageKeys };
