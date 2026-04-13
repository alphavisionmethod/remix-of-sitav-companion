

# SITA OS — Gap Analysis & Next Implementation Plan

## What's Already Done (Phase 1 Complete)

- **DomainAppShell**: Unified shell with traffic lights, accent strip, icon sidebar, status bar, command palette — working for all 3 domains
- **Overview Home Pages**: Business (Operating Room), Finance (Financial Calm), Concierge (Invisible Support) — redesigned with hero strips, priority queues, advisor cards
- **DomainAdvisorCard**: Domain-aware advisor with identity, insights, confidence bars
- **GlobalBoardroom**: OS-level synthesis page with domain cards, priorities, risks
- **Shared Primitives**: OperatingStateHero, PriorityQueue, ModuleWorkspace, ModuleEmptyState, DomainCommandPalette — all created but mostly unused
- **AppToolbar + AppSidebarNav**: With icons, badges, groups

## What's Still Missing (The Gaps)

### GAP 1: Module Pages Still Use Old Patterns
**4 pages** still import `AppWelcomeHeader` + `InAppAdvisorStrip` (the old generic components): LeadRecovery, WebsiteBuilder, SocialCommand, ProposalsContracts. Most other module pages (InvoicesCollections, CommunicationsCenter, CustomersPage, etc.) use their own mixed patterns — none use `ModuleWorkspace` which was built for exactly this purpose.

**Impact**: Modules feel like standalone dashboard pages pasted inside the shell, not like deep workspaces within a software product.

### GAP 2: No Module Uses the List → Detail → Action Flow
`ModuleWorkspace` provides a 3-column layout (list + detail + advisor) but **zero pages use it**. Every module renders as a single flat page. CRM doesn't have a customer detail pane. Invoices don't have a detail drawer. Communications don't have a message detail view.

**Impact**: This is the single biggest reason apps feel like dashboards instead of software.

### GAP 3: No Module-Level Advisors
`DomainAdvisorCard` only appears on the 3 Overview pages. Individual modules (CRM, Leads, Invoices, Bills, etc.) have no contextual advisor guidance. Some still use the old `LiveAdvisorCard` or `InAppAdvisorStrip`.

### GAP 4: Domain-Specific Boardrooms Are Thin
`BusinessBoardroom`, `MoneyBoardroom`, `FamilyBoardroom` exist but are standalone pages — they don't synthesize real data or connect to the module state the way the prompt demands.

### GAP 5: No App-Level Transition/Atmosphere Differentiation
All 3 domains use the same card density, spacing, and motion. No domain-specific CSS variables or spacing tokens. The emotional tone (Business=sharp, Finance=calm, Concierge=soft) is only expressed in accent colors, not in layout density or rhythm.

### GAP 6: Command Palette Has No Module-Specific Commands
The `DomainCommandPalette` auto-generates navigation commands but has no contextual commands like "show overdue invoices" or "prepare follow-ups for aging leads."

### GAP 7: Empty/Loading States Are Inconsistent
`ModuleEmptyState` exists but isn't used. Most modules have ad-hoc empty states or none at all.

---

## Implementation Plan — Phase 2: Module Depth

This is the highest-impact work remaining. We focus on upgrading the **6 most important modules** to use ModuleWorkspace with real list→detail flows, then propagate the pattern.

### Step 1: Upgrade 3 Business Modules to ModuleWorkspace

**CRM / Customers** → Full workspace with:
- Left: Customer list with health scores, search, tab filters (keep existing)
- Right: Customer detail pane with relationship timeline, notes, linked invoices/quotes, communication history, next actions
- Advisor: Customer relationship advisor ("No contact in 14 days — suggest follow-up")
- Uses `ModuleWorkspace` layout

**Invoices / Collections** → Collections command center with:
- Left: Invoice list grouped by status (overdue → due soon → paid)
- Right: Invoice detail with payment timeline, reminder history, customer sensitivity score
- Advisor: Collections advisor ("This client pays within 3 days of second reminder")

**Lead Recovery** → Recovery workspace with:
- Left: Cold lead queue ranked by recovery score
- Right: Lead detail with recovery timeline, prepared drafts, channel recommendation
- Advisor: Recovery advisor ("Email open rate drops 60% after 45 days — act now")
- Remove old `AppWelcomeHeader` / `InAppAdvisorStrip`

