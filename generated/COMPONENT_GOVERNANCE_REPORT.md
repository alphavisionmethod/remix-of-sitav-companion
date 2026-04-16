# SITA OS — Component Governance Report

_Generated: 2026-04-16T17:54:31.559Z_

## Constitution: 3 Classes
1. **PRIMITIVE** — Visual building blocks (no domain logic).
2. **DOMAIN** — Semantic components for a specific domain.
3. **SURFACE** — Full assembled page surfaces.

Plus: `PRIVATE_HELPER`, `DEPRECATED_WRAPPER`, `UI_LIB` (shadcn).

## Inventory

| Metric | Count |
|---|---|
| Total component files | 913 |
| Primitives | 266 |
| Domain components | 577 |
| Surface compositions | 3 |
| Deprecated wrappers | 18 |
| Duplicate families detected | 13 |
| Components in duplicate groups | 27 |

## Classification Breakdown
- **DOMAIN**: 577
- **PRIMITIVE**: 266
- **DEPRECATED_WRAPPER**: 18
- **SURFACE**: 3
- **UI_LIB**: 49

## Top Families
- `other`: 669
- `card`: 67
- `panel`: 64
- `badge`: 35
- `shell`: 24
- `board`: 12
- `timeline`: 10
- `drawer`: 10
- `overlay`: 10
- `table`: 3
- `hero`: 3
- `summary`: 3

## Top Duplicate Families
- `badge`: 13 components
- `other`: 8 components
- `shell`: 2 components
- `card`: 2 components
- `drawer`: 2 components

## Duplicate Groups (Top 10)

### dup-001 (other)
- **Canonical**: `src/components/advisors/AdvisorDebateView.tsx`
- **Members** (2):
  - ✅ `src/components/advisors/AdvisorDebateView.tsx`
  - 🔁 `src/components/business/advisor-board/AdvisorDebateView.tsx`


### dup-002 (other)
- **Canonical**: `src/components/sita/SparklineChart.tsx`
- **Members** (2):
  - 🔁 `src/components/business/advisor-board/SparklineChart.tsx`
  - ✅ `src/components/sita/SparklineChart.tsx`


### dup-003 (shell)
- **Canonical**: `src/components/concierge/ConciergeAppShell.tsx`
- **Members** (2):
  - ✅ `src/components/concierge/ConciergeAppShell.tsx`
  - 🔁 `src/components/sita/apps/concierge/ConciergeAppShell.tsx`


### dup-004 (card)
- **Canonical**: `src/components/mobile/ProofCard.tsx`
- **Members** (2):
  - ✅ `src/components/mobile/ProofCard.tsx`
  - 🔁 `src/components/sita/cards/ProofCard.tsx`


### dup-005 (other)
- **Canonical**: `src/components/sita/EmptyState.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/feedback/EmptyState.tsx`
  - ✅ `src/components/sita/EmptyState.tsx`


### dup-006 (other)
- **Canonical**: `src/components/ui/skeleton.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/feedback/Skeleton.tsx`
  - ✅ `src/components/ui/skeleton.tsx`


### dup-007 (drawer)
- **Canonical**: `src/components/ui/drawer.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/overlays/Drawer.tsx`
  - ✅ `src/components/ui/drawer.tsx`


### dup-008 (badge)
- **Canonical**: `src/components/sita/badges/FreshnessBadge.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/status/FreshnessBadge.tsx`
  - ✅ `src/components/sita/badges/FreshnessBadge.tsx`


### dup-009 (badge)
- **Canonical**: `src/components/sita/badges/ModeBadge.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/status/ModeBadge.tsx`
  - ✅ `src/components/sita/badges/ModeBadge.tsx`


### dup-010 (badge)
- **Canonical**: `src/components/sita/badges/ProofBadge.tsx`
- **Members** (2):
  - 🔁 `src/components/primitives/status/ProofBadge.tsx`
  - ✅ `src/components/sita/badges/ProofBadge.tsx`


## Governance Files
- `generated/component-registry.json` — full machine-readable registry
- `generated/component-duplication-map.json` — duplicate family map
- `docs/architecture/COMPONENT_CONSTITUTION.md` — class rules
- `docs/architecture/COMPONENT_NAMING_POLICY.md` — naming grammar
- `src/components/primitives/` — canonical primitive layer
