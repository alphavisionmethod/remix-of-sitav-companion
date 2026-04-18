# SITA OS — src/lib Migration Plan (Wave 1)

Generated: 2026-04-18T02:44:25.859Z

## Wave Sequence

| Wave | Family | Files | Risk | Strategy |
|-----:|--------|------:|------|----------|
| Wave 2 — Data | — | 171 | 🟠 HIGH | move + wrapper shim |
| Wave 3 — Runtimes | — | 113 | 🟡 MEDIUM | move + wrapper shim |
| Wave 4 — Platform | — | 644 | 🟡 MEDIUM | move + wrapper shim |
| Wave 5 — Domains | — | 240 | 🟡 MEDIUM | move + wrapper shim |
| Wave 6 — Integrations | — | 9 | 🔴 CRITICAL | move + wrapper shim |
| Wave 7 — Contracts | — | 23 | 🟢 LOW | move + wrapper shim |
| Wave 7b — Services remainder | — | 441 | 🟢 LOW | move + wrapper shim |
| Stay (shared-internal) | — | 14 | 🔴 CRITICAL | move + wrapper shim |
| Legacy | — | 26 | 🟠 HIGH | move + wrapper shim |

## Per-wave file counts and consumer pressure

### Wave 2 — Data  (171 files)
Top 5 by consumer count:
- `src/lib/demo-data/admin-platform.tsx` → `src/data/seed/admin-platform.tsx` (75 importers)
- `src/lib/demo-data/revenue-office.ts` → `src/data/seed/revenue-office.ts` (35 importers)
- `src/lib/demo-data/core-pages.ts` → `src/data/seed/core-pages.ts` (26 importers)
- `src/lib/demo-data/investment.ts` → `src/data/seed/investment.ts` (26 importers)
- `src/lib/demo-data/digital-presence.ts` → `src/data/seed/digital-presence.ts` (18 importers)

### Wave 3 — Runtimes  (113 files)
Top 5 by consumer count:
- `src/lib/reality-audit/reality-audit-registry.ts` → `src/runtimes/reality/reality-audit-registry.ts` (13 importers)
- `src/lib/dual-reality/index.ts` → `src/runtimes/reality/index.ts` (6 importers)
- `src/lib/runtime/deployment-profile.ts` → `src/runtimes/core/deployment-profile.ts` (6 importers)
- `src/lib/dual-reality/reality-mode-context.tsx` → `src/runtimes/reality/reality-mode-context.tsx` (5 importers)
- `src/lib/runtime/runtime-context.tsx` → `src/runtimes/core/runtime-context.tsx` (5 importers)

### Wave 4 — Platform  (644 files)
Top 5 by consumer count:
- `src/lib/nova-sdk/ui/components.tsx` → `src/platform/nova-sdk/ui/components.tsx` (21 importers)
- `src/lib/nova-sdk/ui/layout.tsx` → `src/platform/nova-sdk/ui/layout.tsx` (20 importers)
- `src/lib/verification/verification-hooks.ts` → `src/platform/verification/verification-hooks.ts` (14 importers)
- `src/lib/verification/surface-registry.ts` → `src/platform/verification/surface-registry.ts` (13 importers)
- `src/lib/platform-law/platform-law-registry.ts` → `src/platform/governance/platform-law-registry.ts` (11 importers)

### Wave 5 — Domains  (240 files)
Top 5 by consumer count:
- `src/lib/engines/business-identity-layers.ts` → `src/domains/engines/business-identity-layers.ts` (32 importers)
- `src/lib/engines/lead-scoring-engine.ts` → `src/domains/engines/lead-scoring-engine.ts` (18 importers)
- `src/lib/engines/business-module-adaptations.ts` → `src/domains/engines/business-module-adaptations.ts` (16 importers)
- `src/lib/engines/business-profile-engine.ts` → `src/domains/engines/business-profile-engine.ts` (16 importers)
- `src/lib/app-platform/types.ts` → `src/domains/apps/types.ts` (14 importers)

