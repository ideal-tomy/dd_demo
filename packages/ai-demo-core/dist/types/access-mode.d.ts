type AccessMode = "byok-direct" | "managed-trial" | "client-proxy";
type AiProvider = "openai" | "anthropic" | "google";
type ConnectionStatus = "unchecked" | "checking" | "success" | "auth_error" | "permission_error" | "model_unavailable" | "network_error" | "other_error";

export type { AccessMode, AiProvider, ConnectionStatus };
