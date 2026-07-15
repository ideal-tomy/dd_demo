/**
 * Build trial portal URL (共通取得先: Studio /admin/trial).
 */
export function buildTrialPortalUrl(options: {
  baseUrl: string;
  demoId: string;
  returnUrl?: string;
}): string {
  const fallback = "http://localhost:3000/admin/trial";
  const base = options.baseUrl.trim() || fallback;
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    url = new URL(fallback);
  }
  // 量産契約: 飛ばす先は常に /admin/trial
  if (
    !url.pathname ||
    url.pathname === "/" ||
    url.pathname === "/trial" ||
    url.pathname === "/trial/"
  ) {
    url.pathname = "/admin/trial";
  }
  url.searchParams.set("demo", options.demoId);
  if (options.returnUrl) {
    url.searchParams.set("return", options.returnUrl);
  }
  return url.toString();
}

export const DEFAULT_TRIAL_PORTAL_BASE =
  import.meta.env.VITE_TRIAL_PORTAL_URL?.trim() ||
  "https://ai-demo-studio-lime.vercel.app/admin/trial";

/** Studio demo-catalog id */
export const DD_DEMO_CATALOG_ID = "dd-diagnosis";
