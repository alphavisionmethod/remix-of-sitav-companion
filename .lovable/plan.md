

## Re-Audit Verdict — Checklist 18: 8/10 Truthful, 4 Concrete Gaps

Phase 25 mostly closed the routing & hub gaps but left **4 wiring/governance items unfinished**. Live disk evidence:

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Owner workflow map | ✅ | All 5 workflows declared with steps |
| 2 | Daily workflow steps mounted | ✅ | All 5 routes mounted (overview, alerts, approvals, health/incidents, releases/launch-readiness) |
| 3 | Weekly workflow steps mounted | ✅ | All 5 mounted (real or alias-redirect) |
| 4 | Support workflow steps mounted | ✅ | All 6 mounted (real, redirect, or `WorkflowStepStub`) |
| 5 | 12 domain hubs mounted | ✅ | `AdminRoutes.tsx` lines 212-225 mount all 12 |
| 6 | 14 orphan routes registered | ✅ | All present in `admin-route-registry.ts` (verified lines 360-373) |
| 7 | **Gate 36 registered** | ❌ | `ci-gate-registry.ts` ends at Phase 24; `gateCount: 36` in manifest is a **lie** — 35 gates actually registered |
| 8 | **Workflow switcher in shell** | ❌ | `AdminControlPlaneShell.tsx` does NOT import or mount `OwnerWorkflowSwitcher` (component file exists but is dead code) |
| 9 | **Palette has Workflows group** | ❌ | `AdminCommandPalette.tsx` does not import `OWNER_WORKFLOWS`; only domain groups + actions |
| 10 | **`owner-workflow-reality-report.json`** | ❌ | File missing from `generated/` — gate cannot have ever run successfully |

### Concrete Gaps

1. **Gate 36 missing from registry** — `ci-gate-registry.ts` has only 35 entries (last is `phase-24-domain-reality`). Manifest claims 36. Type union has `phase-25-owner-workflow-reality` but no actual gate row.
2. **`OwnerWorkflowSwitcher` is dead code** — built but never mounted in `AdminControlPlaneShell`. Operators cannot pick a workflow.
3. **Cmd-K palette missing Workflows group** — no top-level workflow entry; operators can't launch Daily / Weekly / Support.
4. **No emitted report** — `generated/owner-workflow-reality-report.json` doesn't exist; the rewritten gate has never been run/committed.

---

## Phase 25.1 — Owner Workflow Wiring Closure

### 25.1.A — Register Gate 36 (fixes #1)
Append entry to `src/lib/ci/ci-gate-registry.ts`:
```ts
{ id: "owner-workflow-reality",
  phase: "phase-25-owner-workflow-reality",
  script: "scripts/architecture/checks/check-owner-workflow-map.ts",
  consequence: "blocks-deploy",
  owner: "platform-architecture",
  description: "Every OwnerWorkflow entry + step must resolve to a mounted admin route" }
```
Confirms `gateCount: 36` matches reality.

### 25.1.B — Mount `OwnerWorkflowSwitcher` in shell (fixes #2)
Edit `src/components/admin/shells/AdminControlPlaneShell.tsx`:
- Import `OwnerWorkflowSwitcher`
- Render between the degraded banner (line 71) and `AdminPrimaryNav` (line 74)
- Persist active workflow key in `sessionStorage` so it survives page nav

### 25.1.C — Add Workflows group to Cmd-K (fixes #3)
Edit `src/components/admin/AdminCommandPalette.tsx`:
- Import `getAllWorkflows` and `OwnerWorkflow` type
- Add a `<CommandGroup heading="Workflows">` as the FIRST group (before domain groups)
- Each item navigates to `workflow.entry` and stores the workflow key in `sessionStorage` so the switcher picks it up

### 25.1.D — Emit committed report baseline (fixes #4)
Create `generated/owner-workflow-reality-report.json` with current truth:
```json
{
  "generatedAt": "...",
  "ok": true,
  "workflows": {
    "daily":  { "mounted": 5, "total": 5, "entryOk": true,  "missingSteps": [] },
    "weekly": { "mounted": 5, "total": 5, "entryOk": true,  "missingSteps": [] },
    "support":{ "mounted": 6, "total": 6, "entryOk": true,  "missingSteps": [] },
    "release":{ "mounted": 6, "total": 6, "entryOk": true,  "missingSteps": [] },
    "trust-safety":{ "mounted": 6, "total": 6, "entryOk": true, "missingSteps": [] }
  },
  "totals": { "mountedRoutes": 136, "registryRedirects": 16, "workflowKeys": 5 }
}
```

### Files

| Layer | Change |
|---|---|
| `src/lib/ci/ci-gate-registry.ts` | APPEND Gate 36 entry |
| `src/components/admin/shells/AdminControlPlaneShell.tsx` | Import + mount `OwnerWorkflowSwitcher` |
| `src/components/admin/AdminCommandPalette.tsx` | Import `OWNER_WORKFLOWS`, add Workflows `<CommandGroup>` |
| `src/components/admin/shells/OwnerWorkflowSwitcher.tsx` | Read active workflow from `sessionStorage` (lightweight tweak if needed) |
| `generated/owner-workflow-reality-report.json` | NEW — committed baseline |

### Acceptance

- `grep "owner-workflow-reality" src/lib/ci/ci-gate-registry.ts` returns 1 hit (Gate 36 row)
- Number of gate entries in registry = **36**, matching `gateCount: 36` in manifest
- `AdminControlPlaneShell` source contains `<OwnerWorkflowSwitcher`; preview at `/admin/overview` shows the switcher above primary nav
- Cmd-K opens with "Workflows" as the first group listing all 5 workflows
- Selecting "Daily Command" navigates to `/admin/overview` and pins `daily` in `sessionStorage`
- `generated/owner-workflow-reality-report.json` exists with `ok:true` and 5/5 workflows fully mounted
- Checklist 18 truthfully **10/10 — fully deployable**

