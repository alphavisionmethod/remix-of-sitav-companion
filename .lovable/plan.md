

# Design System Unification and Visual Coherence Plan

## Summary

The repository has a strong canonical design system foundation but suffers from **component duplication**, **inconsistent empty state rendering**, **two parallel badge systems**, **two parallel card systems**, and **only 12% of standalone pages using the PageShell wrapper**. The design token layer is well-structured. The primary work is consolidation and enforcement, not creation.

---

## Key Findings

### 1. Duplicate Component Systems

| Concept | Canonical Location | Duplicate(s) | Usage |
|---|---|---|---|
| Empty State | `primitives/feedback/EmptyState` | `sita/EmptyState` (4 variants), `sita/PremiumEmptyState` (9 variants), `sita/ContextualEmptyState`, `sita/EmptyStateCTA` | 30+ files import from 4 different sources |
| Trust Badge | `primitives/status/TrustBadge` (4 states) | `sita/TrustBadge` (9 trust levels), `sita/TrustStateBadge`, `sita/truth/TruthBadge` | ~100 files use `sita/TrustBadge`, primitives version barely used |
| Card | `primitives/display/BaseCard` | `sita/SitaCard` (with motion), `sita/cards/*` (9 card types) | 140+ files use `SitaCard`, `BaseCard` rarely used directly |
| Page Header | `sita/SitaPageHeader` (icon variant) | `SitaCard.SitaPageHeader` (text-only) | Both in wide use, different APIs |
| Domain Atmosphere | `sita-design-tokens.ts` (DomainAtmosphere) | `domain-atmospheres.ts` (separate DomainAtmosphere type) | Both imported in different contexts |

### 2. Page Shell Coverage Gap

Only 12 out of 100+ standalone pages use `PageShell`. Most domain pages (Business, Money, Concierge) are redirect shims to windowed apps, which is correct. But ~40 non-redirecting pages render content without consistent framing (max-width, padding, entrance animation).

### 3. Design Token Layer: Strong but Fragmented

Three overlapping typography systems:
- `SITA_TYPE` (12 roles) in `sita-design-tokens.ts`
- `APP_TYPE` (4 roles) in `app-window-system.ts`
- `TYPE` (raw numeric values) in `app-window-system.ts`

Surface hierarchy is defined in three places:
- CSS variables (`--surface-0` through `--surface-3`)
- `SURFACE_TOKENS` in `sita-design-tokens.ts`
- `LEVEL_CLASSES` in `AppSurface.tsx`

### 4. State Language: Well-Defined but Inconsistently Applied

`state-visual-grammar.ts` defines 13 canonical states with component refs, but many pages use ad-hoc loading/empty/error patterns instead of referencing the canonical components.

### 5. Trust/Evidence Surfaces: Complete but Fragmented

The `sita/truth/` directory has 17 trust components. The `trust-visual-grammar.ts` defines 6 trust levels. The `sita/TrustBadge` has 9 levels. These overlap but aren't unified.

---

## Phase 1: Consolidate Duplicate Components

### 1.1 Unify Empty State to `sita/PremiumEmptyState`
- `sita/PremiumEmptyState` is the most capable (9 variants, domain-aware, animated)
- Rename it to `sita/EmptyState` (replace the current one)
- Add backward-compatible props for the simpler variants
- Update `sita/ContextualEmptyState` to be a thin wrapper
- Update `primitives/feedback/EmptyState` to import and re-export (maintain barrel)
- Migrate 30+ consumer files to unified import path

### 1.2 Unify Trust Badge to `sita/TrustBadge`
- The `sita/TrustBadge` with 9 trust levels is the real production component
- The `primitives/status/TrustBadge` with 4 states is a simplified version nobody uses at scale
- Keep `sita/TrustBadge` as canonical, update primitives barrel to re-export it
- Consolidate `TrustStateBadge` into `TrustBadge` as a variant

