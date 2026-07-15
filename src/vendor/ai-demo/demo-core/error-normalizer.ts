// CORE-CANDIDATE
import type { AiProvider } from "../types/access-mode";
import type { InternalErrorCode, NormalizedError } from "../types/errors";

const MESSAGES: Record<
  InternalErrorCode,
  { userMessage: string; recommendedAction: string }
> = {
  AUTH_ERROR: {
    userMessage: "APIキーが確認できませんでした。",
    recommendedAction: "キーの入力ミスや失効がないか確認し、再入力してください。",
  },
  PERMISSION_ERROR: {
    userMessage: "このキーでは利用権限が不足しているようです。",
    recommendedAction:
      "Providerの管理画面でモデル利用権限・課金設定を確認してください。",
  },
  MODEL_UNAVAILABLE: {
    userMessage: "選択したモデルを利用できませんでした。",
    recommendedAction: "別のモデルを選ぶか、設定画面でモデルを変更してください。",
  },
  RATE_LIMIT: {
    userMessage: "リクエストが混み合っているため、一時的に制限されています。",
    recommendedAction: "少し待ってから再送信してください。",
  },
  QUOTA_EXCEEDED: {
    userMessage: "利用枠または残高の上限に達した可能性があります。",
    recommendedAction: "Provider側の利用状況・課金設定を確認してください。",
  },
  CONTEXT_TOO_LARGE: {
    userMessage: "送信内容が長すぎて処理できませんでした。",
    recommendedAction: "ナレッジや会話を短くして、もう一度お試しください。",
  },
  NETWORK_ERROR: {
    userMessage: "通信に失敗しました。",
    recommendedAction: "ネットワーク接続を確認し、再試行してください。",
  },
  TIMEOUT: {
    userMessage: "応答がタイムアウトしました。",
    recommendedAction: "時間をおいて再送信してください。",
  },
  UNKNOWN: {
    userMessage: "一時的なエラーが発生しました。",
    recommendedAction: "設定を確認のうえ、もう一度お試しください。",
  },
};

export function normalizeError(
  provider: AiProvider,
  error: unknown,
): NormalizedError {
  const providerLabel =
    provider === "openai"
      ? "OpenAI"
      : provider === "anthropic"
        ? "Claude"
        : "Gemini";

  if (error instanceof TypeError || isNetworkLike(error)) {
    const base = MESSAGES.NETWORK_ERROR;
    return {
      code: "NETWORK_ERROR",
      provider,
      userMessage: `${providerLabel}への${base.userMessage}`,
      recommendedAction: base.recommendedAction,
      technicalDetail: safeDetail(error),
    };
  }

  const status = extractStatus(error);
  const bodyText = extractBodyText(error).toLowerCase();
  const code = classify(status, bodyText);
  const base = MESSAGES[code];

  return {
    code,
    provider,
    userMessage: `${providerLabel}: ${base.userMessage}`,
    recommendedAction: base.recommendedAction,
    technicalDetail: safeDetail(error),
  };
}

function classify(status: number | null, body: string): InternalErrorCode {
  if (status === 401 || /invalid.?api.?key|authentication|unauthorized|api key not valid/.test(body)) {
    return "AUTH_ERROR";
  }
  if (status === 403 || /permission|forbidden|not allowed/.test(body)) {
    return "PERMISSION_ERROR";
  }
  if (
    status === 404 ||
    /model.?not.?found|does not exist|not available|unknown model/.test(body)
  ) {
    return "MODEL_UNAVAILABLE";
  }
  if (status === 429 || /rate.?limit|too many requests/.test(body)) {
    return "RATE_LIMIT";
  }
  if (/quota|insufficient.?quota|billing|credit/.test(body)) {
    return "QUOTA_EXCEEDED";
  }
  if (
    status === 413 ||
    /context.?length|too.?large|maximum.?context|token.?limit/.test(body)
  ) {
    return "CONTEXT_TOO_LARGE";
  }
  if (/timeout|timed out/.test(body)) {
    return "TIMEOUT";
  }
  return "UNKNOWN";
}

function extractStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const e = error as Record<string, unknown>;
  if (typeof e.status === "number") return e.status;
  if (typeof e.statusCode === "number") return e.statusCode;
  return null;
}

function extractBodyText(error: unknown): string {
  if (!error || typeof error !== "object") return String(error ?? "");
  const e = error as Record<string, unknown>;
  if (typeof e.body === "string") return e.body;
  if (typeof e.message === "string") return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return "";
  }
}

function isNetworkLike(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const msg = String((error as { message?: string }).message ?? "").toLowerCase();
  return /failed to fetch|networkerror|load failed|cors/.test(msg);
}

/** Strip anything that looks like an API key from technical details. */
function safeDetail(error: unknown): string | undefined {
  let text = "";
  try {
    text =
      typeof error === "string"
        ? error
        : JSON.stringify(error, Object.getOwnPropertyNames(error as object));
  } catch {
    text = String(error);
  }
  return text
    .replace(/sk-[a-zA-Z0-9_-]{10,}/g, "[REDACTED]")
    .replace(/AIza[a-zA-Z0-9_-]{10,}/g, "[REDACTED]")
    .replace(/sk-ant-[a-zA-Z0-9_-]{10,}/g, "[REDACTED]")
    .slice(0, 500);
}

export function connectionStatusFromError(
  code: InternalErrorCode,
):
  | "auth_error"
  | "permission_error"
  | "model_unavailable"
  | "network_error"
  | "other_error" {
  switch (code) {
    case "AUTH_ERROR":
      return "auth_error";
    case "PERMISSION_ERROR":
      return "permission_error";
    case "MODEL_UNAVAILABLE":
      return "model_unavailable";
    case "NETWORK_ERROR":
      return "network_error";
    default:
      return "other_error";
  }
}
