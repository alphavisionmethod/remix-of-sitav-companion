

## Immediate fix + larger remediation plan

### Build error root cause
During Wave 2 of Phase 5 (page migration), the AdminRBACConsole shim was created at `src/pages/admin/cloud/AdminRBACConsole.tsx` pointing to `@/admin/modules/trust-security/views/AdminRBACConsole`, but the target file was **never actually created** (it shows in the prior summary, but is not on disk). Three consumers import `AdminRBACConsole` as a **named export**:
- `src/admin/pages/fleet/index.ts` line 34
- `src/pages/admin/cloud/CloudBackboneAdmin.tsx` line 38
- The shim itself only re-exports `default`

### Phase A — Hotfix (unblocks build, ~2 min)

1. Create the missing target file `src/admin/modules/trust-security/views/AdminRBACConsole.tsx` with the full component body (move it from `src/pages/admin/cloud/AdminRBACConsole.tsx`).
2. Update the shim at `src/pages/admin/cloud/AdminRBACConsole.tsx` to re-export both named + default:
   ```ts
   export { AdminRBACConsole, AdminRBACConsole as default } from "@/admin/modules/trust-security/views/AdminRBACConsole";
   ```
3. Add the entry to `src/admin/modules/trust-security/views/index.ts` barrel.
4. Run `tsc --noEmit` to confirm green.

### Phase B — Architecture Remediation (4 ordered phases, each independently deployable)

**B1 — Evidence Maps (read-only, no code changes)**
Build four JSON evidence graphs under `generated/architecture-remediation/`:
- `service-topology-map.json` — every file in `src/lib/`, `src/platform/`, `src/data*/`, `src/integrations/`, `src/domains/` classified as platform-svc / domain-svc / runtime-svc / data-svc / integration-svc / orchestration-svc / not-a-service, with import-graph evidence.
- `contract-topology-map.json` — every type/schema/event file classified as canonical-contract (in `src/contracts`) vs leaked-contract (elsewhere), with target home.
- `plane-isolation-graph.json` — full directed import graph keyed by plane (user/admin/shell/backend/core), flagging direct AND transitive cross-plane edges.
- `route-truth-map.json` — for every `<Route>` and every page file: route↔target↔plane↔nav-reference↔test-reference, flagging dead/orphaned/duplicate/wrapper.

Deliverable: 4 audit MDs (`SERVICE_TOPOLOGY_AUDIT.md`, `CONTRACT_TOPOLOGY_AUDIT.md`, `PLANE_ISOLATION_PROOF.md`, `ROUTE_TRUTH_AND_TOPOLOGY_AUDIT.md`). Zero code changes.

**B2 — Guardrail Checks (additive only)**
Add 6 new CI checks under `scripts/architecture/checks/`:
- `check-service-topology.ts` — fails on hidden-service drift in `src/lib/`
- `check-contract-topology.ts` — fails on contract leakage outside `src/contracts/`
- `check-plane-import-graph.ts` — graph-aware boundary check (transitive)
- `check-route-truth.ts` — every `<Route>` resolves to an existing canonical target
- `check-dead-pages.ts` — flags pages not referenced by any route
- `check-route-wrapper-usage.ts` — flags undeclared route wrappers/aliases

All start as **warning-level** (matches the existing `check-5-plane-boundaries.ts` pattern) so they don't break the build.

**B3 — Targeted Structural Fixes (only what evidence demands)**
Based on B1 results, perform low-risk fixes:
- Move provably-hidden service files from `src/lib/` to their canonical home (platform/domain/data/integration), leaving thin re-export shims only where consumers exist outside our control.
- Move leaked contracts into `src/contracts/<family>/`, update import surfaces.
- Fix only the plane-isolation violations the graph proves are real (not declared); use adapter interfaces where breaking the import would lose behavior.
- Convert dead routes to redirects via the existing `admin-redirect-map.ts` / `user-redirect-map.ts` rather than deleting.

**Decision gates** (set before B3 starts, decided by B1 evidence):
- Whether to create a small `src/services/` layer — only if B1 proves true cross-cutting orchestration services exist with no canonical home.
- Whether to recreate `src/packages/` — default is **no**; `src/contracts/` stays canonical unless B1 proves a packaging boundary is needed.

**B4 — Verification**
Run the full 8-gate suite + 6 new checks + `tsc --noEmit`. Emit `FINAL_VERIFICATION_RESULTS.md` and `verification-results.json`.

### What this plan explicitly will NOT do
- ❌ Recreate `src/services/` or `src/packages/` without evidence
- ❌ Mass-move files based on naming alone
- ❌ Delete any service/contract/page without a redirect or canonical replacement
- ❌ Promote new checks to error-level on first run (warn-first, then graduate)
- ❌ Touch the user/operator profile model or plane registry

### Files produced
```
generated/architecture-remediation/
├─ SERVICE_TOPOLOGY_AUDIT.md
├─ CONTRACT_TOPOLOGY_AUDIT.md
├─ PLANE_ISOLATION_PROOF.md
├─ ROUTE_TRUTH_AND_TOPOLOGY_AUDIT.md
├─ SERVICE_REMEDIATION_PLAN.md
├─ CONTRACT_REMEDIATION_PLAN.md
├─ PLANE_ISOLATION_FIXES.md
├─ ROUTE_REMEDIATION_PLAN.md
├─ STALE_PAGES_AND_ROUTE_WRAPPERS.md
├─ ARCHITECTURE_HARDENING_STATUS.md
├─ FINAL_VERIFICATION_RESULTS.md
├─ service-topology-map.json
├─ contract-topology-map.json
├─ plane-isolation-graph.json
├─ route-truth-map.json
└─ verification-results.json

scripts/architecture/checks/
├─ check-service-topology.ts        (new, warn-level)
├─ check-contract-topology.ts       (new, warn-level)
├─ check-plane-import-graph.ts      (new, warn-level)
├─ check-route-truth.ts             (new, warn-level)
├─ check-dead-pages.ts              (new, warn-level)
└─ check-route-wrapper-usage.ts     (new, warn-level)

src/admin/modules/trust-security/views/AdminRBACConsole.tsx   (Phase A hotfix)
```

### Ship order
```
A (hotfix, ~2 min, unblocks build)
   ↓
B1 (evidence, ~5 min, additive)
   ↓
B2 (guardrails, ~5 min, additive warn-level)
   ↓
B3 (targeted fixes — scope determined by B1 evidence)
   ↓
B4 (verification)
```

After approval I will execute Phase A first to clear the build error, then proceed straight into B1 → B2 → B3 → B4 in the same wave.

