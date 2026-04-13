

# SITA OS — Master App-in-OS Experience Implementation Plan

## Current State (What Already Exists)

| Asset | Status |
|-------|--------|
| `DomainAppShell` | Built — traffic lights, accent strip, sidebar nav, app-open ceremony, domain command palette |
| `AppOpenCeremony` | Built — fires once per domain per session via sessionStorage |
| `AppSidebarNav` + `AppToolbar` | Built — grouped tabs with counts/severity |
| `DesktopDock` | Built — 584 lines, magnification, badges, drag reorder, sections |
| `AppSidebar` | Built — macOS-style icon grid with domain colors and sub-route expansion |
| Domain Centers | Built — Business (204L), Money (252L), Concierge (189L) all wrapped in DomainAppShell |
| Session persistence | Built — `useSessionRestore` and `persistSession` on beforeunload |
| Shell decomposed | Done — App.tsx ~253 lines, ShellLayout ~224 lines |

## What's Missing (6 Critical Gaps)

1. **No app-state persistence** — switching Business CRM → Money → back to Business loses sub-page position
2. **Sidebar is still route navigation** — no "running app" indicators, no launch feel
3. **Dock ignores domain apps** — doesn't show Business/Money/Concierge as running with badges
4. **Per-app atmosphere not consumed** — CSS variables exist in DomainAppShell but child components don't read them
5. **FilesCenter has no DomainAppShell wrapper** — it's the only core app still flat
6. **Advisor topology is flat** — no per-domain advisor boards, no roundtable/debate modes
7. **Global Boardroom not cinematic** — missing BoardroomCinematic, ComparisonCard, cross-domain synthesis

---

## Phase 1: App State Persistence Engine

Make switching apps preserve exact sub-page, scroll position, and context.

**Create** `src/hooks/useAppStatePersistence.ts`
- sessionStorage-backed hook storing per-domain: `{ activePage, scrollY, filters, selectedRecord }`
- `save(domain, state)` and `restore(domain)` functions
- Auto-save on sub-page change and component unmount

**Edit** `BusinessCenter.tsx`, `MoneyCenter.tsx`, `ConciergeCenter.tsx`
- On mount: restore last sub-page from persistence instead of defaulting to "overview"
- On sub-page change: persist new sub-page
- On unmount: persist scroll position

**Edit** `DomainAppShell.tsx`
- Capture scroll position of content area on unmount
- Restore scroll position on re-mount
- Register domain as "running" in sessionStorage

**Result:** Business CRM → Money Bills → back to Business = CRM exactly where you left it.

---

## Phase 2: Sidebar as App Launcher + Running Indicators

Transform sidebar from route links into an app launcher surface.

**Edit** `src/components/sita/AppSidebar.tsx`
- Add "running" dot indicator below app icons for domains visited this session
- Add subtle scale pulse animation on click (launch feel vs instant swap)
- Show last-visited sub-page in hover tooltip ("Last: CRM")
- Track running apps via sessionStorage set by DomainAppShell
- Add right-click context menu: "Pin to Dock", "Quit App" (clears session state)

**Behavior:** Clicking "Business" triggers a brief 180ms scale animation. A green dot below the icon shows it's running. Hovering shows "Business OS — Last: CRM".

---

## Phase 3: Dock Domain-App Integration

Make the dock show domain apps as first-class running applications.

**Edit** `src/components/sita/DesktopDock.tsx`
- Add Business, Money, Concierge, Files as pinnable dock items with domain accent colors
- Show running indicator (bottom dot) when app has been opened this session
- Show badge counts (Business: 8 follow-throughs, Money: 3 bills due)
- Clicking dock icon navigates to app restoring last sub-page via Phase 1
- Integrate hover preview showing current sub-page name

---

## Phase 4: Per-App Visual Atmosphere System

Make each domain feel visually distinct through spacing, radius, contrast, and motion.

**Create** `src/lib/design-system/domain-atmospheres.ts`
- Canonical atmosphere per domain:

