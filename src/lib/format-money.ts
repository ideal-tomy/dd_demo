/** 百万円 → 表示用 */

export function toOku(millionYen: number): number {
  return millionYen / 100;
}

export function formatOku(
  millionYen: number,
  opts?: { digits?: number; unit?: boolean },
): string {
  const digits = opts?.digits ?? (Math.abs(toOku(millionYen)) >= 10 ? 0 : 1);
  const n = toOku(millionYen).toFixed(digits);
  return opts?.unit === false ? n : `${n}億`;
}

export function formatOkuFull(millionYen: number): string {
  const oku = toOku(millionYen);
  if (Math.abs(oku) >= 10) return `${oku.toFixed(0)}億円`;
  return `${oku.toFixed(1)}億円`;
}

export function formatMillion(n: number, withSign = false): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${Math.round(n).toLocaleString("ja-JP")}`;
}

export function horizonLabel(months: number): string {
  if (months <= 24) return "2年";
  if (months <= 36) return "3年";
  return "5年";
}