### Step 2: Upgrade 2 Finance Modules

**Bills & Obligations** → Obligations workspace with:
- Left: Bills list with due date timeline markers
- Right: Bill detail with payment history, autopay status, next action
- Advisor: Obligations advisor

**Spending Pulse** → Spending workspace with:
- Left: Category breakdown list
- Right: Category detail with trend, anomalies, budget comparison
- Advisor: Spending advisor

### Step 3: Upgrade 1 Concierge Module

**Life Admin Center** → Life admin workspace with:
- Left: Task/obligation list grouped by category
- Right: Task detail with prep steps, linked documents, timing
- Advisor: Life admin advisor

### Step 4: Add Module-Specific Command Items

Add contextual commands to each upgraded module that get passed to DomainCommandPalette:
- Business: "Show overdue invoices", "Leads aging > 7 days", "Prepare follow-up drafts"
- Finance: "Bills due this week", "Unusual spending alerts", "Review subscriptions"
- Concierge: "What's overdue", "Prep for tomorrow's appointments"

### Step 5: Replace All Old Advisor Components

Migrate the 4 pages still using `AppWelcomeHeader`/`InAppAdvisorStrip` to use `DomainAdvisorCard` with module-specific insights.

### Step 6: Domain Atmosphere Tokens

Add CSS custom properties per domain applied at the DomainAppShell level:
- `--domain-density`: Business=compact, Finance=comfortable, Concierge=spacious
- `--domain-card-radius`: Business=12px, Finance=16px, Concierge=20px
- `--domain-motion-speed`: Business=fast(150ms), Finance=calm(250ms), Concierge=gentle(300ms)

These cascade into all child components automatically.

---

## Files

### Create (6 files)
- `src/components/business/CustomerDetailPane.tsx` (~200 lines) — Customer detail with timeline, notes, linked data
- `src/components/business/InvoiceDetailPane.tsx` (~180 lines) — Invoice detail with payment timeline, actions
- `src/components/business/LeadRecoveryPane.tsx` (~160 lines) — Lead detail with recovery actions, prepared drafts
- `src/components/money/BillDetailPane.tsx` (~150 lines) — Bill detail with payment history, autopay
- `src/components/money/SpendingCategoryPane.tsx` (~130 lines) — Category detail with trends
- `src/components/concierge/LifeAdminDetailPane.tsx` (~140 lines) — Task detail with prep steps

### Rewrite (6 files — adopt ModuleWorkspace pattern)
- `src/pages/business/CustomersPage.tsx` — ModuleWorkspace with CustomerDetailPane
- `src/pages/business/InvoicesCollections.tsx` — ModuleWorkspace with InvoiceDetailPane
- `src/pages/business/LeadRecovery.tsx` — ModuleWorkspace with LeadRecoveryPane
- `src/pages/money/BillsWorkspace.tsx` — ModuleWorkspace with BillDetailPane
- `src/pages/money/SpendingPulse.tsx` — ModuleWorkspace with SpendingCategoryPane
- `src/pages/concierge/LifeAdminCenter.tsx` — ModuleWorkspace with LifeAdminDetailPane

### Edit (5 files)
- `src/pages/business/ProposalsContracts.tsx` — Replace AppWelcomeHeader/InAppAdvisorStrip with DomainAdvisorCard
- `src/pages/business/WebsiteBuilder.tsx` — Same migration
- `src/pages/business/SocialCommand.tsx` — Same migration
- `src/components/sita/shell/DomainAppShell.tsx` — Add domain atmosphere CSS variables
- `src/components/sita/domain-shared/ModuleWorkspace.tsx` — Add atmosphere token consumption

## What This Achieves

After this implementation:
- 6 key modules feel like **real software workspaces** with list→detail→action flows
- Every upgraded module has a **contextual advisor** (not generic)
- Old dashboard patterns (`AppWelcomeHeader`, `InAppAdvisorStrip`) are eliminated
- Domains have **distinct atmospheric density** — Business feels sharper, Finance calmer, Concierge softer
- Command palette gains **module-aware contextual commands**
- The `ModuleWorkspace` primitive is validated and ready to propagate to remaining ~40 modules

