# ライブ層: 給与台帳 × 勤怠突合サンプル

同梱CSVは架空データ。解析処理は本物。結果（乖離月）は既知なので商談が事故らない。

## ファイル

| パス | 内容 |
|---|---|
| `public/live-samples/payroll.csv` | 月次支給（従業員×月） |
| `public/live-samples/attendance.csv` | 月次打刻残業時間（従業員×月） |

## 列定義

### payroll.csv
`employee_id,name,year_month,base_pay,overtime_pay,ot_hours_paid`

### attendance.csv
`employee_id,name,year_month,clock_ot_hours`

## 意図した乖離

- `2024-03`: 打刻残業 > 支給計上残業（複数名）→ 未払残業の兆候
- 他月は概ね一致（ノイズは小さく、重大検知にしない）

## エンジン

`src/live/reconcilePayrollAttendance.ts` が両CSVをパースし、月次で突合して乖離行を返す。
