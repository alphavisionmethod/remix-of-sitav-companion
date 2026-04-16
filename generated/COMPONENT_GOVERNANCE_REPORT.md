# SITA OS — Component Governance Report

_Generated: 2026-04-16T17:46:55.535Z_

## Constitution: 3 Classes
1. **PRIMITIVE** — Visual building blocks (no domain logic).
2. **DOMAIN** — Semantic components for a specific domain.
3. **SURFACE** — Full assembled page surfaces.

Plus: `PRIVATE_HELPER`, `DEPRECATED_WRAPPER`, `UI_LIB` (shadcn).

## Inventory

| Metric | Count |
|---|---|
| Total component files | 897 |
| Primitives | 250 |
| Domain components | 577 |
| Surface compositions | 3 |
| Deprecated wrappers | 18 |
| Duplicate families detected | 3 |
| Components in duplicate groups | 6 |

## Classification Breakdown
- **DOMAIN**: 577
- **PRIMITIVE**: 250
- **DEPRECATED_WRAPPER**: 18
- **SURFACE**: 3
- **UI_LIB**: 49

## Top Families
- `other`: 664
- `card`: 66
- `panel`: 63
- `badge`: 29
- `shell`: 24
- `board`: 12
- `timeline`: 10
- `overlay`: 10
- `drawer`: 9
- `table`: 3
- `hero`: 2
- `summary`: 2

## Top Duplicate Families
- `shell`: 2 components
- `card`: 2 components
- `badge`: 2 components

## Duplicate Groups (Top 10)

### dup-001 (shell)
- **Canonical**: `src/components/concierge/ConciergeAppShell.tsx`
- **Members** (2):
  - ✅ `src/components/concierge/ConciergeAppShell.tsx`
  - 🔁 `src/components/sita/apps/concierge/ConciergeAppShell.tsx`


### dup-002 (card)
- **Canonical**: `src/components/mobile/ProofCard.tsx`
- **Members** (2):
  - ✅ `src/components/mobile/ProofCard.tsx`
  - 🔁 `src/components/sita/cards/ProofCard.tsx`


### dup-003 (badge)
- **Canonical**: `src/components/sita/TrustBadge.tsx`
- **Members** (2):
  - ✅ `src/components/sita/TrustBadge.tsx`
  - 🔁 `src/components/sita/badges/TrustBadge.tsx`


## Governance Files
- `generated/component-registry.json` — full machine-readable registry
- `generated/component-duplication-map.json` — duplicate family map
- `docs/architecture/COMPONENT_CONSTITUTION.md` — class rules
- `docs/architecture/COMPONENT_NAMING_POLICY.md` — naming grammar
- `src/components/primitives/` — canonical primitive layer
