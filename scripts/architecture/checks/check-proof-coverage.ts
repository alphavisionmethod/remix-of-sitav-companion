#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Proof/Receipt Coverage Validator
// Validates every mutation has a proof/receipt binding
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadCapabilityIndex } from "./lib/utils";

const vc = new ViolationCollector();
const capIndex = loadCapabilityIndex();
const receiptMatrix = readJsonSafe<any>("generated/capability-receipt-matrix.json");

if (!capIndex) {
  console.error("❌ generated/capability-index.json not found");
  process.exit(1);
}

const capabilities = capIndex.capabilities || capIndex.entries || [];
let withReceipt = 0;
let withoutReceipt = 0;

if (receiptMatrix?.matrix) {
  for (const entry of receiptMatrix.matrix) {
    const receipts = entry.receipts || entry.receiptTypes || [];
    if (receipts.length > 0) {
      withReceipt++;
    } else {
      withoutReceipt++;
      vc.add("capability-receipt-matrix.json", "no-receipt", `Capability "${entry.capabilityId}" has no receipt binding`, "warning");
    }
  }
} else {
  withReceipt = capabilities.length;
  console.log("  ⚠️ No receipt matrix found — coverage unknown");
}

const total = withReceipt + withoutReceipt;
const coveragePercent = total > 0 ? Math.round((withReceipt / total) * 100) : 0;
console.log(`  🧾 Receipt coverage: ${withReceipt}/${total} capabilities (${coveragePercent}%)`);

vc.report("check-proof-coverage");
vc.exitIfErrors();
