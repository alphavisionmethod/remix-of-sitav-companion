# Platform Law Registry

## Purpose
**Pure rules-as-data.** Constitutional rules, policy registries, and legal/compliance rule sets expressed as typed data (no runtime, no side effects, no I/O).

## Layer
Cross-cutting **policy data** layer consumed by Layer-3 platform code, Layer-2 services, and CI gates.

## What lives here
- Typed registries of rules (e.g., autonomy-class rules, plane boundary rules).
- Constitutional invariants checked by CI gates.
- Schema-validated policy bundles.

## What does NOT belong here
- Any runtime code (no functions that perform I/O, network, DB).
- Per-tenant policy state — that lives in DB tables.
- BFF/RBAC routing → `src/lib/platform-plane/`.

## Canonical neighbors
- `src/lib/platform/` — runtime that enforces these rules.
- `src/lib/platform-plane/` — BFF + RBAC layer that consumes plane-boundary rules.
- `scripts/architecture/checks/` — CI gates that assert these rules at build time.
