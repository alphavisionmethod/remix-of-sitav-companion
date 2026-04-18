#!/usr/bin/env node
/* eslint-disable no-console */
// Phase B — admin-route guard coverage gate (warn-level).
// Every admin-plane route must be wrapped by AdminRoute or PermissionGatedRoute.
// Heuristic-based via local-context scan; warn only because false positives are common.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated"; mkdirSync(OUT, { recursive: true });
const SRC = "generated/profile-and-runtime-hardening/app-route-profile-map.json";

if (!existsSync(SRC)) {
  console.warn("[route-guard-coverage] evidence map missing");
  process.exit(0);
}

const data = JSON.parse(readFileSync(SRC, "utf-8")) as {
  routes: Array<{ path: string; file: string; plane: string | null; guards: string[] }>;
};

const adminRoutes = data.routes.filter((r) => r.plane === "admin");
const unguarded = adminRoutes.filter((r) => r.guards.length === 0);
// Baseline budget = current count. Will ratchet down in B6-equivalent.
const BUDGET = Number(process.env.ROUTE_GUARD_COVERAGE_BUDGET ?? 200);
const ok = unguarded.length <= BUDGET;

writeFileSync(join(OUT, "route-guard-coverage.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "route-guard-coverage",
  level: "warn",
  budget: BUDGET,
  adminRouteTotal: adminRoutes.length,
  unguardedCount: unguarded.length,
  unguardedSample: unguarded.slice(0, 30),
  ok,
}, null, 2));

console.log(`route-guard-coverage: ${unguarded.length}/${adminRoutes.length} admin routes unguarded (budget ${BUDGET}) — ${ok ? "OK" : "WARN"}`);
process.exit(0); // warn-level
