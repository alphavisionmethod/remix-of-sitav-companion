# Health OS — Module Manifest (GREENFIELD)

**Pillar**: 4 of 4
**Status**: 🌱 **Greenfield** — blueprint only, no implementation code yet.
**Route group**: `/health/*` (scaffolded as stubs)
**Primary surface (planned)**: `src/pages/HealthCenter.tsx` (windowed App-in-OS shell, mirroring `BusinessCenter` pattern)

## Planned Sub-Domains

| Sub-domain        | Planned surface                                | Planned service                            | Phase |
| ----------------- | ---------------------------------------------- | ------------------------------------------ | ----- |
| Nutrition         | `src/pages/health/NutritionLog.tsx`            | `src/lib/services/health-os/nutrition-*`   | P1    |
| Wearables         | `src/pages/health/WearableSync.tsx`            | `src/lib/services/health-os/wearable-*`    | P1    |
| Medical           | `src/pages/health/MedicalRecord.tsx`           | `src/lib/services/health-os/medical-*`     | P2    |
| Fitness           | `src/pages/health/FitnessRoutines.tsx`         | `src/lib/services/health-os/fitness-*`     | P1    |
| Recovery          | `src/pages/health/RecoveryPanel.tsx`           | `src/lib/services/health-os/recovery-*`    | P2    |
| Health planning   | `src/pages/health/HealthPlanning.tsx`          | `src/lib/services/health-os/planning-*`    | P2    |
| Health reminders  | `src/pages/health/HealthReminders.tsx`         | `src/lib/services/notifications`           | P1    |
| Symptom log       | `src/pages/health/SymptomLog.tsx`              | `src/lib/services/health-os/symptom-*`     | P3    |
| Performance       | `src/pages/health/Performance.tsx`             | `src/lib/services/health-os/performance-*` | P3    |

## Why Greenfield
The current codebase has zero `/health/*` routes and no `health-os` service folder. The existing `HealthApp.tsx` (`src/pages/apps/HealthApp.tsx`) is a deprecated shell. References to "health" elsewhere are unrelated:
- `CRMHealth` → CRM data hygiene
- `FleetHealthPage`, `EdgeFunctionHealth` → admin system-health dashboards
- `MoneyHealth` → financial pulse
- `CustomerHealthPage` → CRM customer scoring

These are renamed/scoped accordingly in the migration plan and **do not** belong to Health OS.

## Trust Integration (Required from day 1)
Health is the most sensitive data class. Every read of a wearable connector or medical record MUST:
1. Emit a `data_access` receipt to `_trust/receipts`.
2. Honor the user's per-domain consent flags (`_trust/permissions`).
3. Redact PII from logs (DLP guard, already in `_trust/dlp`).

## Phase 1 deliverable (this scaffold)
Stub pages live at `src/pages/health/*` and a manifest entry in `src/routes/health-routes.tsx` so the launcher can render the pillar even before features ship.