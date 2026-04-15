# Admin Plane Manifest

## Purpose
Operational control surface for administrators. RBAC, safety gates, support workflows, notification routing, AI workforce management, and route truth validation.

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

## Deployment Target
- SPA on CDN (Vite build)

## Build Pipeline
```bash
turbo run build --filter=@sita/admin-console
turbo run typecheck --filter=@sita/admin-console
```
