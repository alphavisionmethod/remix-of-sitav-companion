#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6 Gate: Experimental Surface Isolation
//
// Routes mounted in src/routes/experimental-routes.tsx must NOT be
// referenced from launcher/command-palette/default-nav files. This
// gate prevents experimental surfaces from accidentally becoming
// part of the canonical launch surface count.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, scanDir } from "../lib/utils";

const vc = new ViolationCollector();
const EXPERIMENTAL_FILE = "src/routes/experimental-routes.tsx";

if (!fs.existsSync(EXPERIMENTAL_FILE)) {
  console.log("  ⚠️ experimental-routes.tsx not found — gate is a no-op.");
  vc.report("check-experimental-isolation");
  process.exit(0);
}

const ROUTE_RE = /<Route\s+[^>]*?path\s*=\s*["'`]([^"'`]+)["'`]/g;
const src = fs.readFileSync(EXPERIMENTAL_FILE, "utf8");
const experimentalPaths = new Set<string>();
let m: RegExpExecArray | null;
ROUTE_RE.lastIndex = 0;
while ((m = ROUTE_RE.exec(src)) !== null) experimentalPaths.add(m[1]);

console.log(`  🧪 ${experimentalPaths.size} experimental routes detected`);

const NAV_DIRS = ["src/components/launcher", "src/components/command-palette", "src/components/nav"];
const NAV_FILES: string[] = [];
for (const d of NAV_DIRS) {
  if (fs.existsSync(d)) NAV_FILES.push(...scanDir(d, [".tsx", ".ts"]));
}

let leaks = 0;
for (const file of NAV_FILES) {
  const body = fs.readFileSync(file, "utf8");
  for (const p of experimentalPaths) {
    // Match exact path inside a string literal.
    const re = new RegExp(`["'\`]${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
    if (re.test(body)) {
      vc.add(
        path.relative(process.cwd(), file),
        "experimental-leaked-to-nav",
        `Experimental route "${p}" referenced in nav/launcher surface — must be gated or moved to a canonical family.`,
      );
      leaks++;
    }
  }
}

console.log(`  🔎 Scanned ${NAV_FILES.length} nav/launcher files`);
console.log(`  ${leaks === 0 ? "✅" : "❌"} Leaks: ${leaks}`);

vc.report("check-experimental-isolation");
vc.exitIfErrors();
