# Wave 0.8 — Platform ↔ Admin Boundary Hardening

## Audit findings (real repository state)

The Wave 0.5–0.7 substrate already enforces:

- **Cross-subclass imports** inside `src/platform/**` (decrease-only baseline = 509).
- **`platform → admin` direction** (sealed baseline = 1; the lone offender is `src/platform/architecture/page-consolidation.ts` which only re-exports `@/admin/redirects/admin-redirect-map`).
- **`src/pages/admin/**`** thin-adapter ratchet (576 legacy bodies, decrease-only).
- **Semantic route-adapter** contract for `src/pages/**` (550 violations baselined).

What is **NOT yet enforced** — the actual residual blur this wave fixes:

| # | Blur | Evidence |
|---|---|---|
| 1 | **Operator-surface page bodies live inside `src/platform/`** | 27 platform systems contain a `pages/` directory; 207 page-body `.tsx` files total. Many are clearly operator/admin surfaces, not reusable capability: `platform/trust/pages/{TrustAudit, TrustApprovals, ApprovalChamber, PolicyEditor, …}`, `platform/governance/pages/GovernanceDashboard`, `platform/observability/pages/{ObservabilityPage, ServiceArchitectureDashboard, SystemStatus, …}`, `platform/operations/pages/*`, `platform/mission-control/pages/*`. |
| 2 | **No capability↔admin-surface map exists** | The Wave 0.5 subclassification map says `observability`, `operations`, `mission-control` are `operator-control`, but does not split each platform `pages/` directory into "capability page" vs "operator surface that should live in `src/admin/`". |
| 3 | **Validators don't catch operator-UI contamination of `src/platform/**`** | `check-platform-subclassification.ts` only enforces cross-subclass *import* direction. There is no rule preventing a new operator dashboard from being added under `src/platform/<governance|trust|verification|security>/pages/`. |
| 4 | **`src/platform/admin/**` is dispositioned `relocate-future`** | 151 files of admin command palettes/sub-navs/shells live in `src/platform/admin/` and are re-exported by `src/admin/components/index.ts` (Constitution Rule 28 already calls this out — but the ratchet for it is advisory). |

**No physical file moves** will be performed. Wave 10 attestation seal stays intact. This wave installs the **enforcement substrate + a precise capability↔admin-surface inventory** so future relocation waves can drain the violations safely.

---

## What I will install

### 1. New canonical doc — `docs/architecture/PLATFORM_VS_ADMIN_BOUNDARY_MODEL.md`

Defines the hard model (capability vs operator surface), the dependency direction matrix, the rules for what may live in `src/platform/<system>/pages/`, and explicitly maps each capability family to its admin-surface counterpart.

### 2. New manifest generator — `scripts/manifests/generate/generate-platform-admin-capability-surface-map.ts`

Walks every `src/platform/<system>/pages/**.tsx` and classifies each file as one of:

- `capability-page` — legitimately part of the platform capability (e.g. `setup/pages/SetupWizard.tsx`, `app-platform/pages/AppDetail.tsx`, end-user product surface owned by the capability)
- `operator-surface` — admin/operator dashboard that should live in `src/admin/modules/<domain>/views/` (e.g. `governance/GovernanceDashboard`, `trust/TrustAudit`, `observability/ServiceArchitectureDashboard`)
- `end-user-surface` — surface meant for product users (Trust Center, Approvals Chamber, Personal Brain views) — stays in platform, but flagged for future relocation review
- `ambiguous` — needs human decision; included in the report for triage

Classification heuristics: name patterns (`*Dashboard`, `*Audit`, `*Center`, `*Console`, `*Board`), folder subclass (`operator-control` → strong operator-surface signal), import patterns (e.g. importing `@/components/admin/*` or `@/platform/admin/*`), and an explicit override table inside the generator for manual classification.

Outputs:
- `generated/manifests/platform-admin-capability-surface-map.json` — full per-file map with `currentPath`, `subclass`, `classification`, `recommendedAdminTarget` (e.g. `src/admin/modules/trust-security/views/TrustAudit.tsx`), and `routeAdapterPath` (which `src/pages/**` file routes to it).

### 3. New blocking validator — `scripts/architecture/check-platform-operator-surface-ratchet.ts`

