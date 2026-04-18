#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — Architecture Remediation: Evidence Map Generator
// Phase B1 — read-only audit producing 4 JSON maps + 4 MD audits.
// No code changes. Evidence-driven foundation for B3 fixes.

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, extname, basename } from "node:path";

const ROOT = "src";
const OUT = "generated/architecture-remediation";
mkdirSync(OUT, { recursive: true });

// ────────────────────────────────────────────────────────────
// Walker
// ────────────────────────────────────────────────────────────
function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let s; try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const allFiles = walk(ROOT);
console.log(`Scanned ${allFiles.length} TS/TSX files under ${ROOT}/`);

// ────────────────────────────────────────────────────────────
// Import extraction
// ────────────────────────────────────────────────────────────
const IMPORT_RE = /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']/g;
const importsByFile = new Map<string, string[]>();

for (const f of allFiles) {
  let src; try { src = readFileSync(f, "utf-8"); } catch { continue; }
  const imps: string[] = [];
  let m;
  while ((m = IMPORT_RE.exec(src)) !== null) imps.push(m[1]);
  importsByFile.set(f, imps);
}

// ────────────────────────────────────────────────────────────
// 1. SERVICE TOPOLOGY MAP
// ────────────────────────────────────────────────────────────
type ServiceClass =
  | "platform-svc" | "domain-svc" | "runtime-svc" | "data-svc"
  | "integration-svc" | "orchestration-svc" | "contract" | "ui"
  | "hook" | "util" | "test" | "config" | "not-a-service";

function classifyService(file: string, content: string): ServiceClass {
  const rel = relative(".", file);
  const base = basename(file);
  if (/\.(test|spec)\.tsx?$/.test(base)) return "test";
  if (rel.startsWith("src/contracts/") || rel.startsWith("src/packages/")) return "contract";
  if (rel.startsWith("src/components/") || rel.startsWith("src/pages/") || rel.startsWith("src/admin/")) return "ui";
  if (rel.startsWith("src/hooks/") || /\/hooks\//.test(rel)) return "hook";
  if (rel.startsWith("src/data/")) return "data-svc";
  if (rel.startsWith("src/integrations/")) return "integration-svc";
  if (rel.startsWith("src/runtimes/")) return "runtime-svc";
  if (rel.startsWith("src/domains/")) return "domain-svc";
  if (rel.startsWith("src/platform/")) {
    if (/orchestrat|workflow|pipeline|saga/i.test(content)) return "orchestration-svc";
    return "platform-svc";
  }
  if (rel.startsWith("src/lib/")) {
    // Hidden services in src/lib — flag by content signature
    if (/class\s+\w+Service|export\s+(?:async\s+)?function\s+\w+(?:Service|Manager|Orchestrator|Gateway|Client)/i.test(content)) {
      if (/orchestrat|workflow|pipeline|saga|coordinator/i.test(content)) return "orchestration-svc";
      if (/supabase|fetch\(|http|api/i.test(content) && /export/i.test(content)) return "integration-svc";
      if (/repository|projection|persist|query/i.test(content)) return "data-svc";
      return "platform-svc";
    }
    if (rel === "src/lib/utils.ts" || rel.startsWith("src/lib/utils/")) return "util";
    return "util";
  }
  return "not-a-service";
}

const serviceMap: Record<string, { class: ServiceClass; loc: number; importers: number }> = {};
const importerCount = new Map<string, number>();

for (const [f, imps] of importsByFile) {
  for (const i of imps) {
    if (i.startsWith("@/") || i.startsWith(".")) {
      importerCount.set(i, (importerCount.get(i) || 0) + 1);
    }
  }
}

for (const f of allFiles) {
  const content = readFileSync(f, "utf-8");
  const cls = classifyService(f, content);
  const rel = relative(".", f);
  serviceMap[rel] = {
    class: cls,
    loc: content.split("\n").length,
    importers: importerCount.get("@/" + rel.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "")) || 0,
  };
}

const byClass: Record<string, number> = {};
const hiddenServices: string[] = [];
for (const [path, info] of Object.entries(serviceMap)) {
  byClass[info.class] = (byClass[info.class] || 0) + 1;
  if (path.startsWith("src/lib/") &&
      ["platform-svc", "domain-svc", "orchestration-svc", "integration-svc", "data-svc"].includes(info.class)) {
    hiddenServices.push(path);
  }
}

writeFileSync(join(OUT, "service-topology-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalFiles: allFiles.length,
  byClass,
  hiddenServiceCount: hiddenServices.length,
  hiddenServices: hiddenServices.slice(0, 200),
  files: serviceMap,
}, null, 2));

