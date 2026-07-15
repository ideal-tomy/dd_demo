/**
 * Copy AI Demo Core vendor from product_flow (Phase 3 LOCAL DELTA 込み) into dd_demo.
 * Re-run after Studio → product_flow vendor updates.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.resolve(root, "../product_flow/src/vendor/ai-demo");
const dest = path.resolve(root, "src/vendor/ai-demo");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else {
      fs.copyFileSync(a, b);
      console.log("wrote", path.relative(dest, b));
    }
  }
}

if (!fs.existsSync(src)) {
  console.error("Missing source:", src);
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);

// Ensure DD storage / catalog id after refresh from product_flow ISO vendor
const demoCfgPath = path.join(dest, "config", "demo.config.ts");
fs.writeFileSync(
  demoCfgPath,
  `/**
 * Vendor mirror for dd_demo storage / knowledge limits.
 */
export const demoConfig = {
  id: "dd-diagnosis",
  defaultRoleId: "dd-analyst",
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
};
`,
);
console.log("patched config/demo.config.ts → dd-diagnosis");
console.log("done →", dest);
