#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — mobile capability truth gate (warn-level).
// Anything classified "live" must have real persistence/auth backing.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/mobile-capability-map.json";

if (!existsSync(SRC)) {
  console.warn("[mobile-capability-truth] evidence map missing");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  features: Array<{
    file: string; classification: string;
    persistence: string[]; usesAuth: boolean; notes: string[];
  }>;
};

const lyingLive = data.features.filter(
  (f) => f.classification === "live" && (f.persistence.includes("none") || !f.usesAuth),
);

const BUDGET = Number(process.env.MOBILE_CAPABILITY_TRUTH_BUDGET ?? 0);
const ok = lyingLive.length <= BUDGET;

writeFileSync(join(OUT, "mobile-capability-truth.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "mobile-capability-truth",
  level: "block",
  budget: BUDGET,
  lyingLiveCount: lyingLive.length,
  offenders: lyingLive,
  ok,
}, null, 2));

console.log(`mobile-capability-truth: ${lyingLive.length} "live" features without backing (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(ok ? 0 : 1); // block-level — graduated
