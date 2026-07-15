import {
  getDemoCoreConfig
} from "./chunk-N5PTHBXL.js";

// demo-core/storage.ts
function getPrefix() {
  const c = getDemoCoreConfig();
  return `aidemo:${c.storageNamespace}:${c.demoId}`;
}
function key(parts) {
  return [getPrefix(), ...parts].join(":");
}
function safeGet(storage, k) {
  if (!storage) return null;
  try {
    return storage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(storage, k, value) {
  if (!storage) return;
  try {
    storage.setItem(k, value);
  } catch {
  }
}
function safeRemove(storage, k) {
  if (!storage) return;
  try {
    storage.removeItem(k);
  } catch {
  }
}
function browserSession() {
  if (typeof window === "undefined") return void 0;
  return window.sessionStorage;
}
function browserLocal() {
  if (typeof window === "undefined") return void 0;
  return window.localStorage;
}
function defaultSettings() {
  const c = getDemoCoreConfig();
  return {
    accessMode: c.defaultAccessMode ?? "byok-direct",
    provider: c.defaultProvider ?? "openai",
    model: c.defaultModel ?? "gpt-5-nano",
    roleId: c.defaultRoleId,
    customInstruction: "",
    knowledge: "",
    setupComplete: false,
    connectionStatus: "unchecked"
  };
}
var storageKeys = {
  apiKey: (provider) => key(["apiKey", provider]),
  trialCode: () => key(["trialCode"]),
  settings: () => key(["settings"]),
  chat: () => key(["chat"]),
  sessionCost: () => key(["sessionCost"])
};
function getApiKey(provider) {
  return safeGet(browserSession(), storageKeys.apiKey(provider)) ?? "";
}
function setApiKey(provider, apiKey) {
  if (!apiKey) {
    safeRemove(browserSession(), storageKeys.apiKey(provider));
    return;
  }
  safeSet(browserSession(), storageKeys.apiKey(provider), apiKey);
}
function getTrialCode() {
  return safeGet(browserSession(), storageKeys.trialCode()) ?? "";
}
function setTrialCode(code) {
  if (!code) {
    safeRemove(browserSession(), storageKeys.trialCode());
    return;
  }
  safeSet(browserSession(), storageKeys.trialCode(), code);
}
function getSettings() {
  const raw = safeGet(browserLocal(), storageKeys.settings());
  const defaults = defaultSettings();
  if (!raw) return { ...defaults };
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}
function setSettings(partial) {
  const next = { ...getSettings(), ...partial };
  safeSet(browserLocal(), storageKeys.settings(), JSON.stringify(next));
  return next;
}
function getChatJson() {
  return safeGet(browserLocal(), storageKeys.chat());
}
function setChatJson(json) {
  safeSet(browserLocal(), storageKeys.chat(), json);
}
function getSessionCostJson() {
  return safeGet(browserLocal(), storageKeys.sessionCost());
}
function setSessionCostJson(json) {
  safeSet(browserLocal(), storageKeys.sessionCost(), json);
}
function clearAll() {
  const prefix = getPrefix();
  const storages = [browserSession(), browserLocal()].filter(
    Boolean
  );
  for (const storage of storages) {
    const toRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => storage.removeItem(k));
  }
}
function clearChatAndCost() {
  safeRemove(browserLocal(), storageKeys.chat());
  safeRemove(browserLocal(), storageKeys.sessionCost());
}

export {
  storageKeys,
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  getChatJson,
  setChatJson,
  getSessionCostJson,
  setSessionCostJson,
  clearAll,
  clearChatAndCost
};
//# sourceMappingURL=chunk-LWYUQIL6.js.map