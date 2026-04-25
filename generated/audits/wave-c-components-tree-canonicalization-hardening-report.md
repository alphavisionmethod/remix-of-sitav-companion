# Wave C — Components Tree Canonicalization Hardening Report

**Date:** 2026-04-25
**Status:** ✅ COMPLETE — gates green, deployment-ready.
**Scope:** Physical removal of dead/shim UI under `src/components/`, rewiring of all consumers to canonical owner zones, installation of a BLOCKING UI Ownership validator, and constitutional codification of the 5-zone UI Ownership Law (§C.1).

## 1 — Old mixed-components problem

Pre-Wave-C, `src/components/` contained:

- `cards/index.ts` — single-line shim re-export (0 consumers).
- `launcher/PillarRail.tsx` — single-line shim (0 consumers).
- `navigation/index.ts` — single-line shim re-exporting `NavLink` (0 consumers).
- `shared/sita/`, `shared/ai/`, `shared/status/` — barrel-only shim layers (0 consumers).
- `shared/FileUploadZone.tsx` — orphan dead code (0 consumers).
- `primitives/actions/EvidenceLink.tsx` — shim over `src/platform/trust/components/EvidenceLink` (2 consumers).
- `primitives/actions/OperatorActionPanel.tsx` — shim over `src/admin/components/operator/OperatorActionPanel` (1 consumer).
- `primitives/status/ConnectorStateBadge.tsx` — shim over `src/platform/cloud/components/ConnectorStateBadge` (4 consumers).
- `primitives/feedback/Needs{Data,TimeWindow,HistoricalReleases}Explainer.tsx` — shims over `src/platform/sita/components/sita/explainers/**` (2 consumers across all three).

Total: 13 shim/dead files in 4 dead-or-near-dead folders.

## 2 — New canonical UI Ownership Model (5 zones)

| Zone | Canonical home(s) |
|------|-------------------|
| 1. Shared foundation | `src/components/{ui,primitives,NavLink.tsx,__tests__}` |
| 2. Module UI | `src/modules/<pillar>/components/**` |
| 3. Platform UI | `src/platform/<system>/components/**` |
| 4. Admin / operator UI | `src/admin/components/**`, `src/admin/modules/**`, `src/admin/shell/**`, `src/platform/admin/components/**` |
| 5. App / OS / shell UI | `src/app/shell/**`, `src/runtimes/**`, `src/platform/sita/components/sita/{shell,os}/**` |

## 3 — Files physically moved/removed

**Deleted (13 files, 4 folders):**

- `src/components/cards/` (1 file)
- `src/components/launcher/` (1 file)
- `src/components/navigation/` (1 file)
- `src/components/shared/` (5 files, including FileUploadZone)
- `src/components/primitives/actions/` (2 shim files; folder removed)
- `src/components/primitives/feedback/Needs*.tsx` (3 shim files; canonical Skeleton.tsx + EmptyState.tsx kept)
- `src/components/primitives/status/ConnectorStateBadge.tsx` (shim file)

**Imports rewired (9 lines across 5 files):**

| File | Old import | New canonical import |
|---|---|---|
| `src/platform/admin/components/admin/OAuthRefreshHealthBoard.tsx` | `@/components/primitives/status/ConnectorStateBadge` | `@/platform/cloud/components/ConnectorStateBadge` |
| `src/platform/admin/components/admin/integrations/IntegrationStreakPanel.tsx` | `@/components/primitives/{status/ConnectorStateBadge,actions/OperatorActionPanel}` | `@/platform/cloud/components/ConnectorStateBadge`, `@/admin/components/operator/OperatorActionPanel` |
| `src/platform/admin/components/admin/integrations/IntegrationReceiptDrawer.tsx` | `@/components/primitives/status/ConnectorStateBadge` | `@/platform/cloud/components/ConnectorStateBadge` |
| `src/platform/admin/components/admin/ai-runtime/ConnectorTruthSummaryPanel.tsx` | 3× shims | `@/platform/cloud/components/ConnectorStateBadge`, `@/platform/trust/components/EvidenceLink`, `@/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer` |
| `src/platform/admin/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel.tsx` | 2× shims | `@/platform/trust/components/EvidenceLink`, `@/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer` |

