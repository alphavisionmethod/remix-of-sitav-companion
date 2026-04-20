#!/usr/bin/env node
/* eslint-disable no-console */
// WARN-tier validator: asserts the flat routes inventory at
// public/generated/routes.json exists, is fresh, mirrors the internal
// generated/routes.json byte-for-byte, and meets sanity floors.
//
// Does NOT join REQUIRED_GATES — surfaces via advisory ingestion in
// check-os-release-readiness.ts.

import { existsSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report.js";

const INTERNAL = join("generated", "routes.json");
const EXTERNAL = join("public", "generated", "routes.json");
const FRESHNESS_DAYS = 7;
const MIN_ROUTES = 100;

const issues: GateIssue[] = [];

function md5(p: string): string {
  return createHash("md5").update(readFileSync(p)).digest("hex");
}

if (!existsSync(INTERNAL)) {
  issues.push({ severity: "error", area: "manifest", message: `Missing ${INTERNAL}. Run \`npm run generate:routes-inventory\`.` });
}
if (!existsSync(EXTERNAL)) {
  issues.push({ severity: "error", area: "manifest", message: `Missing ${EXTERNAL}. Run \`npm run generate:routes-inventory\`.` });
}

let totalRoutes = 0;
let byPlane: Record<string, number> = {};
let byRuntimeTier: Record<string, number> = {};

if (existsSync(INTERNAL) && existsSync(EXTERNAL)) {
  // Mirror parity
  const internalMd5 = md5(INTERNAL);
  const externalMd5 = md5(EXTERNAL);
  if (internalMd5 !== externalMd5) {
    issues.push({
      severity: "error",
      area: "drift",
      message: `Mirror drift: ${INTERNAL} (${internalMd5}) != ${EXTERNAL} (${externalMd5}). Re-run \`npm run generate:routes-inventory\`.`,
    });
  }

  // Freshness
  const ageMs = Date.now() - statSync(INTERNAL).mtimeMs;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays > FRESHNESS_DAYS) {
    issues.push({
      severity: "warning",
      area: "freshness",
      message: `${INTERNAL} is ${ageDays.toFixed(1)} days old (>${FRESHNESS_DAYS}d). Regenerate.`,
    });
  }

  // Content checks
  try {
    const m = JSON.parse(readFileSync(INTERNAL, "utf8"));
    totalRoutes = m.totalRoutes || 0;
    byPlane = m.byPlane || {};
    byRuntimeTier = m.byRuntimeTier || {};

    if (totalRoutes < MIN_ROUTES) {
      issues.push({
        severity: "error",
        area: "completeness",
        message: `Only ${totalRoutes} routes found (floor: ${MIN_ROUTES}). Generator may be missing nested shells.`,
      });
    }

    const routes: Array<{ path: string; component: string; plane: string }> = m.routes || [];
    const seen = new Map<string, number>();
    let emptyFields = 0;
    for (const r of routes) {
      if (!r.path || !r.component || !r.plane) emptyFields++;
      seen.set(r.path, (seen.get(r.path) || 0) + 1);
    }
    if (emptyFields > 0) {
      issues.push({ severity: "error", area: "integrity", message: `${emptyFields} routes have empty path/component/plane.` });
    }
    const dupes = Array.from(seen.entries()).filter(([, c]) => c > 1).map(([p]) => p);
    if (dupes.length > 0) {
      issues.push({ severity: "error", area: "integrity", message: `Duplicate route paths: ${dupes.slice(0, 5).join(", ")}${dupes.length > 5 ? "..." : ""}` });
    }
  } catch (e) {
    issues.push({ severity: "error", area: "parse", message: `Cannot parse ${INTERNAL}: ${(e as Error).message}` });
  }
}

const errors = issues.filter((i) => i.severity === "error");
const ok = errors.length === 0;

emitGateReport({
  gate: "routes-inventory-completeness",
  ok,
  issues,
  extra: { totalRoutes, byPlane, byRuntimeTier, minRoutes: MIN_ROUTES, freshnessDays: FRESHNESS_DAYS },
});

if (ok) {
  console.log(`✅ routes-inventory-completeness PASS — ${totalRoutes} routes, planes: ${JSON.stringify(byPlane)}`);
  process.exit(0);
} else {
  console.error(`❌ routes-inventory-completeness FAIL — ${errors.length} errors`);
  for (const i of issues) console.error(`  [${i.severity}] ${i.area}: ${i.message}`);
  process.exit(1);
}
