#!/usr/bin/env node
// SITA OS — Receipt Coverage Validator
import { ViolationCollector, readJsonSafe, loadCapabilityIndex } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const receiptMatrix = readJsonSafe<any>("generated/capability-receipt-matrix.json");
const capIndex = loadCapabilityIndex();
if (!receiptMatrix) { console.log("⚠️ capability-receipt-matrix.json not found — skipping"); process.exit(0); }
const matrix = receiptMatrix.matrix || [];
let covered = 0, uncovered = 0;
for (const entry of matrix) {
  const receipts = entry.receipts || entry.receiptTypes || [];
  if (receipts.length > 0) covered++;
  else {
    uncovered++;
    vc.add("capability-receipt-matrix.json", "no-receipt", `"${entry.capabilityId}" has no receipt`, "warning");
  }
}
console.log(`  🧾 ${covered}/${matrix.length} capabilities have receipts`);
vc.report("check-receipt-coverage");
vc.exitIfErrors();
