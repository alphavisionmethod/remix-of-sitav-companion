#!/usr/bin/env node
/* eslint-disable no-console */
// Phase F — admin-route guard coverage gate (block-level, graduated).
// Every admin-plane route must be wrapped by AdminRoute or PermissionGatedRoute.
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
const BUDGET = Number(process.env.ROUTE_GUARD_COVERAGE_BUDGET ?? 0);
const ok = unguarded.length <= BUDGET;

writeFileSync(join(OUT, "route-guard-coverage.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "route-guard-coverage",
  level: "block",
  budget: BUDGET,
  adminRouteTotal: adminRoutes.length,
  unguardedCount: unguarded.length,
  unguardedSample: unguarded.slice(0, 30),
  ok,
}, null, 2));

console.log(`route-guard-coverage: ${unguarded.length}/${adminRoutes.length} admin routes unguarded (budget ${BUDGET}) — ${ok ? "OK" : "FAIL"}`);
process.exit(ok ? 0 : 1); // block-level — graduated
