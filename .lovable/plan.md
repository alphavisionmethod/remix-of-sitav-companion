

## Re-Audit — Checklist 23: 5/11 Truthful, 6 Concrete Gaps

Live disk shows the Golden Path **registry exists** (15 paths, evaluator, ownership map, admin UI `META03GoldenPathHealth.tsx`, CI gate `check-golden-path-coverage.ts`), but the **per-journey 11-dimension mapping required by Checklist 23 is incomplete** — and several referenced verification artifacts do not exist on disk.

### What IS truthful (✅)

| # | Item | Evidence |
|---|---|---|
| 1 | Routes mapped | Every step has `routePattern` (e.g. `/login`, `/business/connect`, `/admin/integrations/sync`) |
| 2 | Proofs mapped | Every step has `expectedReceipts` + path-level `completionReceipts` |
| 3 | Tests declared | `verifications[].artifactRef` references Playwright specs and runtime probes |
| 4 | Owner mapped | `ownerTeam` per path + `GOLDEN_PATH_OWNERSHIP.escalationTarget` |
| 5 | Recovery runbooks mapped | `recoveryRunbookRefs` per step + per path; cross-checked by CI gate |

### What is NOT truthful (❌) — 6 gaps

| # | Item | Status | Evidence |
|---|---|---|---|
| A | **Screens mapped** | ❌ missing | `GoldenPathStep` has `routePattern` but no `screenComponentRef` (e.g. `src/pages/Login.tsx`). Operators can't trace a step to the actual React component |
| B | **APIs/edge functions mapped** | ❌ missing | No `edgeFunctionRefs: string[]` on steps. Cannot trace `submit-credentials` → which edge function, `oauth-handshake` → `connector-oauth`, `first-sync` → `connector-sync` |
| C | **Services mapped** | ❌ missing | No `serviceRefs: string[]` linking steps to canonical services in `canonical-service-registry.ts` |
| D | **Tables mapped** | ❌ missing | No `tableRefs: string[]` linking step mutations to actual DB tables (e.g. `profiles`, `connector_tokens`, `approval_decisions`) |
| E | **Policies mapped** | ❌ missing | No `rlsPolicyRefs` or `policyDomainRefs`. `expectedMutations` are abstract strings (`auth.session.create`) with no link to RLS policies on affected tables |
| F | **Release gates mapped** | ❌ missing | No `releaseGateRefs: string[]` linking paths to launch readiness gates (Gate 23, Gate 37, etc.) |
| G | **Test artifacts referenced are PHANTOM** | ❌ critical | Registry references `tests/e2e/customer-journey/auth/first-boot.spec.ts`, `sign-in.spec.ts`, `restore.spec.ts`, `connect-crm.spec.ts`, `oauth-and-sync.spec.ts`, `setup-continuation.spec.ts` — **none of these files exist on disk**. Disk has only `sign-in-primary.spec.ts`, `sign-out-primary.spec.ts`, `connected-services-open-primary.spec.ts` |
| H | **Runtime probes referenced are PHANTOM** | ❌ critical | Registry references `src/lib/runtime/probes/first-boot-probe.ts`, `oauth-sync-probe.ts` — directory `src/lib/runtime/probes/` **does not exist** |
| I | **Support fallback path** | ⚠️ partial | `escalationTarget` exists in `GOLDEN_PATH_OWNERSHIP` but no `supportFallbackUrl` (e.g. `/admin/support?path=GP-SIGN-IN`) tying paths into FCC04 Runbook Center or incident timeline |

CI gate `check-golden-path-coverage.ts` currently passes only because it checks `verifications[].kind` and `artifactRef` strings — **it does not verify the file actually exists on disk**. This is silent verification theater.

---

## Phase 29 — Golden Path Reality Closure

### 29.A — Extend `GoldenPathStep` schema (fixes A–F, I)

Add to `src/lib/operations/golden-path-types.ts`:
```ts
interface GoldenPathStep {
  // ...existing
  screenComponentRef?: string;        // e.g. "src/pages/Login.tsx"
  edgeFunctionRefs: readonly string[]; // e.g. ["connector-oauth"]
  serviceRefs: readonly string[];      // e.g. ["auth-service"] — keys in canonical-service-registry
  tableRefs: readonly string[];        // e.g. ["profiles", "connector_tokens"]
  policyRefs: readonly string[];       // e.g. ["profiles.user_self_access"]
}
interface GoldenPathEntry {
  // ...existing
  releaseGateRefs: readonly string[];      // e.g. ["GATE-23-GOLDEN-PATH"]
  supportFallbackUrl: string;              // deep-link e.g. "/admin/support?path=GP-SIGN-IN"
}
```

