/**
 * Shared helpers for Trial API routes (Vercel / Vite — no NextResponse).
 */
import { hashTrialCode } from "./hash";
import { TrialConfigError } from "./redis";
import { TrialGatewayError } from "./gateway";

export function extractBearer(req: {
  headers: { get(name: string): string | null };
}): string | null {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}

export function codeHashFromBearer(req: {
  headers: { get(name: string): string | null };
}): string {
  const code = extractBearer(req);
  if (!code) {
    throw new TrialGatewayError(
      "UNAUTHORIZED",
      "体験コードが必要です。",
      401,
    );
  }
  return hashTrialCode(code);
}

export type TrialErrorJson = {
  status: number;
  body: { error: { code: string; message: string } };
};

export function trialErrorPayload(error: unknown): TrialErrorJson {
  if (error instanceof TrialGatewayError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  if (error instanceof TrialConfigError) {
    return {
      status: 503,
      body: { error: { code: "CONFIG", message: error.message } },
    };
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status: number }).status) || 500;
    if (status === 401) {
      return {
        status: 401,
        body: {
          error: { code: "UNAUTHORIZED", message: "認証に失敗しました。" },
        },
      };
    }
  }
  console.error("[trial-api]", error instanceof Error ? error.message : error);
  return {
    status: 500,
    body: {
      error: {
        code: "UNKNOWN",
        message:
          "一時的なエラーが発生しました。しばらくしてからお試しください。",
      },
    },
  };
}
