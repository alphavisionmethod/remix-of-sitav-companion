# Admin Plane Ownership Model

**Status:** Adopted (Wave 0.6).
**Authority:** Constitution Rules 29–32.
**Companion docs:**
- [`ADMIN_INFORMATION_ARCHITECTURE.md`](./ADMIN_INFORMATION_ARCHITECTURE.md) — 12 canonical admin domains.
- [`ROUTE_AND_APP_PLANE_MAP.md`](./ROUTE_AND_APP_PLANE_MAP.md) — operator-only profile gating.
- [`PLATFORM_SUBCLASSIFICATION_MODEL.md`](./PLATFORM_SUBCLASSIFICATION_MODEL.md) — platform capability sub-classes.

## Why this exists

Before Wave 0.6, the constitution declared `src/admin/` the canonical admin
home, but **583 admin page bodies physically lived in `src/pages/admin/`** with
only 7 thin adapters — and `src/planes/admin.ts` never referenced `@/admin/**`.
Without explicit law, dependency direction, and a monotone ratchet, admin was
at risk of becoming a parallel ownership layer beside platform/pillars.

This document is the canonical model. It is enforced by code, not aspiration.

## The four-layer admin plane

| Layer | Owner | What it owns | Hard rules |
|---|---|---|---|
| `src/admin/**` | Admin/operator team | Canonical page bodies, layouts, navigation, dashboards, operator consoles, workflows. | May depend on `platform`, `lib`, `components/ui`, contexts, hooks. |
| `src/pages/admin/**` | Route adapter layer | **Thin re-export wrappers only** (≤10 logical lines) targeting `@/admin/**`. | New files must be adapters. Existing 576 legacy bodies are grandfathered into a decrease-only ratchet. |
| `src/lib/platform-plane/*` and `src/lib/admin-ai/*` | Admin services layer | RBAC, safety gates, BFF, support workflow, notification routing, AI workforce client. | Reused by `src/admin/**` and surfaced via `src/planes/admin.ts`. |
| `src/planes/admin.ts` | Plane public API | Re-exports the admin plane's public surface (services + canonical UI barrels). | Must align with code reality — no orphan exports. |

## Admin vs Platform — capability ownership

| Concept | Lives in | Example |
|---|---|---|
| Reusable cross-pillar **capability** | `src/platform/<sub-class>/<system>/` | `@/platform/governance/trust/*` (trust state engine), `@/platform/observability/uptime/*`. |
| Operator/admin **UI over that capability** | `src/admin/modules/<domain>/views/` | `@/admin/modules/trust-security/views/AdminRBACConsole`, `@/admin/modules/verification/views/V07LaunchBlockerBoard`. |

**Admin may aggregate platform/pillar read-models. Admin may not become the canonical owner of platform capability or pillar product logic.**

## Admin vs Modules — product ownership

| Concept | Lives in | Example |
|---|---|---|
| Pillar product page | `src/modules/<pillar>/pages/` | `@/modules/business/pages/CRMHome`. |
| Admin **inspection/read-model** of pillar state | `src/admin/modules/<domain>/views/` | `@/admin/modules/operations/views/PillarHealthBoard` (reads via service facade). |

`src/admin/**` MUST NOT import a pillar page body. It consumes pillar state
through service facades, contracts, or read-only projections only.

## Dependency matrix (CI-enforced)

| From | May import | Must NOT import |
|---|---|---|
| `src/admin/**` | `platform/**`, `lib/**`, `components/ui/**`, `contexts/**`, `hooks/**`, `contracts/**`, `integrations/**` | `modules/<pillar>/**` |
| `src/pages/admin/**` (new) | `@/admin/**` only | Anything else (must be thin adapter) |
| `src/platform/**` | (per platform sub-class matrix) | `admin/**` |
| `src/modules/<pillar>/**` | (per pillar rules) | `admin/**` |

Enforcement: `scripts/architecture/check-admin-plane-boundaries.ts`,
`scripts/architecture/check-admin-page-body-ratchet.ts`.

## Operator-only vs product-observable surfaces

- **Operator-only** (default for `/admin/*`): only routable inside the operator
  deployment profile. Enforced by `src/lib/architecture/route-plane-map.ts`
  and `check-admin-ia.ts`.
- **Product-observable but admin-owned**: admin pages that surface state
  visible elsewhere (e.g. trust badges) must use the platform capability — they
  do not become the canonical owner.
- **Profile-gating** is route-level: admin routes are mounted only when the
  operator profile is active. See `ROUTE_AND_APP_PLANE_MAP.md`.

## Migration policy (Rule 30 ratchet)

1. **New work** lands directly in `src/admin/modules/<domain>/views/`. The
   wrapper at `src/pages/admin/<domain>/<View>.tsx` is mandatory.
2. **Legacy bodies** in `src/pages/admin/*` migrate one at a time:
   - Move body to `src/admin/modules/<domain>/views/<View>.tsx`.
   - Replace original file with a 1–5 line re-export.
   - Re-run `generate-admin-plane-ownership-map.ts` to update the ratchet.
3. **The ratchet only decreases.** Any PR that increases the legacy count
   fails CI.
4. **No bulk physical move** — Wave 10 attestation must remain stable; each
   migration is gated by the safe-change ledger.

## Manifests

| Manifest | Purpose | TTL |
|---|---|---|
| `generated/manifests/admin-plane-ownership-map.json` | Per-file classification + dependency inventory | 30 days |
| `generated/manifests/admin-page-body-baseline.json` | Sealed legacy-body ratchet baseline | sealed |
| `generated/manifests/admin-dependency-violation-baseline.json` | Sealed cross-plane import baseline | sealed |
| `generated/manifests/admin-page-body-ratchet-report.json` | Latest ratchet result | per-run |

## Validators (foundation tier, BLOCKING)

- `scripts/architecture/check-admin-plane-boundaries.ts` — Rule 31 dependency direction + Rule 30 page-body ratchet.
- `scripts/architecture/check-admin-page-body-ratchet.ts` — Rule 30 monotone ratchet.
- Pre-existing: `check-admin-domain-budget`, `check-admin-ia`, `check-admin-route-coherence`, `check-admin-route-registry-conformance`, `check-admin-shell-consistency`, `check-admin-page-classification-coverage`.
