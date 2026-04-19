# Architecture Ownership Map

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Source of truth:** `generated/ownership-manifest.json`

## 1. Ownership model

Every architectural concern has a primary owner. Owners are responsible for:
- Maintaining canonical truth in their domain
- Reviewing PRs that touch their domain
- Updating their generated reports when changes land

## 2. Domain ownership (from ownership manifest)

| Domain | Owner | Canonical scope |
|---|---|---|
| Core OS plane | core-os team | `src/lib/nova-sdk/`, `src/runtimes/` |
| Shell runtime plane | shell-runtime team | `src/shell/`, `electron/`, `os/runtime/` |
| User product plane | user-product team | `src/domains/user/`, `src/pages/` (user-facing) |
| Admin control plane | admin-control team | `src/domains/admin/`, `src/pages/admin/` |
| Backend services plane | backend-services team | `supabase/functions/`, `supabase/migrations/` |

## 3. Truth manifest ownership

| Manifest | Primary owner | Validator owner |
|---|---|---|
| Route truth | user-product + admin-control | `check-route-truth` |
| Plane boundaries | core-os | `check-plane-import-graph` |
| Service ownership | backend-services | `check-service-topology` |
| Edge function topology | backend-services | `check-edge-function-topology` |
| Portability boundaries | core-os | `check-runtime-host-boundaries` (NEW) |
| Mobile scope | core-os + user-product | `check-mobile-archived-scope` (NEW) |
| Kernel honesty | core-os | `check-no-kernel-overclaim` (NEW) |
| Architecture hardening | core-os + admin-control | `check-doc-canonicality` (NEW) |

## 4. Truth panel ownership

All 10 truth panels on `AIRuntimeHome.tsx` are owned by **admin-control team** (operator-facing surface). Per-panel data ownership flows to the originating closure team.

## 5. Closure ownership history

| Closure | Owner | Status |
|---|---|---|
| Architectural cleanup | core-os | ✅ Shipped |
| Economic trust + future | trust-ux + core-os | ✅ Shipped |
| Security & portability | security + core-os | ✅ Shipped |
| Mobile scope | core-os + user-product | ✅ Shipped |
| Hardware & operator | hardware + admin-control | ✅ Shipped (WARN-tier) |
| Admin & validation | admin-control | ✅ Shipped |
| Architecture hardening | core-os + admin-control | ✅ Shipped (THIS CLOSURE) |

## 6. Cross-references

- `generated/ownership-manifest.json` — canonical machine-readable map
- `generated/SERVICE_GOVERNANCE_REPORT.md` — per-service ownership
