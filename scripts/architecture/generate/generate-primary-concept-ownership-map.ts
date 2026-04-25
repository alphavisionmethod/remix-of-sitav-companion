#!/usr/bin/env tsx
/**
 * Wave D §D.2 — Primary Concept Ownership Map Generator
 *
 * Cross-references the typed registry in
 *   src/platform/architecture/primary-concept-registry.ts
 * against the actual filesystem (canonical owner / page family) and the
 * profile-route-visibility-map (canonical route family).
 *
 * Emits: generated/manifests/primary-concept-ownership-map.json
 * Owner: Architecture Governance · Constitution Rule 46 (Wave D §D.2)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { PRIMARY_CONCEPTS } from "../../../src/platform/architecture/primary-concept-registry";

const ROOT = process.cwd();
const ROUTE_VIS = join(ROOT, "generated", "manifests", "profile-route-visibility-map.json");
const OUT = join(ROOT, "generated", "manifests", "primary-concept-ownership-map.json");

type RouteEntry = { path: string; sourceOwner: string | null };
const routeMap = existsSync(ROUTE_VIS)
  ? (JSON.parse(readFileSync(ROUTE_VIS, "utf8")).entries as RouteEntry[])
  : [];

function dirExists(p: string): boolean {
  try {
    return statSync(join(ROOT, p)).isDirectory();
  } catch {
    return false;
  }
}

const concepts = PRIMARY_CONCEPTS.map((c) => {
  const ownerExists = dirExists(c.ownerPath);
  const pageFamilyExists = dirExists(c.canonicalPageFamily);
  const matchedRoutes = routeMap.filter(
    (r) => r.path === c.canonicalRouteFamily || r.path.startsWith(c.canonicalRouteFamily + "/"),
  );
  const aliasMatchedRoutes = c.aliases.flatMap((a) =>
    routeMap.filter((r) => r.path === a || r.path.startsWith(a + "/")),
  );

  // A concept is duplicate-risk if more than one distinct sourceOwner directory
  // hosts pages for the canonical route family (excluding the declared owner).
  const ownerDirs = new Set<string>();
  for (const r of matchedRoutes) {
    if (!r.sourceOwner) continue;
    const segs = r.sourceOwner.split("/");
    if (segs[0] === "src" && segs.length >= 3) ownerDirs.add(`${segs[0]}/${segs[1]}/${segs[2]}`);
  }

  let status: "canonical" | "alias-only" | "duplicate-risk" | "no-routes" = "canonical";
  if (matchedRoutes.length === 0) status = "no-routes";
  if (ownerDirs.size > 1) status = "duplicate-risk";

  return {
    concept: c.concept,
    displayName: c.displayName,
    ownerType: c.ownerType,
    ownerPath: c.ownerPath,
    ownerExists,
    canonicalRouteFamily: c.canonicalRouteFamily,
    canonicalPageFamily: c.canonicalPageFamily,
    pageFamilyExists,
    aliases: c.aliases,
    aliasRouteCount: aliasMatchedRoutes.length,
    routeCount: matchedRoutes.length,
    distinctOwnerDirs: [...ownerDirs].sort(),
    status,
    notes: c.notes ?? null,
  };
});

const summary = {
  total: concepts.length,
  canonical: concepts.filter((c) => c.status === "canonical").length,
  duplicateRisk: concepts.filter((c) => c.status === "duplicate-risk").length,
  noRoutes: concepts.filter((c) => c.status === "no-routes").length,
  missingOwnerDir: concepts.filter((c) => !c.ownerExists).length,
  missingPageFamily: concepts.filter((c) => !c.pageFamilyExists).length,
};

const out = {
  generatedAt: new Date().toISOString(),
  schemaVersion: 1,
  rule: "Constitution Rule 46 (Wave D §D.2 — Concept Uniqueness Law)",
  summary,
  concepts,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(
  `✅ primary-concept-ownership-map.json — total=${summary.total} canonical=${summary.canonical} duplicate-risk=${summary.duplicateRisk} no-routes=${summary.noRoutes}`,
);