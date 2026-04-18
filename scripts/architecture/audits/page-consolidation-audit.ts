#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Page & Route Surface Consolidation Audit (Phase 0)
//
// Read-only. Walks src/pages/**, classifies every page, cross-
// references admin/user route families, and emits the truth
// artifacts under generated/page-consolidation/.
//
// Outputs (per the approved plan):
//   • PAGE_SURFACE_AUDIT.md
//   • PAGE_CURRENT_TO_TARGET_MAP.md
//   • CANONICAL_ROUTE_OWNERSHIP.md
//   • DUPLICATE_AND_OVERLAPPING_PAGES.md
//   • EXPERIMENTAL_AND_PHASED_SURFACES.md
//   • ADMIN_SURFACE_CONSOLIDATION.md
//   • page-surface-map.json
//   • canonical-route-map.json
//   • duplicate-page-map.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import {
  ADMIN_PAGE_CONSOLIDATION_MAP,
  inferEntryFromFilename,
  type PageConsolidationEntry,
} from "../../../src/platform/architecture/admin-page-consolidation-map";
import {
  ADMIN_DOMAINS,
  DOMAIN_LABELS,
  DOMAIN_HUB_PATHS,
  type AdminDomain,
  type AdminPageClass,
} from "../../../src/platform/architecture/admin-route-registry";

const PAGES_ROOT = "src/pages";
const ROUTES_DIR = "src/routes";
const OUTPUT_DIR = "generated/page-consolidation";