### Wave 6 — Integrations  (9 files)
Top 5 by consumer count:
- `src/lib/supabase-helpers.ts` → `src/integrations/supabase/helpers.ts` (224 importers)
- `src/lib/api/os-api-client.ts` → `src/integrations/api/os-api-client.ts` (2 importers)
- `src/lib/integrations/reality-integration-hub.ts` → `src/integrations/external/reality-integration-hub.ts` (1 importers)
- `src/lib/shopify/config.ts` → `src/integrations/shopify/config.ts` (1 importers)
- `src/lib/shopify/index.ts` → `src/integrations/shopify/index.ts` (1 importers)

### Wave 7 — Contracts  (23 files)
Top 5 by consumer count:
- `src/lib/types/relation-parsers.ts` → `src/contracts/types/relation-parsers.ts` (8 importers)
- `src/lib/types/dwe-types.ts` → `src/contracts/types/dwe-types.ts` (7 importers)
- `src/lib/constants/ui-config.ts` → `src/contracts/constants/ui-config.ts` (6 importers)
- `src/lib/contracts/global-contracts-registry.ts` → `src/contracts/global-contracts-registry.ts` (1 importers)
- `src/lib/types/guards.ts` → `src/contracts/types/guards.ts` (1 importers)

### Wave 7b — Services remainder  (441 files)
Top 5 by consumer count:
- `src/lib/services/engineering-governance/index.ts` → `src/platform/services-unclassified/engineering-governance/index.ts` (8 importers)
- `src/lib/services/board-api-client.ts` → `src/platform/services-unclassified/board-api-client.ts` (7 importers)
- `src/lib/services/orchestration-pipeline/module-advisor-consumer.ts` → `src/platform/services-unclassified/orchestration-pipeline/module-advisor-consumer.ts` (6 importers)
- `src/lib/services/ambient-context-engine.ts` → `src/platform/services-unclassified/ambient-context-engine.ts` (5 importers)
- `src/lib/services/founder-orchestrator/index.ts` → `src/platform/services-unclassified/founder-orchestrator/index.ts` (5 importers)

### Stay (shared-internal)  (14 files)
Top 5 by consumer count:
- `src/lib/utils.ts` → `src/lib/utils.ts` (761 importers)
- `src/lib/hooks/useOSRuntime.tsx` → `src/hooks/useOSRuntime.tsx` (14 importers)
- `src/lib/hooks/useEngineEventsData.ts` → `src/hooks/useEngineEventsData.ts` (8 importers)
- `src/lib/hooks/use-meta-governance.ts` → `src/hooks/use-meta-governance.ts` (7 importers)
- `src/lib/hooks/useAction.ts` → `src/hooks/useAction.ts` (7 importers)

### Legacy  (26 files)
Top 5 by consumer count:
- `src/lib/design-system/sita-design-tokens.ts` → `src/legacy/unclassified/design-system/sita-design-tokens.ts` (50 importers)
- `src/lib/design-system/app-window-system.ts` → `src/legacy/unclassified/design-system/app-window-system.ts` (17 importers)
- `src/lib/design-system/nova-os.ts` → `src/legacy/unclassified/design-system/nova-os.ts` (12 importers)
- `src/lib/sound-engine.ts` → `src/legacy/unclassified/sound-engine.ts` (11 importers)
- `src/lib/simulation/monte-carlo-engine.ts` → `src/legacy/simulation/monte-carlo-engine.ts` (7 importers)

## Safety contract

- Every moved file leaves a thin wrapper shim re-exporting from the canonical home.
- Wrappers are tracked in `src-lib-wrapper-map.json` and removed after consumers are rewired.
- Build runs after every wave; failed wave is reverted before proceeding.
- `src/lib/utils.ts` and `src/lib/utils/` stay in place (763+ importers, true shared utility).
- No file is silently deleted. Unclassified files go to `src/legacy/unclassified/` for manual review.
