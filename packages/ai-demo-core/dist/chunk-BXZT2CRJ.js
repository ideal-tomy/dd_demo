import {
  TrialGatewayError
} from "./chunk-JKVGF7QA.js";
import {
  TrialConfigError
} from "./chunk-CDUF3WGH.js";
import {
  hashTrialCode
} from "./chunk-N4UV5OCM.js";

// trial/http.ts
function extractBearer(req) {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}
function codeHashFromBearer(req) {
  const code = extractBearer(req);
  if (!code) {
    throw new TrialGatewayError(
      "UNAUTHORIZED",
      "\u4F53\u9A13\u30B3\u30FC\u30C9\u304C\u5FC5\u8981\u3067\u3059\u3002",
      401
    );
  }
  return hashTrialCode(code);
}
function trialErrorPayload(error) {
  if (error instanceof TrialGatewayError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message } }
    };
  }
  if (error instanceof TrialConfigError) {
    return {
      status: 503,
      body: { error: { code: "CONFIG", message: error.message } }
    };
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number(error.status) || 500;
    if (status === 401) {
      return {
        status: 401,
        body: {
          error: { code: "UNAUTHORIZED", message: "\u8A8D\u8A3C\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002" }
        }
      };
    }
  }
  console.error("[trial-api]", error instanceof Error ? error.message : error);
  return {
    status: 500,
    body: {
      error: {
        code: "UNKNOWN",
        message: "\u4E00\u6642\u7684\u306A\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u3057\u3066\u304B\u3089\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002"
      }
    }
  };
}

export {
  extractBearer,
  codeHashFromBearer,
  trialErrorPayload
};
//# sourceMappingURL=chunk-BXZT2CRJ.js.map