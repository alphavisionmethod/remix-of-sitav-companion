# SITA OS — Stale Reference Cleanup (Wave 4)

Generated: 2026-04-18

## What was rewired

Phase 2 rewire wave 4 ran the universal `rewire-consumers-wave3.ts` engine across all 188 wrappers carrying `// @lovable:migrated-wrapper`. It rewired 4 import sites across 2 files — the freshly created `services/` → `core-services/` indirections from Phase 1.

## Why the number is small

Prior waves (1, 2, 3) already swept the dominant rewire targets. Most remaining `@/lib/*` imports point at canonical hot-path files (`supabase-helpers`, `utils`) or at folders not yet physically moved (see `SRC_LIB_REMAINING_LEGACY_JUSTIFICATION.md`).

## Top remaining hot-paths (informational, not violations)

| Path | Sites | Disposition |
|---|---|---|
| `@/lib/supabase-helpers` | 366 | Canonical — no action. |
| `@/lib/persistence/universal-service-persistence` | 121 | Migrate folder in Wave 5. |
| `@/lib/dual-reality/reality-mode-registry` | 14 | Migrate in Wave 5. |
| `@/lib/compute-governance` | 12 | Migrate in Wave 5. |
| `@/lib/core-services/policy-engine` | 10 | Move folder to `src/platform/policy/`. |
| `@/lib/core-services/ai-gateway` | 10 | Move folder to `src/platform/ai/`. |

## Verification

`tsc --noEmit -p tsconfig.app.json` returns **0 errors** post-rewire.
