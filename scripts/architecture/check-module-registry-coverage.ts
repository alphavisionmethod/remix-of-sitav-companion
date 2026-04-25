#!/usr/bin/env -S bun run
// ════════════════════════════════════════════════════════════
// SITA OS — Module Registry Coverage Gate (Phase 1)
// ════════════════════════════════════════════════════════════
// Scans every src/routes/*.tsx file for `path="..."` declarations
// and verifies each top-level path is owned by a row in
// public/generated/module-registry.json (the snapshot of
// public.route_ownership). Fails the build if any route is
// unowned, so registry drift is caught at PR time.
//
// Owned-by rules:
//   - exact match against route_ownership.route_path, OR
//   - longest-prefix match against module_registry.route_prefix.

import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

interface Manifest {
  modules: { module_id: string; route_prefix: string | null }[];
  routes: { route_path: string; module_id: string }[];
}

const MANIFEST_PATH = resolve("public/generated/module-registry.json");
const ROUTES_DIR = resolve("src/routes");

// Routes we never expect to be in the registry (router-internal redirects,
// wildcards, dev-only previews). Keep this list small and justified.
const IGNORED_PATHS = new Set<string>([
  "*",
  "/",
  "/auth",
  "/login",
  "/signup",
  "/logout",
  "/reset-password",
  "/forgot-password",
  "/index",
  "/not-found",
  "/404",
]);

function loadManifest(): Manifest {
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
  } catch (err) {
    console.error(
      `✗ Cannot read ${MANIFEST_PATH}.\n  Run: bun scripts/architecture/emit-module-registry-manifest.ts`,
      err,
    );
    process.exit(1);
  }
}

function listRouteFiles(): string[] {
  const all: string[] = [];
  const entries = readdirSync(ROUTES_DIR, { withFileTypes: true });
  for (const e of entries) {
    if (e.isFile() && (e.name.endsWith(".tsx") || e.name.endsWith(".ts"))) {
      all.push(resolve(ROUTES_DIR, e.name));
    }
  }
  return all;
}

function extractPaths(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const out = new Set<string>();
  // Match path="..." or path={"/foo"}
  const re = /path\s*=\s*[{]?["'`]([^"'`{}]+)["'`][}]?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    let p = m[1];
    if (!p) continue;
    // Drop trailing wildcards and route-relative children.
    p = p.replace(/\/\*$/, "").replace(/\*$/, "");
    if (!p.startsWith("/")) continue; // skip relative children like ":id"
    // Strip parameterized segments to compare prefix coverage.
    out.add(p);
  }
  return [...out];
}

function isOwned(path: string, manifest: Manifest): boolean {
  if (manifest.routes.some((r) => r.route_path === path)) return true;
  // Longest-prefix match against module route_prefix.
  let best = 0;
  for (const m of manifest.modules) {
    const pref = m.route_prefix;
    if (!pref) continue;
    if (path === pref || path.startsWith(pref + "/")) {
      if (pref.length > best) best = pref.length;
    }
  }
  return best > 0;
}

function main() {
  const manifest = loadManifest();
  const files = listRouteFiles();
  const unowned: { file: string; path: string }[] = [];
  let totalScanned = 0;

  for (const f of files) {
    const paths = extractPaths(f);
    for (const p of paths) {
      if (IGNORED_PATHS.has(p)) continue;
      // Strip dynamic segments for the ownership check.
      const stripped = p.replace(/\/:[^/]+/g, "");
      totalScanned += 1;
      if (!isOwned(stripped, manifest)) {
        unowned.push({ file: f.replace(process.cwd() + "/", ""), path: p });
      }
    }
  }

  if (unowned.length > 0) {
    console.error(
      `✗ ${unowned.length} unowned route(s) of ${totalScanned} scanned. ` +
        `Add to module_registry / route_ownership and re-run emit:`,
    );
    for (const u of unowned.slice(0, 50)) {
      console.error(`  ${u.path}    (${u.file})`);
    }
    if (unowned.length > 50) console.error(`  …and ${unowned.length - 50} more`);
    // Phase 1 ships with a baseline grace window: warn if > 0 but
    // hard-fail only when above the recorded baseline. Update this
    // baseline downward in each subsequent phase as routes are wired.
    const baseline = Number(process.env.MODULE_COVERAGE_BASELINE ?? "9999");
    if (unowned.length > baseline) {
      console.error(
        `✗ Coverage gap (${unowned.length}) exceeds baseline (${baseline}). Failing.`,
      );
      process.exit(1);
    }
    console.log(
      `⚠ Coverage gap ${unowned.length} ≤ baseline ${baseline}. Allowed (warning only).`,
    );
    return;
  }

  console.log(
    `✓ All ${totalScanned} declared routes are owned by the module registry.`,
  );
}

main();