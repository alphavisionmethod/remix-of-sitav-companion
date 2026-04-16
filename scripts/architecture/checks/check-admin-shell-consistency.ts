#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Shell Consistency Check
// Validates all admin pages use the canonical shell
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();
const CANONICAL_SHELL = "AdminControlPlaneShell";

const adminPages = scanDir("src/pages/admin", [".tsx"]);
let usingCanonical = 0;
let usingLegacy = 0;
let noShell = 0;

for (const page of adminPages) {
  const content = fs.readFileSync(page, "utf-8");
  if (content.includes(CANONICAL_SHELL)) {
    usingCanonical++;
  } else if (content.includes("AdminShell")) {
    usingLegacy++;
    vc.add(page, "legacy-shell", `Uses legacy AdminShell instead of ${CANONICAL_SHELL}`, "warning");
  } else {
    noShell++;
  }
}

console.log(`  ✅ ${usingCanonical} pages use canonical shell`);
console.log(`  ⚠️ ${usingLegacy} pages use legacy shell`);
console.log(`  ❓ ${noShell} pages have no shell wrapper`);

vc.report("check-admin-shell-consistency");
vc.exitIfErrors();
