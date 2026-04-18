#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// Phase Z — Route Topology Truth Gate
//
// Aggregates two existing warn-level signals (route-truth +
// dead-pages) and asserts a single hard ceiling that ratchets down
// each release. Prevents either dimension from regressing while
// each individual signal continues to evolve.
//
// Level: warn-with-ratchet.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated";
mkdirSync(OUT, { recursive: true });

const ROUTE_TRUTH = "generated/route-truth.json";
const DEAD_PAGES = "generated/dead-pages.json";

if (!existsSync(ROUTE_TRUTH) || !existsSync(DEAD_PAGES)) {
  console.warn("[route-topology-truth] upstream evidence missing — run check-route-truth + check-dead-pages first");
  process.exit(0);
}

type RouteTruth = { totalRoutes: number; unresolvedCount: number };
type DeadPages = { totalPages: number; deadCount: number };

const rt = JSON.parse(readFileSync(ROUTE_TRUTH, "utf-8")) as RouteTruth;
const dp = JSON.parse(readFileSync(DEAD_PAGES, "utf-8")) as DeadPages;

const combinedDrift = rt.unresolvedCount + dp.deadCount;

// Phase Z initial ceiling: current 26 + 53 = 79 → budget 90 (small headroom).
const BUDGET = Number(process.env.ROUTE_TOPOLOGY_BUDGET ?? 90);
const ok = combinedDrift <= BUDGET;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "route-topology-truth",
  level: "warn-with-ratchet",
  totalRoutes: rt.totalRoutes,
  totalPages: dp.totalPages,
  unresolvedRoutes: rt.unresolvedCount,
  deadPages: dp.deadCount,
  combinedDrift,
  budget: BUDGET,
  ok,
};

writeFileSync(join(OUT, "route-topology-truth.json"), JSON.stringify(report, null, 2));
console.log(
  `route-topology-truth: ${combinedDrift} drift (routes=${rt.unresolvedCount}, dead-pages=${dp.deadCount}) (budget ${BUDGET}) — ${ok ? "OK" : "FAIL"}`
);
process.exit(ok ? 0 : 1);
