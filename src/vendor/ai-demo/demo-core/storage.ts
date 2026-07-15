// CORE-CANDIDATE — ISO vendor storage (no Next.js)
import { brandConfig } from "../config/brand.config";
import { demoConfig } from "../config/demo.config";
import type { AiProvider } from "../types/access-mode";
import type { StudioAccessMode } from "../types/trial";

const PREFIX = `aidemo:${brandConfig.storageNamespace}:${demoConfig.id}`;

function key(parts: string[]): string {
  return [PREFIX, ...parts].join(":");
}

function safeGet(storage: Storage | undefined, k: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(k);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | undefined, k: string, value: string): void {
  if (!storage) return;
  try {
    storage.setItem(k, value);
  } catch {
    // ignore
  }
}

function safeRemove(storage: Storage | undefined, k: string): void {
  if (!storage) return;
  try {
    storage.removeItem(k);
  } catch {
    // ignore
  }
}

function browserSession(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage;
}

function browserLocal(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

export type StudioSettings = {
  /** Extended in ISO: also sample | server-proxy */
  accessMode: StudioAccessMode | "sample" | "server-proxy";
  provider: AiProvider;
  model: string;
  roleId: string;
  customInstruction: string;
  knowledge: string;
  setupComplete: boolean;
  connectionStatus: string;
};

const DEFAULT_SETTINGS: StudioSettings = {
  accessMode: "sample",
  provider: "openai",
  model: "gpt-5-nano",
  roleId: demoConfig.defaultRoleId,
  customInstruction: "",
  knowledge: "",
  setupComplete: false,
  connectionStatus: "unchecked",
};

export const storageKeys = {
  apiKey: (provider: AiProvider) => key(["apiKey", provider]),
  trialCode: () => key(["trialCode"]),
  settings: () => key(["settings"]),
  chat: () => key(["chat"]),
  sessionCost: () => key(["sessionCost"]),
};

export function getApiKey(provider: AiProvider): string {
  return safeGet(browserSession(), storageKeys.apiKey(provider)) ?? "";
}

export function setApiKey(provider: AiProvider, apiKey: string): void {
  if (!apiKey) {
    safeRemove(browserSession(), storageKeys.apiKey(provider));
    return;
  }
  safeSet(browserSession(), storageKeys.apiKey(provider), apiKey);
}

export function getTrialCode(): string {
  return safeGet(browserSession(), storageKeys.trialCode()) ?? "";
}

export function setTrialCode(code: string): void {
  if (!code) {
    safeRemove(browserSession(), storageKeys.trialCode());
    return;
  }
  safeSet(browserSession(), storageKeys.trialCode(), code);
}

export function getSettings(): StudioSettings {
  const raw = safeGet(browserLocal(), storageKeys.settings());
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function setSettings(partial: Partial<StudioSettings>): StudioSettings {
  const next = { ...getSettings(), ...partial };
  safeSet(browserLocal(), storageKeys.settings(), JSON.stringify(next));
  return next;
}

export function clearAll(): void {
  const storages = [browserSession(), browserLocal()].filter(
    Boolean,
  ) as Storage[];
  for (const storage of storages) {
    const toRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => storage.removeItem(k));
  }
}

export function clearChatAndCost(): void {
  safeRemove(browserLocal(), storageKeys.chat());
  safeRemove(browserLocal(), storageKeys.sessionCost());
}