- Reads the surface map.
- Maintains a **monotone-decreasing baseline** (`generated/manifests/platform-operator-surface-baseline.json`) of files currently classified `operator-surface` inside `src/platform/`.
- Fails CI on any **increase** (i.e. any new operator dashboard added to `src/platform/`).
- Fails CI on any **new** `src/platform/<system>/pages/` directory whose subclass is `operator-control` *unless* the file is added to the baseline allow-list with explicit justification.

### 4. New blocking validator — `scripts/architecture/check-platform-admin-surface-coherence.ts`

Cross-checks:
- Every file classified `operator-surface` has a route adapter under `src/pages/**` *or* `src/pages/admin/**` (i.e. is reachable).
- No file under `src/platform/<system>/pages/` imports from `src/admin/**` (already guarded by Rule 31 baseline; this duplicates the assertion at the page-body level for clarity).
- No new platform folder is added without a subclassification entry **and** a capability-surface classification.

### 5. Constitution amendment — `docs/architecture/REPOSITORY_CONSTITUTION.md`

Add **Rules 36–38**:
- **Rule 36 — Platform pages must be capability pages.** Files under `src/platform/<system>/pages/**` must be capability-owned (end-user product surface or capability-internal). Operator/admin dashboards belong in `src/admin/modules/<domain>/views/`. Decrease-only ratchet.
- **Rule 37 — Capability ↔ admin-surface map.** Every platform system that exposes operator-relevant state must declare its admin-surface counterpart in `generated/manifests/platform-admin-capability-surface-map.json`. New platform `pages/` directories require a classification entry.
- **Rule 38 — Operator surface dependency direction (formal restatement).** `admin → platform` ✅ (consume capability). `platform → admin` ❌ (capability never reaches into operator UI). `admin` MAY aggregate platform read-models via service facades; admin MUST NOT redefine capability state.

### 6. Promote the Wave 0.6 `platform→admin` direction from baseline-1 to **strict zero**

