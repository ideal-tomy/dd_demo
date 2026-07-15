export type DdAccessMode = "sample" | "byok-direct" | "managed-trial";

export const DD_ACCESS_MODE_LABELS: Record<DdAccessMode, string> = {
  sample: "サンプルデータで試す",
  "byok-direct": "APIキーで試す",
  "managed-trial": "体験コードで試す",
};

export const PRIMARY_ACCESS_MODES = [
  "sample",
  "byok-direct",
  "managed-trial",
] as const satisfies readonly DdAccessMode[];

export function isDdAccessMode(
  value: string | null | undefined,
): value is DdAccessMode {
  return (
    value === "sample" || value === "byok-direct" || value === "managed-trial"
  );
}
