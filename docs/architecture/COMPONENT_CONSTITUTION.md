# SITA OS — Component Constitution

> **Status:** Canonical · **Owner:** Platform Architecture · **Enforced by:** `scripts/architecture/checks/check-component-classification.ts`

The component layer of SITA OS is governed by a strict 3-class model. Every component file under `src/components/**` (excluding `ui/*` shadcn primitives) must belong to **exactly one** of these classes.

---

## The Three Classes

### Class 1 — PRIMITIVE
Universal visual building blocks. The only authors of low-level style grammar.

**Location:** `src/components/primitives/**`

**Rules:**
- ❌ No domain logic.
- ❌ No imports from `@/lib/services/**`, `@/lib/engines/**`, `@/lib/orchestrators/**`, `@/integrations/supabase/**`.
- ❌ No imports from `@/hooks/**` or `@/lib/hooks/**`.
- ❌ No imports from any `domain/**` or `surfaces/**` component.
- ✅ May compose `@/components/ui/**` (shadcn).
- ✅ May import from `@/lib/utils`, `@/lib/design-system/**`.
- ✅ Stable prop API. No business semantics in prop names.

**Examples:** `BaseCard`, `StatusBadge`, `Hero`, `EmptyState`, `Drawer`, `TimelineRow`.

---

### Class 2 — DOMAIN
Semantically meaningful UI for a specific domain. Composes primitives.

**Location:** `src/components/domain/<area>/**` (canonical) or domain folders like `src/components/concierge/**`, `src/components/governance/**`.

**Rules:**
- ✅ May express domain semantics in name and props.
- ✅ May compose primitives and other domain components.
- ✅ May import domain hooks and services.
- ❌ May not become a full page shell.
- ❌ May not introduce new style primitives — extract to `primitives/` instead.
- ❌ May not import from `@/pages/**`.

**Examples:** `AdvisorCard`, `ProofTimelineRow`, `BoardroomRecommendationCard`, `CashPressureCard`.

---

### Class 3 — SURFACE
Fully assembled surfaces (page compositions, app shells).

**Location:** `src/components/surfaces/**` (canonical) or `src/components/sita/shell/**`.

**Rules:**
- ✅ Assembles domain components and primitives.
- ✅ Orchestrates layout and routing.
- ❌ May not invent new generic primitives ad-hoc.
- ❌ Should not contain business logic — receive prepared data from hooks/services.
- ❌ Must not bypass canonical domain components when one exists.

**Examples:** `BoardroomHome`, `MobileBoardroom`, `AdminAIRuntimeSurface`, `BusinessOverviewSurface`.

---

## Auxiliary Categories

These are **not** classes — they are statuses applied to files within the 3 classes.

| Category | Meaning |
|---|---|
| `PRIVATE_HELPER` | Used in exactly one parent. Should be moved to that parent's local folder. |
| `DEPRECATED_WRAPPER` | Thin re-export to canonical path. Will be removed once consumers migrate. |
| `UI_LIB` | Shadcn primitive in `src/components/ui/**`. Not subject to this constitution. |

---

## Hard Rule: No Fourth Class

If a component does not clearly fit one of the three classes, it must be:

1. **Merged** into an existing component, or
2. **Extracted** into a primitive, or
3. **Downgraded** to a `PRIVATE_HELPER`, or

---

## Cross-reference: Concept-Based Shared Component Rule (Wave 0.9)

The 3-class model above answers *"what kind of component is this?"*. It is **orthogonal** to the question *"may this file live under `src/components/**`?"*, which is governed by the concept rule in `docs/architecture/SHARED_COMPONENT_OWNERSHIP_MODEL.md` and Constitution Rules 36–38.

A `DOMAIN` component is fine — it just doesn't live in `src/components/**`. Its canonical home is `src/modules/<pillar>/components/`, `src/platform/<system>/components/`, or `src/admin/modules/<domain>/components/`, depending on its semantic owner.
4. **Renamed and reclassified**, or
5. **Removed**.

No "mystery components." No "kind of reusable but also page-specific."

---

## Anti-Patterns

| ❌ Anti-pattern | ✅ Correct |
|---|---|
| Business logic in `BaseCard` | Pass prepared data via props |
| 5 different `AdvisorCard` files | One `AdvisorCard` with `variant` prop |
| Page-specific hero in `primitives/` | Move to page-local folder |
| Naming by vibe (`Theater`, `Pulse`, `Studio`) | Use suffix grammar (Card/Panel/Hero/etc.) |
| Domain component importing a page | Invert dependency or move to `surfaces/` |

---

## Migration Rules

1. **Audit before merging.** Run `npx tsx scripts/architecture/audit-components.ts` to classify everything.
2. **Wrappers, not deletion.** Legacy paths become thin re-exports; only delete after consumer migration.
3. **One canonical winner per duplicate group.** Recorded in `generated/component-duplication-map.json`.
4. **Tests guard regressions.** Each constitutional rule has a corresponding `check-*.ts` script.

---

## Enforcement

| Script | What it checks |
|---|---|
| `check-component-classification.ts` | Every component is classified |
| `check-primitive-purity.ts` | Primitives have no forbidden imports |
| `check-domain-purity.ts` | Domain components don't import pages |
| `check-duplicate-families.ts` | No new unregistered duplicates |
| `check-deprecated-wrappers.ts` | Wrappers stay thin |

All wired into `npm run check:architecture`.
