import { demoConfig } from "../config/demo.config";
import {
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  clearAll,
  type StudioSettings,
} from "../vendor/ai-demo/demo-core/storage";
import type { AiProvider } from "../vendor/ai-demo/types/access-mode";
import { isDdAccessMode, type DdAccessMode } from "./access-mode";

export function getDdAccessMode(): DdAccessMode {
  const s = getSettings();
  if (isDdAccessMode(s.accessMode)) return s.accessMode;
  return demoConfig.defaultAccessMode;
}

export function setDdAccessMode(mode: DdAccessMode): void {
  setSettings({ accessMode: mode as StudioSettings["accessMode"] });
}

export function getDdProvider(): AiProvider {
  return getSettings().provider ?? demoConfig.defaultProvider;
}

export function getDdModel(): string {
  return getSettings().model || demoConfig.defaultModel;
}

export {
  getApiKey,
  setApiKey,
  getTrialCode,
  setTrialCode,
  getSettings,
  setSettings,
  clearAll,
};
