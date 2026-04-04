#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Ring Promotion Logic
// Canary → Pilot → GA ring promotion with quality gates
// Usage: npx tsx scripts/release/ring-promotion.ts [--ring canary|pilot|ga] [--promote]
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { readJsonSafe, writeJsonOutput, envelope } from "../architecture/lib/utils";

const args = process.argv.slice(2);
const targetRing = args.find((_, i) => args[i - 1] === "--ring") || "canary";
const promote = args.includes("--promote");

interface RingGate {
  name: string;
  check: () => boolean;
  required: boolean;
}

const RING_GATES: Record<string, RingGate[]> = {
  canary: [
    { name: "Service manifest exists", check: () => fs.existsSync("generated/service-manifest.json"), required: true },
    { name: "Route manifest exists", check: () => fs.existsSync("generated/route-manifest.json"), required: true },
    { name: "Capability index exists", check: () => fs.existsSync("generated/capability-index.json"), required: true },
  ],
  pilot: [
    { name: "Architecture compliance", check: () => { const r = readJsonSafe<any>("generated/architecture-compliance-report.json"); return r?.summary?.score >= 50; }, required: true },
    { name: "Validation summary", check: () => fs.existsSync("generated/validation-summary.json"), required: true },
    { name: "Security review", check: () => fs.existsSync("generated/security-review-manifest.json"), required: true },
  ],
  ga: [
    { name: "Architecture score >= 80", check: () => { const r = readJsonSafe<any>("generated/architecture-compliance-report.json"); return r?.summary?.score >= 80; }, required: true },
    { name: "All delivery artifacts", check: () => fs.existsSync("generated/launch-tier-index.json") && fs.existsSync("generated/maturity-thresholds.json"), required: true },
    { name: "Ownership manifest", check: () => fs.existsSync("generated/ownership-manifest.json"), required: true },
  ],
};

const gates = RING_GATES[targetRing] || [];
const results = gates.map(g => ({ name: g.name, passed: g.check(), required: g.required }));
const allRequiredPassed = results.filter(r => r.required).every(r => r.passed);

console.log(`\n🔄 Ring: ${targetRing.toUpperCase()}`);
for (const r of results) {
  console.log(`  ${r.passed ? "✅" : "❌"} ${r.name}${r.required ? " (required)" : ""}`);
}

if (allRequiredPassed) {
  console.log(`\n✅ ${targetRing} ring gates passed`);
  if (promote) {
    const nextRing = targetRing === "canary" ? "pilot" : targetRing === "pilot" ? "ga" : "ga";
    console.log(`🚀 Promoting to ${nextRing}`);
    writeJsonOutput("generated/ring-promotion-status.json", envelope("1.0.0", {
      currentRing: targetRing,
      promotedTo: nextRing,
      promotedAt: new Date().toISOString(),
      gateResults: results,
    }));
  }
} else {
  console.log(`\n❌ ${targetRing} ring gates FAILED — cannot promote`);
  process.exit(1);
}
