# SITA OS — Runtime Map

> Maps every plane and module to its runtime target.

## Runtime Targets

| Runtime | Description | Used By |
|---------|-------------|---------|
| **Browser** | Vite SPA, React 18 | Product, Admin, Founder, Mobile (web fallback) |
| **Deno** | Supabase Edge Functions | Backend edge functions |
| **Node.js** | Backend services, workers | Backend services (post-migration) |
| **Electron** | Desktop OS shell | OS plane (desktop target) |
| **Flutter** | Mobile app (iOS + Android) | Mobile plane |
| **Docker** | Containerized services | Backend workers, OS agent |

## Per-Module Runtime Assignment

### Shared Plane — `npm_package`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/packages/contracts/` | None (types only) | Pure TypeScript interfaces |
| `src/packages/design-tokens/` | None (tokens only) | CSS/TS design tokens |
| `src/packages/event-types/` | None (types only) | Event shape definitions |
| `src/packages/auth/` | None (types only) | Auth scope definitions |

### Backend Plane — `edge_functions_and_api`
| Module | Runtime | Notes |
|--------|---------|-------|
| `supabase/functions/` | Deno | Edge functions (auto-deployed) |
| `src/lib/core-services/` | Node.js / Deno | Canonical services |
| `src/lib/cloud-backbone/` | Node.js | Cloud infrastructure |
| `src/lib/persistence/` | Node.js | Supabase SDK |
| `src/lib/observability/` | Node.js | Structured logging |
| `src/lib/ai/` | Node.js | AI client |

### OS Plane — `electron_or_docker`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/lib/nova-sdk/kernel/` | Browser (sim) / Electron (prod) | Kernel simulation |
| `src/lib/nova-sdk/services/` | Browser / Electron | System services |
| `src/lib/os-services/` | Browser / Electron | Platform daemons |
| `src/lib/os-security/` | Browser / Electron | Security subsystem |
| `src/lib/sync-engine/` | Browser / Electron | Sync state machine |

### Admin Plane — `spa_cdn`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/pages/admin/` | Browser | React SPA |
| `src/components/admin/` | Browser | React components |

### Founder Plane — `spa_cdn`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/pages/owner/` | Browser | React SPA |
| `src/pages/mission-control/` | Browser | React SPA |

### Mobile Plane — `flutter_app`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/pages/mobile/` | Browser (current) → Flutter (target) | Mobile surfaces |
| `src/components/mobile/` | Browser (current) → Flutter (target) | Mobile components |

### Internal Tools — `local_dev`
| Module | Runtime | Notes |
|--------|---------|-------|
| `src/lib/simulation/` | Node.js / Browser | Simulation engines |
| `src/lib/fip/` | Node.js | Feature governance |
| `src/lib/dual-reality/` | Browser | Reality framework |
