export type ModelPricing = {
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M?: number;
  currency: "JPY" | "USD";
  /** Approximate JPY conversion rate when currency is USD */
  usdToJpy?: number;
};

export type ProviderPricingEntry = {
  providerId: import("./access-mode").AiProvider;
  updatedAt: string;
  models: Record<string, ModelPricing>;
};

export type PricingConfig = {
  providers: ProviderPricingEntry[];
};
