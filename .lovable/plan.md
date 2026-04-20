
## Diagnosis

The runbook surface **artifacts all exist** (RunbookViewer, AdminRunbookViewerPage, FCC04RunbookCenter, RUNBOOK_REGISTRY=22 entries, runbook-index.json=31 entries, routes mounted in `AdminRoutes.tsx`, BLOCK gate #25 `check-runbook-coverage` green). The **real gap** is that the runbook surface is not declared in the canonical 12-domain IA registry (`src/platform/architecture/admin-route-registry.ts`), so:

1. `AdminDomainNav` (sidebar driven by registry) does not surface a "Runbooks" tab under Support
2. The deep-link viewer route `/admin/support/runbooks/:id` is not in the registry at all
3. No gate asserts the support domain exposes a runbook surface

This is the literal "runbook tab is not wired" symptom in audit row 79.

## Plan — wire runbook surface into 12-domain IA

### 1. Register runbook surface in canonical IA registry
Edit `src/platform/architecture/admin-route-registry.ts` Support cluster (around line 357):
- Add `/admin/support/runbooks` as `nav: "subnav"` with `component: "FCC04RunbookCenter"`, breadcrumb `["Support", "Runbooks"]`, workflow `["support"]`, permission `maintenance.view`
- Add `/admin/support/runbooks/:id` as `nav: "explorer"` with `component: "AdminRunbookViewerPage"`, breadcrumb `["Support", "Runbooks", "Detail"]`
- Mark legacy `/admin/founder/runbooks` (line 349) as `nav: "deprecated"` with `replacedBy: "/admin/support/runbooks"`

### 2. Mount canonical route in `AdminRoutes.tsx`
Add `<Route path="/admin/support/runbooks" element={gated("maintenance.view", <FCC04RunbookCenter />)} />` so the registry-declared canonical path actually resolves (currently only the legacy `/admin/founder/runbooks` mounts the same component).

### 3. Surface runbook tab in Support hub
`src/pages/admin/support/SupportHome.tsx` already includes a Runbooks `HubModule` — verify `legacyPath` updates to `/admin/support/runbooks` so the hub URL aligns with the canonical registry entry.

### 4. New BLOCK gate `check-admin-runbook-surface-wiring`
Create `scripts/architecture/checks/check-admin-runbook-surface-wiring.ts`:
- Asserts ADMIN_ROUTE_REGISTRY contains `/admin/support/runbooks` (subnav, support domain, workflow=support, component=FCC04RunbookCenter)
- Asserts deep-link viewer `/admin/support/runbooks/:id` registered (component=AdminRunbookViewerPage)
- Asserts SupportHome's `HubModule[]` includes id="runbooks"
- Asserts AdminRoutes.tsx mounts the canonical path
- Emits `generated/admin-runbook-surface-report.json` with `ok/errors/warnings`
- Wire as BLOCK gate #28 in `MANDATORY_BLOCK_GATES` of `check-os-release-readiness.ts`

### 5. Update audit doc (all 4 mirrors)
Patch row 79 in `public/generated/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md` (and `/mnt/documents/` mirrors) — replace the current text with `**RESOLVED 2026-04-20**` markers describing the registry entries, canonical mount, hub tab, and BLOCK gate #28. Keep all 4 mirrors byte-identical (md5sum verified).

## Files

**Created (2):**
- `scripts/architecture/checks/check-admin-runbook-surface-wiring.ts`
- `generated/admin-runbook-surface-report.json` (gate output, auto-emitted)

**Edited (5):**
- `src/platform/architecture/admin-route-registry.ts` (3 entries)
- `src/routes/AdminRoutes.tsx` (1 new route)
- `src/pages/admin/support/SupportHome.tsx` (legacyPath alignment)
- `scripts/architecture/checks/check-os-release-readiness.ts` (BLOCK gate #28)
- `public/generated/MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md` + 2 `/mnt/documents/` mirrors

## What this does NOT touch

- Zero schema changes
- Zero edge function changes
- No changes to RunbookViewer / AdminRunbookViewerPage / FCC04RunbookCenter component code
- No changes to RUNBOOK_REGISTRY content (22 entries already complete)
- No changes to runbook-index.json (31 entries already mirrored)
- BLOCK gate #25 `check-runbook-coverage` untouched — gate #28 is additive
