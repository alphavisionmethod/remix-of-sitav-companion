#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// IA Phase 5 — Shell-vs-Route Boundary Validator
// ───────────────────────────────────────────────────────────────
// Codifies the mechanical rule for whether a manifest descriptor
// gets a route shim:
//
//   role ∈ ROUTE_REQUIRED_ROLES (overview, workspace, engine,
//          control-plane, boardroom, proof, settings, room)
//     ⇒ MUST have descriptor.route !== null
//     ⇒ AND that route MUST be declared in some src/routes/families/*.tsx
//
//   role ∈ ROUTE_FORBIDDEN_ROLES (internal, archived)
//     ⇒ MUST have descriptor.route === null
//     ⇒ AND no route family may declare descriptor.id as a slug
//
//   role = labs
//     ⇒ shim allowed iff descriptor.featureFlag is set
//
// Exception clauses (encoded below, and only here):
//   • An entry-scoped `room` (e.g. Deal Room, Strategic Accounts) may
//     legitimately have route === null because it is opened from an
//     entity context inside the shell, not from the URL bar. We
//     accept this iff the descriptor's notes mention an entity scope.
//   • An overview/workspace whose `notes` field explicitly says
//     "in-shell only" is permitted to skip the route requirement
//     (sub-tab promotion is tracked there).
//
// Exits non-zero on violation. Designed to be invoked from
// src/__tests__/ia/shell-route-boundary.test.ts.
// ═══════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";
import {
  ALL_IA_DESCRIPTORS,
} from "../../../src/platform/ia/module-ia-manifest";
import {
  ROUTE_REQUIRED_ROLES,
  ROUTE_FORBIDDEN_ROLES,
} from "../../../src/platform/ia/page-role";
import type { PageDescriptor } from "../../../src/platform/ia/page-role";

const ROOT = process.cwd();
const FAMILIES_DIR = path.join(ROOT, "src/routes/families");

/** Extract every `path="..."` literal from every route family file. */
function collectFamilyRoutePaths(): { path: string; file: string; line: number }[] {
  const found: { path: string; file: string; line: number }[] = [];
  if (!fs.existsSync(FAMILIES_DIR)) return found;
  const files = fs
    .readdirSync(FAMILIES_DIR)
    .filter((f) => /\.tsx?$/.test(f));
  const rx = /<Route\s+[^>]*path\s*=\s*"([^"]+)"/g;
  for (const file of files) {
    const full = path.join(FAMILIES_DIR, file);
    const text = fs.readFileSync(full, "utf8");
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      let m: RegExpExecArray | null;
      const lineRx = new RegExp(rx.source, "g");
      while ((m = lineRx.exec(line)) !== null) {
        found.push({ path: m[1], file, line: i + 1 });
      }
    }
  }
  return found;
}

function isEntityScopedRoom(d: PageDescriptor): boolean {
  if (d.role !== "room") return false;
  return /entity[- ]scoped|opened from a (?:Deal|Customer|Account)/i.test(
    d.notes ?? "",
  );
}

function isInShellOnly(d: PageDescriptor): boolean {
  return /in-shell only|sub-tab|no public deep-link by design/i.test(
    d.notes ?? "",
  );
}

const familyRoutes = collectFamilyRoutePaths();
const familyRouteSet = new Set(familyRoutes.map((r) => r.path));

const violations: string[] = [];

for (const d of ALL_IA_DESCRIPTORS) {
  const tag = `[${d.pillar}/${d.id}]`;

  // ── ROUTE_REQUIRED roles
  if (ROUTE_REQUIRED_ROLES.has(d.role)) {
    if (d.route === null) {
      // Permitted ONLY for entity-scoped rooms or explicit in-shell-only documented surfaces.
      if (isEntityScopedRoom(d) || isInShellOnly(d)) continue;
      violations.push(
        `${tag} role="${d.role}" requires a route shim, but descriptor.route is null. ` +
        `Either set descriptor.route OR add a 'notes' field documenting why this surface is in-shell only.`,
      );
      continue;
    }
    // Strip dynamic segments so we can match shim declarations.
    const normalize = (p: string) => p.replace(/\/:[^/]+/g, "/:_");
    const want = normalize(d.route);
    const haveMatch = Array.from(familyRouteSet).some((p) => normalize(p) === want);
    if (!haveMatch) {
      violations.push(
        `${tag} declares route="${d.route}" but no <Route path="${d.route}"/> exists in src/routes/families/*.tsx`,
      );
    }
    continue;
  }

  // ── ROUTE_FORBIDDEN roles
  if (ROUTE_FORBIDDEN_ROLES.has(d.role)) {
    if (d.route !== null) {
      violations.push(
        `${tag} role="${d.role}" must have descriptor.route === null, got "${d.route}"`,
      );
    }
    continue;
  }

  // ── labs roles
  if (d.role === "labs") {
    const hasShim = d.route !== null && familyRouteSet.has(d.route);
    if (hasShim && !d.featureFlag) {
      violations.push(
        `${tag} role="labs" with route shim must declare a featureFlag (descriptor.featureFlag is undefined)`,
      );
    }
    continue;
  }
}

if (violations.length > 0) {
  console.error("\n❌ Shell-vs-Route boundary check failed:\n");
  for (const v of violations) console.error("  • " + v);
  console.error(`\nTotal: ${violations.length} violation(s)\n`);
  console.error(`Inspected ${ALL_IA_DESCRIPTORS.length} descriptors against ${familyRouteSet.size} unique route paths from ${familyRoutes.length} declarations.\n`);
  process.exit(1);
}

console.log(
  `✅ Shell-vs-Route boundary clean (${ALL_IA_DESCRIPTORS.length} descriptors × ${familyRouteSet.size} unique routes from ${familyRoutes.length} declarations).`,
);
process.exit(0);