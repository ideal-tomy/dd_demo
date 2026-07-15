# Phase 4 完了 — DD診断（フォーム型）運用・受け入れ

`dd_demo` に企業フォーム → 構造化 JSON → 診断セクション UI を追加。  
既存の簿外債務演出デモ（`/`）は変更最小で併存。AI は `/ai`。

## 画面

| Path | 内容 |
|------|------|
| `/` | 既存 Vanilla 演出デモ |
| `/ai`（`ai.html`） | React フォーム診断（サンプル / BYOK / Trial） |

## 体験モード（/ai）

| モード | 動作 |
|--------|------|
| サンプル | 固定 `SAMPLE_RESULT`（API 不要） |
| APIキー | ブラウザ BYOK → `sendAiRequest` → DD Output Adapter |
| 体験コード | `/api/trial/ask` → Gateway（OpenAI のみ） |

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
| Form / Result UI | `src/components/DiagnosisPanels.tsx` |
| Input / Output Adapter | `src/ai/adapters/dd-input.ts`, `dd-output.ts` |
| Engine | `src/ai/runDiagnosis.ts` |
| Access | `src/access/`, `src/components/access/` |
| Vendor Core | `src/vendor/ai-demo/` |
| Trial API | `api/trial/ask.ts`, `api/trial/status.ts` |
| Dev middleware | `vite.dd-api.ts` |
| Vendor sync | `npm run copy-vendor` |

## 受け入れチェック

- [x] `npm run build` 成功
- [ ] `/` 演出デモ回帰（リンク「AI診断デモ →」動作）
- [ ] `/ai` sample で7セクション表示
- [ ] `/ai` BYOK（OpenAI）で構造化 JSON → 表示
- [ ] `/ai` Trial: ポータル発行 → 残回数＋回答
- [ ] 「体験コードを取得」が Studio `/admin/trial` を開く

## LOCAL DELTA（Studio / product_flow 逆マージ候補）

- vendor は product_flow 経由コピー（`responseFormat` / `temperature` 含む）
- DD 固有 Adapter / フォーム UI はデモ側のみ
