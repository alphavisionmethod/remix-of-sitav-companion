

# SITA OS — Remaining Gaps & Next Phase Implementation

## What's Done

| Area | Status |
|------|--------|
| DomainAppShell (Business, Finance, Concierge) | Done — unified shell with toolbar, icon sidebar, accent system, atmosphere tokens |
| Overview Home Pages (3 domains) | Done — Operating Room, Financial Calm, Invisible Support |
| ModuleWorkspace list→detail→action | Done — 5 modules upgraded (Customers, Invoices, LeadRecovery, SpendingPulse, LifeAdmin) |
| DomainAdvisorCard | Done — domain-aware, contextual |
| GlobalBoardroom | Done — synthesis page |
| DomainCommandPalette | Done — Cmd+K with nav commands |
| Old patterns removed | Done — AppWelcomeHeader/InAppAdvisorStrip eliminated from 3 pages |

## What's Still Missing (mapped to original prompt Parts)

### 1. Files & Trust/Proof Are Not App-in-OS (Parts 3, 11)
`FilesCenter` and `TrustCenter` still use the old flat tab layout — no DomainAppShell, no icon sidebar, no atmosphere tokens. The prompt explicitly requires Files and Trust/Proof to feel like independent software products.

### 2. Domain-Specific Boardrooms Are Shallow (Part 9)
`BusinessBoardroom` exists but still uses old `LiveAdvisorCard` and generic layout. No Finance Boardroom or Concierge Boardroom as dedicated review environments. The prompt demands rich, synthesized boardrooms per domain.

### 3. Remaining ~30+ Module Pages Not Upgraded (Part 12)
Only 5 modules use ModuleWorkspace. Pages like CommunicationsCenter, Operations, Support, Quotes/Proposals, Bills, Subscriptions, Travel, Errands, Events, etc. are still flat dashboard pages.

### 4. No App-Launch Transitions or WOW Moments (Part 13)
No app-open animations, no skeleton→content transitions, no stagger animations on lists, no card hover elevation system. The prompt demands premium motion at every level.

### 5. Module-Specific Commands Missing (Part 14)
DomainCommandPalette only has navigation commands. No contextual commands like "show overdue invoices" or "leads aging > 7 days."

### 6. Global Advisor Council Missing (Part 8.1)
No OS-level advisor overlay that synthesizes across all domains. Only per-domain advisors exist.

---

## Next Phase: Files/Trust Upgrade + Boardroom Depth + WOW Layer

### A. Upgrade Files & Trust to DomainAppShell (6 files)

**FilesCenter.tsx** — Rewrite to use DomainAppShell with:
- Accent: `slate → zinc` (quiet, precise)
- Icon sidebar with groups: Browse (Overview, All Files, Search), Intelligence (Processing, Memory, Review), Security (Sensitive, Settings)
- Files-specific toolbar with search and view toggles

**TrustCenter.tsx** — Rewrite to use DomainAppShell with:
- Accent: `amber → orange` (serious, inspectable)
- Icon sidebar with groups: Overview, Sessions, Devices, Permissions, Proof Log, Audit Trail, Settings
- Trust-specific status bar showing trust score

### B. Upgrade 3 Domain Boardrooms (3 files)

**BusinessBoardroom.tsx** — Rewrite with ModuleWorkspace pattern:
- Replace `LiveAdvisorCard` with `DomainAdvisorCard`
- Add revenue pressure, lead recovery, customer health sections with real data synthesis
- Add "What Changed This Week" feed
- Add prepared next moves queue

**Create `src/pages/money/FinanceBoardroom.tsx`**:
- Obligations due, reserve confidence, approvals waiting, unusual spending, receivables pressure
- Finance-specific advisor council
- Calm, confidence-oriented tone

**Create `src/pages/concierge/ConciergeBoardroom.tsx`**:
- Upcoming obligations, logistics pressure, travel/admin prep, service coordination
- Softer tone, burden reduction focus

### C. WOW Motion Layer (2 files)

**Create `src/components/sita/motion/AppTransitions.tsx`**:
- `AppLaunchTransition` — scale-up fade when entering a domain app
- `ModuleTransition` — slide-fade between modules
- `ListStagger` — staggered entry for list items
- `CardHoverElevation` — lift + shadow on hover
- `SkeletonReveal` — skeleton→content crossfade

**Edit `DomainAppShell.tsx`** — Wrap content area in `AppLaunchTransition`

### D. Module-Specific Commands (1 file edit)

**Edit `DomainAppShell.tsx`** — Accept `moduleCommands` prop from each page, merge into command palette. Add default contextual commands per domain.

---

## File Summary

| Action | File | Lines |
|--------|------|-------|
| Rewrite | `src/pages/FilesCenter.tsx` | ~120 |
| Rewrite | `src/pages/TrustCenter.tsx` | ~180 |
| Rewrite | `src/pages/business/BusinessBoardroom.tsx` | ~200 |
| Create | `src/pages/money/FinanceBoardroom.tsx` | ~180 |
| Create | `src/pages/concierge/ConciergeBoardroom.tsx` | ~160 |
| Create | `src/components/sita/motion/AppTransitions.tsx` | ~120 |
| Edit | `src/components/sita/shell/DomainAppShell.tsx` | Add launch transition + moduleCommands prop |
| Edit | `src/pages/MoneyCenter.tsx` | Add Finance Boardroom to nav |
| Edit | `src/pages/ConciergeCenter.tsx` | Add Concierge Boardroom to nav |

