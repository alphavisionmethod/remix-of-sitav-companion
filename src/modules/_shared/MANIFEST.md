# Shared Platform — Manifest

**Type**: Cross-cutting platform layer (leaf-only — no module imports)

## What lives here (logically — code stays at current paths during Phase 1)

| Capability                | Current location                                  |
| ------------------------- | ------------------------------------------------- |
| Shell / launcher / window | `src/components/sita/shell/**`, `ShellLayout`     |
| Identity / profile / auth | `src/contexts/AuthContext`, `src/lib/services/auth/**` |
| AI runtime / model router | `src/lib/services/ai-gateway`, `model-router`     |
| Voice spine               | `src/contexts/SitaVoiceContext`                   |
| Memory / context          | `src/lib/services/memory-service`, `mnemosyne`    |
| File / knowledge platform | `src/lib/services/file-ingestion`, `FilesCenter`  |
| Notifications & events    | `src/lib/services/notifications`, `event-bus`     |
| Settings (global)         | `src/pages/SettingsPage.tsx`, `src/routes/settings-routes.tsx` |
| Design system             | `src/components/ui/**`, `src/components/primitives/**`, `index.css` |
| Runtime / tier provider   | `src/runtimes/**`, `src/contexts/RuntimeProvider` |
| Connectors                | `src/lib/services/connector-control-plane`        |

## Rule
Shared MAY NOT import from `src/modules/business|concierge|finance|health/**`.
Modules MAY import from `src/modules/_shared/**` and `src/modules/_trust/**`.