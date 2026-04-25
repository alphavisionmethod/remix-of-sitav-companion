# Profile Visibility & Operator Separation Model

> **Status:** Adopted (Wave D §D.1 — Constitution Rule 45)
> **Authority:** `generated/manifests/profile-route-visibility-map.json`
> **Validator (BLOCK):** `scripts/architecture/checks/check-profile-visibility-leakage.ts`
> **Source projection:** `generated/profile-and-runtime-hardening/app-route-profile-map.json`

## Why this exists

SITA OS ships as **two deployment profiles** (`user`, `operator`) on **one substrate**.
The 5-plane architecture model already separates *runtime* visibility, but the
**source-tree law** was implicit. Wave D promotes profile separation to a
constitutional rule with a central manifest, an automated leakage detector, and
a monotone-decreasing baseline ratchet.

## The five visibility classes

Every route in `src/routes/**` is projected into one of these classes:

| Class | Profile set | Permitted plane | Required guard |
|---|---|---|---|
| **operator-only** | `["operator"]` | `admin` | `AdminRoute` and/or `PermissionGatedRoute` |
| **user-only** | `["user"]` | `shell-runtime`, `user`, `backend-services` | optional auth guard |
| **both** | `["user","operator"]` | `shell-runtime` shared surfaces | role-aware UI |
| **unscoped** | `[]` | public/marketing/auth surfaces | none |
| **leak-risk** | `["operator"]` but reachable without admin guard | n/a — **violation** | — |

## Hard rules

1. **Operator-only surfaces MUST NOT leak into user route trees** without an
   explicit `AdminRoute` / `PermissionGatedRoute` / `RequirePermission` guard.
2. **Profile-specific route visibility is centrally registered** in
   `generated/manifests/profile-route-visibility-map.json`. The manifest is a
   pure projection of the runtime hardening map; it MUST be regenerated whenever
   the source changes (Constitution Rule 25 — manifest freshness).
3. **Page adapter families MAY declare profile availability** via a top-of-file
   directive: `// @profile: user`, `// @profile: operator`, or `// @profile: both`.
   When present, the directive MUST match the manifest profile set or CI fails.
4. **Product shells MUST NOT import operator-only admin surfaces.** This is
   enforced by the existing UI Ownership Law (§C.1) and the import-direction
   rules of Constitution Rule 31 (`platform → admin ❌`, `modules → admin ❌`).
5. **Admin/operator visibility is architecture law**, not just a deployment
   detail. The validator runs on every PR; new leak-risk routes BLOCK CI.

## How violations are surfaced

`check-profile-visibility-leakage.ts` produces
`generated/profile-visibility-leakage-report.json` with three failure classes:

- `newViolators` — net-new operator-only routes lacking an admin guard
- `directiveMismatches` — `// @profile:` directive contradicts the manifest
- `missing-profile` (informational) — routes without any profile assignment

Pre-existing leak-risk routes (zero at Wave D seal) are pinned in
`generated/baselines/profile-visibility-leakage-baseline.json`. Re-sealing
requires `--reseal` and an ADR.

## Relationship to existing systems

- **Builds on** `app-route-profile-map.json` (Phase B profile-and-runtime hardening)
- **Complements** `check-route-plane-coverage.ts`, `check-shared-component-profile-pollution.ts`, `check-command-palette-profile-leakage.ts`
- **Complements** Constitution Rule 31 (admin plane dependency direction)
- **Does NOT replace** the per-domain admin uniqueness rule
  (`check-no-duplicate-primary-concept.ts`) — see §D.2 for cross-cutting concept law.