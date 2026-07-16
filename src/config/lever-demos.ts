/** レバー → 実働デモ接続（存在するデモのみ） */

export type LeverDemoId = "product_flow_minato";

export type LeverDemoDef = {
  id: LeverDemoId;
  label: string;
  /** 環境変数未設定時のローカル既定 */
  defaultBaseUrl: string;
  buildPath: (packQuery: string) => string;
};

export const LEVER_DEMOS: Record<LeverDemoId, LeverDemoDef> = {
  product_flow_minato: {
    id: "product_flow_minato",
    label: "ミナトテック工場ボット",
    defaultBaseUrl: "http://localhost:5173",
    buildPath: () => "/?pack=minato-factory",
  },
};

const STORAGE_KEY = "dd_lever_return_state";

export type LeverReturnState = {
  companyId: string;
  strategyAxis: string;
  leverKey: string;
  scrollY: number;
  expandedLever: string;
  dataSource: "sample" | "client";
};

export function getProductFlowBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_PRODUCT_FLOW_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");
  return LEVER_DEMOS.product_flow_minato.defaultBaseUrl;
}

export function buildLeverDemoUrl(
  demoId: LeverDemoId,
  returnState: LeverReturnState,
): string {
  const def = LEVER_DEMOS[demoId];
  const base = getProductFlowBaseUrl();
  const path = def.buildPath("minato-factory");
  const returnUrl = new URL(
    typeof window !== "undefined"
      ? `${window.location.origin}/ai`
      : "http://localhost:5174/ai",
  );
  returnUrl.searchParams.set("restore", "1");
  returnUrl.searchParams.set("companyId", returnState.companyId);
  returnUrl.searchParams.set("axis", returnState.strategyAxis);
  returnUrl.searchParams.set("lever", returnState.leverKey);
  returnUrl.searchParams.set("src", returnState.dataSource);

  const url = new URL(path, `${base}/`);
  url.searchParams.set("pack", "minato-factory");
  url.searchParams.set("from", "dd");
  url.searchParams.set("return", returnUrl.toString());
  return url.toString();
}

export function saveLeverReturnState(state: LeverReturnState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadLeverReturnState(): LeverReturnState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LeverReturnState;
  } catch {
    return null;
  }
}

export function clearLeverReturnState(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isLeverDemoId(value: string | undefined): value is LeverDemoId {
  return value === "product_flow_minato";
}
