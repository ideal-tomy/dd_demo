// CORE-CANDIDATE
import { countCharacters } from "./knowledge";

export type IngestTarget = "knowledge" | "prompt";

export type ExtractResult = {
  text: string;
  fileName: string;
  mimeOrExt: string;
  characterCount: number;
  warning?: string;
};

export class DocumentIngestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentIngestError";
  }
}

/** Soft cap to keep browser extraction responsive. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;

const KNOWLEDGE_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".csv",
  ".yaml",
  ".yml",
  ".json",
] as const;

const PROMPT_EXTENSIONS = [
  ".txt",
  ".md",
  ".yaml",
  ".yml",
  ".json",
  ".pdf",
] as const;

export const SUPPORTED_EXTENSIONS: Record<
  IngestTarget,
  readonly string[]
> = {
  knowledge: KNOWLEDGE_EXTENSIONS,
  prompt: PROMPT_EXTENSIONS,
};

export function acceptAttribute(target: IngestTarget): string {
  return SUPPORTED_EXTENSIONS[target].join(",");
}

export function formatHelpLabel(target: IngestTarget): string {
  const list = SUPPORTED_EXTENSIONS[target]
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(" / ");
  return target === "knowledge"
    ? `PDF・文書ファイル（${list}）`
    : `プロンプトファイル（${list}）`;
}

function getExtension(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  if (i < 0) return "";
  return fileName.slice(i).toLowerCase();
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new DocumentIngestError("ファイルの読み込みに失敗しました。"));
    reader.readAsText(file, "UTF-8");
  });
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(new DocumentIngestError("ファイルの読み込みに失敗しました。"));
    reader.readAsArrayBuffer(file);
  });
}

function normalizePlainText(raw: string): string {
  return raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

function formatJsonText(raw: string): string {
  const trimmed = normalizePlainText(raw).trim();
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return normalizePlainText(raw);
  }
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Use CDN worker matching the installed package major.minor to avoid bundler worker path issues.
  const version = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const data = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  const parts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(line);
  }

  return parts.join("\n").replace(/[ \t]+\n/g, "\n").trim();
}

export async function extractDocumentText(
  file: File,
  target: IngestTarget,
): Promise<ExtractResult> {
  if (file.size > MAX_FILE_BYTES) {
    throw new DocumentIngestError(
      `ファイルサイズが上限（${(MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)}MB）を超えています。より小さいファイルをご利用ください。`,
    );
  }

  const ext = getExtension(file.name);
  const allowed = SUPPORTED_EXTENSIONS[target];
  if (!ext || !allowed.includes(ext)) {
    throw new DocumentIngestError(
      `この形式（${ext || "不明"}）には対応していません。対応: ${allowed.join(", ")}`,
    );
  }

  let text = "";
  let warning: string | undefined;

  if (ext === ".pdf") {
    try {
      text = await extractPdfText(file);
    } catch (err) {
      if (err instanceof DocumentIngestError) throw err;
      throw new DocumentIngestError(
        "PDFの読み込みに失敗しました。ファイルが壊れているか、対応していない形式かもしれません。",
      );
    }
    if (!text.trim()) {
      throw new DocumentIngestError(
        "テキストを取り出せませんでした。スキャンPDFや画像のみのPDFは現在未対応です（OCRは今後対応予定）。",
      );
    }
  } else if (ext === ".json") {
    text = formatJsonText(await readFileAsText(file));
  } else {
    text = normalizePlainText(await readFileAsText(file));
  }

  if (!text.trim()) {
    throw new DocumentIngestError(
      "ファイルから有効なテキストを取得できませんでした。別のファイルをお試しください。",
    );
  }

  return {
    text,
    fileName: file.name,
    mimeOrExt: ext || file.type || "unknown",
    characterCount: countCharacters(text),
    warning,
  };
}
