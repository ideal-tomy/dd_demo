import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getTrialStatusForCode } from "../../src/vendor/ai-demo/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorPayload,
} from "../../src/vendor/ai-demo/trial/http";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
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
    const status = await getTrialStatusForCode(codeHash);
    res.status(200).json(status);
  } catch (err) {
    const payload = trialErrorPayload(err);
    res.status(payload.status).json(payload.body);
  }
}
