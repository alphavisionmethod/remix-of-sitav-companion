#!/usr/bin/env node
/* eslint-disable no-console */
// WARN-tier validator: asserts every check-*.ts under scripts/architecture/checks/
// has a declared classification + consumer in the validator-gate-map.
//
// Floor: 80% coverage (errors below floor; warnings between floor and target).
// Target: 95% coverage.
//
// Does NOT join REQUIRED_GATES — it's an advisory drift detector. It writes
// generated/validator-gate-coverage-report.json so the readiness aggregator
// surfaces its state.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report.js";

const MAP_FILE = join("generated", "validator-gate-map.json");
const FLOOR = 80;
const TARGET = 95;

const issues: GateIssue[] = [];

if (!existsSync(MAP_FILE)) {
  issues.push({
    severity: "error",
    area: "manifest",
    message: `Missing ${MAP_FILE}. Run \`npm run generate:validator-gate-map\` first.`,
  });
  emitGateReport({ gate: "validator-gate-coverage", ok: false, issues });
  console.error("❌ validator-gate-map.json missing");
  process.exit(1);
}

const map = JSON.parse(readFileSync(MAP_FILE, "utf8")) as {
  totalValidators: number;
  blockCount: number;
  warnCount: number;
  advisoryCount: number;
  disabledCount: number;
  archivedCount: number;
  classified: number;
  unclassified: number;
  coveragePercent: number;
  entries: Array<{
    validator: string;
    gateId: string;
    classification: string;
    consumer: string;
    bucket?: string;
    killSwitchRef?: string;
    declaredInRegistry: boolean;
    hasReportArtifact: boolean;
  }>;
};

// Rule 1 — coverage floor.
if (map.coveragePercent < FLOOR) {
  issues.push({
    severity: "error",
    area: "coverage",
    message: `Validator classification coverage is ${map.coveragePercent}% (< floor ${FLOOR}%). ` +
      `${map.unclassified} validators have no declared consumer.`,
  });
} else if (map.coveragePercent < TARGET) {
  issues.push({
    severity: "warning",
    area: "coverage",
    message: `Validator classification coverage is ${map.coveragePercent}% (< target ${TARGET}%). ` +
      `${map.unclassified} validators are advisory-only without a registry override.`,
  });
}

// Rule 2 — every "block" entry's gateId must appear in REQUIRED_GATES (we re-parse).
const READINESS = "scripts/architecture/checks/check-os-release-readiness.ts";
const readinessSrc = existsSync(READINESS) ? readFileSync(READINESS, "utf8") : "";
const requiredMatch = readinessSrc.match(/REQUIRED_GATES\s*=\s*\[([\s\S]*?)\]/);
const requiredSet = new Set(
  requiredMatch ? Array.from(requiredMatch[1].matchAll(/"([a-z0-9-]+)"/g)).map((x) => x[1]) : [],
);

for (const entry of map.entries) {
  if (entry.classification === "block" && !requiredSet.has(entry.gateId)) {
    issues.push({
      severity: "error",
      area: "block-mismatch",
      message: `Validator \`${entry.validator}\` is classified \`block\` but gateId \`${entry.gateId}\` is NOT in REQUIRED_GATES.`,
    });
  }

  // Rule 3 — every "warn" entry should declare a bucket.
  if (entry.classification === "warn" && !entry.bucket) {
    issues.push({
      severity: "warning",
      area: "warn-no-bucket",
      message: `Validator \`${entry.validator}\` is \`warn\` but has no declared bucket.`,
    });
  }

  // Rule 4 — archived validators must not live under scripts/architecture/checks/.
  if (entry.classification === "archived") {
    issues.push({
      severity: "error",
      area: "archived-in-place",
      message: `Validator \`${entry.validator}\` is classified \`archived\` but still lives under scripts/architecture/checks/. Move it to archive/.`,
    });
  }

  // Rule 5 — disabled validators must cite a kill-switch ref.
  if (entry.classification === "disabled" && !entry.killSwitchRef) {
    issues.push({
      severity: "error",
      area: "disabled-no-killswitch",
      message: `Validator \`${entry.validator}\` is \`disabled\` but does not cite a kill-switch ref.`,
    });
  }
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

emitGateReport({
  gate: "validator-gate-coverage",
  ok,
  issues,
  extra: {
    totalValidators: map.totalValidators,
    blockCount: map.blockCount,
    warnCount: map.warnCount,
    advisoryCount: map.advisoryCount,
    disabledCount: map.disabledCount,
    archivedCount: map.archivedCount,
    coveragePercent: map.coveragePercent,
    floor: FLOOR,
    target: TARGET,
  },
});

console.log(
  `validator-gate-coverage: ${ok ? "✅" : "❌"} ` +
    `coverage=${map.coveragePercent}% block=${map.blockCount} warn=${map.warnCount} advisory=${map.advisoryCount} ` +
    `errors=${errorCount} warnings=${warningCount}`,
);
process.exit(ok ? 0 : 1);
