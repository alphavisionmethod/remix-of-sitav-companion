#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 4 — Release Decision Persistence Validator (WARN initially).
// Verifies the master release aggregator wrote a release_decisions row in
// the most recent run. Reads generated/release-decision-snapshot.json which
// the aggregator emits after persisting to DB.
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface Issue {
  severity: "error" | "warning";
  area: string;
  message: string;
}

const issues: Issue[] = [];
const snapshotPath = "generated/release-decision-snapshot.json";
const MAX_AGE_HOURS = 24;

let lastDecidedAt: string | null = null;
let lastDecision: string | null = null;
let lastReleaseId: string | null = null;

if (!existsSync(snapshotPath)) {
  issues.push({
    severity: "warning",
    area: "release-decision",
    message: "release-decision-snapshot.json not yet produced — validator in WARN mode until first aggregator run",
  });
} else {
  try {
    const snap = JSON.parse(readFileSync(snapshotPath, "utf8"));
    lastDecidedAt = snap?.last_decided_at ?? null;
    lastDecision = snap?.last_decision ?? null;
    lastReleaseId = snap?.last_release_id ?? null;

    if (!lastDecidedAt) {
      issues.push({ severity: "warning", area: "release-decision", message: "snapshot present but missing last_decided_at" });
    } else {
      const ageHours = (Date.now() - new Date(lastDecidedAt).getTime()) / (1000 * 60 * 60);
      if (ageHours > MAX_AGE_HOURS) {
        issues.push({
          severity: "warning",
          area: "release-decision",
          message: `last release decision is ${ageHours.toFixed(1)}h old (> ${MAX_AGE_HOURS}h)`,
        });
      }
    }
  } catch (e) {
    issues.push({ severity: "warning", area: "release-decision", message: `Parse failure: ${(e as Error).message}` });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

mkdirSync("generated", { recursive: true });
writeFileSync(
  join("generated", "release-decision-persistence-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "release-decision-persistence",
      ok,
      errorCount,
      warningCount,
      lastDecidedAt,
      lastDecision,
      lastReleaseId,
      maxAgeHours: MAX_AGE_HOURS,
      issues,
    },
    null,
    2,
  ),
);

console.log(`release-decision-persistence: ${errorCount} errors, ${warningCount} warnings (last=${lastDecision ?? "none"})`);
process.exit(errorCount === 0 ? 0 : 1);
