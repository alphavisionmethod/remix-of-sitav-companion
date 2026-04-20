# Layer-3 Platform Services

## Purpose
**Platform plumbing barrel** — auth, proof/receipts, execution policies, observability hooks, sync, notifications. These are cross-cutting infrastructure capabilities consumed by every domain.

## Layer
**Layer 3** in the SITA Service Constitution (infrastructure under the domain organs).

## What lives here
- Auth helpers (session, RBAC checks, MFA gates).
- Proof/receipt emission primitives.
- Execution policy guards (autonomy gates, quotas).
- Observability hooks that wrap `src/lib/observability/`.
- Sync primitives, notification routing helpers.

## What does NOT belong here
- Domain logic → `src/lib/services/`.
- Pure rules data (no runtime) → `src/lib/platform-law/`.
- BFF + RBAC for Admin/User planes → `src/lib/platform-plane/`.
- Web-target deployability contract → `src/lib/web-platform/`.

## Canonical neighbors
- `src/lib/platform-law/` — pure rules-as-data registry (no runtime).
- `src/lib/platform-plane/` — BFF + RBAC + safety + notification routing per plane.
- `src/lib/web-platform/` — web-target deployability contract (browser min-version, runtime).
- `src/lib/observability/` — telemetry primitives this layer wraps.
