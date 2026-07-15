import type { DdDiagnosisResult } from "../types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asLeverDetails(v: unknown): DdDiagnosisResult["leverDetails"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const lever = asString(o.lever);
      if (!lever) return null;
      return {
        lever,
        rationale: asString(o.rationale),
        kpi: asString(o.kpi),
      };
    })
    .filter((x): x is DdDiagnosisResult["leverDetails"][number] => Boolean(x));
}

function asOffbalancePlan(v: unknown): DdDiagnosisResult["offbalancePlan"] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const itemText = asString(o.item);
      if (!itemText) return null;
      return {
        item: itemText,
        treatment: asString(o.treatment),
        timing: asString(o.timing),
      };
    })
    .filter((x): x is DdDiagnosisResult["offbalancePlan"][number] => Boolean(x));
}

function asRisks(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean).slice(0, 5);
}

function asRoadmap(v: unknown): DdDiagnosisResult["roadmap"] {
  if (!v || typeof v !== "object") {
    return { phase1: "", phase2: "", phase3: "" };
  }
  const o = v as Record<string, unknown>;
  return {
    phase1: asString(o.phase1),
    phase2: asString(o.phase2),
    phase3: asString(o.phase3),
  };
}

/** Parse model text → value-up structured result. */
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

  const gapRaw = o.gap_advice ?? o.gapAdvice;
  const gapAdvice =
    gapRaw === null || gapRaw === undefined
      ? null
      : asString(gapRaw) || null;

  return {
    diagnosis: asString(o.diagnosis, "（診断文なし）"),
    planNarrative: asString(o.plan_narrative ?? o.planNarrative),
    leverDetails: asLeverDetails(o.lever_details ?? o.leverDetails),
    offbalancePlan: asOffbalancePlan(o.offbalance_plan ?? o.offbalancePlan),
    exitStory: asString(o.exit_story ?? o.exitStory),
    roadmap: asRoadmap(o.roadmap),
    gapAdvice,
    risks: asRisks(o.risks),
  };
}
