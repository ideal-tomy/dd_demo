/** 給与台帳 × 勤怠の実突合（フロント完結）。データは架空、処理は本物。 */

export type PayrollRow = {
  line: number;
  employeeId: string;
  name: string;
  yearMonth: string;
  basePay: number;
  overtimePay: number;
  otHoursPaid: number;
};

export type AttendanceRow = {
  line: number;
  employeeId: string;
  name: string;
  yearMonth: string;
  clockOtHours: number;
};

export type ReconcileGap = {
  employeeId: string;
  name: string;
  yearMonth: string;
  clockOtHours: number;
  otHoursPaid: number;
  gapHours: number;
  estimatedUnpaidYen: number;
  payrollLine: number;
  attendanceLine: number;
  severity: "high" | "mid";
};

export type ReconcileResult = {
  payrollRows: PayrollRow[];
  attendanceRows: AttendanceRow[];
  gaps: ReconcileGap[];
  summary: {
    monthsChecked: number;
    gapCount: number;
    estimateLo: number;
    estimateHi: number;
  };
};

const HOURLY_FALLBACK = 1600;
/** 打刻超過がこの時間以上なら検知 */
const GAP_THRESHOLD_HOURS = 3;

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(",").map((c) => c.trim()));
}

export function parsePayrollCsv(text: string): PayrollRow[] {
  const rows = parseCsv(text);
  const out: PayrollRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 6) continue;
    out.push({
      line: i + 1,
      employeeId: r[0],
      name: r[1],
      yearMonth: r[2],
      basePay: Number(r[3]),
      overtimePay: Number(r[4]),
      otHoursPaid: Number(r[5]),
    });
  }
  return out;
}

export function parseAttendanceCsv(text: string): AttendanceRow[] {
  const rows = parseCsv(text);
  const out: AttendanceRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length < 4) continue;
    out.push({
      line: i + 1,
      employeeId: r[0],
      name: r[1],
      yearMonth: r[2],
      clockOtHours: Number(r[3]),
    });
  }
  return out;
}

export function reconcilePayrollAttendance(
  payroll: PayrollRow[],
  attendance: AttendanceRow[],
): ReconcileResult {
  const attMap = new Map<string, AttendanceRow>();
  for (const a of attendance) {
    attMap.set(`${a.employeeId}|${a.yearMonth}`, a);
  }

  const gaps: ReconcileGap[] = [];
  const months = new Set<string>();

  for (const p of payroll) {
    months.add(p.yearMonth);
    const a = attMap.get(`${p.employeeId}|${p.yearMonth}`);
    if (!a) continue;
    const gapHours = a.clockOtHours - p.otHoursPaid;
    if (gapHours < GAP_THRESHOLD_HOURS) continue;
    const hourly =
      p.otHoursPaid > 0
        ? Math.round(p.overtimePay / p.otHoursPaid)
        : HOURLY_FALLBACK;
    const estimatedUnpaidYen = Math.round(gapHours * hourly);
    gaps.push({
      employeeId: p.employeeId,
      name: p.name,
      yearMonth: p.yearMonth,
      clockOtHours: a.clockOtHours,
      otHoursPaid: p.otHoursPaid,
      gapHours: Math.round(gapHours * 10) / 10,
      estimatedUnpaidYen,
      payrollLine: p.line,
      attendanceLine: a.line,
      severity: gapHours >= 8 ? "high" : "mid",
    });
  }

  const total = gaps.reduce((s, g) => s + g.estimatedUnpaidYen, 0);
  const toMillion = (yen: number) => Math.round((yen / 1_000_000) * 10) / 10;
  return {
    payrollRows: payroll,
    attendanceRows: attendance,
    gaps,
    summary: {
      monthsChecked: months.size,
      gapCount: gaps.length,
      estimateLo: toMillion(total * 0.85),
      estimateHi: toMillion(total * 1.25),
    },
  };
}

export const LIVE_SAMPLE_PATHS = {
  payroll: "/live-samples/payroll.csv",
  attendance: "/live-samples/attendance.csv",
} as const;

export const LIVE_SCAN_STEPS = [
  "給与台帳CSVを読込中…",
  "勤怠打刻データを読込中…",
  "従業員ID×年月で突合中…",
  "2024-03 に乖離を検出",
  "根拠行を特定中…",
] as const;

export async function runLiveSampleReconcile(): Promise<ReconcileResult> {
  const [pRes, aRes] = await Promise.all([
    fetch(LIVE_SAMPLE_PATHS.payroll),
    fetch(LIVE_SAMPLE_PATHS.attendance),
  ]);
  if (!pRes.ok || !aRes.ok) {
    throw new Error("サンプル資料の読込に失敗しました");
  }
  const [pText, aText] = await Promise.all([pRes.text(), aRes.text()]);
  return reconcilePayrollAttendance(
    parsePayrollCsv(pText),
    parseAttendanceCsv(aText),
  );
}
