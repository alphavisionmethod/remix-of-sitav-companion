#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate: Duplicate Service Pair Detection
// Scans core-services/ and services/ for undeclared overlaps.
// Blocks merge if an unknown pair appears.
// ═══════════════════════════════════════════════════════════════

import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CORE = "src/lib/core-services";
const SERVICES = "src/lib/services";
const OUT = "generated/duplicate-service-pairs-report.json";

// Known declared pairs (from duplicate-service-registry.ts)
const DECLARED_PAIRS = new Set([
  "README.md", "__tests__", "index.ts", "architecture",
  "ai-gateway", "ai-workforce", "approval-engine", "biometric-auth",
  "brain-core", "canonical-pipeline", "capability-router", "ci-launch-gate-service",
  "conscience-gate", "connector-health-service", "epistemic-firewall", "event-bus",
  "executor-service", "finance-os", "flagship-loops", "frontend",
  "google-provider-family", "handoff", "identity-auth", "inference-gateway",
  "integration-hub", "launch-readiness", "life-simulation", "memory-service",
  "mnemosyne", "model-router", "policy-engine", "projection-service",
  "receipt-service", "recommendation-execution", "security", "self-healing",
  "service-registry", "system-updates", "trust-governor", "truth-indices",
  "verification-engine", "workflow-engine",
]);

function listEntries(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir);
}

const coreEntries = new Set(listEntries(CORE));
const serviceEntries = new Set(listEntries(SERVICES));
const overlap = [...coreEntries].filter(e => serviceEntries.has(e));
const undeclared = overlap.filter(e => !DECLARED_PAIRS.has(e));

mkdirSync("generated", { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  gate: "duplicate-service-pairs",
  coreServicesCount: coreEntries.size,
  servicesCount: serviceEntries.size,
  overlapCount: overlap.length,
  declaredCount: overlap.length - undeclared.length,
  undeclaredCount: undeclared.length,
  undeclaredPairs: undeclared,
  ok: undeclared.length === 0,
  errorCount: undeclared.length,
  warningCount: 0,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));

if (undeclared.length > 0) {
  console.error(`❌ duplicate-service-pairs: ${undeclared.length} undeclared overlap(s):`);
  for (const u of undeclared) console.error(`  - ${u}`);
  console.error("Add these to DUPLICATE_SERVICE_PAIRS in duplicate-service-registry.ts");
  process.exit(1);
} else {
  console.log(`✓ duplicate-service-pairs: ${overlap.length} pairs, all declared`);
  process.exit(0);
}