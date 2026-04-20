#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Index Traceability Gate (BLOCK-tier #24)
// Asserts generated/INDEX.json exists, is well-formed, has
// ≥ 90% traceability coverage, every producer path is on disk
// (or a known external source), and the public mirror is byte-
// identical.
// ═══════════════════════════════════════════════════════════════

import * as fs from "node:fs";
import * as crypto from "node:crypto";

const INDEX_PATH = "generated/INDEX.json";
const MIRROR_PATH = "public/generated/INDEX.json";
const REPORT_PATH = "generated/artifact-index-traceability-report.json";
const COVERAGE_FLOOR = 90;

interface IndexEntry {
  artifact: string;
  producer: string | null;
  npmScript: string | null;
  consumers: string[];
  owner: string;
}
interface IndexDoc {
  schemaVersion: number;
  generatedAt: string;
  generator: string;
  totalArtifacts: number;
  withProducer: number;
  withConsumers: number;
  fullyTraceable: number;
  coveragePercent: number;
  entries: IndexEntry[];
}

const issues: Array<{ severity: string; area: string; message: string }> = [];

function sha256(p: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

// 1. Existence
if (!fs.existsSync(INDEX_PATH)) {
  issues.push({ severity: "error", area: "existence", message: `${INDEX_PATH} missing — run npm run generate:artifact-index` });
}

let doc: IndexDoc | null = null;
if (issues.length === 0) {
  try {
    doc = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  } catch (e: any) {
    issues.push({ severity: "error", area: "parse", message: `${INDEX_PATH} unparseable: ${e?.message ?? e}` });
  }
}

// 2. Schema validity
if (doc) {
  const requiredKeys: (keyof IndexDoc)[] = [
    "schemaVersion",
    "generatedAt",
    "generator",
    "totalArtifacts",
    "withProducer",
    "withConsumers",
    "fullyTraceable",
    "coveragePercent",
    "entries",
  ];
  for (const k of requiredKeys) {
    if (!(k in doc)) {
      issues.push({ severity: "error", area: "schema", message: `missing required key '${k}'` });
    }
  }
  if (doc.schemaVersion !== 1) {
    issues.push({ severity: "error", area: "schema", message: `unsupported schemaVersion ${doc.schemaVersion}` });
  }
  if (!Array.isArray(doc.entries)) {
    issues.push({ severity: "error", area: "schema", message: `'entries' is not an array` });
  }
}

// 3. Coverage threshold
if (doc && Array.isArray(doc.entries)) {
  if (doc.coveragePercent < COVERAGE_FLOOR) {
    issues.push({
      severity: "error",
      area: "coverage",
      message: `coverage ${doc.coveragePercent}% < ${COVERAGE_FLOOR}% floor`,
    });
  }
}

// 4. Every entry's producer on disk OR external
const EXTERNAL_PREFIXES = [".github/", "supabase/functions/", "package.json"];
let missingProducers = 0;
const missingProducerExamples: string[] = [];
if (doc && Array.isArray(doc.entries)) {
  for (const e of doc.entries) {
    if (!e.producer) continue;
    const head = e.producer.split(" ")[0];
    if (EXTERNAL_PREFIXES.some((p) => head.startsWith(p))) continue;
    if (!fs.existsSync(head)) {
      missingProducers++;
      if (missingProducerExamples.length < 5) missingProducerExamples.push(`${e.artifact} → ${e.producer}`);
    }
  }
  if (missingProducers > 0) {
    issues.push({
      severity: "error",
      area: "producer-on-disk",
      message: `${missingProducers} producer script(s) referenced but not on disk (e.g. ${missingProducerExamples.join("; ")})`,
    });
  }
}

// 5. Mirror parity
let mirrorParity = false;
if (fs.existsSync(INDEX_PATH) && fs.existsSync(MIRROR_PATH)) {
  if (sha256(INDEX_PATH) === sha256(MIRROR_PATH)) {
    mirrorParity = true;
  } else {
    issues.push({
      severity: "error",
      area: "mirror-parity",
      message: `${MIRROR_PATH} sha256 differs from ${INDEX_PATH}`,
    });
  }
} else if (!fs.existsSync(MIRROR_PATH)) {
  issues.push({ severity: "error", area: "mirror-parity", message: `${MIRROR_PATH} missing` });
}

// ── Emit report ────────────────────────────────────────────────
const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      gate: "artifact-index-traceability",
      ok,
      errorCount,
      warningCount,
      indexPath: INDEX_PATH,
      mirrorPath: MIRROR_PATH,
      mirrorParity,
      coveragePercent: doc?.coveragePercent ?? 0,
      coverageFloor: COVERAGE_FLOOR,
      totalArtifacts: doc?.totalArtifacts ?? 0,
      withProducer: doc?.withProducer ?? 0,
      withConsumers: doc?.withConsumers ?? 0,
      fullyTraceable: doc?.fullyTraceable ?? 0,
      missingProducers,
      issues,
    },
    null,
    2,
  ),
);

console.log(
  `${ok ? "✅" : "❌"} artifact-index-traceability: ${errorCount} errors, ${warningCount} warnings`,
);
if (doc) {
  console.log(
    `   coverage=${doc.coveragePercent}% (floor ${COVERAGE_FLOOR}%), entries=${doc.totalArtifacts}, producers=${doc.withProducer}, consumers=${doc.withConsumers}, mirror-parity=${mirrorParity}`,
  );
}
process.exit(ok ? 0 : 1);
