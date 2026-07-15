export type InternalErrorCode =
  | "AUTH_ERROR"
  | "PERMISSION_ERROR"
  | "MODEL_UNAVAILABLE"
  | "RATE_LIMIT"
  | "QUOTA_EXCEEDED"
  | "CONTEXT_TOO_LARGE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

export type NormalizedError = {
  code: InternalErrorCode;
  provider: import("./access-mode").AiProvider;
  userMessage: string;
  recommendedAction: string;
  /** Never include API keys. Safe technical detail for optional expand. */
  technicalDetail?: string;
};
