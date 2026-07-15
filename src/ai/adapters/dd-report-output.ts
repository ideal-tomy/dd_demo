import type { DdFlag } from "../scenario/build-dd-flags";

export type DdReportEnrichment = {
  summary: string;
  flags: DdFlag[];
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Merge AI narrations onto deterministic flags by id. Never invents flags/amounts. */
export function parseDdReportEnrichment(
  text: string,
  baseFlags: DdFlag[],
): DdReportEnrichment {
  const byId = new Map(baseFlags.map((f) => [f.id, f]));
  let summary = "";
  try {
    const trimmed = text.trim();
    let raw: unknown;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) {
        raw = JSON.parse(trimmed.slice(start, end + 1));
      } else {
        return { summary: "", flags: baseFlags };
      }
    }
    if (!raw || typeof raw !== "object") {
      return { summary: "", flags: baseFlags };
    }
    const o = raw as Record<string, unknown>;
    summary = asString(o.summary);
    const arr = Array.isArray(o.flags) ? o.flags : [];
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = asString(row.id);
      const base = byId.get(id);
      if (!base) continue;
      byId.set(id, {
        ...base,
        glance: asString(row.glance, base.glance) || base.glance,
        inference: asString(row.inference, base.inference) || base.inference,
        deal: asString(row.deal, base.deal) || base.deal,
      });
    }
  } catch {
    return { summary: "", flags: baseFlags };
  }
  return {
    summary,
    flags: baseFlags.map((f) => byId.get(f.id) ?? f),
  };
}
