import { configureDemoCore } from "@axeon/ai-demo-core/demo-core";
import { demoConfig } from "../config/demo.config";

let configured = false;

export function ensureAiDemoCoreConfigured(): void {
  if (configured) return;
  configureDemoCore({
    storageNamespace: demoConfig.storageNamespace,
    demoId: demoConfig.id,
    defaultRoleId: demoConfig.defaultRoleId,
    defaultAccessMode: demoConfig.defaultAccessMode,
    defaultModel: demoConfig.defaultModel,
    defaultProvider: demoConfig.defaultProvider,
    knowledgePolicy: demoConfig.knowledgePolicy,
  });
  configured = true;
}