// ────────────────────────────────────────────────────────────
// 2. CONTRACT TOPOLOGY MAP
// ────────────────────────────────────────────────────────────
const CONTRACT_PATTERNS = [
  /export\s+(?:type|interface)\s+\w+/,
  /export\s+const\s+\w+Schema\s*=/,
  /z\.object\(/,
  /export\s+type\s+\w+Event/,
];

function isContractFile(content: string): boolean {
  return CONTRACT_PATTERNS.some((re) => re.test(content)) &&
    !/use\w+\(|React\.|jsx|className=/.test(content.slice(0, 2000));
}

const contractMap: Record<string, { canonical: boolean; family: string; targetHome: string }> = {};
let canonicalCount = 0, leakedCount = 0;
const leakedByFamily: Record<string, string[]> = {};

for (const f of allFiles) {
  const content = readFileSync(f, "utf-8");
  if (!isContractFile(content)) continue;
  const rel = relative(".", f);
  const isCanonical = rel.startsWith("src/contracts/") || rel.startsWith("src/packages/");
  // Heuristic family from path
  let family = "misc";
  const parts = rel.split("/");
  if (parts[1] === "packages" && parts[2]) family = parts[2];
  else if (parts[1] === "contracts" && parts[2]) family = parts[2];
  else if (parts[1] === "domains" && parts[2]) family = parts[2] + "-contracts";
  else if (parts[1] === "platform" && parts[2]) family = parts[2] + "-contracts";
  else if (/types|schema|contract|event/.test(rel)) family = "types-leak";

  contractMap[rel] = {
    canonical: isCanonical,
    family,
    targetHome: isCanonical ? rel : `src/contracts/${family}/${basename(f)}`,
  };
  if (isCanonical) canonicalCount++;
  else {
    leakedCount++;
    (leakedByFamily[family] ||= []).push(rel);
  }
}

writeFileSync(join(OUT, "contract-topology-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  canonicalCount,
  leakedCount,
  leakedByFamily: Object.fromEntries(
    Object.entries(leakedByFamily).map(([k, v]) => [k, { count: v.length, sample: v.slice(0, 10) }])
  ),
  totalContracts: canonicalCount + leakedCount,
}, null, 2));

// ────────────────────────────────────────────────────────────
// 3. PLANE ISOLATION GRAPH
// ────────────────────────────────────────────────────────────
type Plane = "user" | "admin" | "shell" | "backend" | "core" | "shared";

function planeOf(rel: string): Plane {
  if (rel.startsWith("src/admin/") || rel.includes("/admin/")) return "admin";
  if (rel.startsWith("src/app/") || rel.startsWith("src/pages/") && !rel.includes("/admin/")) return "user";
  if (rel.startsWith("src/shell-runtime/") || rel.startsWith("src/layouts/")) return "shell";
  if (rel.startsWith("supabase/functions/")) return "backend";
  if (rel.startsWith("src/contracts/") || rel.startsWith("src/packages/") ||
      rel.startsWith("src/lib/") || rel.startsWith("src/platform/") ||
      rel.startsWith("src/runtimes/") || rel.startsWith("src/data/") ||
      rel.startsWith("src/integrations/") || rel.startsWith("src/hooks/") ||
      rel.startsWith("src/components/") || rel.startsWith("src/contexts/") ||
      rel.startsWith("src/domains/")) return "shared";
  return "core";
}

// Forbidden direct edges
const FORBIDDEN: Array<[Plane, Plane]> = [
  ["user", "admin"],
  ["admin", "user"],
];

function resolveImport(fromFile: string, spec: string): string | null {
  if (!spec.startsWith("@/") && !spec.startsWith(".")) return null;
  let target: string;
  if (spec.startsWith("@/")) target = "src/" + spec.slice(2);
  else target = join(fromFile, "..", spec).replace(/\\/g, "/");
  for (const ext of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    if (existsSync(target + ext)) return target + ext;
  }
  if (existsSync(target)) return target;
  return null;
}

const planeViolations: Array<{ from: string; to: string; fromPlane: Plane; toPlane: Plane; spec: string }> = [];
const edgesByPlane: Record<string, number> = {};

for (const [f, imps] of importsByFile) {
  const relF = relative(".", f);
  const planeF = planeOf(relF);
  for (const spec of imps) {
    const resolved = resolveImport(f, spec);
    if (!resolved) continue;
    const relT = relative(".", resolved);
    const planeT = planeOf(relT);
    const key = `${planeF}->${planeT}`;
    edgesByPlane[key] = (edgesByPlane[key] || 0) + 1;
    if (FORBIDDEN.some(([a, b]) => a === planeF && b === planeT)) {
      planeViolations.push({ from: relF, to: relT, fromPlane: planeF, toPlane: planeT, spec });
    }
  }
}

writeFileSync(join(OUT, "plane-isolation-graph.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  edgesByPlane,
  directViolationCount: planeViolations.length,
  directViolations: planeViolations.slice(0, 100),
  forbiddenEdges: FORBIDDEN,
}, null, 2));