### 29.B — Backfill all 15 Golden Paths with real cross-references

For each of the 15 paths, populate the new fields by walking the existing registries:
- **edge functions** ← from `edge-function-topology.ts`
- **services** ← from `canonical-service-registry.ts`
- **tables** ← from `db-schema-registry`
- **policies** ← from `db-policy-registry` (or extracted from migrations)
- **release gates** ← from `launch-readiness-gates.ts`
- **screens** ← from `route-registry` reverse lookup on `routePattern`

Example for `GP-SIGN-IN.submit-credentials`:
```ts
screenComponentRef: "src/pages/Login.tsx",
edgeFunctionRefs: [],   // uses supabase auth directly
serviceRefs: ["auth-service"],
tableRefs: ["auth.users", "profiles"],
policyRefs: ["profiles.user_self_access", "profiles.user_self_update"],
```

### 29.C — Replace phantom verification refs with real on-disk artifacts (fixes G, H)

- Audit every `artifactRef` in the registry against disk
- For each missing spec: either point to the existing `*-primary.spec.ts` equivalent OR create the missing spec stub
- Create `src/lib/runtime/probes/` directory with the 6 referenced probes (`first-boot-probe.ts`, `oauth-sync-probe.ts`, `restore-probe.ts`, `mobile-approval-probe.ts`, `workflow-replay-probe.ts`, `env-recovery-probe.ts`) as real callable functions returning `ProbeResult`

### 29.D — Strengthen CI gate to detect phantom artifacts

Extend `scripts/architecture/checks/check-golden-path-coverage.ts`:
- For every `artifactRef`, assert `fs.existsSync(artifactRef)` — fail build on phantom
- For every `edgeFunctionRefs[i]`, assert it exists in `edge-function-topology`
- For every `serviceRefs[i]`, assert it exists in `canonical-service-registry`
- For every `tableRefs[i]`, assert it exists in `db-schema-registry`
- For every `releaseGateRefs[i]`, assert it exists in `launch-readiness-gates`

### 29.E — Surface the 11-dimension map in admin UI

Update `src/pages/admin/META03GoldenPathHealth.tsx`:
- Add "Reality Map" panel per step showing the 11 dimensions in a grid
- Add deep-links: route → preview, edge function → admin function logs, table → DB explorer, policy → RLS browser, runbook → FCC04, gate → launch readiness board
- Add `supportFallbackUrl` button that takes operator straight to the right support context

### 29.F — Generate operability artifact + register manifest

- Generate `generated/golden-path-reality-report.json`:
  ```json
  {
    "totalPaths": 15,
    "dimensionsRequired": 11,
    "dimensionsCovered": { "GP-SIGN-IN": 11, "GP-FIRST-BOOT": 11, ... },
    "phantomArtifacts": [],
    "ok": true
  }
  ```
- Register in `manifest-registry.ts` (113 → 114 entries)

### Files

| Layer | Change |
|---|---|
| `src/lib/operations/golden-path-types.ts` | Add 6 new fields to step + entry |
| `src/lib/operations/golden-path-registry.ts` | Backfill 15 paths × N steps with real refs |
| `src/lib/runtime/probes/` (NEW) | 6 real probe implementations |
| `tests/e2e/customer-journey/**` | Fix or create missing specs referenced by registry |
| `scripts/architecture/checks/check-golden-path-coverage.ts` | Assert on-disk existence + cross-registry resolution |
| `scripts/support/runbooks/generate-golden-path-registry.ts` | Emit reality report |
| `src/pages/admin/META03GoldenPathHealth.tsx` | Render 11-dimension reality map per step |
| `src/lib/truth-manifests/manifest-registry.ts` | Register entry 114 |
| `generated/golden-path-reality-report.json` | NEW |

### Acceptance

- Every `GoldenPathStep` declares non-empty `edgeFunctionRefs` (or explicit `[]` with comment), `serviceRefs`, `tableRefs`, `policyRefs`, `screenComponentRef`
- Every `GoldenPathEntry` declares `releaseGateRefs` and `supportFallbackUrl`
- `check-golden-path-coverage.ts` passes with **0 phantom artifacts** and resolves every cross-registry reference
- `META03GoldenPathHealth` shows full 11-dimension reality map per step with working deep-links
- `generated/golden-path-reality-report.json` shows `ok: true` and `dimensionsCovered = 11/11` for all 15 paths
- Manifest registry grows to 114 entries; Gate 37 stays green
- Checklist 23 truthfully **11/11 — fully deployable**

