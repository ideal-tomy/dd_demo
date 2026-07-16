/** 返した時間カウンター — イベント定義と算定根拠 */

export type ReturnedTimeEventId =
  | "sample_exit_view"
  | "client_dd_analyze"
  | "proposal_update"
  | "live_payroll_attendance";

export type ReturnedTimeEventDef = {
  id: ReturnedTimeEventId;
  label: string;
  hours: number;
};

export const RETURNED_TIME_BASIS =
  "標準的なDD実務工数（docs/returned_time_basis.md を参照）に基づく実務時間換算の試算";

export const RETURNED_TIME_EVENTS: Record<
  ReturnedTimeEventId,
  ReturnedTimeEventDef
> = {
  sample_exit_view: {
    id: "sample_exit_view",
    label: "サンプルEXIT試算の確認",
    hours: 2.0,
  },
  client_dd_analyze: {
    id: "client_dd_analyze",
    label: "DDフラグ解析",
    hours: 8.0,
  },
  proposal_update: {
    id: "proposal_update",
    label: "バリューアップ語りの再生成",
    hours: 1.5,
  },
  live_payroll_attendance: {
    id: "live_payroll_attendance",
    label: "給与×勤怠の実解析",
    hours: 14.0,
  },
};

export function formatReturnedHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
