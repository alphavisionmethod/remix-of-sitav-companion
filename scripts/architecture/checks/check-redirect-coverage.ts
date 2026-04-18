#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 2 Gate: Redirect Coverage
//
// Fails CI if any consolidation-map entry classified as
// DUPLICATE_MERGE_REQUIRED, DEPRECATE_WITH_REDIRECT, or
// REMOVE_AFTER_SAFE_MIGRATION has a `currentRoute` but no
// matching redirect target in src/admin/redirects/admin-redirect-map.ts.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import { ADMIN_PAGE_CONSOLIDATION_MAP } from "../../../src/platform/architecture/admin-page-consolidation-map";
import { ADMIN_REDIRECTS } from "../../../src/admin/redirects/admin-redirect-map";

const vc = new ViolationCollector();

const REDIRECT_CLASSES = new Set([
  "DUPLICATE_MERGE_REQUIRED",
  "DEPRECATE_WITH_REDIRECT",
  "REMOVE_AFTER_SAFE_MIGRATION",
]);

const redirectFromSet = new Set(ADMIN_REDIRECTS.map((r) => r.from));

let needRedirect = 0;
let covered = 0;

for (const entry of ADMIN_PAGE_CONSOLIDATION_MAP) {
  if (!REDIRECT_CLASSES.has(entry.pageClass)) continue;
  if (!entry.currentRoute) continue;
  if (entry.targetRoute === entry.currentRoute) continue;
  needRedirect++;
  if (redirectFromSet.has(entry.currentRoute)) {
    covered++;
  } else {
    vc.add(
      entry.component,
      "missing-redirect",
      `Page "${entry.component}" classified as ${entry.pageClass} with currentRoute "${entry.currentRoute}" has no entry in ADMIN_REDIRECTS.`,
    );
  }
}

console.log(`  📊 Redirect-eligible entries: ${needRedirect}`);
console.log(`  ✅ Covered: ${covered}`);
console.log(`  📋 Total redirects mounted: ${ADMIN_REDIRECTS.length}`);

vc.report("check-redirect-coverage");
vc.exitIfErrors();
