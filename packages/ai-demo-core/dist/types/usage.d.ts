import { AiProvider } from './access-mode.js';

type ModelPricing = {
    inputPer1M: number;
    outputPer1M: number;
    cachedInputPer1M?: number;
    currency: "JPY" | "USD";
    /** Approximate JPY conversion rate when currency is USD */
    usdToJpy?: number;
};
type ProviderPricingEntry = {
    providerId: AiProvider;
    updatedAt: string;
    models: Record<string, ModelPricing>;
};
type PricingConfig = {
    providers: ProviderPricingEntry[];
};

export type { ModelPricing, PricingConfig, ProviderPricingEntry };
