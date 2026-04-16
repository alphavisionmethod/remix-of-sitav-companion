#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin IA Check
// Validates admin information architecture consistency
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const adminPages = scanDir("src/pages/admin", [".tsx"]);
console.log(`  📊 ${adminPages.length} admin pages found`);

// Check admin shell exists
const shellPath = "src/components/admin/shells/AdminControlPlaneShell.tsx";
if (!fs.existsSync(shellPath)) {
  vc.add(shellPath, "missing-shell", "Admin control plane shell not found");
} else {
  console.log("  🐚 Admin control plane shell found");
}

// Check admin nav exists
const navPath = "src/components/admin/shells/AdminPrimaryNav.tsx";
if (!fs.existsSync(navPath)) {
  vc.add(navPath, "missing-nav", "Admin primary nav not found", "warning");
}

// Verify admin pages use the shell
let usingShell = 0;
for (const page of adminPages) {
  const content = fs.readFileSync(page, "utf-8");
  if (content.includes("AdminControlPlaneShell") || content.includes("AdminShell")) {
    usingShell++;
  }
}
console.log(`  🏗️ ${usingShell}/${adminPages.length} admin pages use a shell wrapper`);

vc.report("check-admin-ia");
vc.exitIfErrors();
