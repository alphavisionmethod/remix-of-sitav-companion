# Founder Plane Manifest

## Purpose
Strategic command center for founder/executive users. Environment configuration, plane registry, service auth, strategic intelligence, compute governance, and simulation orchestration.

## Ownership
- **Primary owner**: Founder/Executive Engineering
- **Trust level**: Strategic control — highest human authority

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/pages/owner/` | Founder dashboard routes |
| `src/pages/owner-mode/` | Owner mode routes |
| `src/pages/mission-control/` | Mission control routes |
| `src/pages/enterprise/` | Enterprise management routes |

## Migration Target
```
/founder/command-center/src/pages/
/founder/command-center/src/features/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- `os`, `admin`, `mobile`, `backend` (implementation)

## Deployment Target
- SPA on CDN (Vite build)
