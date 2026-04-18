#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 2/4 Documentation Emitter
//
// Emits the human-readable & JSON forms of:
//   • REDIRECT_AND_ALIAS_MAP.md   (Phase 2)
//   • USER_DOMAIN_SURFACE_CONSOLIDATION.md  (Phase 4)
//   • redirect-alias-map.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { ADMIN_REDIRECTS } from "../../../src/admin/redirects/admin-redirect-map";
import { USER_REDIRECTS } from "../../../src/routes/redirects/user-redirect-map";

const OUTPUT_DIR = "generated/page-consolidation";
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const generatedAt = new Date().toISOString();

// ─── REDIRECT_AND_ALIAS_MAP.md ──────────────────────────────────
const redirectMd = `# Redirect & Alias Map
> Generated: ${generatedAt}
> Source: \`scripts/architecture/audits/emit-consolidation-docs.ts\`
> Status: Phase 2 (Redirect & Alias Layer) — **bookmark-safe forever**.

Every legacy / duplicate URL listed below resolves to its canonical
target via \`<Navigate to={canonical} replace />\`. CI gate
\`check-redirect-coverage\` blocks merge if any consolidation-map
entry classified as DUPLICATE_MERGE_REQUIRED, DEPRECATE_WITH_REDIRECT,
or REMOVE_AFTER_SAFE_MIGRATION lacks a redirect target.

## Admin redirects (${ADMIN_REDIRECTS.length} total)

| From | → | To | Reason | Source |
|---|---|---|---|---|
${ADMIN_REDIRECTS.map((r) => `| \`${r.from}\` | → | \`${r.to}\` | ${r.reason} | \`${r.sourceComponent}\` |`).join("\n")}

## User-domain redirects (${USER_REDIRECTS.length} total)

| From | → | To | Reason |
|---|---|---|---|
${USER_REDIRECTS.map((r) => `| \`${r.from}\` | → | \`${r.to}\` | ${r.reason} |`).join("\n")}

## How redirects are mounted

Both lists are spread into their respective route families:
- \`src/routes/AdminRoutes.tsx\` — appends \`ADMIN_REDIRECTS.map(...)\`
- \`src/App.tsx\` — appends \`USER_REDIRECTS.map(...)\`

This keeps the redirect surface auto-derived from the consolidation
map, so future Phase 5 view migrations only need to update the
classification — no second source of truth to keep in sync.
`;

const redirectJson = {
  generatedAt,
  admin: ADMIN_REDIRECTS,
  user: USER_REDIRECTS,
  totals: { admin: ADMIN_REDIRECTS.length, user: USER_REDIRECTS.length, all: ADMIN_REDIRECTS.length + USER_REDIRECTS.length },
};

// ─── USER_DOMAIN_SURFACE_CONSOLIDATION.md ───────────────────────
const userDomainMd = `# User Domain Surface Consolidation
> Generated: ${generatedAt}
> Source: \`scripts/architecture/audits/emit-consolidation-docs.ts\`
> Status: Phase 4 baseline — every user domain has a canonical shell owner.

## Canonical shells per user domain

| Domain | Shell page | Routes | Strategy |
|---|---|---:|---|
| **Business** | \`src/pages/BusinessCenter.tsx\` | 46 (single composite shell) | Already consolidated. Every \`/business/*\` route renders \`BusinessCenter\` and switches view via path. Phase 4 ✅ |
| **Money** | \`src/pages/MoneyCenter.tsx\` | 37 (single composite shell) | Already consolidated. \`/money/*\` paths render \`MoneyCenter\`. Phase 4 ✅ |
| **Concierge** | \`src/pages/ConciergeCenter.tsx\` | 20 (single composite shell) | Already consolidated. \`/concierge/*\` paths render \`ConciergeCenter\`. Phase 4 ✅ |
| **Investment Office** | \`src/features/investment-office/pages/InvestmentShellPage.tsx\` (Phase 4 scaffold) | 18 canonical + 100+ experimental | Shell scaffold added. Detail pages remain mounted under \`/investment/*\`; experimental \`/investments/*\` paths redirect to canonical. |
| **Files** | \`src/pages/FilesCenter.tsx\` | served by \`getFilesRoutes()\` | Composite shell; no Phase 4 changes. |
| **Boardroom** | \`src/pages/Boardroom.tsx\` | served by \`getBoardroomRoutes()\` | Composite shell; no Phase 4 changes. |
| **Communications** | \`src/pages/CommunicationsPage.tsx\` | served by \`getCommunicationsRoutes()\` | Composite shell; no Phase 4 changes. |
| **Apps** | \`src/pages/AppStoreCenter.tsx\` | served by \`getAppsRoutes()\` | Composite shell. |
| **Settings** | served by \`getSettingsRoutes()\` | Composite shell. |

## Why this looks "easy"

The user product plane was consolidated incrementally during the
Phase 24 work — most domains already follow the canonical shell
pattern (one page composes many child views). Phase 4 of the page
consolidation effort therefore only had to:

1. Add the \`InvestmentShellPage\` scaffold so the canonical owner is
   explicit (Investment Office had been mounted as 100+ flat routes
   under \`experimental-routes.tsx\`).
2. Wire \`/investments/*\` legacy plural URLs through the
   \`USER_REDIRECTS\` map (Phase 2).

All other domains already conformed.

## What is NOT in scope here

- ❌ No physical move of the 100+ Investment Office pages. They
  remain at \`src/pages/investment-office/*\` and continue to be
  mounted by \`investment-routes.tsx\` / \`experimental-routes.tsx\`.
- ❌ No deletion of any user-domain page.
- ❌ No collapse of the canonical \`/business/crm-*\` deep links —
  they stay first-class deep-linkable URLs.
`;

fs.writeFileSync(path.join(OUTPUT_DIR, "REDIRECT_AND_ALIAS_MAP.md"), redirectMd);
fs.writeFileSync(path.join(OUTPUT_DIR, "USER_DOMAIN_SURFACE_CONSOLIDATION.md"), userDomainMd);
fs.writeFileSync(path.join(OUTPUT_DIR, "redirect-alias-map.json"), JSON.stringify(redirectJson, null, 2));

console.log(`✅ Emitted Phase 2/4 docs:`);
console.log(`   → ${OUTPUT_DIR}/REDIRECT_AND_ALIAS_MAP.md`);
console.log(`   → ${OUTPUT_DIR}/USER_DOMAIN_SURFACE_CONSOLIDATION.md`);
console.log(`   → ${OUTPUT_DIR}/redirect-alias-map.json`);
console.log(`   Admin redirects: ${ADMIN_REDIRECTS.length}, User redirects: ${USER_REDIRECTS.length}`);
