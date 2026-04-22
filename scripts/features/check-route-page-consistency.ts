// ═══════════════════════════════════════════════════════════════
// SITA OS — Route ↔ Page ↔ Feature Consistency Validator
// Ensures:
//   1. Every pageSource in ROUTE_METADATA_REGISTRY resolves on disk
//   2. Every page in PAGE_OWNER_MAP resolves on disk
//   3. Pages referenced by routes have a PAGE_OWNER_MAP entry
//   4. Pages in PAGE_OWNER_MAP are referenced by at least one route
//   5. Route-owned pages map to a registered feature surface
// Generates: generated/route-page-consistency-audit.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// ── Load registry data via simple regex extraction ──────────
// (We parse the TS source files directly to avoid needing full
// TS compilation in a CI script context.)

interface Violation {
  rule: string;
  item: string;
  detail: string;
  severity: "error" | "warn";
}

const violations: Violation[] = [];
const ROOT = process.cwd();

// ── Extract pageSource values from route-intent-taxonomy.ts ──
function extractPageSources(): string[] {
  const filePath = path.join(ROOT, "src/platform/architecture/route-intent-taxonomy.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  const re = /pageSource:\s*["']([^"']+)["']/g;
  const sources: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    sources.push(m[1]);
  }
  return sources;
}

// ── Extract page entries from page-owner-map.ts ──
function extractPageOwnerEntries(): string[] {
  const filePath = path.join(ROOT, "src/platform/architecture/page-owner-map.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  const re = /page:\s*["']([^"']+)["']/g;
  const pages: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    pages.push(m[1]);
  }
  return pages;
}

// ── Extract featureId + ownedRoutes from feature-registry.ts ──
function extractFeatureRoutes(): Map<string, string[]> {
  const filePath = path.join(ROOT, "src/features/feature-registry.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  // Simple block extraction: find featureId and ownedRoutes pairs
  const map = new Map<string, string[]>();
  const blockRe = /featureId:\s*["']([^"']+)["'][^}]*?ownedRoutes:\s*\[([^\]]*)\]/gs;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(content)) !== null) {
    const id = m[1];
    const routes = m[2].match(/["']([^"']+)["']/g)?.map(r => r.replace(/["']/g, "")) ?? [];
    map.set(id, routes);
  }
  return map;
}

// ── Extract routeId + path + pageSource tuples ──
function extractRouteTuples(): Array<{ routeId: string; routePath: string; pageSource: string }> {
  const filePath = path.join(ROOT, "src/platform/architecture/route-intent-taxonomy.ts");
  const content = fs.readFileSync(filePath, "utf-8");
  const tuples: Array<{ routeId: string; routePath: string; pageSource: string }> = [];
  const re = /routeId:\s*["']([^"']+)["'][^}]*?path:\s*["']([^"']+)["'][^}]*?pageSource:\s*["']([^"']+)["']/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    tuples.push({ routeId: m[1], routePath: m[2], pageSource: m[3] });
  }
  return tuples;
}

// ═══ CHECK 1: Every pageSource resolves on disk ═══
const pageSources = extractPageSources();
const uniquePageSources = [...new Set(pageSources)];

for (const ps of uniquePageSources) {
  const fullPath = path.join(ROOT, ps);
  if (!fs.existsSync(fullPath)) {
    violations.push({
      rule: "route-page-exists",
      item: ps,
      detail: `Route references pageSource "${ps}" but file does not exist on disk`,
      severity: "error",
    });
  }
}

// ═══ CHECK 2: Every PAGE_OWNER_MAP page resolves on disk ═══
const pageOwnerEntries = extractPageOwnerEntries();

for (const page of pageOwnerEntries) {
  const fullPath = path.join(ROOT, page);
  if (!fs.existsSync(fullPath)) {
    violations.push({
      rule: "page-owner-exists",
      item: page,
      detail: `PAGE_OWNER_MAP references "${page}" but file does not exist on disk`,
      severity: "error",
    });
  }
}

// ═══ CHECK 3: Route pages have PAGE_OWNER_MAP entries ═══
const pageOwnerSet = new Set(pageOwnerEntries);

for (const ps of uniquePageSources) {
  if (!pageOwnerSet.has(ps)) {
    violations.push({
      rule: "route-page-has-owner",
      item: ps,
      detail: `Route pageSource "${ps}" has no entry in PAGE_OWNER_MAP`,
      severity: "warn",
    });
  }
}

// ═══ CHECK 4: PAGE_OWNER_MAP pages referenced by routes ═══
const routePageSet = new Set(uniquePageSources);

for (const page of pageOwnerEntries) {
  if (!routePageSet.has(page)) {
    violations.push({
      rule: "page-owner-has-route",
      item: page,
      detail: `PAGE_OWNER_MAP page "${page}" is not referenced by any route in ROUTE_METADATA_REGISTRY`,
      severity: "warn",
    });
  }
}

// ═══ CHECK 5: Route paths map to feature registry ═══
const featureRoutes = extractFeatureRoutes();
const routeTuples = extractRouteTuples();
const allFeatureRoutes = new Set<string>();
for (const routes of featureRoutes.values()) {
  for (const r of routes) allFeatureRoutes.add(r);
}

for (const tuple of routeTuples) {
  // Check if this route path is claimed by any feature
  const claimed = [...featureRoutes.entries()].some(([, routes]) =>
    routes.some(r => tuple.routePath === r || tuple.routePath.startsWith(r + "/")),
  );
  if (!claimed) {
    violations.push({
      rule: "route-has-feature-owner",
      item: `${tuple.routeId} (${tuple.routePath})`,
      detail: `Route "${tuple.routePath}" is not claimed by any feature in FEATURE_REGISTRY`,
      severity: "warn",
    });
  }
}

// ═══ Report ═══
const errors = violations.filter(v => v.severity === "error");
const warnings = violations.filter(v => v.severity === "warn");

const report = {
  timestamp: new Date().toISOString(),
  totalRoutePageSources: uniquePageSources.length,
  totalPageOwnerEntries: pageOwnerEntries.length,
  totalFeatures: featureRoutes.size,
  totalRoutes: routeTuples.length,
  errors,
  warnings,
  compliant: errors.length === 0,
};

const outDir = path.resolve("generated");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "route-page-consistency-audit.json"),
  JSON.stringify(report, null, 2),
);

console.log(`\n═══ Route ↔ Page ↔ Feature Consistency Audit ═══`);
console.log(`Route pageSources: ${uniquePageSources.length}`);
console.log(`PAGE_OWNER_MAP entries: ${pageOwnerEntries.length}`);
console.log(`Feature registry entries: ${featureRoutes.size}`);
console.log(`Route tuples checked: ${routeTuples.length}`);
console.log(`Errors: ${errors.length}`);
if (errors.length > 0) {
  for (const v of errors) {
    console.log(`  ❌ [${v.rule}] ${v.item}: ${v.detail}`);
  }
}
console.log(`Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  for (const v of warnings) {
    console.log(`  ⚠️  [${v.rule}] ${v.item}: ${v.detail}`);
  }
}
console.log(`Compliant (no errors): ${report.compliant}`);
console.log(`Report: generated/route-page-consistency-audit.json\n`);

if (!report.compliant) process.exit(1);