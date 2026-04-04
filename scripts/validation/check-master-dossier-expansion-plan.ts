#!/usr/bin/env node
// SITA OS — Master Dossier Expansion Plan Tracker
import { ViolationCollector, readJsonSafe } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const expansion = readJsonSafe<any>("generated/master-dossier-expansion-status.json");
if (!expansion) { console.log("⚠️ master-dossier-expansion-status.json not found — skipping"); process.exit(0); }
const items = expansion.expansions || expansion.entries || [];
let planned = 0, done = 0;
for (const item of items) {
  if (item.status === "done" || item.complete) done++;
  else planned++;
}
console.log(`  📊 Dossier expansion: ${done}/${items.length} done, ${planned} remaining`);
vc.report("check-master-dossier-expansion-plan");
vc.exitIfErrors();
