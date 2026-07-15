/**
 * Vendor built @axeon/ai-demo-core into this demo repo for standalone Vercel deploys.
 *
 * Usage (from product_flow or dd_demo):
 *   node scripts/vendor-ai-demo-core.mjs
 *
 * Requires ../AI-Demo-Studio/packages/ai-demo-core (builds dist if missing).
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
const dest = path.join(root, "packages", "ai-demo-core");

if (!fs.existsSync(path.join(studioPkg, "package.json"))) {
  console.error("Studio package not found:", studioPkg);
  console.error("Run this from a workspace that has AI-Demo-Studio next to the demo.");
  process.exit(1);
}

const distDir = path.join(studioPkg, "dist");
if (!fs.existsSync(path.join(distDir, "index.js"))) {
  console.log("building Studio ai-demo-core…");
  execSync("npm run build", { cwd: studioPkg, stdio: "inherit" });
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, out) {
  fs.mkdirSync(out, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (name === "node_modules") continue;
    const from = path.join(src, name);
    const to = path.join(out, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

rmrf(dest);
fs.mkdirSync(path.join(dest, "dist"), { recursive: true });

const pkg = JSON.parse(
  fs.readFileSync(path.join(studioPkg, "package.json"), "utf8"),
);
// Vendored package is prebuilt — no tsup needed on Vercel.
delete pkg.scripts;
delete pkg.devDependencies;
fs.writeFileSync(
  path.join(dest, "package.json"),
  JSON.stringify(pkg, null, 2) + "\n",
);

copyDir(distDir, path.join(dest, "dist"));

if (fs.existsSync(path.join(studioPkg, "README.md"))) {
  fs.copyFileSync(
    path.join(studioPkg, "README.md"),
    path.join(dest, "README.md"),
  );
}

console.log("vendored →", path.relative(root, dest));
