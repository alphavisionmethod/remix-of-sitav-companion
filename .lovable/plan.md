

# Boardroom Audit — Gaps Found & Fix Plan

## What's Already Working Well
- Shell, header, sidebar, cinematic atmosphere — all solid
- Executive View: agenda table, cross-domain signals, recommended motion with ExecutionChainTimeline
- Pulse View: domain tabs, metrics, priorities, advisor stances, overdue pressure
- Synthesis View: consensus meter, advisor stance cards, disagreement cards
- Simulation View: ScenarioComparison, ConfidenceBand, downstream effects, assumptions disclosure
- Approval View: ApprovalGate, DecisionSeal, ProofReceipt, ExecutionChainTimeline
- Decision Memory: timeline, expandable history with outcomes

## Gaps Found (7 issues)

### 1. Scope not wired to views
The header has Global/Business/Finance/Concierge tabs but `scope` is never passed to any view. Changing scope should filter agenda items, signals, and recommendations to that domain.

### 2. No EvidenceChain usage anywhere
The spec heavily emphasizes evidence inspection ("What evidence supports this?"). The `EvidenceChain` primitive exists but is never used in the Boardroom.

### 3. "Simulate First" and "Approve" buttons are dead
Clicking them does nothing. They should at minimum navigate to the Simulation or Approval views respectively.

### 4. No freshness indicators on data items
The spec requires explicit freshness labels (e.g., "Updated 2 min ago", "Stale — 3 weeks old") on individual data points, not just the header.

### 5. No "What Changed" section
Spec section 12 requires a delta view showing what changed since the last boardroom session.

### 6. No blocker/requirement panel before approval
Before approving, the spec says the system should show prerequisites, blockers, or conditions that must be met.

### 7. No receipt generation flow
After clicking Approve, nothing happens. Should show a generated receipt with hash, timestamp, and rationale.

## Fix Plan

### File 1: `BoardroomAppShell.tsx` — Pass scope to all views
- Pass `scope` and `setActiveModule` as props to `ActiveView`
- Use a context or prop drilling so views can react to scope

### File 2: `BoardroomExecutiveView.tsx` — Wire scope + interactivity
- Filter agenda items by scope (show all for "global", domain-specific otherwise)
- "Simulate First" button calls `onNavigate("simulation")`
- "Approve" button calls `onNavigate("approvals")`
- Add `EvidenceChain` below the recommended motion card
- Add freshness timestamps on agenda items and signals
- Add a "What Changed" strip below cross-domain signals (3 delta items with timestamps)

### File 3: `BoardroomSimulationView.tsx` — Add scope filtering + freshness
- Add freshness badges on each assumption (e.g., "3 weeks old" on stale data)
- Scope-aware: show relevant scenarios per domain

### File 4: `BoardroomApprovalView.tsx` — Add blockers panel + receipt generation
- Add "Requirements & Blockers" section above pending approvals (2-3 mock items like "CRM review complete", "Reserve buffer > 60%")
- Approve button triggers state change: shows animated receipt generation with hash, timestamp, rationale, and conditions
- Add freshness on proof receipts

### File 5: `BoardroomPulseView.tsx` — Sync with header scope
- When header scope changes, auto-select matching domain tab

### File 6: `BoardroomSynthesisView.tsx` — Add EvidenceChain
- Below each disagreement card, add collapsible `EvidenceChain` showing the proof trail each advisor used

## Files

| File | Change |
|------|--------|
| `BoardroomAppShell.tsx` | Pass `scope` + `onNavigate` to views |
| `BoardroomExecutiveView.tsx` | Scope filtering, button wiring, EvidenceChain, What Changed, freshness |
| `BoardroomSimulationView.tsx` | Freshness badges on assumptions |
| `BoardroomApprovalView.tsx` | Blockers panel, receipt generation flow |
| `BoardroomPulseView.tsx` | Sync domain tab with scope |
| `BoardroomSynthesisView.tsx` | Add EvidenceChain to disagreements |

6 files modified. No new files. No database changes.

