#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Failure Normalization
// Reads verification-graph.json, classifies every failed check,
// extracts impacted files, emits failure-report.json
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { classifyFailure } from "./lib/repo-failure-classifier.mjs";

const GRAPH = path.resolve("generated/self-healing/verification-graph.json");
const OUT_DIR = path.resolve("generated/self-healing");
const OUT = path.join(OUT_DIR, "failure-report.json");

if (!existsSync(GRAPH)) {
  console.error(`[normalize] missing ${GRAPH}; run run-full-verification first.`);
  process.exit(1);
}

const FILE_PATTERNS = [
  /(?:^|\s|["'`])((?:src|scripts|supabase|tests|generated|config|public)\/[\w./@-]+\.(?:tsx?|jsx?|mjs|json|sql|md|css|html))/g,
];

function extractImpactedFiles(text) {
  const files = new Set();
  for (const pat of FILE_PATTERNS) {
    let m;
    while ((m = pat.exec(text)) !== null) {
      const f = m[1];
      if (f && !f.includes("node_modules")) files.add(f);
    }
  }
  return [...files].slice(0, 20);
}

function ownerFor(file) {
  if (file.startsWith("supabase/")) return "backend";
  if (file.startsWith("src/pages/")) return "frontend-pages";
  if (file.startsWith("src/services/")) return "services";
  if (file.startsWith("src/lib/")) return "platform";
  if (file.startsWith("scripts/")) return "tooling";
  if (file.startsWith("generated/")) return "generated";
  if (file.startsWith("config/")) return "config";
  return "uncategorized";
}

function severityFor(criticality, cls) {
  if (criticality === "release-blocker") return "critical";
  if (cls === "auth-boundary-regression") return "critical";
  if (criticality === "high") return "high";
  return "normal";
}

const graph = JSON.parse(readFileSync(GRAPH, "utf8"));
const failures = [];

for (const check of graph.checks) {
  if (!check.result || (check.result.status !== "fail" && check.result.status !== "timeout")) continue;

  const text = `${check.result.stdout}\n${check.result.stderr}`;
  const cls = classifyFailure({
    stdout: check.result.stdout,
    stderr: check.result.stderr,
    checkId: check.id,
    subsystem: check.subsystem,
  });
  const impactedFiles = extractImpactedFiles(text);
  const impactedOwners = [...new Set(impactedFiles.map(ownerFor))];

  failures.push({
    failureId: "fail_" + crypto.randomBytes(8).toString("hex"),
    checkId: check.id,
    subsystem: check.subsystem,
    criticality: check.criticality,
    severity: severityFor(check.criticality, cls.class),
    normalizedClass: cls.class,
    rootCauseConfidence: cls.confidence,
    repairFamily: cls.suggestedRepairFamily,
    signals: cls.signals,
    impactedFiles,
    impactedOwners,
    durationMs: check.result.durationMs,
    rawSnippet: text.slice(-2000),
    suggestedValidationScope: scopeFor(cls.class, impactedFiles),
    flakeSuspicion: cls.class === "flaky-test" || cls.class === "external-dep-unavailable",
    reproducibilityStatus: "untested", // Phase 3 will fill this
  });
}

function scopeFor(cls, files) {
  if (cls === "auth-boundary-regression") return "repo";
  if (cls === "release-readiness-mismatch") return "repo";
  if (cls === "stale-generated" || cls === "manifest-drift") return "subsystem";
  if (files.length === 1) return "file";
  if (files.length <= 5) return "package";
  return "subsystem";
}

mkdirSync(OUT_DIR, { recursive: true });
const report = {
  schema: "self-healing/failure-report@1",
  generatedAt: new Date().toISOString(),
  sourceGraph: GRAPH,
  totals: {
    failedChecks: failures.length,
    byClass: failures.reduce((acc, f) => ({ ...acc, [f.normalizedClass]: (acc[f.normalizedClass] || 0) + 1 }), {}),
    bySeverity: failures.reduce((acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] || 0) + 1 }), {}),
    byRepairFamily: failures.reduce((acc, f) => ({ ...acc, [f.repairFamily]: (acc[f.repairFamily] || 0) + 1 }), {}),
  },
  failures,
};
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`[normalize] ${failures.length} failures → ${OUT}`);