// ─── 1. Walk pages on disk ───────────────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const n of fs.readdirSync(dir)) {
    if (n.startsWith(".")) continue;
    const p = path.join(dir, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (n.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const allPages = walk(PAGES_ROOT).sort();

// ─── 2. Index admin curated entries ──────────────────────────────
const curatedByComponent = new Map<string, PageConsolidationEntry>();
for (const e of ADMIN_PAGE_CONSOLIDATION_MAP) curatedByComponent.set(e.component, e);

// ─── 3. Walk route families and extract <Route path="..."> ──────
interface MountedRoute {
  path: string;
  component?: string;
  family: string;
}
const ROUTE_RE = /<Route\s+[^>]*?path\s*=\s*["'`]([^"'`]+)["'`][^>]*?(?:element\s*=\s*\{?\s*<\s*([A-Z][\w]+))?/g;

function scanRoutes(): { byFamily: Record<string, MountedRoute[]>; byComponent: Map<string, MountedRoute[]>; total: number } {
  const byFamily: Record<string, MountedRoute[]> = {};
  const byComponent = new Map<string, MountedRoute[]>();
  if (!fs.existsSync(ROUTES_DIR)) return { byFamily, byComponent, total: 0 };
  let total = 0;
  for (const f of fs.readdirSync(ROUTES_DIR)) {
    if (!f.endsWith(".tsx")) continue;
    const family = f.replace(/\.tsx$/, "");
    const src = fs.readFileSync(path.join(ROUTES_DIR, f), "utf8");
    const list: MountedRoute[] = [];
    ROUTE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = ROUTE_RE.exec(src)) !== null) {
      const route: MountedRoute = { path: m[1], component: m[2], family };
      list.push(route);
      total++;
      if (m[2]) {
        const arr = byComponent.get(m[2]) ?? [];
        arr.push(route);
        byComponent.set(m[2], arr);
      }
    }
    byFamily[family] = list;
  }
  return { byFamily, byComponent, total };
}

const routes = scanRoutes();

// ─── 4. Classify every page ──────────────────────────────────────
type PageBucket = "critical" | "admin" | "user-domain" | "internal" | "experimental" | "dev";

interface PageRecord {
  file: string;
  component: string;
  bucket: PageBucket;
  domain?: AdminDomain | string;
  pageClass?: AdminPageClass | "USER_PAGE" | "EXPERIMENTAL" | "INTERNAL";
  curated: boolean;
  mountedRoutes: string[];
  loc: number;
  imports: number;
  targetRoute?: string;
  mergeInto?: string;
  notes?: string;
}

function classifyBucket(file: string): PageBucket {
  if (file.startsWith("src/pages/admin/")) return "admin";
  if (file.startsWith("src/pages/owner/")) return "internal";
  if (file.startsWith("src/pages/dev/") || file.includes("/__")) return "dev";
  if (file.startsWith("src/pages/internal/")) return "internal";
  if (
    file.startsWith("src/pages/business/") ||
    file.startsWith("src/pages/money/") ||
    file.startsWith("src/pages/concierge/") ||
    file.startsWith("src/pages/files/") ||
    file.startsWith("src/pages/boardroom/") ||
    file.startsWith("src/pages/communications/") ||
    file.startsWith("src/pages/apps/") ||
    file.startsWith("src/pages/settings/") ||
    file.startsWith("src/pages/investment/") ||
    file.startsWith("src/pages/desktop/")
  ) return "user-domain";
  return "internal";
}

const records: PageRecord[] = [];
for (const f of allPages) {
  const component = path.basename(f, ".tsx");
  const bucket = classifyBucket(f);
  const src = fs.readFileSync(f, "utf8");
  const loc = src.split("\n").length;
  const imports = (src.match(/^import\s/gm) ?? []).length;
  const mountedRoutes = (routes.byComponent.get(component) ?? []).map((r) => r.path);

  let curated = false;
  let domain: string | undefined;
  let pageClass: PageRecord["pageClass"];
  let targetRoute: string | undefined;
  let mergeInto: string | undefined;
  let notes: string | undefined;

  if (bucket === "admin") {
    const e = curatedByComponent.get(component) ?? inferEntryFromFilename(component);
    curated = curatedByComponent.has(component);
    domain = e.targetDomain;
    pageClass = e.pageClass;
    targetRoute = e.targetRoute;
    mergeInto = e.mergeInto;
    notes = e.notes;
  } else if (bucket === "user-domain") {
    domain = f.split("/")[2];
    pageClass = "USER_PAGE";
  } else if (bucket === "dev") {
    pageClass = "EXPERIMENTAL";
  } else {
    pageClass = "INTERNAL";
  }

  records.push({ file: f, component, bucket, domain, pageClass, curated, mountedRoutes, loc, imports, targetRoute, mergeInto, notes });
}

// ─── 5. Detect duplicates & overlaps ─────────────────────────────
interface DuplicateGroup {
  canonical: string;
  duplicates: string[];
  reason: string;
  domain?: string;
}
const duplicates: DuplicateGroup[] = [];

// 5a. Admin curated DUPLICATE_MERGE_REQUIRED → group by mergeInto
const mergeMap = new Map<string, string[]>();
for (const r of records) {
  if (r.pageClass === "DUPLICATE_MERGE_REQUIRED" && r.mergeInto) {
    const arr = mergeMap.get(r.mergeInto) ?? [];
    arr.push(r.component);
    mergeMap.set(r.mergeInto, arr);
  }
}
for (const [canonical, dups] of mergeMap) {
  duplicates.push({ canonical, duplicates: dups, reason: "Curated merge target.", domain: records.find((r) => r.component === canonical)?.domain as string });
}

// 5b. Same component mounted under multiple paths
for (const [comp, routeList] of routes.byComponent) {
  if (routeList.length > 1) {
    const uniquePaths = [...new Set(routeList.map((r) => r.path))];
    if (uniquePaths.length > 1) {
      duplicates.push({
        canonical: uniquePaths[0],
        duplicates: uniquePaths.slice(1),
        reason: `Component "${comp}" mounted under ${uniquePaths.length} paths across families [${[...new Set(routeList.map((r) => r.family))].join(", ")}].`,
      });
    }
  }
}

// 5c. Thin admin pages sharing the same target route
const targetRouteMap = new Map<string, string[]>();
for (const r of records) {
  if (r.bucket !== "admin" || !r.targetRoute) continue;
  if (r.pageClass === "PRIMARY_DOMAIN_ENTRY") continue;
  const arr = targetRouteMap.get(r.targetRoute) ?? [];
  arr.push(r.component);
  targetRouteMap.set(r.targetRoute, arr);
}
for (const [target, comps] of targetRouteMap) {
  if (comps.length > 1) {
    duplicates.push({
      canonical: target,
      duplicates: comps,
      reason: `${comps.length} admin pages converge on the same target route.`,
    });
  }
}

// ─── 6. Compute per-domain & per-bucket counts ────────────────────
const bucketCounts: Record<PageBucket, number> = { critical: 0, admin: 0, "user-domain": 0, internal: 0, experimental: 0, dev: 0 };
for (const r of records) bucketCounts[r.bucket]++;

const adminByDomain: Record<AdminDomain, number> = Object.fromEntries(ADMIN_DOMAINS.map((d) => [d, 0])) as Record<AdminDomain, number>;
const adminByClass: Record<string, number> = {};
for (const r of records) {
  if (r.bucket !== "admin") continue;
  if (r.domain && (ADMIN_DOMAINS as readonly string[]).includes(r.domain)) adminByDomain[r.domain as AdminDomain]++;
  if (r.pageClass) adminByClass[r.pageClass] = (adminByClass[r.pageClass] ?? 0) + 1;
}

const userDomainCounts: Record<string, number> = {};
for (const r of records) {
  if (r.bucket === "user-domain" && r.domain) userDomainCounts[r.domain] = (userDomainCounts[r.domain] ?? 0) + 1;
}

// ─── 7. Identify thin pages (LOC < 80 → strong merge candidate) ──
const thinPages = records.filter((r) => r.loc < 80 && r.bucket === "admin");

// ─── 8. Identify experimental routes ─────────────────────────────
const experimentalRoutes = routes.byFamily["experimental-routes"] ?? [];

// ─── 9. Write outputs ────────────────────────────────────────────
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const generatedAt = new Date().toISOString();
const heroBanner = `> Generated: ${generatedAt}\n> Source: \`scripts/architecture/audits/page-consolidation-audit.ts\`\n> Status: **read-only audit** (Phase 0). Zero code/route changes.\n`;

// 9a. PAGE_SURFACE_AUDIT.md
const surfaceAudit = `# Page Surface Audit
${heroBanner}
## Summary

| Metric | Value |
|---|---|
| Total pages on disk (\`src/pages/**\`) | **${allPages.length}** |
| Total mounted routes | **${routes.total}** |
| Admin pages | ${bucketCounts.admin} |
| User-domain pages | ${bucketCounts["user-domain"]} |
| Internal / owner pages | ${bucketCounts.internal} |
| Dev / experimental pages | ${bucketCounts.dev} |

## Admin pages by canonical domain

| Domain | Page count | Hub path |
|---|---:|---|
${ADMIN_DOMAINS.map((d) => `| ${DOMAIN_LABELS[d]} | ${adminByDomain[d]} | \`${DOMAIN_HUB_PATHS[d]}\` |`).join("\n")}

## Admin pages by classification

| Class | Count |
|---|---:|
${Object.entries(adminByClass).sort(([, a], [, b]) => b - a).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## User-domain page counts

| Domain | Page count |
|---|---:|
${Object.entries(userDomainCounts).sort(([, a], [, b]) => b - a).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## Mounted routes by family

| Route family | Routes |
|---|---:|
${Object.entries(routes.byFamily).sort(([, a], [, b]) => b.length - a.length).map(([k, v]) => `| ${k} | ${v.length} |`).join("\n")}

## Thin pages (LOC < 80) — strong merge candidates

**${thinPages.length} thin admin pages identified.** These are top candidates for conversion to embedded views (Phase 5).

${thinPages.slice(0, 25).map((p) => `- \`${p.file}\` (${p.loc} LOC) → ${p.targetRoute ?? "(no target)"}`).join("\n")}
${thinPages.length > 25 ? `\n…and ${thinPages.length - 25} more (see \`page-surface-map.json\`)` : ""}
`;

// 9b. PAGE_CURRENT_TO_TARGET_MAP.md
const currentToTarget = `# Page Current → Target Map
${heroBanner}
For every admin page on disk: what is its current path, what is its canonical target, and what consolidation strategy applies.

| Component | Current route(s) | Target route | Page class | Curated? | Merge into | LOC |
|---|---|---|---|---|---|---:|
${records
  .filter((r) => r.bucket === "admin")
  .sort((a, b) => (a.targetRoute ?? "").localeCompare(b.targetRoute ?? ""))
  .map(
    (r) =>
      `| \`${r.component}\` | ${r.mountedRoutes.length ? r.mountedRoutes.map((p) => `\`${p}\``).join(", ") : "_(unmounted)_"} | \`${r.targetRoute ?? "?"}\` | ${r.pageClass ?? "?"} | ${r.curated ? "✓" : ""} | ${r.mergeInto ? `\`${r.mergeInto}\`` : ""} | ${r.loc} |`,
  )
  .join("\n")}
`;

// 9c. CANONICAL_ROUTE_OWNERSHIP.md
const canonicalOwnership = `# Canonical Route Ownership
${heroBanner}
The 12 canonical admin domains and their assigned page populations.

${ADMIN_DOMAINS.map((d) => {
  const owned = records.filter((r) => r.bucket === "admin" && r.domain === d);
  const primary = owned.find((r) => r.pageClass === "PRIMARY_DOMAIN_ENTRY");
  const subviews = owned.filter((r) => r.pageClass === "SECONDARY_SUBVIEW");
  const explorers = owned.filter((r) => r.pageClass === "DETAIL_EXPLORER");
  const tools = owned.filter((r) => r.pageClass === "WORKFLOW_TOOL" || r.pageClass === "SUPPORT_TOOL");
  const merges = owned.filter((r) => r.pageClass === "DUPLICATE_MERGE_REQUIRED");
  return `## ${DOMAIN_LABELS[d]} (\`${DOMAIN_HUB_PATHS[d]}\`)

- **Primary hub:** ${primary ? `\`${primary.component}\`` : "_(needs creation in Phase 3)_"}
- **Subviews:** ${subviews.length} → ${subviews.slice(0, 8).map((s) => `\`${s.component}\``).join(", ")}${subviews.length > 8 ? ` …+${subviews.length - 8}` : ""}
- **Detail explorers:** ${explorers.length}
- **Workflow tools:** ${tools.length}
- **Pending merges:** ${merges.length}${merges.length > 0 ? ` → ${merges.map((m) => `\`${m.component}\` ⇒ \`${m.mergeInto}\``).join(", ")}` : ""}
`;
}).join("\n")}
`;

// 9d. DUPLICATE_AND_OVERLAPPING_PAGES.md
const duplicatesDoc = `# Duplicate & Overlapping Pages
${heroBanner}
**${duplicates.length} duplication groups detected.**

