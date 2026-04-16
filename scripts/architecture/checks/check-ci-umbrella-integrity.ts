#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Umbrella Integrity Gate (Phase 8)
// PR-blocking. Validates the canonical CI gate registry:
//   • Unique gate IDs
//   • Bounded-context refs resolve
//   • Every registered script exists on disk
//   • Trigger / blocking semantics are coherent
//   • If a producesArtifact is declared and the file exists,
//     it must be valid JSON (when not a markdown report)
// Also writes generated/ci-umbrella-manifest.json.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, writeJsonOutput, envelope, readJsonSafe } from "../lib/utils";

// We import via the Vite alias-free path: tsx supports tsconfig paths,
// but to keep this script self-contained we re-import the data files
// directly. The registry & validator are pure data and have no React/DOM
// dependencies.
import { CI_GATE_REGISTRY } from "../../../src/lib/ci/ci-gate-registry";
import { validateCIUmbrellaIntegrity } from "../../../src/lib/ci/ci-umbrella-integrity";
import { computeCIUmbrellaSnapshot } from "../../../src/lib/ci/ci-umbrella-evaluator";

const vc = new ViolationCollector();

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(path.resolve(process.cwd(), p));
  } catch {
    return false;
  }
}

// ── 1. Pure-data integrity ───────────────────────────────────
const report = validateCIUmbrellaIntegrity(fileExists);
for (const issue of report.issues) {
  vc.add(
    issue.gateId ?? "ci-registry",
    issue.kind,
    issue.message,
    issue.severity === "error" ? "error" : "warning"
  );
}

// ── 2. Verify produced JSON artifacts parse (when present) ──
for (const g of CI_GATE_REGISTRY) {
  if (!g.producesArtifact) continue;
  if (!g.producesArtifact.endsWith(".json")) continue;
  if (!fileExists(g.producesArtifact)) continue; // generator may not have run; not fatal here
  const data = readJsonSafe(g.producesArtifact);
  if (!data) {
    vc.add(
      g.gateId,
      "invalid-artifact",
      `Gate "${g.gateId}" producesArtifact "${g.producesArtifact}" is invalid JSON`,
      "error"
    );
  }
}

// ── 3. Emit umbrella manifest ───────────────────────────────
const snapshot = computeCIUmbrellaSnapshot();
writeJsonOutput(
  "generated/ci-umbrella-manifest.json",
  envelope("1.0.0", {
    summary: snapshot.totals,
    phases: snapshot.phases,
    gates: snapshot.gates,
    integrity: {
      ok: report.ok,
      errorCount: report.errorCount,
      warningCount: report.warningCount,
      issues: report.issues,
    },
  })
);

console.log(
  `  📊 CI Umbrella: ${snapshot.totals.gates} gates · ${snapshot.totals.blockers} blockers · ${snapshot.totals.releaseBlocking} release-blocking · ${snapshot.totals.mergeBlocking} merge-blocking`
);
console.log(
  `  📊 Integrity: ${report.errorCount} errors, ${report.warningCount} warnings`
);

vc.report("check-ci-umbrella-integrity");
vc.exitIfErrors();
