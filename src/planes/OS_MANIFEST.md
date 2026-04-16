# OS Plane Manifest

## Purpose
Execution runtime, kernel simulation, SDK, shell, security daemons, device services, and sync engine. The OS plane owns local enforcement, process management, and hardware abstraction.

## Ownership
- **Primary owner**: OS/Runtime Engineering
- **Trust level**: Local enforcer — executes commands dispatched by backend

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/lib/nova-sdk/` | App SDK: manifest, registry, UI components, services, kernel, extensions |
| `src/lib/os-services/` | Platform daemons (33 services): healthd, powerd, crashd, audiod, etc. |
| `src/lib/os-security/` | Security subsystem (18 modules): authd, policyd, sessiond, secretsd, etc. |
| `src/lib/sync-engine/` | Sync state machine, conflict resolution, transport |
| `src/components/sita/shell/` | OS shell UI |
| `src/components/sita/os/` | OS system UI |
| `src/components/sita/boot/` | Boot sequence UI |

## Migration Target
```
/os/kernel/
/os/runtime/
/os/sdk/
/os/shell/
/os/security/
/os/services/
/os/services/sync/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- `backend`, `admin`, `founder`, `mobile`
- No `@/pages/` imports
- No `@/components/admin/` imports

## Deployment Target
- Electron (desktop)
- Docker (server-side agent)
- Browser (simulation mode)

## Build Pipeline
```bash
turbo run build --filter=@sita/os
turbo run typecheck --filter=@sita/os
```

## Trust Level
- Local trust enforcement
- Sandbox isolation for apps
- Capability-based security model (7 trust zones)
