# Platform Plane (BFF + RBAC)

## Purpose
**Backend-for-frontend + RBAC + safety + notification routing** for the Admin and User planes. This is the per-plane composition layer that decides what each plane can see and do.

## Layer
Cross-cutting **plane composition** layer. Sits above Layer-3 `platform/` runtime and below the route handlers in `src/pages/`.

## What lives here
- Plane-scoped BFF helpers (Admin BFF, User BFF).
- RBAC composition (combines `platform-law/` rules with session state).
- Safety gates per plane (e.g., admin confirmation, dual-approval).
- Notification routing per plane (who gets paged, who gets in-app).

## What does NOT belong here
- Domain logic → `src/lib/services/`.
- Generic platform primitives → `src/lib/platform/`.
- Rule definitions → `src/lib/platform-law/`.

## Canonical neighbors
- `src/lib/platform/` — generic platform primitives this layer composes.
- `src/lib/platform-law/` — rules-as-data this layer consumes.
- `src/lib/architecture/route-plane-map.ts` — explicit route ↔ plane mapping.
- `src/lib/architecture/app-plane-map.ts` — explicit app ↔ plane mapping.
