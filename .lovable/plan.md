

# Frontend Excellence Pass — Phased Implementation Plan

This plan covers the complete frontend audit, migration, and polish across 8 sequential phases. Each phase must reach 100% completion before the next begins.

---

## Phase 1: Demo-to-Production Truth Migration (226 pages)

**Problem**: 226 pages use `isDemoMode ? DEMO_X : ([] as typeof DEMO_X)`, meaning in production mode every user sees completely empty surfaces. This is the single largest UX defect.

**Action**: For each of the 226 pages, replace every `isDemoMode ? DEMO_X` ternary with the correct production behavior:

- **Real data path**: Wire to existing query hooks (`useRevenueLeaks`, `useFinancialAccounts`, `usePositions`, etc.) where the backend table exists
- **Empty state**: Replace `[] as typeof DEMO_X` with `<PremiumEmptyState variant="no-data">` using the canonical component already at `src/components/sita/PremiumEmptyState.tsx`
- **First-use state**: For surfaces requiring setup (connectors, integrations, team), use `<PremiumEmptyState variant="first-use">` with a setup CTA
- **Connect-to-activate**: For surfaces needing an external provider, use `<PremiumEmptyState variant="connect-to-activate">`
- **Loading/error**: Wrap data fetches in proper `isLoading ? <Skeleton /> : isError ? <PremiumEmptyState variant="degraded"> : <RealContent>` patterns

**Batch order** (by domain directory):
1. `src/pages/admin/` (~120 files) -- admin surfaces, mostly table/dashboard pages
2. `src/pages/revenue-office/` (~20 files) -- revenue domain
3. `src/pages/money/` (~15 files) -- finance domain (5 already done)
4. `src/pages/business/`, `src/pages/boardroom/`, `src/pages/concierge/` (~20 files)
5. `src/pages/digital-presence/`, `src/pages/investment-office/` (~15 files, 4 already done)
6. Remaining root-level pages (~36 files: Boardroom.tsx, ActivityStream.tsx, etc.)

**Per-file pattern**:
```typescript
// BEFORE:
const isDemoMode = isDemo;
const data = isDemoMode ? DEMO_ITEMS : ([] as typeof DEMO_ITEMS);

// AFTER:
const { data, isLoading, isError } = useRealDataHook();
if (isLoading) return <PageSkeleton rows={3} />;
if (!data?.length) return (
  <PremiumEmptyState
    variant="no-data"
    title="No items yet"
    description="Create your first item to get started."
    actions={[{ label: "Create Item", onClick: handleCreate, variant: "primary" }]}
    domain="business"
  />
);
```

**Completion criteria**: Zero files matching `grep -r "isDemoMode ? DEMO_" src/pages/`. Every surface shows either real data, a proper empty state, or a setup prompt.

---

## Phase 2: State Grammar Enforcement (All 1,092 pages)

**Problem**: Many pages lack loading, error, empty, degraded, or unauthorized states. Users encounter blank screens or cryptic errors.

**Action**: Audit every page for the 5 required states and add missing ones using canonical components:
- `<PageSkeleton>` for loading
- `<PremiumEmptyState variant="no-data">` for empty
- `<PremiumEmptyState variant="degraded">` for error/degraded
- `<PremiumEmptyState variant="blocked">` for unauthorized
- `<PremiumEmptyState variant="first-use">` for first-run

**Priority**: Pages reachable from main navigation (Desktop, Business, Money, Concierge, Boardroom, Files, Settings, Admin) first, then deep/experimental pages.

**Completion criteria**: Every page accessible from a route has at minimum loading + empty + error state handling.

---

## Phase 3: CTA and Action Wiring Verification

**Problem**: Many buttons, menu items, and card actions render but do nothing (dead buttons). Forms may not submit. Wizards may not complete.

**Action**:
1. Audit all `onClick` handlers across pages for `() => {}`, `console.log`, `toast("Coming soon")`, or missing handlers
2. For each dead CTA, determine the correct behavior:
   - If the backend/service exists: wire it
   - If setup is required: navigate to setup
   - If the feature is not ready: replace with a disabled button + tooltip explaining status
3. Verify all form submissions call real mutations or show proper validation
4. Verify all wizard/stepper flows can complete start-to-finish
5. Verify all modal/drawer open-close cycles work

**Key surfaces to verify**:
- Business Center tabs (leads, customers, invoices, quotes, CRM)
- Money Center tabs (accounts, transactions, budgets)
- Concierge Center (tasks, requests)
- Settings pages (profile save, preferences save, MFA enrollment)
- Admin actions (session revoke, user reset, deployment gates)
- App Store (install, open, uninstall)
- Boardroom (start meeting, AI invocation)

**Completion criteria**: No `onClick={() => {}}` or `toast("Coming soon")` patterns remain on primary CTAs. Every primary action either works or is honestly disabled with explanation.

---

## Phase 4: Visual Coherence and Design Polish

