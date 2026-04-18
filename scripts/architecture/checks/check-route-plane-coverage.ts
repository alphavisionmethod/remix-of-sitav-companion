/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Plane Coverage Check
// Validates every top-level src/pages/* route has a plane assignment
// in route-plane-map.ts. Fails CI on uncovered routes.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface CoverageReport {
  generatedAt: string;
  gate: "route-plane-coverage";
  scannedRoutes: number;
  coveredRoutes: number;
  uncoveredRoutes: string[];
  ok: boolean;
  errorCount: number;
  warningCount: number;
}

const PAGES_DIR = "src/pages";
const MAP_FILE = "src/lib/architecture/route-plane-map.ts";
const OUT_DIR = "generated";

mkdirSync(OUT_DIR, { recursive: true });

// Extract declared prefixes from the map file.
const declaredPrefixes = new Set<string>();
if (existsSync(MAP_FILE)) {
  const src = readFileSync(MAP_FILE, "utf8");
  for (const m of src.matchAll(/prefix:\s*"([^"]+)"/g)) {
    declaredPrefixes.add(m[1]);
  }
}

// Walk top-level page routes (1 level deep is enough — sub-routes inherit).
const discoveredRoutes: string[] = [];
function walk(dir: string, depth: number) {
  if (!existsSync(dir) || depth > 2) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      const route = "/" + full.replace(PAGES_DIR + "/", "").toLowerCase();
      discoveredRoutes.push(route);
      walk(full, depth + 1);
    }
  }
}
walk(PAGES_DIR, 0);

const uncovered: string[] = [];
for (const route of discoveredRoutes) {
  const matched = Array.from(declaredPrefixes).some(
    p => route === p || route.startsWith(p + "/") || p === "/",
  );
  if (!matched) uncovered.push(route);
}

const report: CoverageReport = {
  generatedAt: new Date().toISOString(),
  gate: "route-plane-coverage",
  scannedRoutes: discoveredRoutes.length,
  coveredRoutes: discoveredRoutes.length - uncovered.length,
  uncoveredRoutes: uncovered.slice(0, 50),
  ok: uncovered.length === 0,
  errorCount: uncovered.length,
  warningCount: 0,
};

writeFileSync(join(OUT_DIR, "route-plane-coverage-report.json"), JSON.stringify(report, null, 2));
console.log(`route-plane-coverage: ${report.coveredRoutes}/${report.scannedRoutes} covered`);
if (uncovered.length > 0) {
  console.log(`  uncovered (first 10): ${uncovered.slice(0, 10).join(", ")}`);
}
process.exit(report.ok ? 0 : 1);
