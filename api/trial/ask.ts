import type { VercelRequest, VercelResponse } from "@vercel/node";
import { executeTrialAsk } from "@axeon/ai-demo-core/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorPayload,
} from "@axeon/ai-demo-core/trial/http";
import type { TrialAskRequestBody } from "@axeon/ai-demo-core/types/trial";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: { code: "METHOD", message: "Method not allowed" } });
    return;
  }

  try {
    const headers = {
      get(name: string) {
        const v = req.headers[name.toLowerCase()];
        if (Array.isArray(v)) return v[0] ?? null;
        return v ?? null;
      },
    };
    const codeHash = codeHashFromBearer({ headers });
    const body =
      typeof req.body === "string"
        ? (JSON.parse(req.body) as TrialAskRequestBody)
        : ((req.body ?? {}) as TrialAskRequestBody);

    if (!body?.systemPrompt || !Array.isArray(body.messages)) {
      res.status(400).json({
        error: {
          code: "INVALID_BODY",
          message: "リクエスト形式が正しくありません。",
        },
      });
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
    res.status(200).json(result);
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.status(payload.status).json(payload.body);
  }
}