// ────────────────────────────────────────────────────────────
// 4. ROUTE TRUTH MAP
// ────────────────────────────────────────────────────────────
const ROUTE_RE = /<Route\s+[^>]*path=["']([^"']+)["'][^>]*element=\{<(\w+)/g;
const LAZY_RE = /lazy\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']/g;

const routeFiles = allFiles.filter((f) =>
  /Routes?\.tsx$/.test(f) || /\/routes\//.test(f)
);
const allRoutes: Array<{ path: string; element: string; sourceFile: string }> = [];
const lazyTargets = new Set<string>();

for (const f of routeFiles) {
  const c = readFileSync(f, "utf-8");
  let m;
  while ((m = ROUTE_RE.exec(c)) !== null) {
    allRoutes.push({ path: m[1], element: m[2], sourceFile: relative(".", f) });
  }
  while ((m = LAZY_RE.exec(c)) !== null) {
    lazyTargets.add(m[1]);
  }
}

const pageFiles = allFiles.filter((f) => f.startsWith("src/pages/") || f.startsWith("src/app/"));
const referencedPages = new Set<string>();

for (const [, imps] of importsByFile) {
  for (const i of imps) {
    if (i.startsWith("@/pages/") || i.startsWith("@/app/")) {
      referencedPages.add(i.replace(/^@\//, "src/"));
    }
  }
}
for (const t of lazyTargets) {
  if (t.startsWith("@/pages/") || t.startsWith("@/app/") || t.startsWith("@/admin/")) {
    referencedPages.add(t.replace(/^@\//, "src/"));
  }
}

const orphanedPages: string[] = [];
const wrapperPages: string[] = [];
for (const p of pageFiles) {
  const rel = relative(".", p);
  const stem = rel.replace(/\.(ts|tsx)$/, "");
  const isReferenced = [...referencedPages].some((r) => r === stem || r.endsWith(stem.replace("src/", "")));
  if (!isReferenced) orphanedPages.push(rel);
  const content = readFileSync(p, "utf-8");
  if (content.length < 500 && /export\s+(?:\{|default).*from\s+["']/.test(content)) {
    wrapperPages.push(rel);
  }
}

writeFileSync(join(OUT, "route-truth-map.json"), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalRoutes: allRoutes.length,
  totalPages: pageFiles.length,
  orphanedPageCount: orphanedPages.length,
  wrapperPageCount: wrapperPages.length,
  orphanedPages: orphanedPages.slice(0, 100),
  wrapperPages: wrapperPages.slice(0, 100),
  routeFiles: routeFiles.map((f) => relative(".", f)),
  routeSample: allRoutes.slice(0, 50),
}, null, 2));

// ────────────────────────────────────────────────────────────
// Summary line
// ────────────────────────────────────────────────────────────
console.log(JSON.stringify({
  services: { total: allFiles.length, hidden: hiddenServices.length, byClass },
  contracts: { canonical: canonicalCount, leaked: leakedCount },
  planes: { violations: planeViolations.length, edges: Object.keys(edgesByPlane).length },
  routes: { total: allRoutes.length, pages: pageFiles.length, orphaned: orphanedPages.length, wrappers: wrapperPages.length },
}, null, 2));
