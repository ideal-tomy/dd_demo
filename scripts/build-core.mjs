/**
 * On Vercel / standalone CI: skip when Studio sibling is absent (use vendored package).
 * Locally: rebuild Studio core then re-vendor into ./packages/ai-demo-core.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const studioPkg = path.resolve(
  root,
  "../AI-Demo-Studio/packages/ai-demo-core",
);
const vendored = path.join(root, "packages", "ai-demo-core", "package.json");

if (!fs.existsSync(path.join(studioPkg, "package.json"))) {
  if (!fs.existsSync(vendored)) {
    console.error(
      "Missing @axeon/ai-demo-core. Commit packages/ai-demo-core or run vendor-ai-demo-core.mjs locally.",
    );
    process.exit(1);
  }
  console.log("build:core skipped (using vendored packages/ai-demo-core)");
  process.exit(0);
}

execSync("npm run build", { cwd: studioPkg, stdio: "inherit" });
execSync("node scripts/vendor-ai-demo-core.mjs", { cwd: root, stdio: "inherit" });
