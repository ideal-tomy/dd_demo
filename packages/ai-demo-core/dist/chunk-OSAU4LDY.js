// config/trial-policy.config.ts
var trialPolicyConfig = {
  validityDays: 7,
  maxRequests: 10,
  publicBudgetLabelJpy: 500,
  hardCapJpy: 500,
  knowledgeCharLimit: 3e4,
  estimatedInputTokenLimit: 4e4,
  maxOutputTokens: 2e3,
  rateLimitPerMinute: 5,
  maxConcurrency: 1,
  allowedProviders: ["openai"],
  allowedModels: ["gpt-5.4-nano", "gpt-5-nano"]
};
function getTrialDefaultProvider() {
  return "openai";
}
function getTrialDefaultModel() {
  const model = process.env.TRIAL_DEFAULT_MODEL || "gpt-5.4-nano";
  if (trialPolicyConfig.allowedModels.includes(model)) return model;
  return "gpt-5.4-nano";
}
var managedTrialDesignNotes = {
  phase: "1.5",
  storeBodies: false,
  hardCapSourceOfTruth: "gateway",
  providerBudgetIsNotHardCap: true,
  persistence: "upstash-redis",
  trialProviders: "openai-only"
};

export {
  trialPolicyConfig,
  getTrialDefaultProvider,
  getTrialDefaultModel,
  managedTrialDesignNotes
};
//# sourceMappingURL=chunk-OSAU4LDY.js.map