### 1.3 Consolidate Card Hierarchy
- `SitaCard` (motion-enabled, 140+ consumers) stays as the primary domain card
- `BaseCard` in primitives stays as the no-motion structural primitive
- `sita/cards/*` family stays (they compose domain-specific layouts)
- Add a `@deprecated` comment to any card that duplicates another
- Ensure all `sita/cards/*` compose either `SitaCard` or `BaseCard` internally

### 1.4 Unify Page Header
- Merge `SitaPageHeader` (two versions: one in `SitaCard.tsx` exports, one in `SitaPageHeader.tsx`)
- The `SitaCard.SitaPageHeader` (text + actions) is used by 50+ pages
- The standalone `SitaPageHeader.tsx` (icon + title) is used by fewer pages
- Create a single `SitaPageHeader` that handles both modes via optional `icon` prop

### 1.5 Merge Domain Atmosphere Definitions
- `domain-atmospheres.ts` and `sita-design-tokens.ts` both define `DomainAtmosphere`
- Merge into `sita-design-tokens.ts` (the richer definition)
- Update `atmosphereToCSSVars` to use the merged type
- Delete `domain-atmospheres.ts`

---

## Phase 2: Strengthen Page Framing

### 2.1 Wrap Remaining Standalone Pages in PageShell
- Identify ~40 pages that render content directly without PageShell or domain redirect
- Add `PageShell` wrapper with appropriate width variant
- This gives consistent max-width, padding, and entrance animation

### 2.2 Standardize Page Structure
- Every standalone page follows: `PageShell > SitaPageHeader > content`
- Every domain page follows: `DomainAppShell > AppSurface > content`
- Document this in a `PAGE_FRAMING_GRAMMAR` constant

---

## Phase 3: Enforce State Language

### 3.1 Create `StateRenderer` Component
- A single component that takes a `ProductState` and renders the canonical visual
- References `state-visual-grammar.ts` for color, surface, animation
- Replaces ad-hoc loading/empty/error blocks in pages

### 3.2 Standardize Loading States
- `PageSkeleton` and `SectionSkeleton` exist but aren't used consistently
- Add a `DataLoadingWrapper` that auto-renders skeleton/empty/error based on query state
- Many pages already have `DataLoadingWrapper` -- ensure it references canonical state grammar

---

## Phase 4: Unify Typography System

### 4.1 Create Unified Type Scale
- Merge `SITA_TYPE`, `APP_TYPE`, and `TYPE` into a single `SITA_TYPE` export
- `APP_TYPE` values map 1:1 to `SITA_TYPE` entries (label, body, title, heading)
- Keep `APP_TYPE` as a re-export alias for backward compatibility
- Document the 12-role type scale as the canonical reference

---

## Phase 5: Surface Hierarchy Alignment

### 5.1 Align AppSurface with CSS Variables
- `AppSurface.tsx` hardcodes `hsl(0_0%_6%)` etc. instead of using `--surface-0` variables
- Rewrite `LEVEL_CLASSES` to use `bg-[hsl(var(--surface-0))]` etc.
- This ensures light/dark mode works correctly through the same component

### 5.2 Ensure `getSurfaceClasses()` Uses Tailwind Variables
- Currently references `bg-surface-0` etc. which are defined in CSS
- Verify these classes exist in CSS and match the variable definitions

---

## Phase 6: Visual Polish Pass

### 6.1 Card Hover and Focus Consistency
- Ensure all interactive cards use `micro-hover-lift` or `card-hover-lift` from the CSS utilities
- Ensure all interactive cards have `focus-visible` ring treatment
- Remove inline `whileHover` framer-motion where CSS hover is sufficient (reduces JS)

### 6.2 Empty State Elevation
- Replace remaining raw "No data" strings with `PremiumEmptyState`
- Ensure every domain surface has a domain-aware empty state

