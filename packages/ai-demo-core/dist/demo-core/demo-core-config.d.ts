import { AiProvider } from '../types/access-mode.js';

type KnowledgePolicy = {
    recommendedMax: number;
    warningFrom: number;
    hardLimit: number;
};
type RolePreset = {
    id: string;
    label: string;
    description: string;
    prompt: string;
};
type DemoCoreConfig = {
    storageNamespace: string;
    demoId: string;
    defaultRoleId: string;
    defaultAccessMode?: string;
    defaultModel?: string;
    defaultProvider?: AiProvider;
    knowledgePolicy: KnowledgePolicy;
    chat?: {
        maxHistoryMessages: number;
    };
    baseSystemPrompt?: string;
    demoSpecificPrompt?: string;
    rolePresets?: RolePreset[];
};
declare function configureDemoCore(config: DemoCoreConfig): void;
declare function getDemoCoreConfig(): DemoCoreConfig;
declare function isDemoCoreConfigured(): boolean;

export { type DemoCoreConfig, type KnowledgePolicy, type RolePreset, configureDemoCore, getDemoCoreConfig, isDemoCoreConfigured };