```text
Business:  sharp, operational — 12px radius, 0.875rem density, 150ms motion, higher contrast
Finance:   calm, precise      — 16px radius, 1rem density, 250ms motion, standard contrast  
Concierge: soft, warm         — 20px radius, 1.125rem density, 300ms motion, lower contrast
Files:     minimal, neutral   — 10px radius, 0.875rem density, 180ms motion, standard contrast
```

**Create** `src/components/sita/cards/DomainCard.tsx`
- Card that reads `--domain-card-radius`, `--domain-density`, `--domain-motion-speed` CSS variables
- Adapts padding, border-radius, shadow depth, hover lift per domain automatically

**Edit** `DomainAppShell.tsx`
- Import atmosphere definitions and apply as CSS variables (replaces current inline object)

**Edit** `BusinessOverview.tsx`, `MoneyOverview.tsx`, `ConciergeOverview.tsx`
- Replace generic cards with `DomainCard` to demonstrate per-domain atmosphere

---

## Phase 5: FilesCenter Full App + Global Boardroom Cinematic

**Create/Rewrite** `src/pages/FilesCenter.tsx`
- Full `DomainAppShell` wrapper with domain config: `id: "files"`, graphite atmosphere
- Sub-pages: Overview, All Files, Smart Search, Sensitive, Processing, Document Intelligence, Proof/History, Settings
- Tab groups matching Files specification
- Wire existing file sub-pages into the shell

**Edit** `src/pages/GlobalBoardroom.tsx`
- Add `BoardroomCinematic` entry animation
- Add cross-domain `ComparisonCard` (Business vs Finance vs Concierge health)
- Add `AdvisorCard` for global advisor synthesis
- Add `ProofCard` for cross-domain evidence chain
- Add `PageTruthBanner`

---

## Phase 6: Advisor Topology + Domain Advisor Boards

**Create** `src/lib/advisor-topology.ts`
- Canonical advisor roster per domain:
  - Business: Revenue, Relationship, Follow-Through, Support, Collections, Operations
  - Finance: Obligations, Spending, Planning, Reserve, Approvals, Receivables
  - Concierge: Life Admin, Travel, Logistics, Support Load, Prep, Household

**Create** `src/components/sita/domain-shared/DomainAdvisorBoard.tsx`
- Reusable advisor board with 3 modes:
  - **Roundtable** — all advisors visible, sequential synthesis
  - **Ask One** — focus on single advisor with deep response
  - **Synthesis** — combined recommendation from all advisors
- Domain-aware: reads advisor roster from topology, applies domain accent

**Edit** `BusinessBoardroom.tsx`, `MoneyBoardroom.tsx`, `ConciergeBoardroom.tsx`
- Integrate `DomainAdvisorBoard` with domain-specific advisor roster
- Wire into existing boardroom layout alongside ComparisonCard and ProofCard

---

## Files Summary

| Phase | Action | Files |
|-------|--------|-------|
| 1 | Create | `useAppStatePersistence.ts` |
| 1 | Edit | `BusinessCenter`, `MoneyCenter`, `ConciergeCenter`, `DomainAppShell` |
| 2 | Edit | `AppSidebar.tsx`, `DomainAppShell.tsx` |
| 3 | Edit | `DesktopDock.tsx` |
| 4 | Create | `domain-atmospheres.ts`, `DomainCard.tsx` |
| 4 | Edit | `DomainAppShell`, 3 overview pages |
| 5 | Create | `FilesCenter.tsx` (rewrite) |
| 5 | Edit | `GlobalBoardroom.tsx` |
| 6 | Create | `advisor-topology.ts`, `DomainAdvisorBoard.tsx` |
| 6 | Edit | 3 boardroom pages |

**After all 6 phases:** Apps persist state across switches, sidebar feels like a launcher with running indicators, dock shows domain apps, each domain has distinct visual atmosphere, Files is a full app, boardrooms are cinematic with advisor boards, and the system feels like a true OS containing independent software products.

