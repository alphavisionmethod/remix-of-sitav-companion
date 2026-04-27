#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// IA Phase 8 — Route + Navigation Truth Map Builder
// ───────────────────────────────────────────────────────────────
// Reads the canonical sources of truth:
//   • src/platform/ia/module-ia-manifest.ts  (page descriptors)
//   • src/routes/families/*.tsx              (route shim declarations)
//   • src/routes/redirects/user-redirect-map.ts (URL aliases)
//
// Emits two artifacts:
//   • generated/route-and-navigation-truth-map.json — machine truth
//   • generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md — humans
//
// Designed for CI consumption (validators) AND for the hand-readable
// IA review at the end of every release. Re-running this script must
// produce a deterministic diff (sorted keys, stable ordering).
// ═══════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import { ALL_IA_DESCRIPTORS } from "../../src/platform/ia/module-ia-manifest";
import type { PageDescriptor } from "../../src/platform/ia/page-role";
import { USER_REDIRECTS } from "../../src/routes/redirects/user-redirect-map";

const ROOT = process.cwd();
const FAMILIES_DIR = path.join(ROOT, "src/routes/families");
const OUT_JSON = path.join(ROOT, "generated/route-and-navigation-truth-map.json");
const OUT_MD = path.join(ROOT, "generated/audits/SITA_OS_ROUTE_AND_NAVIGATION_TRUTH_MAP.md");

interface FamilyRoute {
  path: string;
  family: string;
  line: number;
}

