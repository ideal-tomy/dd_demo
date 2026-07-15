# @axeon/ai-demo-core

Universal AI Demo Platform — shared Core (transport, Trial Gateway, Providers).

## Build

```bash
npm install
npm run build
```

Output: `dist/` (tsup ESM + `.d.ts`).

## Sync from Studio sources

When `lib/demo-core`, `lib/trial`, `lib/providers`, or shared `types` / `config` change in AI-Demo-Studio:

```bash
cd AI-Demo-Studio
node scripts/sync-ai-demo-core-package.mjs
cd packages/ai-demo-core && npm run build
```

Then re-run `npm run build` in each consuming demo.

## Consumers

- `AI-Demo-Studio` — `file:./packages/ai-demo-core`
- `product_flow` — `file:../AI-Demo-Studio/packages/ai-demo-core`
- `dd_demo` — `file:../AI-Demo-Studio/packages/ai-demo-core`

## Browser vs server imports

- **Browser:** `@axeon/ai-demo-core/demo-core`, `/demo-core/storage`, `/types/*`
- **Server (API routes):** `@axeon/ai-demo-core/trial/gateway`, `/trial/http`
- **Do not** import the package root from client bundles (includes `crypto`).

See `docs/porting-guide.md` and `docs/PHASE5_HANDOFF.md`.
