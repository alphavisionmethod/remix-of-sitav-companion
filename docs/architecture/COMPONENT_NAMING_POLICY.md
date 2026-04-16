# SITA OS — Component Naming Policy

> **Status:** Canonical · **Owner:** Platform Architecture

Component names must reflect **role**, not marketing. Every name uses one of the canonical suffixes below.

---

## Canonical Suffix Grammar

| Suffix | Meaning | Examples |
|---|---|---|
| `*Card` | Bounded content container (single semantic unit) | `AdvisorCard`, `ProofCard`, `RecommendationCard` |
| `*Badge` | Compact status or semantic label | `TrustBadge`, `UrgencyBadge`, `StatusBadge` |
| `*Pill` | Inline compact label (alias of Badge for inline use) | `DomainPill` |
| `*Panel` | Mid-sized grouped, often interactive section | `RiskSummaryPanel`, `ConnectorHealthPanel` |
| `*Drawer` | Slide-out / detail drill-in surface | `EvidenceDrawer`, `AdvisorDrawer` |
| `*Sheet` | Bottom-sheet (mobile pattern) | `ApprovalSheet` |
| `*Dialog` | Modal interrupt requiring decision | `ConfirmDialog` |
| `*Modal` | (avoid — prefer `Dialog`) | — |
| `*Shell` | App / surface frame container | `PrimaryAppShell`, `AdminShell` |
| `*Layout` | (avoid — prefer `Shell`) | — |
| `*Hero` | Top summary / identity area | `HomeHero`, `BoardroomHero` |
| `*Summary` | Concise multi-signal digest (read-only) | `BusinessSummary`, `CashSummary` |
| `*Inspector` | Diagnostic / detail drill-down | `RecommendationInspector` |
| `*Console` | Operator interactive control surface | `RuntimeConsole` |
| `*Board` | Strategic multi-signal display | `AdvisorBoard` |
| `*Workspace` | User work environment | `OwnerWorkspace` |
| `*Timeline` | Chronological / event display | `ProofTimeline` |
| `*List` | Collection view of homogeneous items | `RecommendationList` |
| `*Table` | Tabular structured list | `DelegationRegistryTable` |
| `*Tile` | Small at-a-glance metric block | `StatTile`, `RevenueTile` |
| `*Row` | Single line in a list/timeline/table | `TimelineRow`, `ApprovalRow` |
| `*EmptyState` | Empty / zero-data placeholder | `BoardroomEmptyState` |
| `*Skeleton` | Loading placeholder | `PageSkeleton` |

---

## Forbidden / Discouraged Naming

| ❌ Avoid | Why | ✅ Use Instead |
|---|---|---|
| `*Theater` | Vague | `*Surface` or `*Workspace` |
| `*Pulse` | Marketing-y | `*Summary` or `*Tile` |
| `*Studio` | Vague | `*Workspace` |
| `*Center` | Vague | `*Console` or `*Workspace` |
| `*Layer` | Implementation detail | `*Section` or `*Panel` |
| `*Zone` | Vague | `*Section` or `*Panel` |
| `*Wrapper` (top-level) | Reserved for thin re-exports | Use specific role |

---

## Plurality Rule

- Singular when it represents one unit: `AdvisorCard`.
- Plural only for collection-shaped components: `AdvisorList`, `RecommendationsTable`.

## Domain Prefix Rule

When ambiguity exists across domains, prepend the domain:
- `BusinessAdvisorCard` vs `BoardroomAdvisorCard`.
- Prefer **variants** on a single component over forked files (use `variant="boardroom"`).

## Variants Over Files

If two components differ only in style, formatting, or display mode, they are **variants of one component**, not two files.

```tsx
// ❌ AdvisorCard.tsx + LiveAdvisorCard.tsx + AdvisorProfileCard.tsx
// ✅ <AdvisorCard variant="live" />
```

---

## File-to-Export Rule

- One default export per file matching filename: `AdvisorCard.tsx` → `export function AdvisorCard()`.
- Type and helper exports allowed if scoped to the component.

---

## Enforcement

`scripts/architecture/checks/check-component-classification.ts` validates suffix grammar at CI time.
