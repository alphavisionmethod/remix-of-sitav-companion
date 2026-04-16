#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Appliance Isolation Check
// Appliance-runtime modules must not be imported by web-only paths.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, extractImports } from "../../architecture/lib/utils";

const vc = new ViolationCollector();

const APPLIANCE_PREFIXES = [
  "@/lib/runtime/appliance/",
  "@/runtimes/appliance/",
  "src/lib/runtime/appliance/",
];

const pageFiles = scanDir("src/pages", [".tsx", ".ts"]);

let scanned = 0;
let violations = 0;

for (const file of pageFiles) {
  scanned++;
  // Only flag plain web pages (skip mobile/desktop/admin which may legitimately reference appliance)
  if (file.includes("/admin/") || file.includes("/owner/") || file.includes("/mission-control/")) continue;
  const imports = extractImports(file);
  for (const imp of imports) {
    for (const prefix of APPLIANCE_PREFIXES) {
      if (imp.source.startsWith(prefix)) {
        violations++;
        vc.add(file, "appliance-leak", `Web page imports appliance module "${imp.source}". Route through TierGate.`, "warning");
      }
    }
  }
}

console.log(`  📦 ${scanned} pages scanned, ${violations} appliance-isolation breaches`);

vc.report("check-appliance-isolation");
vc.exitIfErrors();
