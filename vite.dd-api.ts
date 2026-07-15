import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv } from "vite";
import { executeTrialAsk, getTrialStatusForCode } from "@axeon/ai-demo-core/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorPayload,
} from "@axeon/ai-demo-core/trial/http";
import type { TrialAskRequestBody } from "@axeon/ai-demo-core/types/trial";

function applyEnv(mode: string) {
  const env = loadEnv(mode, process.cwd(), "");
  for (const k of [
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "TRIAL_DEFAULT_MODEL",
  ] as const) {
    if (env[k]) process.env[k] = env[k];
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function headerGet(req: IncomingMessage, name: string): string | null {
  const v = req.headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0] ?? null;
  return typeof v === "string" ? v : null;
}

async function handleTrialAsk(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: { code: "METHOD", message: "Method not allowed" } }),
    );
    return;
  }

  try {
    const codeHash = codeHashFromBearer({
      headers: { get: (n) => headerGet(req, n) },
    });
    const raw = await readBody(req);
    const body = JSON.parse(raw) as TrialAskRequestBody;
    if (!body?.systemPrompt || !Array.isArray(body.messages)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            code: "INVALID_BODY",
            message: "リクエスト形式が正しくありません。",
          },
        }),
      );
      return;
    }
    const result = await executeTrialAsk(codeHash, {
      provider: body.provider,
      model: body.model,
      systemPrompt: body.systemPrompt,
      messages: body.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? ""),
      })),
      knowledgeCharCount: Number(body.knowledgeCharCount) || 0,
      estimatedInputTokens: Number(body.estimatedInputTokens) || 0,
      responseFormat: body.responseFormat,
      temperature: body.temperature,
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result));
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.statusCode = payload.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload.body));
  }
}

async function handleTrialStatus(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({ error: { code: "METHOD", message: "Method not allowed" } }),
    );
    return;
  }

  try {
    const codeHash = codeHashFromBearer({
      headers: { get: (n) => headerGet(req, n) },
    });
    const status = await getTrialStatusForCode(codeHash);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(status));
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.statusCode = payload.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload.body));
  }
}

function attach(server: { middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
  server.middlewares.use((req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url === "/api/trial/ask") {
      void handleTrialAsk(req, res);
      return;
    }
    if (url === "/api/trial/status") {
      void handleTrialStatus(req, res);
      return;
    }
    next();
  });
}

export function ddTrialApiPlugin(): Plugin {
  return {
    name: "dd-trial-api",
    configResolved(config) {
      applyEnv(config.mode);
    },
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}
