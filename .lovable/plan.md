

# SITA OS — Remaining Implementation Gaps (Full Audit)

## Summary

The design system primitives (cards, badges, surfaces, motion) are built and integrated into **4 pages**. But **199 files** still import old primitives (`SitaCard`, `GlassCard`, `ModuleWorkspace`, `EmptyStateCTA`). Beyond the migration debt, several major spec areas remain unimplemented.

---

## Gap 1: BillsWorkspace Rewrite (planned but never done)

`src/pages/money/BillsWorkspace.tsx` still uses `SitaCard`, `SitaPageHeader`, `ModuleWorkspace` — the old stack. The plan called for `SplitWorkspace`, `QueueCard`, `ExecutionBadge`, `FreshnessBadge`. This was approved but skipped.

**Action:** Rewrite BillsWorkspace with new design system primitives.

---

## Gap 2: DesktopSurface State System (skipped)

`DesktopSurface.tsx` was planned to get visual state differentiation (idle/active/degraded/heavy-review) and use `StatusCard` for widgets. This was explicitly skipped to "avoid visual regression." The desktop still has no state-aware visual logic.

**Action:** Add desktop state system with ambient intensity shifts per state.

---

## Gap 3: DomainAppShell Atmosphere Injection (incomplete)

`DomainAppShell.tsx` has `DomainMotionProvider` but does NOT inject domain atmosphere CSS variables (`--domain-card-radius`, `--domain-contrast`, `--domain-warmth`) and does NOT wrap content in `AppSurface level={0}`. Child pages cannot inherit domain feel automatically.

**Action:** Add CSS variable injection and `AppSurface` wrapper to DomainAppShell content area.

---

## Gap 4: High-Impact Module Pages (75+ pages untouched)

Only 4 of ~80 module pages use the new design system. The highest-impact remaining pages that users encounter frequently:

| Domain | Page | Current State |
|--------|------|--------------|
| Business | LeadRecovery, InvoicesCollections, QuotesWorkspace | Old SitaCard |
| Business | FollowThroughCenter, CommunicationsCenter | Old SitaCard |
| Money | SpendingPulse, MoneyApprovals, ReceivablesObligations | Old SitaCard |
| Money | ReservesSavings, SubscriptionsWaste, TaxEstimator | Old SitaCard |
| Concierge | TravelPlanning, LifeAdminCenter, ServiceProviders | Old SitaCard |
| Concierge | ErrandsLogistics, HouseholdCommandCenter | Old SitaCard |
| Files | FilesOverview, FilesSensitive | Old SitaCard |
| Trust | TrustCenter, ProofCenter | Old SitaCard |

**Action:** Migrate the next 10 highest-traffic module pages to use HeroCard/QueueCard/ActionCard/SplitWorkspace/badges/ListReveal with domain-specific atmosphere.

---

## Gap 5: `DetailDrawer` Never Used in Pages

The `DetailDrawer` component exists in `src/components/sita/surfaces/` but zero pages import it. All detail views are either inline or use old `ContextDrawer`.

**Action:** Replace `ContextDrawer` usage in key pages (BillsWorkspace, InvoicesCollections, QuotesWorkspace) with the new `DetailDrawer`.

---

## Gap 6: `AppOpenCeremony` Never Triggered

The cinematic app launch animation exists but is never called when entering a domain app from the desktop or dock. Entering Business/Finance/Concierge feels like a page navigation, not launching software.

**Action:** Wire `AppOpenCeremony` into `DomainAppShell` on first mount (using sessionStorage to fire once per domain session).

---

## Gap 7: Boardroom Pages Don't Use Domain Ceremonies

`BusinessBoardroom`, `FinanceBoardroom`, `MoneyBoardroom`, `ConciergeBoardroom` exist but don't use `BoardroomCinematic` for domain-specific entry. They use the old generic `BoardroomEntryCeremony`.

**Action:** Replace generic ceremony with domain-paced `BoardroomCinematic` in each boardroom page.

---

## Gap 8: No `ComparisonCard` or `ProofCard` Usage

These two card types were built but zero pages use them. `ComparisonCard` is needed for boardroom scenario reviews and `ProofCard` for trust/proof pages.

**Action:** Integrate `ComparisonCard` into boardroom pages and `ProofCard` into TrustCenter/ProofCenter/MoneyProof/BusinessProof.

---

## Recommended Implementation Order

| Phase | Work | Files |
|-------|------|-------|
| **A** | DomainAppShell atmosphere + AppSurface + AppOpenCeremony | `DomainAppShell.tsx` |
| **B** | BillsWorkspace rewrite (planned, never done) | `BillsWorkspace.tsx` |
| **C** | Desktop state system | `DesktopSurface.tsx` |
| **D** | Migrate 10 key module pages to new primitives | 10 page files |
| **E** | DetailDrawer integration in 3 pages | InvoicesCollections, QuotesWorkspace, BillsWorkspace |
| **F** | Boardroom domain ceremonies + ComparisonCard/ProofCard | 4 boardroom + 4 proof pages |

This covers the most impactful remaining gaps. After Phase A-F, ~18 pages use the new system (vs 4 today), the shell automatically applies domain atmosphere to all children, and the desktop/boardroom feel cinematically distinct.