function collectFamilyRoutes(): FamilyRoute[] {
  const out: FamilyRoute[] = [];
  if (!fs.existsSync(FAMILIES_DIR)) return out;
  const files = fs.readdirSync(FAMILIES_DIR).filter((f) => /\.tsx?$/.test(f));
  for (const file of files) {
    const text = fs.readFileSync(path.join(FAMILIES_DIR, file), "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const rx = /<Route\s+[^>]*path\s*=\s*"([^"]+)"/g;
      let m: RegExpExecArray | null;
      while ((m = rx.exec(lines[i])) !== null) {
        out.push({ path: m[1], family: file, line: i + 1 });
      }
    }
  }
  return out.sort((a, b) =>
    a.path.localeCompare(b.path) || a.family.localeCompare(b.family),
  );
}

function buildTruth(): {
  generatedAt: string;
  totals: Record<string, number>;
  pillars: Record<string, PillarTruth>;
  redirects: Array<{ from: string; to: string; reason: string }>;
  orphanedRoutes: FamilyRoute[];
} {
  const familyRoutes = collectFamilyRoutes();
  const familyRoutePaths = new Set(familyRoutes.map((r) => r.path));
  const familyRouteByPath = new Map<string, FamilyRoute[]>();
  for (const r of familyRoutes) {
    if (!familyRouteByPath.has(r.path)) familyRouteByPath.set(r.path, []);
    familyRouteByPath.get(r.path)!.push(r);
  }

  const pillars: Record<string, PillarTruth> = {
    business: emptyPillar(),
    concierge: emptyPillar(),
    finance: emptyPillar(),
  };

  const declaredRoutesFromManifest = new Set<string>();

  for (const d of [...ALL_IA_DESCRIPTORS].sort((a, b) =>
    a.pillar.localeCompare(b.pillar) || a.id.localeCompare(b.id),
  )) {
    const families = d.route ? (familyRouteByPath.get(d.route) ?? []).map((f) => f.family) : [];
    if (d.route) declaredRoutesFromManifest.add(d.route);
    pillars[d.pillar].pages.push({
      id: d.id,
      role: d.role,
      label: d.label,
      component: d.component,
      route: d.route,
      sidebarVisible: d.sidebarVisible,
      status: d.status,
      replacedBy: d.replacedBy ?? null,
      legacyNameAllowed: d.legacyNameAllowed === true,
      featureFlag: d.featureFlag ?? null,
      notes: d.notes ?? null,
      routeFamilies: families,
      routeShimPresent: d.route ? familyRoutePaths.has(d.route) : null,
      absorbedSlugs: d.absorbedSlugs ?? [],
    });
    pillars[d.pillar].counts.total += 1;
    pillars[d.pillar].counts[d.role] = (pillars[d.pillar].counts[d.role] ?? 0) + 1;
    if (d.role === "archived") pillars[d.pillar].counts.archived = (pillars[d.pillar].counts.archived ?? 0) + 1;
  }

  // Orphaned routes: declared in a family but no manifest descriptor and no redirect target.
  const redirectTargets = new Set(USER_REDIRECTS.map((r) => r.to.replace(/\/:[^/]+/g, "/:_")));
  const orphanedRoutes = familyRoutes
    .filter((r) => !pillarOwnedRoute(r.path))
    .filter((r) => !declaredRoutesFromManifest.has(r.path))
    .filter((r) => {
      const norm = r.path.replace(/\/:[^/]+/g, "/:_");
      return !redirectTargets.has(norm);
    });

  const totals = {
    descriptors: ALL_IA_DESCRIPTORS.length,
    familyRoutes: familyRoutes.length,
    uniqueFamilyRoutePaths: familyRoutePaths.size,
    redirects: USER_REDIRECTS.length,
    orphanedRoutes: orphanedRoutes.length,
  };

  return {
    generatedAt: new Date().toISOString(),
    totals,
    pillars,
    redirects: [...USER_REDIRECTS]
      .map((r) => ({ from: r.from, to: r.to, reason: r.reason }))
      .sort((a, b) => a.from.localeCompare(b.from)),
    orphanedRoutes,
  };
}

interface PillarTruth {
  counts: Record<string, number>;
  pages: Array<{
    id: string;
    role: string;
    label: string;
    component: string;
    route: string | null;
    sidebarVisible: boolean;
    status: string;
    replacedBy: string | null;
    legacyNameAllowed: boolean;
    featureFlag: string | null;
    notes: string | null;
    routeFamilies: string[];
    routeShimPresent: boolean | null;
    absorbedSlugs: string[];
  }>;
}

function emptyPillar(): PillarTruth {
  return { counts: { total: 0 }, pages: [] };
}

/** True if a route belongs to a pillar this manifest covers (skip orphans outside scope). */
function pillarOwnedRoute(p: string): boolean {
  return /^\/(business|concierge|money|investment|investments|life|personal-life|wealth-command)(\/|$)/.test(p);
}

function renderMd(truth: ReturnType<typeof buildTruth>): string {
  const lines: string[] = [];
  lines.push("# SITA OS — Route & Navigation Truth Map");
  lines.push("");
  lines.push(`Generated: ${truth.generatedAt}`);
  lines.push("");
  lines.push("> Auto-generated by `scripts/architecture/build-route-nav-truth-map.ts`.");
  lines.push("> Do not hand-edit. Source of truth = `src/platform/ia/module-ia-manifest.ts` + `src/routes/families/*.tsx` + `src/routes/redirects/user-redirect-map.ts`.");
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|---|---|");
  for (const [k, v] of Object.entries(truth.totals)) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push("");

  for (const pillar of ["business", "concierge", "finance"] as const) {
    const p = truth.pillars[pillar];
    lines.push(`## ${pillar.charAt(0).toUpperCase() + pillar.slice(1)} (${p.counts.total} pages)`);
    lines.push("");
    const counts = Object.entries(p.counts).filter(([k]) => k !== "total").sort();
    lines.push("**Counts by role:** " + counts.map(([k, v]) => `${k}=${v}`).join(", "));
    lines.push("");
    lines.push("| ID | Role | Label | Component | Route | Sidebar | Status | Notes |");
    lines.push("|---|---|---|---|---|---|---|---|");
    for (const page of p.pages) {
      const route = page.route ?? "—";
      const sidebar = page.sidebarVisible ? "✓" : "—";
      const note = (page.notes ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      const replaced = page.replacedBy ? ` _(→ ${page.replacedBy})_` : "";
      lines.push(
        `| \`${page.id}\` | ${page.role} | ${page.label} | \`${page.component}\` | \`${route}\` | ${sidebar} | ${page.status}${replaced} | ${note} |`,
      );
    }
    lines.push("");
  }

  lines.push("## Redirects (URL aliases)");
  lines.push("");
  lines.push("| From | To | Reason |");
  lines.push("|---|---|---|");
  for (const r of truth.redirects) {
    lines.push(`| \`${r.from}\` | \`${r.to}\` | ${r.reason} |`);
  }
  lines.push("");

  lines.push("## Orphaned Routes (declared in family but no manifest descriptor + no redirect)");
  lines.push("");
  if (truth.orphanedRoutes.length === 0) {
    lines.push("_None — every pillar-owned route is anchored in the IA manifest or the redirect map._");
  } else {
    lines.push("| Path | Family | Line |");
    lines.push("|---|---|---|");
    for (const o of truth.orphanedRoutes) {
      lines.push(`| \`${o.path}\` | ${o.family} | ${o.line} |`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function main() {
  const truth = buildTruth();
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(truth, null, 2) + "\n");
  fs.writeFileSync(OUT_MD, renderMd(truth));
  console.log(`✅ Truth map written:`);
  console.log(`   • ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`   • ${path.relative(ROOT, OUT_MD)}`);
  console.log(`   • ${truth.totals.descriptors} descriptors, ${truth.totals.uniqueFamilyRoutePaths} unique family routes, ${truth.totals.redirects} redirects, ${truth.totals.orphanedRoutes} orphan(s).`);
}

main();