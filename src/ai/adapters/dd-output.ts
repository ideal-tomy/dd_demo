import type { DdDiagnosisResult } from "../types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asOptions(v: unknown): DdDiagnosisResult["developmentOptions"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const title = asString(o.title);
      const summary = asString(o.summary);
      if (!title) return null;
      return { title, summary };
    })
    .filter((x): x is { title: string; summary: string } => Boolean(x));
}

function asPriority(v: unknown): DdDiagnosisResult["priority"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item, i) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const itemText = asString(o.item);
      if (!itemText) return null;
      return {
        rank: typeof o.rank === "number" ? o.rank : i + 1,
        item: itemText,
        rationale: asString(o.rationale),
      };
    })
    .filter((x): x is DdDiagnosisResult["priority"][number] => Boolean(x));
}

function asRoadmap(v: unknown): DdDiagnosisResult["roadmap"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const phase = asString(o.phase);
      if (!phase) return null;
      const items = Array.isArray(o.items)
        ? o.items.map((x) => asString(x)).filter(Boolean)
        : [];
      return { phase, items };
    })
    .filter((x): x is DdDiagnosisResult["roadmap"][number] => Boolean(x));
}

/** Parse model text → DD structured result. Throws on total failure. */
export function parseDdDiagnosisText(text: string): DdDiagnosisResult {
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
      throw new Error("診断結果の JSON を解析できませんでした。");
    }
  }

  if (!raw || typeof raw !== "object") {
    throw new Error("診断結果の形式が不正です。");
  }
  const o = raw as Record<string, unknown>;
  const investment =
    o.investmentImpact && typeof o.investmentImpact === "object"
      ? (o.investmentImpact as Record<string, unknown>)
      : {};
  const prototype =
    o.prototype && typeof o.prototype === "object"
      ? (o.prototype as Record<string, unknown>)
      : {};

  return {
    diagnosis: asString(o.diagnosis, "（診断文なし）"),
    techOpportunity: asString(o.techOpportunity),
    developmentOptions: asOptions(o.developmentOptions),
    priority: asPriority(o.priority),
    investmentImpact: {
      investment: asString(investment.investment),
      impact: asString(investment.impact),
      note: asString(investment.note) || undefined,
    },
    prototype: {
      name: asString(prototype.name),
      scope: asString(prototype.scope),
      nextStep: asString(prototype.nextStep),
    },
    roadmap: asRoadmap(o.roadmap),
  };
}