### 6.3 Form Field Consistency
- Audit form pages for consistent use of shadcn `Input`, `Select`, `Textarea`
- Ensure validation messaging uses canonical error styling

---

## Phase 7: Accessibility Hardening

### 7.1 Focus Management
- Ensure all modals/drawers trap focus
- Ensure `PageShell` applies `role="main"` or wraps a `<main>` element
- Ensure `SitaPageHeader` uses proper `<h1>` (already does)

### 7.2 Reduced Motion
- The CSS already has `prefers-reduced-motion: reduce` that kills all animations
- Ensure framer-motion components also respect this via `useReducedMotion()`

### 7.3 Color Contrast
- Trust badge colors meet WCAG AA on dark backgrounds (verified: the HSL values have sufficient lightness)
- Add `aria-label` to any badge using only color to communicate state (most already have this)

---

## Phase 8: Design Governance

### 8.1 Create Design Audit Script
- `scripts/design/check-visual-coherence.ts`
- Scans for: raw color values outside design tokens, duplicate component imports, pages without PageShell, empty state variants not using canonical component

### 8.2 Generate Design Token Audit Artifact
- `generated/design-token-audit.json` documenting: token coverage, drift points, deprecated aliases

---

## Files Modified (Estimated)

**Consolidated/Deleted:**
- `src/platform/design-system/domain-atmospheres.ts` (merged into `sita-design-tokens.ts`)
- `src/components/sita/EmptyState.tsx` (replaced by enhanced `PremiumEmptyState`)
- `src/components/sita/ContextualEmptyState.tsx` (thin wrapper updated)
- `src/components/sita/EmptyStateCTA.tsx` (consolidated)

**Modified:**
- `src/components/sita/PremiumEmptyState.tsx` (becomes canonical, renamed)
- `src/components/sita/SitaCard.tsx` (merged page header)
- `src/components/sita/SitaPageHeader.tsx` (merged into SitaCard export)
- `src/components/sita/surfaces/AppSurface.tsx` (use CSS variables)
- `src/platform/design-system/sita-design-tokens.ts` (absorb atmospheres)
- `src/components/primitives/feedback/EmptyState.tsx` (re-export canonical)
- `src/components/primitives/status/TrustBadge.tsx` (re-export canonical)
- `src/components/primitives/index.ts` (update exports)
- ~40 standalone page files (wrap in PageShell)
- ~30 files importing duplicate empty states (update imports)

**Created:**
- `src/lib/ui/page-framing-grammar.ts` (canonical page structure rules)
- `src/lib/ui/state-renderer.tsx` (canonical state-to-visual component)
- `scripts/design/check-visual-coherence.ts` (governance script)

**Intentionally Unchanged:**
- `src/index.css` (the 1005-line CSS is well-structured; no additions needed)
- `tailwind.config.ts` (token layer is complete)
- `src/components/ui/*` (shadcn primitives are canonical, not modified)
- `src/components/sita/cards/*` (domain cards are well-composed)
- `src/platform/experience/*` (grammar files are documentation/contract, not visual)

---

## What Remains Intentionally Flexible

1. **Domain-specific card variants** (`sita/cards/*`) -- domains need visual personality differences, governed by `DOMAIN_ATMOSPHERE`
2. **OS shell components** (`sita/shell/*`) -- these are a separate rendering context (windowed) with their own chrome, correctly isolated
3. **Mobile shell** -- mobile layout patterns are intentionally different from desktop
4. **Light mode polish** -- the `.light` CSS class exists but the product is dark-mode primary; light mode is secondary

---

## Recommended Next Steps (Post-Implementation)

**Immediate:** Run the design audit script to find remaining raw color values and fix them.

**Medium-term:** Extract the 12-role typography scale into a `Typography` component that enforces semantic usage (prevents `text-[14px]` scattered across pages).

**Long-term:** Build a visual regression test suite using Playwright screenshots of key surfaces, compared against golden files.

