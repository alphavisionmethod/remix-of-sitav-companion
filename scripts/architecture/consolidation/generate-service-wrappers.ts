#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Consolidation: Generate Service Wrappers
// For each validated duplicate pair, replaces services/ copy
// with a thin @lovable:migrated-wrapper re-export pointing
// to core-services/ canonical.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const WAVE = process.argv.find(a => a.startsWith("--wave="))?.split("=")[1] ?? "wave-1";

interface WrapperResult {
  pairName: string;
  coreServicesPath: string;
  servicesPath: string;
  action: "wrapped" | "skipped-missing" | "skipped-divergent" | "skipped-already-wrapper" | "dry-run";
  hashMatch: boolean;
  notes: string;
}

// Wave 1 pairs (low risk, likely identical)
const WAVE_1_PAIRS = [
  "ai-gateway", "ai-workforce", "biometric-auth", "canonical-pipeline",
  "capability-router", "event-bus", "flagship-loops", "frontend",
  "google-provider-family", "handoff", "launch-readiness", "life-simulation",
  "mnemosyne", "model-router", "projection-service", "self-healing",
  "service-registry", "system-updates", "truth-indices",
];

const WAVE_2_PAIRS = [
  "approval-engine", "conscience-gate", "epistemic-firewall", "identity-auth",
  "inference-gateway", "integration-hub", "memory-service",
  "recommendation-execution", "security", "verification-engine",
];

const WAVE_3_PAIRS = [
  "brain-core", "executor-service", "finance-os", "policy-engine",
  "receipt-service", "trust-governor", "workflow-engine",
];

const PAIRS_BY_WAVE: Record<string, string[]> = {
  "wave-1": WAVE_1_PAIRS,
  "wave-2": WAVE_2_PAIRS,
  "wave-3": WAVE_3_PAIRS,
};

const pairs = PAIRS_BY_WAVE[WAVE] ?? [];
if (pairs.length === 0) {
  console.log(`No pairs for wave: ${WAVE}`);
  process.exit(0);
}

function hashDir(dir: string): string {
  const h = createHash("sha256");
  if (!existsSync(dir)) return "";
  const entries = readdirSync(dir).sort();
  for (const e of entries) {
    const p = join(dir, e);
    try {
      const st = statSync(p);
      if (st.isFile()) h.update(readFileSync(p));
      // Skip subdirs for top-level comparison
    } catch {}
  }
  return h.digest("hex");
}

const results: WrapperResult[] = [];

for (const name of pairs) {
  const corePath = `src/lib/core-services/${name}`;
  const svcPath = `src/lib/services/${name}`;

  if (!existsSync(corePath) || !existsSync(svcPath)) {
    results.push({ pairName: name, coreServicesPath: corePath, servicesPath: svcPath, action: "skipped-missing", hashMatch: false, notes: "One or both paths missing" });
    continue;
  }

  // Check if services/ copy is already a wrapper
  const indexPath = join(svcPath, "index.ts");
  if (existsSync(indexPath)) {
    const content = readFileSync(indexPath, "utf8");
    if (content.includes("@lovable:migrated-wrapper")) {
      results.push({ pairName: name, coreServicesPath: corePath, servicesPath: svcPath, action: "skipped-already-wrapper", hashMatch: true, notes: "Already wrapped" });
      continue;
    }
  }

  const hCore = hashDir(corePath);
  const hSvc = hashDir(svcPath);
  const match = hCore === hSvc && hCore !== "";

  if (!match) {
    results.push({ pairName: name, coreServicesPath: corePath, servicesPath: svcPath, action: "skipped-divergent", hashMatch: false, notes: "Hash mismatch — manual analysis needed" });
    continue;
  }

  if (DRY_RUN) {
    results.push({ pairName: name, coreServicesPath: corePath, servicesPath: svcPath, action: "dry-run", hashMatch: true, notes: "Would replace with wrapper" });
    continue;
  }

  // Replace services/X/index.ts with wrapper
  const canonicalImport = `@/lib/core-services/${name}`;
  const wrapper = `// @lovable:migrated-wrapper\n/**\n * @deprecated Consolidated to ${canonicalImport} (zero-regression cleanup).\n * This wrapper exists for back-compat and will be removed once all consumers migrate.\n */\nexport * from "${canonicalImport}";\n`;

  if (existsSync(indexPath)) {
    writeFileSync(indexPath, wrapper);
  }

  results.push({ pairName: name, coreServicesPath: corePath, servicesPath: svcPath, action: "wrapped", hashMatch: true, notes: "Successfully wrapped" });
  console.log(`  ✓ ${svcPath} → ${canonicalImport}`);
}

mkdirSync("generated/lib-remediation", { recursive: true });
writeFileSync(
  `generated/lib-remediation/service-wrapper-${WAVE}.json`,
  JSON.stringify({ generatedAt: new Date().toISOString(), wave: WAVE, dryRun: DRY_RUN, results }, null, 2),
);

const wrapped = results.filter(r => r.action === "wrapped" || r.action === "dry-run").length;
console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}${WAVE}: ${wrapped}/${pairs.length} pairs processed`);