import { TrialPolicy } from '../types/trial.js';
import { AiProvider } from '../types/access-mode.js';
import '../types/provider.js';

/**
 * Phase 1.5 Managed Trial policy — Source of Truth for Gateway limits.
 * Phase 2: Managed Trial is OpenAI-only (BYOK may still use other providers).
 */

declare const trialPolicyConfig: TrialPolicy;
/** Trial always uses OpenAI regardless of env overrides for other providers. */
declare function getTrialDefaultProvider(): AiProvider;
declare function getTrialDefaultModel(): string;
declare const managedTrialDesignNotes: {
    phase: string;
    storeBodies: false;
    hardCapSourceOfTruth: string;
    providerBudgetIsNotHardCap: boolean;
    persistence: string;
    trialProviders: "openai-only";
};

export { getTrialDefaultModel, getTrialDefaultProvider, managedTrialDesignNotes, trialPolicyConfig };