**Behavioral diff:** zero. All canonical bodies preserved at their platform homes.

## 4 — Final state of `src/components/`

```
src/components/
├── NavLink.tsx
├── __tests__/
│   ├── domain-components.test.tsx
│   └── ui-primitives.test.tsx
├── primitives/
│   ├── index.ts
│   ├── display/  (BaseCard, Hero, Panel, StatTile, Summary)
│   ├── feedback/ (EmptyState, Skeleton)
│   ├── overlays/ (Drawer)
│   ├── status/   (AITruthDisclosure, FreshnessBadge, ModeBadge, ProofBadge, ProvenanceChip, StatusBadge, TrustBadge, UrgencyBadge)
│   └── timelines/ (TimelineRow)
└── ui/           (shadcn primitives)
```

## 5 — Constitution updates

`docs/architecture/REPOSITORY_CONSTITUTION.md` — new section **§C.1 — UI Ownership Law (BLOCKING)**:

- 5-zone ownership model codified.
- Sealed allowlist for `src/components/*`.
- Forbidden re-introduction of Wave-C-removed folders.
- Primitive-purity rule (no `@/{modules,platform,admin,app,runtimes}` imports under primitives).
- Owner-semantic-name ban at root.
- Pointer-index entries added for the new model, manifest, and validator.

## 6 — Validator/CI hardening

- New BLOCKING validator: `scripts/architecture/checks/check-ui-ownership.ts`
  - 4 rules; emits `generated/ui-ownership-report.json`.
  - Wired into `src/lib/ci/validator-gate-map.ts` as `classification: "block"`, `consumer: "release-readiness"`, `gateId: "ui-ownership"`.
- New manifest: `generated/manifests/ui-ownership-map.json` (machine-readable canonical-roots map + allowlist + forbidden list).
- New doc: `docs/architecture/UI_OWNERSHIP_MODEL.md`.
- `src/platform/architecture/directory-organization-map.ts` updated: 5 entries promoted from `barrel-only` → `physically-moved`, with descriptions and canonical destinations refreshed.

## 7 — Verification proof

```
✅ tsc --noEmit                               → 0 errors
✅ check-ui-ownership                          → PASS (18 primitives scanned, 0 violations)
✅ check-page-backend-bypass (Wave B)          → PASS (145/0/9 baselines unchanged)
✅ check-generated-artifact-governance (Wave B) → PASS (1446 artifacts, 0 errors, 0 warns)
```

No imports broken. No baselines regressed. No new orphans. No new bypasses.

## 8 — Future-proofing

- The validator BLOCKS any future PR that:
  - Adds a new top-level folder under `src/components/`.
  - Re-introduces `cards/`, `launcher/`, `navigation/`, `shared/`, or `primitives/actions/`.
  - Adds an owner-semantic name (`business`, `advisors`, `admin`, `concierge`, `finance`, `personal-brain`, `sita`, `mobile`, `marketing`, etc.) directly under `src/components/`.
  - Imports from `@/modules`, `@/platform`, `@/admin`, `@/app`, or `@/runtimes` inside any `src/components/primitives/**` file.
- Manifest + doc are discoverable via the constitution's pointer index.
- Tests under `src/components/__tests__/` continue to smoke the canonical primitives.

## 9 — Remaining future-facing work

- None blocking. Wave C is complete.
- Optional next wave (D): formalize Tier-2 platform-relocation for any remaining `src/platform/admin/components/admin/**` cross-imports if the admin-plane boundary tightens further.
- Optional next wave: extend the validator with **filename-pattern checks** for module/platform names INSIDE `primitives/` (currently only top-level names are validated).