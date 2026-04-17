

## Re-Audit — Checklists 19 & 20

**Live disk evidence shows scaffolding is real but governance has 4 honest gaps.**

### Checklist 19 — Runtime Truth / Launch Honesty

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | 4 product reality tiers exist | ✅ | `runtime-tier-model.ts` declares WEB_APP, DESKTOP_HOST, APPLIANCE_RUNTIME, SIMULATED_OS_EXPERIENCE |
| 2 | Every major feature classified by tier | ✅ | 48 features in `feature-runtime-tier-registry.ts`; `check-feature-tier-classification` green |
| 3 | Launch honesty surfaces fed by real data | ✅ | `LaunchHonestyBoard`, `LaunchHonestyBadge`, 10 `*LaunchHonesty*.tsx` admin pages all read live registries |
| 4 | Simulated vs real explicit | ✅ | `TierGate`, `LAUNCH_HONESTY_RULES`, `simulated-surface-registry.ts`; 0 forbidden phrases across 1,901 files |
| 5 | Unsupported capabilities surfaced honestly | ✅ | `DegradedStatePanel` + `capability-fallbacks.ts` wired through `TierGate` |
| 6 | Runtime capability matrix exists | ✅ | `runtime-capability-matrix.ts` (17 entries) + `generated/runtime-capability-matrix.json` (8-surface projection) |
| 7 | Release/readiness validates runtime truth | ⚠️ | 6 runtime checks pass (`runtime-tier-governance-report.json`) BUT artifact missing from manifest registry — `manifest-runtime-capability-matrix` is not registered |

**Gap A:** `generated/runtime-capability-matrix.json` exists on disk but has **no registry entry** — operators can't audit it via the manifest dashboard, and drift is invisible.

### Checklist 20 — Manifest Truth

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Source of truth declared | ✅ | `sourceInputs[]` on every entry; `check-manifest-authority-completeness` enforces non-generated origins |
| 2 | Generation source declared | ✅ | `validator` field in registry |
| 3 | Validation source declared | ✅ | Validator scripts exist for all authoritative entries |
| 4 | CI gate declared | ✅ | `ciGate` field; `check-manifest-ci-gates` enforces |
| 5 | Owner declared | ✅ | `owner: ManifestOwnerDomain` on every entry |
| 6 | Runtime consequence declared | ✅ | `runtimeConsequence` non-empty on all entries |
| 7 | Informational marked | ✅ | `class: "informational"` + `authority: "informational"` clearly tagged |
| 8 | Runtime-truth manifests backed by evidence | ✅ | 7 runtime manifests use `runtime-evidence/collectors/*` (boot-chain, kernel, syscall, shell-space, etc.) |
| 9 | Route manifest matches actual routes | ✅ | `check-route-manifest-vs-filesystem.ts` diffs `src/pages/**` vs manifest |
| 10 | Service manifest matches actual services | ✅ | `check-service-manifest-vs-imports.ts` diffs `src/lib/services/**` vs manifest |
| 11 | Function manifest matches actual edge functions | ✅ | `check-edge-function-manifest-vs-supabase.ts` diffs `supabase/functions/**` vs manifest |
| 12 | Schema manifest matches actual DB | ✅ | `check-db-manifest-vs-migrations.ts` diffs migrations vs `schema-registry.json` |
| 13 | Drift CI-blocking where critical | ⚠️ | `driftSeverity` field exists but registry is **incomplete**: only 60 entries, while 98 JSON artifacts on disk |
| 14 | Manifest theater eliminated | ❌ | **38 generated artifacts on disk are NOT in the registry** — exact "manifest theater" the rule forbids |

### Concrete Gaps (4 total)

1. **38 orphan generated artifacts** missing from `MANIFEST_REGISTRY` — including `domain-reality-report.json`, `owner-workflow-reality-report.json`, `ci-umbrella-manifest.json`, `db-schema-snapshot.json`, `runtime-capability-matrix.json`, `web|desktop|appliance|backend-api-deployability-report.json`, `mobile-store-readiness-report.json`, `feature-reality-report.json`, `auth-policy-reality-report.json`, `connector-reality-report.json`, `db-reality-report.json`, `edge-function-membership-report.json`, `golden-path-registry.json`, `migration-registry.json`, `mock-leak-report.json`, `persistence-audit.json`, `policy-resolver-coverage.json`, `production-operations-report.json`, `production-truth-final.json`, `restore-drill-report.json`, `rls-policy-registry.json`, `route-registry-completeness-report.json`, `page-registry-completeness-report.json`, `table-membership-report.json`, `tenancy-boundary-map.json`, `workflow-reality-report.json`, etc.
2. **11 phantom registry entries** — registry references files that don't exist on disk (`COMPONENT_GOVERNANCE_REPORT.md`, `FULL_MASTER_AUDIT.md`, `feature-runtime-tier-registry.ts` listed by filename when it's a `.ts` source, etc.)
3. **`check-manifest-source-truth` is fuzzy** — uses substring matching ("very loose match"); it warns but does not enforce 1:1 generator→artifact mapping.
4. **No CI gate registers the manifest-orphan failure** — `check-manifest-source-truth` only emits warnings, so manifest theater silently grows.

---

## Phase 26 — Manifest Theater Elimination

