#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — profile route coverage gate (warn-level).
// Every route that resolves to a plane must be allowed by at least one profile.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/app-route-profile-map.json";

if (!existsSync(SRC)) {
  console.warn("[profile-route-coverage] evidence map missing");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  routes: Array<{ path: string; plane: string | null; profiles: string[] }>;
};

const orphans = data.routes.filter((r) => r.plane && (!r.profiles || r.profiles.length === 0));
const BUDGET = Number(process.env.PROFILE_ROUTE_COVERAGE_BUDGET ?? 0);
const ok = orphans.length <= BUDGET;

writeFileSync(join(OUT, "profile-route-coverage.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "profile-route-coverage",
  level: "block",
  budget: BUDGET,
  orphanCount: orphans.length,
  sample: orphans.slice(0, 20),
  ok,
}, null, 2));

console.log(`profile-route-coverage: ${orphans.length} routes with no profile (budget ${BUDGET}) — ${ok ? "OK" : "FAIL"}`);
process.exit(ok ? 0 : 1); // block-level — graduated