**Problem**: With 1,016 components and 1,092 pages, visual drift is inevitable. Spacing, typography, elevation, and color usage vary across surfaces.

**Action**:
1. Ensure all pages use `DomainAppShell` or `CenterPageShell` for consistent framing
2. Standardize page header patterns (title, description, breadcrumb, actions toolbar)
3. Verify all pages use design tokens from `src/platform/design-system/sita-design-tokens.ts`
4. Check card/panel components use consistent border-radius, padding, elevation
5. Verify empty states use `PremiumEmptyState` with correct domain color accents
6. Check tab bars, toolbars, and action bars for consistent height/spacing
7. Verify glassmorphic depth and gradient usage follows `DOMAIN_ATMOSPHERE` tokens

**Key visual fixes**:
- Consistent page padding (p-4 md:p-6)
- Consistent max-width containers (max-w-[1400px])
- Consistent card spacing (gap-4 or gap-6)
- Typography hierarchy using `SITA_TYPE` tokens
- Consistent icon sizes and button variants

**Completion criteria**: All primary surfaces visually match the established glassmorphic design system. No raw/unstyled pages remain in navigation-reachable routes.

---

## Phase 5: Shell/App/OS Surface Alignment

**Problem**: Desktop shell, app windows, mobile views, and settings must feel like one product, not separate applications.

**Action**:
1. Verify `ShellLayout` wraps all authenticated desktop routes consistently
2. Verify dock/taskbar items match actual available apps
3. Verify command palette (`CommandPalette.tsx`) indexes all navigable routes
4. Verify notification center renders real notifications (or proper empty state)
5. Verify window manager can open/close/resize app windows
6. Verify mobile routes (`/mobile/*`) provide equivalent functionality to desktop counterparts
7. Verify settings shell provides consistent navigation sidebar
8. Verify admin shell (Mission Control) provides consistent navigation

**Completion criteria**: Navigation between shell, apps, settings, and admin feels seamless. Command palette finds all surfaces. Mobile provides honest degraded/deferred views where desktop features are not available.

---

## Phase 6: Flow Completion and End-to-End Verification

**Problem**: Multi-step workflows (onboarding, setup, AI interactions, financial operations) may break mid-flow.

**Action**: Verify and fix these critical flows:
1. **Auth flow**: Login -> Signup -> Email verification -> Onboarding -> Desktop
2. **Onboarding flow**: All 29 screens complete start-to-finish
3. **Business setup**: Create first customer, first invoice, first quote
4. **Money setup**: Connect first account, view first transaction
5. **App install flow**: Browse store -> Install -> Open -> Use
6. **Settings flow**: Update profile -> Save -> Confirmation feedback
7. **Admin flow**: View dashboard -> Take action -> See result
8. **Advisor/Boardroom flow**: Open boardroom -> Start session -> Get recommendation

**Completion criteria**: All critical flows complete without errors. Success/failure feedback is shown at every step.

---

## Phase 7: Accessibility and Interaction Quality

**Problem**: Keyboard navigation, focus management, screen reader support, and touch targets may be incomplete.

**Action**:
1. Verify all interactive elements have proper `aria-label` or visible text
2. Verify focus order follows visual order on all pages
3. Verify modals/drawers trap focus correctly
4. Verify all forms have proper `<label>` associations
5. Verify color contrast meets WCAG 2.1 AA (4.5:1 for text)
6. Verify all buttons have minimum 44x44px touch targets on mobile
7. Verify `prefers-reduced-motion` is respected in animations
8. Add `role` attributes where semantic HTML is not used

**Completion criteria**: No accessibility violations on primary surfaces. All interactive elements are keyboard-navigable.

---

## Phase 8: Duplicate Removal, Governance, and Deployment Verification

**Problem**: Duplicate components, dead routes, orphan pages, and stale code reduce maintainability.

**Action**:
1. Identify and consolidate duplicate empty-state, error-state, and loading-state components
2. Remove pages not reachable from any route
3. Remove components not imported anywhere
4. Verify route registry completeness (every route in App.tsx has a real page)
5. Run `npx vite build` to confirm zero build errors
6. Run `npx vitest run` to confirm test suite passes
7. Create a generated `route-health-report.json` listing all routes and their state (complete/stub/deferred)
8. Verify `generated/` directory contains only current artifacts

**Completion criteria**: Clean build, passing tests, no orphan pages, no duplicate systems, honest route health report.

---

## Execution Contract

- Each phase completes fully before the next begins
- Each phase ends with a verification step (build check, grep check, or test run)
- Changes stay within existing architectural patterns (no new frameworks, no new providers)
- All 226 demo-dependent pages will be migrated using `PremiumEmptyState` as the canonical empty/setup/degraded component
- Realistic scope per session: ~25-30 page migrations, or ~10 flow fixes, or ~1 full phase of smaller scope
- Estimated total: 10-12 implementation sessions across all 8 phases

