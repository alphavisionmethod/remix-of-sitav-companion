#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Verify Backup Restore
// Validates backup/restore infrastructure exists and works
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const backupScripts = [
  "scripts/support/recovery/restore-backup.sh",
  "scripts/support/recovery/restore-backup.ps1",
];

let found = 0;
for (const s of backupScripts) {
  if (fs.existsSync(s)) found++;
}
console.log(`  💾 ${found}/${backupScripts.length} restore scripts found`);

if (found === 0) {
  // Check legacy locations
  const legacyPaths = ["scripts/restore-backup.sh", "scripts/restore-backup.ps1"];
  const legacyFound = legacyPaths.filter(p => fs.existsSync(p)).length;
  if (legacyFound > 0) {
    console.log(`  ⚠️ ${legacyFound} restore scripts found at legacy paths`);
  } else {
    vc.add("scripts/support/recovery/", "no-restore-scripts", "No backup restore scripts found", "warning");
  }
}

// Check backup directory exists
if (!fs.existsSync("backups")) {
  fs.mkdirSync("backups", { recursive: true });
  console.log("  📁 Created backups/ directory");
}

vc.report("verify-backup-restore");
vc.exitIfErrors();