The lone offender (`src/platform/architecture/page-consolidation.ts`) only consumes the `ADMIN_REDIRECTS` constant. Move that constant from `@/admin/redirects/admin-redirect-map` to `@/platform/architecture/admin-redirect-map` (it's pure data, not UI), then update both the consolidation file and `src/admin/redirects/admin-redirect-map.ts` to re-export from the platform location. After this, `platform→admin` baseline collapses to **0** and the rule becomes strict (any new `platform→admin` import fails CI immediately, no ratchet).

### 7. Wire into CI + foundation manifest

- Register both new validators (`check-platform-operator-surface-ratchet`, `check-platform-admin-surface-coherence`) in `src/lib/ci/validator-gate-map.ts` as `block` / foundation tier.
- Add to `.github/workflows/foundation-gate.yml`.
- Re-run `scripts/manifests/generate/generate-foundation-manifest-index.ts` so `generated/manifests/foundation-manifest-index.json` and `foundation-tier-validator-set.json` pick up the new entries.
- Re-emit `generated/validator-gate-map.json`.

### 8. Audit + baseline updates

- New: `generated/audits/platform-admin-boundary-hardening-report.md` — old blur, new model, full classification of all 207 platform page-body files, dependency rules, validator coverage, future relocation waves.
- Update: `generated/audits/repository-canonicalization-baseline.json` with `platformAdminBoundaryInstalled: true` block (wave 0.8, validator paths, baseline counts, model doc).
- Update: `src/platform/MANIFEST.md` to reference the new boundary doc.
- Update: `src/admin/MANIFEST.md` to reference the new boundary doc and the capability↔surface map.

---

## Safety posture

- **No physical file moves** of the 207 platform page-body files. Each is classified and either kept (capability) or baselined-for-future-relocation (operator-surface).
- **One small, surgical move**: the `ADMIN_REDIRECTS` data constant from `src/admin/redirects/` to `src/platform/architecture/`, which collapses the last `platform→admin` import. This is data, not UI, so it does not violate any rule.
- **Wave 10 attestation seal**: only `generated/**`, `docs/**`, `scripts/**`, `src/lib/ci/**`, `src/admin/MANIFEST.md`, `src/platform/MANIFEST.md`, and the one redirect-map move are touched. The `wave-10-architectural-attestation.json` digest is computed over `src/components`, `src/modules`, `src/platform`, `src/pages`, `src/admin`, `src/runtimes`, `src/routes` — the redirect map move is inside `src/admin` and `src/platform` and will require a re-seal entry, which I will record explicitly in the report.
- All ratchets are **decrease-only** and seeded from the current real numbers (no synthetic baselines).
- All validators run in `--warn` mode locally first (sanity), then promote to blocking via the gate map.

---

## Files I will create or modify

**Create**:
- `docs/architecture/PLATFORM_VS_ADMIN_BOUNDARY_MODEL.md`
- `scripts/manifests/generate/generate-platform-admin-capability-surface-map.ts`
- `scripts/architecture/check-platform-operator-surface-ratchet.ts`
- `scripts/architecture/check-platform-admin-surface-coherence.ts`
- `scripts/architecture/checks/check-platform-operator-surface-ratchet.ts` (gate-map discovery shim)
- `scripts/architecture/checks/check-platform-admin-surface-coherence.ts` (gate-map discovery shim)
- `generated/manifests/platform-admin-capability-surface-map.json`
- `generated/manifests/platform-operator-surface-baseline.json`
- `generated/audits/platform-admin-boundary-hardening-report.md`
- `src/platform/architecture/admin-redirect-map.ts` (moved from `src/admin/redirects/`)

**Modify**:
- `docs/architecture/REPOSITORY_CONSTITUTION.md` (add Rules 36–38; tighten Rule 31 platform→admin to strict-zero)
- `src/admin/redirects/admin-redirect-map.ts` (becomes a 2-line re-export from the platform location)
- `src/platform/architecture/page-consolidation.ts` (update import to platform location)
- `src/lib/ci/validator-gate-map.ts` (register two new blocking validators)
- `.github/workflows/foundation-gate.yml` (wire two new validators)
- `scripts/manifests/generate/generate-foundation-manifest-index.ts` (include new manifests)
- `generated/manifests/foundation-manifest-index.json` (regenerated)
- `generated/manifests/foundation-tier-validator-set.json` (regenerated)
- `generated/validator-gate-map.json` (regenerated)
- `generated/manifests/admin-dependency-violation-baseline.json` (set `platformImportingAdminCount: 0`)
- `generated/audits/repository-canonicalization-baseline.json` (add `platformAdminBoundaryInstalled` block)
- `src/platform/MANIFEST.md` (reference new boundary doc)
- `src/admin/MANIFEST.md` (reference new boundary doc + surface map)

---

## Verification I will run before declaring done

1. `npx tsc --noEmit` (no broken imports from the redirect-map move).
2. `npx tsx scripts/manifests/generate/generate-platform-admin-capability-surface-map.ts` succeeds and emits the expected JSON shape.
3. `npx tsx scripts/architecture/check-platform-operator-surface-ratchet.ts` exits 0 against its own freshly-generated baseline.
4. `npx tsx scripts/architecture/check-platform-admin-surface-coherence.ts` exits 0.
5. `npx tsx scripts/architecture/check-admin-plane-boundaries.ts` exits 0 with the new strict-zero `platform→admin` rule.
6. `npx tsx scripts/manifests/generate/generate-foundation-manifest-index.ts` regenerates the index containing both new manifests + both new validators.
7. `rg "from ['\"]@/admin" src/platform/` returns **zero** results after the redirect-map move.
8. Spot-check 5 high-risk page bodies (`TrustAudit`, `GovernanceDashboard`, `ObservabilityPage`, `ServiceArchitectureDashboard`, `OperationsDashboard`) appear in the surface map with classification `operator-surface` and a `recommendedAdminTarget` path.
9. Spot-check that 5 capability pages (`AppDetail`, `SetupWizard`, `TrustCenter`, `PersonalBrain` views, `Workspace` views) appear classified as `capability-page` or `end-user-surface` (NOT `operator-surface`).
10. Open the report and confirm it tallies: total platform `pages/` files = 207, classification breakdown sums correctly, baseline file mirrors the operator-surface count.

---

## What this wave deliberately does NOT do

- Does NOT physically move any of the 207 platform page bodies (deferred to the future Platform→Admin Relocation Wave, gated by Rule 24 evidence + Rule 19 attestation re-seal).
- Does NOT relocate the 151 files in `src/platform/admin/` (already dispositioned `relocate-future` by Wave 0.5; this wave just makes its boundary stronger).
- Does NOT change any route, profile gate, lazy-load chain, or shell mount.
- Does NOT touch the `src/modules/<pillar>/**` tree.

The result is a fully-defined, machine-enforced boundary with a sealed inventory of every operator-surface contamination — ready to be drained file-by-file in a future relocation wave without losing any current behavior or attestation.