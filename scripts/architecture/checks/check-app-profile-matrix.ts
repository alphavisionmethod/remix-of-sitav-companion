#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — APP_PLANE_MAP.profiles[] ↔ profile manifests parity (warn-level).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SEP = "generated/profile-and-runtime-hardening/profile-separation-map.json";

if (!existsSync(SEP)) {
  console.warn("[app-profile-matrix] evidence map missing — run generate-runtime-evidence-maps first");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SEP, "utf-8")) as {
  manifestMismatches: Array<{ appId: string; issue: string }>;
};

const BUDGET = Number(process.env.APP_PROFILE_MATRIX_BUDGET ?? 0);
const ok = data.manifestMismatches.length <= BUDGET;

writeFileSync(join(OUT, "app-profile-matrix.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "app-profile-matrix",
  level: "warn",
  budget: BUDGET,
  mismatchCount: data.manifestMismatches.length,
  mismatches: data.manifestMismatches,
  ok,
}, null, 2));

console.log(`app-profile-matrix: ${data.manifestMismatches.length} mismatches (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0); // warn-level