These are the surfaces that Phase 2 (redirects) and Phase 5 (view migration) must resolve.

${duplicates
  .map(
    (g, i) => `## ${i + 1}. ${g.canonical}${g.domain ? ` _(${g.domain})_` : ""}

- **Reason:** ${g.reason}
- **Canonical:** \`${g.canonical}\`
- **Duplicates / aliases:** ${g.duplicates.map((d) => `\`${d}\``).join(", ")}
`,
  )
  .join("\n")}
`;

// 9e. EXPERIMENTAL_AND_PHASED_SURFACES.md
const experimentalDoc = `# Experimental & Phased Surfaces
${heroBanner}
## Routes mounted in \`experimental-routes.tsx\`

**${experimentalRoutes.length} routes currently mounted as experimental.**
These must NOT count against canonical launch surfaces.

| Path | Component |
|---|---|
${experimentalRoutes.map((r) => `| \`${r.path}\` | \`${r.component ?? "?"}\` |`).join("\n")}

## Pages under \`src/pages/dev/\` or \`__\` directories

| File | Bucket |
|---|---|
${records.filter((r) => r.bucket === "dev").map((r) => `| \`${r.file}\` | dev |`).join("\n") || "_(none)_"}
`;

// 9f. ADMIN_SURFACE_CONSOLIDATION.md
const adminConsolidation = `# Admin Surface Consolidation
${heroBanner}
## Final classification of all 539 admin pages

