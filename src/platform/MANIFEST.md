# Platform — Canonical cross-pillar systems

> Owner: platform team. Authority: **Constitution Rules 27 & 28**.
> Canonical model: [`docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md`](../../docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md).
> Machine-readable map: [`generated/manifests/platform-subclassification-map.json`](../../generated/manifests/platform-subclassification-map.json).

`src/platform/` is **not** a flat folder. Every top-level child belongs to
exactly one of six canonical sub-classes with explicit allowed-dependency
directions (validator: `scripts/architecture/check-platform-subclassification.ts`,
BLOCKING — wired into `foundation-gate.yml`).

## The six platform sub-classes

### 1 · `runtime-bridges` (lowest layer — 17 systems)
Runtime/registry/integration/orchestration adapters and host SDKs.
_Allowed deps:_ `governance`, `identity-and-tenant`.

architecture · capabilities · ci · control-plane · core-services · deploy ·
eventing · execution · fip · integration · migration · nova-sdk ·
orchestration · registry · runtime · sync-engine · topology

### 2 · `identity-and-tenant` (3 systems)
Identity, auth, tenant, enterprise scoping.
_Allowed deps:_ `governance`, `runtime-bridges`.

auth · enterprise · tenant

### 3 · `governance` (7 systems)
Trust, security, policy, audit, contracts, verification.
_Allowed deps:_ `identity-and-tenant`, `runtime-bridges`.

contracts · governance · proof · security · trust · truth · verification

### 4 · `intelligence` (6 systems)
AI capability layer, knowledge spine, advisors, boardroom.
_Allowed deps:_ `governance`, `identity-and-tenant`, `runtime-bridges`.

advisors · ai · boardroom · intelligence · knowledge · product

### 5 · `product-infrastructure` (13 systems)
Reusable product capability surfaces (files, notifications, search,
app-platform, workspace, settings, etc.).
_Allowed deps:_ all except `operator-control`.

app-platform · apps · cloud · design-system · experience · files · marketing ·
notifications · personal-brain · search · settings · setup · workspace

### 6 · `operator-control` (8 systems — consumer surface)
Operator/admin/owner UI shells.
_Allowed deps:_ all other sub-classes.

admin\* · atlas · mission-control · observability · operations · owner ·
sita\* · support

\* `admin/**` and `sita/**` are dispositioned `relocate-future` — see the
model doc.

## Universal boundary rules

1. **No platform sub-class may import from `src/modules/<pillar>/**`**
   (Constitution Rule 2; validator `check-module-ownership.ts`).
2. **No cross-sub-class import outside the allowed-deps matrix.** Existing
   violations are frozen at **509** in
   `generated/manifests/platform-cross-subclass-baseline.json` as a monotone
   ratchet — count may only decrease.
3. **Platform owns capability; admin owns UI** (Rule 28). Operator dashboards
   over a platform capability live in `src/admin/**`, never in
   `src/platform/<X>/`.
4. New top-level `src/platform/<X>/` folders MUST be added to the
   subclassification map in the same PR or CI fails.

## How to add a new platform system

1. Pick a sub-class from the six above.
2. Add `src/platform/<your-system>/` and create files following the sub-class's
   allowed-dep matrix.
3. Re-run `npx tsx scripts/manifests/generate/generate-platform-subclassification-map.ts`.
4. Verify `npx tsx scripts/architecture/check-platform-subclassification.ts` is green.
