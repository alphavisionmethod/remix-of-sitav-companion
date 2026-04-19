# ADR — No top-level `src/services/` directory

**Status:** Decided
**Date:** 2026-04-19
**Phase:** Phase 18 — Layout & CI Truth
**Closes:** `PROJECT_TREE_AUDIT.md` Section A, item #2

---

## Context

A previous audit pass flagged the absence of a top-level `src/services/` directory as a structural gap, observing that "service-shaped logic is split across `src/lib/`, `src/packages/`, and `core-services/`."

This ADR formally records that the absence is **deliberate**, not a defect.

## Decision

**SITA OS will not introduce a top-level `src/services/` directory.**

The Service Layer authority model (see `memory/architecture/service-constitution`) defines five layers:

1. **Core Platform** — infrastructure and foundations
2. **Domain Services** — business logic ← *lives in `src/lib/core-services/`*
3. **Integration Adapters** — provider translation
4. **Read Models / Projections** — UI data shaping
5. **UI Clients / Hooks** — frontend consumption

Layer 2 (Domain Services) has a single canonical home: **`src/lib/core-services/`**. This is enforced by the `service-facade.ts` barrel and by cross-layer import boundary checks.

Adding a parallel `src/services/` directory would:

- **Split Layer 2 authority** across two locations, violating the "single canonical home" rule of the service constitution.
- **Invalidate existing import-boundary checks** that key off `src/lib/core-services/`.
- **Force a 200+ file move** with no functional benefit and significant churn risk.
- **Re-fragment** the very topology this ADR is closing.

`src/packages/` hosts Layer 1 (Core Platform) services such as event bus, eventing infrastructure, and runtime primitives — by design, not by accident.

## Consequences

- ✅ Layer 2 service authority remains unambiguous and single-rooted.
- ✅ Existing CI gates (`service-topology`, `plane-import-graph`, `service-facade-purity`) continue to enforce boundaries without modification.
- ✅ `PROJECT_TREE_AUDIT.md` item A2 is closed as **Decided**, not Open.
- ⚠️ New contributors must learn the convention: "Domain services live in `src/lib/core-services/`, not `src/services/`."

## Enforcement

This decision is asserted by:

- `scripts/architecture/checks/check-cosmetic-debt-closure.ts` — verifies this ADR exists.
- `memory/architecture/service-constitution` — canonical layer definitions.
- `service-facade.ts` barrel — runtime authority for Layer 2 exports.

## Revisiting

This ADR may be revisited only if a future architectural review demonstrates that the cost of the convention exceeds the cost of a rename. As of Phase 18, no such evidence exists.
