# SITA OS — Remaining Legacy Justification (Wave 4)

Generated: 2026-04-18

103 top-level entries remain in `src/lib/`. They are tracked, not blessed. Top categories:

| Category | Examples | Why kept this wave | Path to removal |
|---|---|---|---|
| Hot-path canonicals | `supabase-helpers.ts` (366 importers), `utils.ts` (763 importers) | Removing them would touch every page/component. Canonical here per Option B. | None — these are canonical, not legacy. |
| Pre-decomposition platform | `core-services/`, `services/`, `platform/`, `platform-plane/`, `platform-law/` | Holds canonical implementations until physical move to `src/platform/`. | Migrate folder-by-folder in Wave 5. |
| Pre-decomposition domains | `domain-engines/`, `domain-system/`, `business-launcher.ts`, `finance-launcher.ts`, `concierge-launcher.ts` | Used by routes/pages still resolving via `@/lib/*`. | Migrate in Wave 5 alongside route updates. |
| Pre-decomposition data | `persistence/`, `storage/`, `db/`, `offline-db.ts` | Active production code; needs adapter swap, not deletion. | Migrate to `src/data/persistence/`. |
| Mock / demo | `mock-data/`, `demo-data/`, `demo-scenarios/` | Used by storybook + dev pages. | Move to `src/data/mocks/`. |
| Migration bridges | `internal/`, `hooks/` | Allowlisted (Option B). | Hooks → `src/hooks/`; internal stays. |

**Nothing in this list is unjustified.** Each entry has a target home and is gated by `check-residual-lib-canonicality.ts` against new additions.
