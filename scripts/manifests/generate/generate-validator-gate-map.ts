#!/usr/bin/env node
/* eslint-disable no-console */
// Auto-discovery generator for the canonical Validator-to-Gate Map.
//
// Scans scripts/architecture/checks/check-*.ts on disk, cross-references:
//   - REQUIRED_GATES in scripts/architecture/checks/check-os-release-readiness.ts
//   - GATES in scripts/architecture/checks/run-all-deployment-gap-gates.ts
//   - VALIDATOR_GATE_OVERRIDES from src/lib/ci/validator-gate-map.ts
// and emits generated/validator-gate-map.json.
//
// Output shape:
// {
//   generatedAt, totalValidators,
//   blockCount, warnCount, advisoryCount, disabledCount, archivedCount,
//   classified, unclassified, coveragePercent,
//   entries: [{ validator, gateId, classification, consumer, bucket?,
//               declaredInRegistry, lastModifiedAt, hasReportArtifact }]
// }

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { VALIDATOR_GATE_OVERRIDE_INDEX, type ValidatorClassification, type ValidatorConsumer } from "../../../src/lib/ci/validator-gate-map.js";

const CHECKS_DIR = "scripts/architecture/checks";
const READINESS_FILE = join(CHECKS_DIR, "check-os-release-readiness.ts");
const DEP_GAP_FILE = join(CHECKS_DIR, "run-all-deployment-gap-gates.ts");
const GENERATED_DIR = "generated";

interface MapEntry {
  validator: string;
  gateId: string;
  classification: ValidatorClassification;
  consumer: ValidatorConsumer;
  bucket?: string;
  killSwitchRef?: string;
  declaredInRegistry: boolean;
  lastModifiedAt: string;
  hasReportArtifact: boolean;
  rationale: string;
}

function extractStringArray(source: string, varName: string): string[] {
  // Match: const VARNAME[: type] = [ ... ]; — non-greedy single block.
  const re = new RegExp(`${varName}\\s*(?::[^=]+)?=\\s*\\[([\\s\\S]*?)\\]`, "m");
  const m = source.match(re);
  if (!m) return [];
  return Array.from(m[1].matchAll(/"([a-z0-9][a-z0-9-]*)"/g)).map((x) => x[1]);
}

// 1. Discover validators on disk.
const validatorFiles = readdirSync(CHECKS_DIR)
  .filter((f) => f.startsWith("check-") && f.endsWith(".ts"))
  .map((f) => f.replace(/\.ts$/, ""))
  .sort();

// 2. Parse REQUIRED_GATES + WARN buckets from the aggregator.
const readinessSrc = existsSync(READINESS_FILE) ? readFileSync(READINESS_FILE, "utf8") : "";
const REQUIRED_GATES = extractStringArray(readinessSrc, "REQUIRED_GATES");
const MOBILE_WARN_GATES = extractStringArray(readinessSrc, "MOBILE_WARN_GATES");
const ADMIN_AI_ENGINEER_WARN_GATES = extractStringArray(readinessSrc, "ADMIN_AI_ENGINEER_WARN_GATES");
const requiredSet = new Set(REQUIRED_GATES);
const mobileWarnSet = new Set(MOBILE_WARN_GATES);
const adminWarnSet = new Set(ADMIN_AI_ENGINEER_WARN_GATES);

// 3. Parse deployment-gap suite (validator basenames, not gate ids).
const depGapSrc = existsSync(DEP_GAP_FILE) ? readFileSync(DEP_GAP_FILE, "utf8") : "";
const depGapSet = new Set(
  Array.from(depGapSrc.matchAll(/"(check-[a-z][a-z0-9-]*)"/g)).map((m) => m[1]),
);

// 4. Existing report artifacts (for hasReportArtifact flag).
const reportFiles = existsSync(GENERATED_DIR)
  ? new Set(
      readdirSync(GENERATED_DIR)
        .filter((f) => f.endsWith("-report.json"))
        .map((f) => f.replace(/-report\.json$/, "")),
    )
  : new Set<string>();

