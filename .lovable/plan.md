

# Enhancement Plan — Connect & Complete Everything from Last 20 Prompts

## Audit Summary

After thorough review of all files, here is what exists and what needs fixing/enhancing:

### Already Fully Implemented & Working
- **Automation Office** (652 LOC): 10 tabs — Boardroom, Surface Map, Active, At Risk, Advisor Recs, Leak Repair, Quality Scoring, Shadow Board, Promises, OS Map
- **Automation Builder** (298 LOC): Visual node editor, 65+ node types, 4 trust levels, advisor-generated templates
- **Automation Templates** — Ready-made gallery
- **Automation SimLab** — Pre-activation simulation
- **Automation Health** — Domain-level monitoring
- **Automation Receipts** (198 LOC): Full audit trail + "Why This Was Sent" transparency
- **Automation Policy** (445 LOC): 9 tabs — Trust Levels, Constitution, No-Guess Mode, Pause/Rollback, Human Handoff, Escalation, Compliance, Human vs AI, Audit Log
- **Quote Studio** — Full quote generation workspace
- **Call Desk** — Call queue, prep, post-call automation
- **Business Formation Ceremony** — 20 screens across 7 chapters with branching, custom journey editor, revenue estimator
- **Growth Advisor Board** (422 LOC): Interactive queries (disagree/missing/break) with 27 evidence-backed responses
- **All routes wired** in App.tsx (9 automation routes + quotes + calls + onboarding)
- **Demo data layer** fully populated in `revenue-office.ts`

### Issues Found — Need Fixing

**1. Redundant DemoModeBadge in 13 onboarding screens**
`DemoModeBadge` is rendered inside individual screens (IdentityScreen, DeliveryScreen, TeamScreen, AutomationScreen, ConversionScreen, FileImportScreen, IntakeHubScreen, AdvisorActivationScreen, BranchingQuestionsPanel, etc.) even though `FormationShell.tsx` already renders it at the top level (line 106). This causes 2-5 redundant badge renders per screen.

**Fix:** Remove `<DemoModeBadge />` and unused `useDataMode`/`DemoModeBadge` imports from all 13 onboarding screen files.

**2. No sidebar sub-navigation for Revenue Office**
The sidebar only has a single "Revenue Office" link. There's no expandable sub-menu for Automation Office, Quote Studio, Call Desk, etc. Users cannot discover these workspaces from the sidebar.

**Fix:** Add a collapsible Revenue Office sub-menu in `AppSidebar.tsx` with key workspace links (Boardroom, Automation, Quotes, Calls, Pipeline, Advisors, Journey Twin).

**3. Automation Office header buttons are non-functional**
The "Policies" and "New Automation" buttons (lines 81-86 in AutomationOffice.tsx) don't navigate anywhere.

**Fix:** Wire them to `/revenue-office/automation/policy` and `/revenue-office/automation/builder` respectively using `useNavigate`.

**4. Cross-module navigation missing throughout**
AutomationReceipts, AutomationHealth, AutomationSimLab, AutomationTemplates don't link back to each other or to the main Automation Office. No breadcrumb or tab-level navigation between the 7 automation sub-pages.

**Fix:** Add a shared Automation sub-nav bar component used across all 7 automation pages, linking them together.

**5. RevealScreen "Enter Your Revenue Office" navigates to `/revenue-office/boardroom` but doesn't pass onboarding state**
The onboarding data (business type, journey template, bottlenecks, first wins) is lost after navigation. No persistence to localStorage or Supabase.

**Fix:** Save onboarding state to localStorage on reveal, and load it in the Boardroom/Advisor pages for personalization.

**6. RevenueGate (landing page) doesn't surface Automation Office**
The Revenue Office gate page likely doesn't include navigation cards for the Automation Office, Quote Studio, or Call Desk workspaces added in recent prompts.

**Fix:** Add workspace cards for Automation Office, Quote Studio, and Call Desk to RevenueGate.

## Implementation Plan

### Phase 1: Clean DemoModeBadge from 13 screens (~13 files)
Remove redundant `<DemoModeBadge />` renders and unused imports from:
- IdentityScreen, DeliveryScreen, TeamScreen, AutomationScreen, ConversionScreen
- FileImportScreen, IntakeHubScreen, AdvisorActivationScreen, BranchingQuestionsPanel
- AcquisitionScreen, RevenueModelScreen, ArtifactScreen, URLIntakeScreen, ConnectionsScreen, FrictionScreen

### Phase 2: Automation sub-nav component (~1 new file, 7 file edits)
Create `src/pages/revenue-office/AutomationSubNav.tsx` — a horizontal nav bar linking all 7 automation pages. Add it to AutomationOffice, AutomationBuilder, AutomationTemplates, AutomationSimLab, AutomationHealth, AutomationReceipts, AutomationPolicy.

### Phase 3: Wire Automation Office buttons (~1 file)
Add `useNavigate` to AutomationOffice.tsx and connect the "Policies" and "New Automation" buttons.

### Phase 4: Sidebar Revenue Office sub-menu (~1 file)
Add collapsible sub-menu in AppSidebar.tsx under "Revenue Office" with links: Boardroom, Automation, Pipeline, Advisors, Quotes, Calls, Journey Twin, Reputation, Retention.

### Phase 5: Persist onboarding state (~2 files)
Save `OnboardingState` to `localStorage` in RevealScreen on "Enter" click. Load in GrowthBoardroom to show personalized summary.

### Phase 6: RevenueGate workspace cards (~1 file)
Add Automation Office, Quote Studio, Call Desk cards to the Revenue Office landing page.

## Files Changed

| File | Change |
|------|--------|
| 13 onboarding screens | Remove redundant DemoModeBadge |
| `AutomationSubNav.tsx` (NEW) | Shared automation sub-navigation |
| 7 automation pages | Add AutomationSubNav import |
| `AutomationOffice.tsx` | Wire header buttons with navigate |
| `AppSidebar.tsx` | Add Revenue Office expandable sub-menu |
| `RevealScreen.tsx` | Persist state to localStorage |
| `GrowthBoardroom.tsx` | Load onboarding state for personalization |
| `RevenueGate.tsx` | Add Automation/Quote/Call workspace cards |

Total: ~25 files touched, ~120 net LOC added, ~50 LOC removed.

