# Architectural Cleanup Inventory — Hardening Pass

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Status:** audit-only (zero code mutation)

## 1. Prior closures (canonical, do not duplicate)

This inventory builds on top of prior cleanup work. Prior canonical inventories:

- `generated/architectural-cleanup/ARCHITECTURAL_CLEANUP_INVENTORY.md` — original 16-deliverable inventory
- `generated/security-and-portability-closure/` — 13 markdowns + 5 JSONs (security/portability)
- `generated/economic-trust-and-future-closure/` — 7 markdowns + 3 JSONs (per-user budgets, trust UX, future containment)
- `generated/mobile-scope-closure/` — mobile honesty containment

This document **canonicalizes by reference** rather than duplicating evidence already proven in those closures.

## 2. New cleanup candidates discovered in this hardening pass

### 2.1 Partial-surface families (audit-only this pass)

The following 6 route families are partial in production polish, not architectural correctness. Closure is **audit + recommendation** only; UI rewrites belong to a separate flagship-surface pass.

| Family | Route prefix | Status | Recommendation |
|---|---|---|---|
| Onboarding | `/onboarding/**` | Partial polish; simulated personas labeled | Gate copy-only; no auto-claim of agent autonomy |
| Boardroom | `/boardroom/**` | Loop visible; learning-loop v2 partial | Gate v2 wording behind feature flag |
| Concierge | `/concierge/**` | AI degraded states partial | Surface receipt status in degraded UX |
| Communications | `/communications/**` | Long-tail connector limits partial | Make manual-tier connectors explicit |
| Admin AI Runtime | `/admin/ai-runtime/**` | 10 truth panels + this hardening panel | Already canonical; no further action |
| Admin Integrations | `/admin/integrations/**` | Operator drilldowns partial | Surface reauth/degraded paths in detail drawer |

### 2.2 Containment zones (already enforced)

| Zone | Containment artifact | Validator |
|---|---|---|
| Native mobile | `archive/mobile/ARCHIVED.md`, `MOBILE_HONESTY.md` | `check-mobile-archived-scope` (NEW) |
| Nova Runtime SDK simulation | `docs/architecture/native-os-future/KERNEL_OWNERSHIP_GAP.md` | `check-no-kernel-overclaim` (NEW), `check-no-user-visible-nova-kernel-claims` |
| Future surfaces | `src/runtimes/simulated-surface-registry.ts` | `check-future-surfaces-registered` |

### 2.3 Cleanup classifications (this pass)

- **Canonical, keep:** all current `src/runtimes/`, `src/lib/services/`, `src/contracts/`, `src/domains/`
- **Already classified:** all 11 portability-classified hooks (see `portability-boundary-model.ts`)
- **Already contained:** all native mobile + Nova kernel simulation
- **Audit-only this pass:** 6 partial-surface families (see 2.1)
- **Zero deletions:** strictly additive; removal candidates are tracked in `SAFE_FILE_REMOVAL_POLICY.md` for deferred action

## 3. Source-of-truth pointers

- Edge function topology: `generated/edge-function-topology-report.json`
- Service ownership: `generated/ownership-manifest.json`
- Route truth: `generated/route-truth-report.json`
- Plane boundaries: `generated/5-plane-boundaries-report.json`
- Runtime tiers: `src/runtimes/feature-runtime-tier-registry.ts`
- Mobile scope: `MOBILE_HONESTY.md` + `archive/mobile/ARCHIVED.md`
- Kernel honesty: `docs/architecture/native-os-future/KERNEL_OWNERSHIP_GAP.md`

## 4. Out of scope for this hardening pass

- Mass deletion of any file (deferred to proven-safe future pass)
- UI rewrites of partial-surface families (separate flagship pass)
- Refactoring the 27 `needs-standardization` edge functions (additive future work)
- Any change to other admin domains, sealed migrations, or `archive/` directory
