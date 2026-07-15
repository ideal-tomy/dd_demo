export type DdAskResult = {
  answer: string;
  citations: string[];
};

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function parseDdAskText(text: string): DdAskResult {
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
      return {
        answer: trimmed || "回答を解析できませんでした。",
        citations: [],
      };
    }
  }
  if (!raw || typeof raw !== "object") {
    return { answer: "回答の形式が不正です。", citations: [] };
  }
  const o = raw as Record<string, unknown>;
  const citations = Array.isArray(o.citations)
    ? o.citations.map((c) => asString(c)).filter(Boolean).slice(0, 5)
    : [];
  return {
    answer: asString(o.answer, "（回答なし）"),
    citations,
  };
}
