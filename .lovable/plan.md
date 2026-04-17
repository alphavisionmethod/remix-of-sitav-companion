

Looking at the current state, I need to verify what already exists before planning. The repo already shows extensive kill-switch infrastructure (KILL_SWITCH_REGISTRY, 14 switches, enforcement map, runtime consequences, dependency map), runbook registry (RB-001 through RB-019), and an AR08KillSwitchCenter admin page. Let me check what's actually missing vs what's already real.
<lov-plan>

Based on the visible files, **most of Section B is already implemented**:
- ✅ 14 kill switches in registry with enforcement map (verified by `kill-switch-enforcement-report.json`)
- ✅ 19 runbooks with markdown files + CI gate
- ✅ Edge function enforcement (12 functions verified calling `checkKillSwitchOrReject`)
- ✅ Admin UI at `/admin/automation/kill-switches`
- ✅ Runbook coverage CI gate

What I need to verify/complete is the DB persistence layer, audit trail, UI polish, and incident-to-runbook wiring. Let me explore before finalizing.

## Plan: Section B — Operational Safety Hardening (gap-fill, no duplicates)

### What already exists (keep as-is)
- `KILL_SWITCH_REGISTRY` with 14 switches + `kill-switch-enforcement-map.ts` + `kill-switch-runtime-consequence.ts` + `kill-switch-dependency-map.ts`
- 12 edge functions instrumented with `checkKillSwitchOrReject` / `checkAnyKillSwitchOrReject`
- 19 runbooks under `docs/runbooks/` + `runbook-registry.ts` + CI coverage gate
- `AR08KillSwitchCenter` admin page mounted at `/admin/automation/kill-switches`
- `useKillSwitchGate` UI hook

### Gaps to close (real work)

**Phase 1 — DB persistence + audit trail (1 migration)**
- `system_kill_switches` table — current state per switch_id (enabled, reason, scope, severity, activated_by/at, expires_at, requires_approval, metadata) with RLS (admin-only write, authenticated read for UI gates)
- `kill_switch_audit_log` table — every activation/deactivation with actor, reason, before/after state, timestamp, runbook_link
- `incidents` table extension — add `kill_switch_id`, `runbook_id`, `subsystem`, `severity`, `classification` columns if missing
- `incident_classifications` table — maps subsystem+symptom → recommended runbook + kill switch
- Trigger: auto-write audit log row on INSERT/UPDATE to `system_kill_switches`
- Seed all 14 switches as inactive rows

**Phase 2 — Runtime read-through (replace static registry checks with DB-backed)**
- Edit `src/lib/control-plane/kill-switch-runtime.ts` (and Deno equivalent in `supabase/functions/_shared/`) to query `system_kill_switches` table with 30s in-memory cache instead of static config
- Keep registry as the *catalog* (what switches exist), use DB as *state* (which are active)
- Edge function `kill-switch-toggle` — admin-gated mutation endpoint that writes to DB + emits audit + raises alert
- Edge function `kill-switch-state` — public read for UI gating

**Phase 3 — Admin UI upgrade (refactor existing AR08KillSwitchCenter)**
- Activate/deactivate dialog with **mandatory reason** (min 20 chars) + optional TTL
- Dependency warning banner (uses `recommendCascade`)
- Affected systems summary (reads `enforcementLayers` + `affectedEdgeFunctions`)
- Audit history panel per switch (last 50 actions)
- Live state indicator (pulse animation when active)
- Active emergency banner across `AdminControlPlaneShell` when any severe switch is on
- Dual-approval flow for `requires_approval=true` switches (KS-PAYMENTS, KS-MODEL-PROVIDERS, KS-RELEASE-ROLLOUT, KS-APPLIANCE-UPDATE)

**Phase 4 — Incident classification + runbook linking**
- `src/lib/incidents/incident-classifier.ts` — maps `(subsystem, symptom_code)` → `{severity, runbook_id, recommended_switch_id, escalation_owner}`
- Wire into existing `raiseAlert` flow: when alert fires, auto-classify and attach runbook + suggested switch
- New component `IncidentRunbookLink.tsx` — surfaces runbook + "activate kill switch" CTA inside incident/alert cards
- Update `ObservabilityPage` Alerts tab to show classification + runbook link
- Update `Support Gateway` to deep-link from alerts → runbook markdown viewer

**Phase 5 — Runbook viewer (in-app)**
- `src/components/admin/runbooks/RunbookViewer.tsx` — renders markdown from `docs/runbooks/*.md` (fetched at build time via Vite glob)
- Route `/admin/support/runbooks/:id` — already in `runbook-registry`, just needs the viewer page
- Cross-link from `AR08KillSwitchCenter` → relevant runbook

**Phase 6 — Tests**
- `system-kill-switches.test.ts` — DB toggle → runtime cache invalidation → enforcement check passes/blocks
- `incident-classifier.test.ts` — every subsystem maps to a real runbook + valid switch
- `kill-switch-audit.test.ts` — every state change writes audit row
- Extend existing `kill-switch-enforcement.test.ts` — verify DB-backed runtime path

### Files

**New (~14)**
- 1 migration (4 tables + trigger + seed)
- 2 edge functions (`kill-switch-toggle`, `kill-switch-state`)
- 1 shared Deno helper (`supabase/functions/_shared/kill-switch-db.ts`)
- 3 lib files (`incident-classifier.ts`, `kill-switch-db-client.ts`, `runbook-loader.ts`)
- 4 UI components (`KillSwitchToggleDialog`, `KillSwitchAuditPanel`, `IncidentRunbookLink`, `RunbookViewer`)
- 1 page (`AdminRunbookViewerPage`)
- 3 test files

**Edited (~6)**
- `src/lib/control-plane/kill-switch-runtime.ts` — DB-backed state
- `src/pages/admin/AR08KillSwitchCenter.tsx` — dialog + audit + dependencies
- `src/components/admin/AdminControlPlaneShell.tsx` — emergency banner
- `src/lib/observability/raise-alert.ts` — auto-classify + attach runbook
- `src/pages/ObservabilityPage.tsx` — show classification on alerts
- `src/routes/AdminRoutes.tsx` — mount runbook viewer route

### Honest scope
- Dual approval for severe switches: schema + UI flow real; second approver must be a different admin user (enforced server-side)
- TTL expiration: `expires_at` column + `kill-switch-expiry-cron` (1-min pg_cron) auto-deactivates expired switches and writes audit row
- Audit immutability: `kill_switch_audit_log` has no UPDATE/DELETE policies, append-only

### Acceptance
- Admin opens kill-switch center → toggles KS-PAYMENTS → must enter reason → DB row updated → `payment-process` edge function rejects within 30s → audit row visible → emergency banner appears across admin shell
- Alert fires for `subsystem=payments` → automatically links to RB-005 + suggests KS-PAYMENTS → operator clicks "View Runbook" → markdown renders in-app → clicks "Activate Switch" → goes to pre-filled toggle dialog
- TTL set to 1h → cron auto-deactivates → audit shows `auto_expired=true`
- Dual-approval switch cannot activate without second admin's confirmation
- All existing CI gates still pass; 4 new tests pass; 0 TS errors