| Class | Count | Action in later phases |
|---|---:|---|
| PRIMARY_DOMAIN_ENTRY | ${adminByClass["PRIMARY_DOMAIN_ENTRY"] ?? 0} | Stay as canonical hubs (Phase 3). |
| SECONDARY_SUBVIEW | ${adminByClass["SECONDARY_SUBVIEW"] ?? 0} | Become tabs/views inside hubs (Phase 5). |
| DETAIL_EXPLORER | ${adminByClass["DETAIL_EXPLORER"] ?? 0} | Stay as deep-link drill-downs. |
| WORKFLOW_TOOL | ${adminByClass["WORKFLOW_TOOL"] ?? 0} | Operator action surfaces — preserved. |
| SUPPORT_TOOL | ${adminByClass["SUPPORT_TOOL"] ?? 0} | Diagnostics — preserved. |
| DUPLICATE_MERGE_REQUIRED | ${adminByClass["DUPLICATE_MERGE_REQUIRED"] ?? 0} | Merge into canonical (Phase 2 redirect + Phase 5 file move). |
| DEPRECATE_WITH_REDIRECT | ${adminByClass["DEPRECATE_WITH_REDIRECT"] ?? 0} | Redirect-only (Phase 2). |
| REMOVE_AFTER_SAFE_MIGRATION | ${adminByClass["REMOVE_AFTER_SAFE_MIGRATION"] ?? 0} | Final cleanup (Phase 7, only after CI green). |