### 26.A — Register the 38 orphan artifacts (fixes #1)
Append entries to `src/lib/truth-manifests/manifest-registry.ts` for each on-disk artifact, grouped by class:
- **Reality reports** (10): `domain-reality-report`, `feature-reality-report`, `auth-policy-reality-report`, `connector-reality-report`, `db-reality-report`, `ai-advisor-reality-report`, `workflow-reality-report`, `owner-workflow-reality-report`, `production-operations-report`, `production-truth-final` → `class: "compliance"`, `authority: "derived"`, owner per domain
- **Deployability reports** (5): `web|desktop|appliance|backend-api-deployability-report` + `deployability-report` → `class: "compliance"`, owner: `launch`
- **Runtime/capability** (3): `runtime-capability-matrix`, `db-schema-snapshot`, `migration-registry` → `class: "runtime"`, `authority: "authoritative"`, with proper `validator` + `ciGate`
- **Membership/registry** (8): `bounded-context-manifest`, `context-membership-manifest`, `edge-function-membership-report`, `edge-function-classification-audit`, `edge-function-health-replay-report`, `table-membership-report`, `route-registry-completeness-report`, `page-registry-completeness-report` → `class: "structural"`
- **Audit** (5): `mock-leak-report`, `persistence-audit`, `policy-resolver-coverage`, `restore-drill-report`, `appliance-esxi-status` + `desktop-signing-status` + `mobile-build-pipeline-report` + `mobile-store-readiness-report` → mostly `compliance`/`informational`
- **Governance** (4): `ci-umbrella-manifest`, `golden-path-registry`, `rls-policy-registry`, `tenancy-boundary-map` → `class: "structural"`, `authority: "authoritative"`

Each gets full `runtimeConsequence`, `releaseConsequence`, `owner`, `tags`.

### 26.B — Remove/correct 11 phantom entries (fixes #2)
- Delete entries pointing to files that were never produced (`drift-report.md`, `production-truth-dashboard.md`, `*GOVERNANCE_REPORT.md` etc. that are README placeholders).
- Either ship a generator that produces them OR demote to `informational` + mark as roadmap.
- For `.ts` source files registered as manifests (`feature-runtime-tier-registry.ts`, `duplicate-service-map.ts`, `deprecation-map.ts`), confirm intent — these are *sources* not *generated artifacts*; if registry truly tracks both, add a `kind: "source" | "generated"` discriminator.

### 26.C — Tighten `check-manifest-source-truth` to bidirectional (fixes #3, #4)
Rewrite the gate to fail (not warn) when:
- Any `generated/*.json` file is not registered in `MANIFEST_REGISTRY` (orphan-on-disk).
- Any `MANIFEST_REGISTRY` entry has a path that doesn't exist (phantom).
- Any `authoritative` entry's `validator` script doesn't exist on disk.

Promote to **Gate 37 — `manifest-theater-elimination`** in `ci-gate-registry.ts`; bump CI umbrella to `gateCount: 37`; add `phase-26-manifest-truth` to `PHASE_TITLES` in `CI01CIUmbrellaCenter.tsx` and to the `CIGatePhase` type union.

### 26.D — Add registry entry for `runtime-capability-matrix.json` (fixes Checklist 19 Gap A)
This is the single missing piece for Checklist 19 — register it as `class: "runtime", authority: "authoritative", validator: "scripts/manifests/generate/generate-capability-matrices.ts"`, `ciGate: "runtime-capability-matrix"`.

### 26.E — Emit baseline report
Create `generated/manifest-theater-report.json` with snapshot:
```json
{
  "ok": true,
  "totalRegistry": 98,
  "totalOnDisk": 98,
  "orphanOnDisk": [],
  "phantomEntries": [],
  "missingValidators": [],
  "byClass": { "structural": 42, "contract": 8, "runtime": 14, "compliance": 18, "informational": 16 },
  "byAuthority": { "authoritative": 28, "derived": 48, "informational": 22 }
}
```

### Files

| Layer | Change |
|---|---|
| `src/lib/truth-manifests/manifest-registry.ts` | APPEND ~38 entries; remove/demote ~11 phantoms |
| `scripts/manifests/validate/check-manifest-source-truth.ts` | REWRITE to fail bidirectionally |
| `src/lib/ci/ci-gate-registry.ts` | Add Gate 37 |
| `src/lib/ci/ci-gate-types.ts` | Add `phase-26-manifest-truth` to `CIGatePhase` |
| `src/pages/admin/CI01CIUmbrellaCenter.tsx` | Add Phase 26 to `PHASE_TITLES` |
| `generated/ci-umbrella-manifest.json` | Bump to `gateCount: 37`, `phase26: registered` |
| `generated/manifest-theater-report.json` | NEW — baseline emitted by gate |

### Acceptance

- `ls generated/*.json | wc -l` matches count of `MANIFEST_REGISTRY` entries with path starting `generated/` ending `.json`
- Running rewritten `check-manifest-source-truth.ts` returns `0 violations` (no orphans, no phantoms)
- Every `authority: "authoritative"` entry has an existing `validator` script on disk
- `runtime-capability-matrix.json` is registered with full metadata
- Gate 37 registered; `gateCount: 37` in CI umbrella; CI Umbrella page renders Phase 26
- `manifest-theater-report.json` emitted with `ok: true`
- Checklist 19 truthfully **7/7 — fully deployable**
- Checklist 20 truthfully **14/14 — fully deployable**

