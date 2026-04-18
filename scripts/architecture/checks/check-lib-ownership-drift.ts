#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Check: src/lib Ownership Drift
// Fails CI if new non-allowlisted files appear under src/lib/.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir } from "../lib/utils";

const vc = new ViolationCollector();
const ROOT = process.cwd();

// Files allowed to live under src/lib/ post-decomposition
const ALLOWLIST_PREFIXES = [
  "src/lib/utils.ts",
  "src/lib/utils/",
  "src/lib/internal/",
  "src/lib/__tests__/",
  "src/lib/hooks/",
];

// Wrapper map authorizes existing legacy paths
const WRAPPER_MAP_PATH = path.join(ROOT, "generated/lib-decomposition/src-lib-wrapper-map.json");
const allowedWrappers = new Set<string>();
if (fs.existsSync(WRAPPER_MAP_PATH)) {
  const map = JSON.parse(fs.readFileSync(WRAPPER_MAP_PATH, "utf8"));
  for (const w of map.wrappers ?? []) allowedWrappers.add(w.oldPath);
}

const libFiles = scanDir("src/lib", [".ts", ".tsx"]);
let drift = 0;
for (const f of libFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const allowed =
    ALLOWLIST_PREFIXES.some(p => rel === p || rel.startsWith(p)) ||
    allowedWrappers.has(rel);
  if (!allowed) {
    drift++;
    if (drift <= 25) {
      vc.add(rel, "lib-ownership-drift",
        "File added under src/lib/ but is not in the allowlist or wrapper map. Move to canonical home (src/domains, src/platform, src/runtimes, src/data, src/integrations, src/contracts).",
        "warning");
    }
  }
}

console.log(`  📂 Scanned ${libFiles.length} src/lib files; ${drift} potential drift entries`);
vc.report("check-lib-ownership-drift");
vc.exitIfErrors();
