#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Evidence Graph Completeness Validator
import { existsSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";

const CRITICAL_ARTIFACTS = [
  "generated/runtime-capability-closure.json",
  "generated/os-boot-proof-bundle.json",
  "generated/app-lifecycle-closure.json",
  "generated/ai-capability-proof-matrix.json",
  "generated/release-provenance-attestation.json",
  "generated/mobile-readiness-pack.json",
  "generated/windowing-closure.json",
  "generated/frontend-closure-bundle.json",
  "generated/support-readiness-report.json",
];

const missing = CRITICAL_ARTIFACTS.filter(f => !existsSync(f));
const total = CRITICAL_ARTIFACTS.length;
const present = total - missing.length;

mkdirSync("generated", { recursive: true });
writeFileSync("generated/evidence-graph-completeness-v2.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "evidence-graph-completeness",
  ok: missing.length === 0,
  total,
  present,
  missing,
  coveragePct: Math.round((present / total) * 100),
}, null, 2));

console.log(`Evidence graph: ${present}/${total} artifacts present (${missing.length === 0 ? "✅" : "❌"})`);
if (missing.length > 0) { missing.forEach(m => console.error(`  ❌ ${m}`)); process.exit(1); }