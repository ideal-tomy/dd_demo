# Phase 4 完了 — DD診断（フォーム型）運用・受け入れ

`dd_demo` の `/ai` は、サンプル企業 JSON + シナリオパラメータ連動の
DD → バリューアップ → EXIT 体験ページ。既存の簿外債務演出デモ（`/`）は併存。

データ: `docs/20_ma_demo_companies.json`（実装コピー: `src/data/ma-demo-companies.json`）  
設計: `docs/21_ma_demo_scenario_design.md`

## 画面

| Path | 内容 |
|------|------|
| `/` | 既存 Vanilla ストーリーデモ（prior → 解析 → フラグ → PMI/EXIT） |
| `/ai`（`ai.html`） | サンプル＝EXIT試算 / 自社＝DD準備→解析フラグ報告→EXIT試算 |

## 体験モード（/ai）

| モード | 動作 |
|--------|------|
| サンプル | フロント試算 + ローカル語り（API 不要）。パラメータ変更で即時追従 |
| APIキー | EXIT語り「提案を更新」＋自社経路の DD語り補強／自由質問 |
| 体験コード | 同上（`/api/trial/ask` → Gateway、OpenAI のみ） |

## データソース（/ai）

| ソース | 動作 |
|--------|------|
| サンプル企業 | `CompanyPicker`（5社）→ EXIT ダッシュボードのみ。ナレッジパネルなし |
| 自社で入力 | 規模フォーム → DD準備（prior／データルーム／資料）→ **解析を実行** → フラグ報告 → 自由質問 → EXIT |

## AI 三タスク（数値は前端固定）

| タスク | 関数 | 役割 |
|--------|------|------|
| A. DD報告語り補強 | `enrichDdReport` | 決定的 flags の glance/inference/deal のみ再文（失敗時はローカル文） |
| B. 自由質問 | `askDdFollowup` | 会社＋flags＋資料のみで回答。新数値禁止 |
| C. バリューアップ語り | `runDiagnosis` | 既存 EXIT／バリューアップ JSON |

共通: `temperature` 0.2（A/B）/ 0.3（C）、`responseFormat: json_object`、`allowed_findings` 以外の id・金額は無視。

解析本体は `buildDdFlagsFromCompany`（テンプレ findings の決定的変換）。実ファイル突合エンジンではない。

## Managed Trial 取得

発行 UI は各デモに持たない。**共通飛ばし先は Studio `/admin/trial`。**

| 役割 | URL |
|------|-----|
| 体験コード取得（正） | `VITE_TRIAL_PORTAL_URL` → Studio `/admin/trial` |
| 現行本番 | `https://ai-demo-studio-lime.vercel.app/admin/trial` |

catalog id: `dd-diagnosis`（`?demo=dd-diagnosis&return=…/ai`）

## 環境変数

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-nano
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TRIAL_DEFAULT_MODEL=gpt-5-nano
VITE_TRIAL_PORTAL_URL=https://ai-demo-studio-lime.vercel.app/admin/trial
```

Studio と **同じ Upstash** を共有する想定。

## 主なパス

| 領域 | パス |
|------|------|
| 企業データ | `src/data/ma-demo-companies.json`, `ma-companies.ts` |
| EXIT計算 | `src/ai/scenario/exit-model.ts` |
| DDフラグ生成 | `src/ai/scenario/build-dd-flags.ts` |
| Client 合成 | `src/ai/scenario/build-client-company.ts` |
| Scenario UI | `ClientCompanyForm`, `ClientDdSetupPanel`, `DdFlagReport`, `DdFollowupAsk` |
| AI A/B | `runDdReport.ts`, `askDdFollowup.ts`, `adapters/dd-report-*`, `dd-ask-*` |
| AI C | `runDiagnosis.ts`, `adapters/dd-input.ts`, `dd-output.ts` |
| Access | `src/access/`, `src/components/access/` |
| Vendor Core | `@axeon/ai-demo-core`（Phase 5 で vendor 廃止） |
| Trial API | `api/trial/ask.ts`, `api/trial/status.ts` |

## 受け入れチェック

- [x] `npm run build` 成功
- [ ] `/` ストーリーデモ回帰（リンク「AI診断デモ →」動作）
- [ ] `/ai` サンプル: ナレッジパネル非表示・5社切替・EXIT即時更新
- [ ] `/ai` 自社: 設定 → prior／データルーム → 解析 → フラグカード表示
- [ ] `/ai` 自社: 解析後に EXIT ダッシュボードが表示される
- [ ] `/ai` 自社 BYOK/Trial: 自由質問が allowed_findings 根拠で回答
- [ ] サンプルモードで自由質問は詳細設定へ誘導
- [ ] 「体験コードを取得」が Studio `/admin/trial` を開く
- [ ] `/ai` → 「ストーリーデモへ」リンクが `/` を開く

## LOCAL DELTA（Studio / product_flow 逆マージ候補）

- vendor は product_flow 経由コピー（`responseFormat` / `temperature` 含む）
- DD 固有 Adapter / シナリオ UI はデモ側のみ
