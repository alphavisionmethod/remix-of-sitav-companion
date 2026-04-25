# SITA OS — UI Ownership Model (Wave C)

**Authority:** Repository Constitution §C.1 — UI Ownership Law.
**Manifest:** [`generated/manifests/ui-ownership-map.json`](../../generated/manifests/ui-ownership-map.json).
**Validator:** [`scripts/architecture/checks/check-ui-ownership.ts`](../../scripts/architecture/checks/check-ui-ownership.ts) (BLOCKING).

## Why this exists

`src/components/` historically became a dumping ground for module-, platform-,
admin-, and shell-owned UI. Wave C physically removed the residue and froze the
root tree to **5 ownership zones**, each with a single canonical home.

## The five canonical UI ownership zones

| # | Zone | Canonical home(s) | What lives here |
|---|------|-------------------|-----------------|
| 1 | **Shared foundation** | `src/components/ui/**`, `src/components/primitives/**`, `src/components/NavLink.tsx` | Shadcn primitives + owner-neutral display/feedback/status/timeline primitives. **No** domain, platform, admin, or shell semantics. |
| 2 | **Module UI** | `src/modules/<pillar>/components/**` | Pillar-owned UI: business, concierge, finance, health. Carries pillar semantics. |
| 3 | **Platform UI** | `src/platform/<system>/components/**` | Platform-system UI: ai, advisors, cloud, files, governance, intelligence, knowledge, marketing, notifications, personal-brain, product, sita, simulation, runtime, trust, etc. |
| 4 | **Admin / operator UI** | `src/admin/components/**`, `src/admin/modules/<domain>/views/**`, `src/admin/shell/**`, `src/platform/admin/components/**` | Operator/admin-plane UI. Dashboards, panels, control-plane widgets. |
| 5 | **App / OS / shell UI** | `src/app/shell/**`, `src/runtimes/**`, `src/platform/sita/components/sita/shell/**`, `src/platform/sita/components/sita/os/**` | Desktop/windowing/SITA-experience surfaces. |

## What is allowed under `src/components/`

After Wave C, the root component tree is **strictly limited** to:

```
src/components/
├── NavLink.tsx              # owner-neutral router link primitive
├── primitives/              # owner-neutral display/feedback/status/timeline/overlay primitives
├── ui/                      # shadcn primitives
└── __tests__/               # smoke tests for primitives + critical surfaces
```

**No other folders may be added under `src/components/`.** Any new UI must be
placed under its canonical owner zone (2–5 above).

## Forbidden patterns (validator-enforced)

The `check-ui-ownership.ts` validator BLOCKS:

1. **New folder under `src/components/`** that is not one of `ui`, `primitives`, `__tests__`.
2. **Module/platform/admin-semantic component** placed under `src/components/`
   (e.g. `src/components/business/*`, `src/components/advisors/*`, `src/components/admin/*`).
3. **`src/components/primitives/**` importing** from `src/modules/**`, `src/platform/**`,
   `src/admin/**`, `src/app/**`, or `src/runtimes/**` (purity rule — primitives must be owner-neutral).
4. **Re-introducing deprecated shim folders**: `cards/`, `launcher/`, `shared/`, `navigation/`.

## How to add new UI

1. **Owner-neutral primitive** (button, badge, panel, drawer, timeline row)
   → place under `src/components/primitives/<class>/<Name>.tsx`, register in
   `src/components/primitives/index.ts`.
2. **Module-specific UI** (e.g. business inbox card) → `src/modules/business/components/<Name>.tsx`.
3. **Platform-specific UI** (e.g. trust badge, advisor panel) → `src/platform/<system>/components/<Name>.tsx`.
4. **Admin-specific UI** → `src/admin/components/<scope>/<Name>.tsx` or
   `src/admin/modules/<domain>/views/<Name>.tsx`.
5. **Shell/OS UI** → `src/platform/sita/components/sita/shell/<Name>.tsx` or `src/runtimes/**`.

## Wave C migration record

| Removed (Wave C) | Reason | Replacement |
|---|---|---|
| `src/components/cards/index.ts` | Shim re-export only; 0 consumers | Canonical: `src/platform/sita/components/cards/**` |
| `src/components/launcher/PillarRail.tsx` | Shim; 0 consumers | Canonical: `src/platform/sita/components/sita/shell/PillarRail` |
| `src/components/primitives/actions/EvidenceLink.tsx` | Shim; rewired 2 consumers | Canonical: `src/platform/trust/components/EvidenceLink` |
| `src/components/primitives/actions/OperatorActionPanel.tsx` | Shim; rewired 1 consumer | Canonical: `src/admin/components/operator/OperatorActionPanel` |
| `src/components/primitives/status/ConnectorStateBadge.tsx` | Shim; rewired 4 consumers | Canonical: `src/platform/cloud/components/ConnectorStateBadge` |
| `src/components/primitives/feedback/NeedsDataExplainer.tsx` | Shim; 0 consumers | Canonical: `src/platform/sita/components/sita/explainers/NeedsDataExplainer` |
| `src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx` | Shim; 0 consumers | Canonical: `src/platform/sita/components/sita/explainers/NeedsTimeWindowExplainer` |
| `src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx` | Shim; rewired 2 consumers | Canonical: `src/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer` |
| `src/components/shared/sita/index.ts` | Re-export barrel; 0 consumers | Canonical: `src/platform/sita/components/sita/**` |
| `src/components/shared/ai/index.ts` | Re-export barrel; 0 consumers | Canonical: `src/platform/ai/components/ai/**` |
| `src/components/shared/status/index.ts` | Re-export barrel; 0 consumers | Canonical: `src/platform/cloud/components/cloud/PlatformDegradedBanner` |
| `src/components/shared/FileUploadZone.tsx` | Dead code (no importers) | n/a — recreate at owner if needed |
| `src/components/navigation/index.ts` | Single-line re-export of `NavLink`; 0 consumers | Canonical: `src/components/NavLink` directly |

**Total Wave C deletions:** 13 files, 4 folders (`cards/`, `launcher/`, `shared/`, `navigation/`).
**Imports rewired:** 9 lines across 5 files.
**Behavioral diff:** zero (all canonical bodies preserved at platform homes).

## Future-proofing

- The validator runs in CI as **BLOCKING** (`src/lib/ci/validator-gate-map.ts`).
- Manifest is regenerated automatically when new owner zones are added (handled by
  the platform-relocation generator if/when introduced).
- New contributors and AI tools cannot drift the tree without failing the gate.