**Total curated entries:** ${ADMIN_PAGE_CONSOLIDATION_MAP.length}
**Coverage:** 100% (every admin page has either a curated entry or a prefix-inferred classification).
`;

// 9g. JSON outputs
const surfaceMap = {
  generatedAt,
  totals: { onDisk: allPages.length, mountedRoutes: routes.total, ...bucketCounts },
  adminByDomain,
  adminByClass,
  userDomainCounts,
  routesByFamily: Object.fromEntries(Object.entries(routes.byFamily).map(([k, v]) => [k, v.length])),
  records,
};
const canonicalRouteMap = {
  generatedAt,
  domains: ADMIN_DOMAINS.map((d) => ({
    domain: d,
    label: DOMAIN_LABELS[d],
    hub: DOMAIN_HUB_PATHS[d],
    pages: records.filter((r) => r.bucket === "admin" && r.domain === d).map((r) => ({
      component: r.component,
      pageClass: r.pageClass,
      targetRoute: r.targetRoute,
      mergeInto: r.mergeInto,
    })),
  })),
};
const duplicateMap = { generatedAt, totalGroups: duplicates.length, groups: duplicates };

fs.writeFileSync(path.join(OUTPUT_DIR, "PAGE_SURFACE_AUDIT.md"), surfaceAudit);
fs.writeFileSync(path.join(OUTPUT_DIR, "PAGE_CURRENT_TO_TARGET_MAP.md"), currentToTarget);
fs.writeFileSync(path.join(OUTPUT_DIR, "CANONICAL_ROUTE_OWNERSHIP.md"), canonicalOwnership);
fs.writeFileSync(path.join(OUTPUT_DIR, "DUPLICATE_AND_OVERLAPPING_PAGES.md"), duplicatesDoc);
fs.writeFileSync(path.join(OUTPUT_DIR, "EXPERIMENTAL_AND_PHASED_SURFACES.md"), experimentalDoc);
fs.writeFileSync(path.join(OUTPUT_DIR, "ADMIN_SURFACE_CONSOLIDATION.md"), adminConsolidation);
fs.writeFileSync(path.join(OUTPUT_DIR, "page-surface-map.json"), JSON.stringify(surfaceMap, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, "canonical-route-map.json"), JSON.stringify(canonicalRouteMap, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, "duplicate-page-map.json"), JSON.stringify(duplicateMap, null, 2));

console.log(`✅ Page consolidation audit complete.`);
console.log(`   Pages: ${allPages.length}`);
console.log(`   Mounted routes: ${routes.total}`);
console.log(`   Admin pages: ${bucketCounts.admin} (${ADMIN_PAGE_CONSOLIDATION_MAP.length} curated, 100% classified)`);
console.log(`   Duplicate groups: ${duplicates.length}`);
console.log(`   Outputs → ${OUTPUT_DIR}/`);
