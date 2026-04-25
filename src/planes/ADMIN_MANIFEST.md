# Admin Plane Manifest

## Purpose
Operational control surface for administrators. RBAC, safety gates, support workflows, notification routing, AI workforce management, and route truth validation.

> **Wave 0.6 update.** The canonical home for admin **page bodies** is `src/admin/**`,
> with `src/pages/admin/**` reduced to thin re-export wrappers. See
> [`docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md`](../../docs/architecture/ADMIN_PLANE_OWNERSHIP_MODEL.md)
> for the canonical model and Constitution **Rules 29–32** for binding rules.

## Ownership
- **Primary owner**: Admin/Operations Engineering
- **Trust level**: Governed elevated control — dual-approval for destructive actions

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/pages/admin/` | Admin page routes |
| `src/components/admin/` | Admin UI components |
| `src/components/admin-ai/` | AI workforce admin UI |
| `src/components/admin-os/` | OS management admin UI |
| `src/components/governance/` | Governance dashboard components |
| `src/lib/admin-ai/` | Admin AI workforce client |

## Migration Target
```
/admin/web-app/src/pages/
/admin/web-app/src/components/
/admin/web-app/src/features/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- `os`, `founder`, `mobile`, `backend` (implementation)
- Talks to backend via BFF/API only
- **`src/modules/<pillar>/**` page bodies** (admin reads pillar state via service facades only — Rule 31).
- **`src/platform/**` MUST NOT import from `src/admin/**`** (Rule 31, decrease-only ratchet).

## Deployment Target
- SPA on CDN (Vite build)

## Build Pipeline
```bash
turbo run build --filter=@sita/admin-console
turbo run typecheck --filter=@sita/admin-console
```