// 5. Classify each validator.
const entries: MapEntry[] = [];
for (const validator of validatorFiles) {
  const fpath = join(CHECKS_DIR, `${validator}.ts`);
  const lastModifiedAt = statSync(fpath).mtime.toISOString();
  const override = VALIDATOR_GATE_OVERRIDE_INDEX.get(validator);

  if (override) {
    entries.push({
      validator,
      gateId: override.gateId,
      classification: override.classification,
      consumer: override.consumer,
      bucket: override.bucket,
      killSwitchRef: override.killSwitchRef,
      declaredInRegistry: true,
      lastModifiedAt,
      hasReportArtifact: reportFiles.has(override.gateId),
      rationale: override.rationale,
    });
    continue;
  }

  // Auto-classification: gateId defaults to "check-foo" → "foo".
  const inferredGateId = validator.replace(/^check-/, "");
  let classification: ValidatorClassification;
  let consumer: ValidatorConsumer;
  let bucket: string | undefined;
  let rationale: string;
  let gateId = inferredGateId;

  if (requiredSet.has(inferredGateId)) {
    classification = "block";
    consumer = "release-readiness";
    rationale = "Auto-classified: gateId present in REQUIRED_GATES.";
  } else if (mobileWarnSet.has(inferredGateId)) {
    classification = "warn";
    consumer = "warn-ratchet";
    bucket = "mobile";
    rationale = "Auto-classified: gateId present in MOBILE_WARN_GATES bucket.";
  } else if (adminWarnSet.has(inferredGateId)) {
    classification = "warn";
    consumer = "warn-ratchet";
    bucket = "admin-ai-engineer";
    rationale = "Auto-classified: gateId present in ADMIN_AI_ENGINEER_WARN_GATES bucket.";
  } else if (depGapSet.has(validator)) {
    classification = "warn";
    consumer = "deployment-gap-suite";
    bucket = "deployment-gap";
    rationale = "Auto-classified: validator wired into run-all-deployment-gap-gates.ts.";
  } else {
    classification = "advisory";
    consumer = "advisory-only";
    rationale = "Auto-classified: no consumer wiring found; surfaced via advisory ingestion.";
  }

  entries.push({
    validator,
    gateId,
    classification,
    consumer,
    bucket,
    declaredInRegistry: false,
    lastModifiedAt,
    hasReportArtifact: reportFiles.has(gateId),
    rationale,
  });
}

// 6. Aggregate counts.
const counts = entries.reduce(
  (acc, e) => {
    acc[e.classification] = (acc[e.classification] ?? 0) + 1;
    return acc;
  },
  {} as Record<ValidatorClassification, number>,
);

const classified = entries.filter((e) => e.classification !== "advisory" || e.declaredInRegistry).length;
const totalValidators = entries.length;
const coveragePercent = totalValidators === 0 ? 100 : Math.round((classified / totalValidators) * 1000) / 10;

const out = {
  generatedAt: new Date().toISOString(),
  source: {
    checksDir: CHECKS_DIR,
    requiredGatesCount: REQUIRED_GATES.length,
    deploymentGapSuiteCount: depGapSet.size,
    overrideCount: VALIDATOR_GATE_OVERRIDE_INDEX.size,
  },
  totalValidators,
  blockCount: counts.block ?? 0,
  warnCount: counts.warn ?? 0,
  advisoryCount: counts.advisory ?? 0,
  disabledCount: counts.disabled ?? 0,
  archivedCount: counts.archived ?? 0,
  classified,
  unclassified: totalValidators - classified,
  coveragePercent,
  entries,
};

mkdirSync(GENERATED_DIR, { recursive: true });
writeFileSync(join(GENERATED_DIR, "validator-gate-map.json"), JSON.stringify(out, null, 2));

console.log(
  `validator-gate-map: ${totalValidators} validators ` +
    `(block=${out.blockCount}, warn=${out.warnCount}, advisory=${out.advisoryCount}, ` +
    `disabled=${out.disabledCount}, archived=${out.archivedCount}) ` +
    `coverage=${coveragePercent}%`,
);
