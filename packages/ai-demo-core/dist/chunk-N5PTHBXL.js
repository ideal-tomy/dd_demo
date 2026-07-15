// demo-core/demo-core-config.ts
var activeConfig = null;
function configureDemoCore(config) {
  activeConfig = config;
}
function getDemoCoreConfig() {
  if (!activeConfig) {
    throw new Error(
      "configureDemoCore() must be called before using @axeon/ai-demo-core storage or knowledge helpers."
    );
  }
  return activeConfig;
}
function isDemoCoreConfigured() {
  return activeConfig !== null;
}

export {
  configureDemoCore,
  getDemoCoreConfig,
  isDemoCoreConfigured
};
//# sourceMappingURL=chunk-N5PTHBXL.js.map