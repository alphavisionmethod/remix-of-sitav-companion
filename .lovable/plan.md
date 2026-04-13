

# Boardroom — Full Cinematic Decision Chamber Implementation

## What We're Building

Replacing the empty `BoardroomAppShell.tsx` placeholder with the complete, cinematic strategic decision environment described in the product spec. This is the highest-trust surface in SITA OS — darker, more focused, simulation-first, anti-hallucination, and visually premium.

The implementation uses **demo/mock data** throughout (consistent with the existing `useBoardroomData` hook pattern) so every section renders immediately with rich, realistic content.

## Architecture

```text
BoardroomAppShell.tsx (sidebar + router)
├── BoardroomExecutiveView.tsx    — The default "room": agenda + synthesis + simulation
├── BoardroomPulseView.tsx        — Domain-specific pulse (business/finance/concierge)
├── BoardroomSynthesisView.tsx    — Advisor positions + disagreements + confidence
├── BoardroomSimulationView.tsx   — Scenario comparison + confidence bands + dry-run
├── BoardroomApprovalView.tsx     — Approval gates + decision seals + receipts
├── BoardroomDecisionMemory.tsx   — Historical decisions + outcomes timeline
└── BoardroomHeader.tsx           — Session header with scope, trust posture, freshness
```

## Detailed Changes

### 1. `BoardroomHeader.tsx` (new)

Cinematic top bar showing:
- Session scope selector (Global / Business / Finance / Concierge)
- Trust posture badge (Verified / Review / Degraded)
- Data freshness indicator with timestamp
- Session mode label (Review / Simulation / Approval)
- Subtle ambient glow animation (purple→gold gradient pulse)

### 2. `BoardroomExecutiveView.tsx` (new) — The Main Room

The centerpiece. Three-section vertical layout:

**A. Current Agenda Table** — The "table in the room"
- 3 mock agenda items (e.g., "Collections action review", "Reserve shortfall", "Travel prep decision")
- Each shows: title, domain badge, urgency, recommended motion, confidence bar
- Spotlighted active item with glowing border and expanded detail

**B. Cross-Domain Signals Strip**
- 3-column grid: Business tension / Finance pressure / Concierge burden
- Each shows: 1-line summary, key metric, trend arrow, confidence

**C. Recommended Motion Card**
- Large featured card with: recommendation title, rationale (2-3 lines), confidence bar, risk badge
- "Simulate First" and "Approve" action buttons
- Evidence source count badge
- ExecutionChainTimeline showing current step

### 3. `BoardroomPulseView.tsx` (new)

Reusable domain pulse view (tabs for Business/Finance/Concierge within the Boardroom sidebar). Each shows:
- Domain health summary (3 key metrics in glassmorphic cards)
- Top 3 priorities with confidence bars
- Advisor stance summary (who says what, with confidence)
- Overdue/pressure items
- Uses existing `useBoardroomData` hook for real data with demo fallback

### 4. `BoardroomSynthesisView.tsx` (new)

Advisor convergence surface:
- **Advisor Stance Cards**: 4-6 advisor positions side-by-side (Revenue, CRM, Obligations, Reserve, Travel, Ops) — each with name, recommendation, confidence, evidence count
- **Disagreement Highlight**: When advisors conflict, a special "Disagreement Card" with both positions, confidence gap, and recommended resolution
- **Confidence Ladder**: Sorted list of all advisor confidences using existing `ConfidenceLadder` component
- **Consensus Meter**: Visual aggregate showing overall advisor alignment percentage

### 5. `BoardroomSimulationView.tsx` (new)

The simulation theater:
- Uses existing `ScenarioComparison` primitive with 2-3 mock scenarios
- Uses existing `ConfidenceBand` for projected outcomes with uncertainty ranges
- **What-If Panel**: Side panel showing downstream effects across domains
- **Assumptions Disclosure**: Explicit list of what's assumed vs. verified vs. unknown
- **Missing Data Warnings**: Amber badges for gaps in evidence

### 6. `BoardroomApprovalView.tsx` (new)

The approval and receipt chamber:
- Uses existing `ApprovalGate` primitives for pending approvals from `useBoardroomData`
- Uses existing `DecisionSeal` for final seal ceremony (animated stamp)
- Uses existing `ExecutionChainTimeline` showing the full 8-step chain
- **Receipt Preview**: After approval, shows generated receipt with hash, timestamp, rationale
- Uses existing `ProofReceipt` primitive

### 7. `BoardroomDecisionMemory.tsx` (new)

Historical decision archive:
- Timeline of past decisions (5-6 mock entries)
- Each shows: decision, date, outcome status (positive/neutral/negative), receipt hash
- Expandable to show original recommendation, advisor positions at time of decision, and actual outcome

### 8. `BoardroomAppShell.tsx` (rewrite)

Complete rewrite of the shell:
- **Visual atmosphere**: Darker than other apps — `bg-[hsl(220_18%_4%)]` with subtle radial purple spotlight
- **Sidebar**: Narrower (180px), more formal typography, fuchsia/purple accent, ambient glow on active item
- **Cinematic entry**: Fade-in with subtle scale on first load
- **Module routing**: Routes to the 6 views above based on sidebar selection
- **BoardroomHeader** rendered above all views

## Visual Design Principles

- **Darker than everything else**: Base bg ~4% lightness (vs 6% for other apps)
- **Purple spotlight**: Subtle radial gradient from center creating "room" feel
- **Premium typography**: Larger headers, more tracking, stronger hierarchy
- **Glass cards**: Higher blur, more border opacity than standard surfaces
- **Restrained motion**: Smooth fades and scales, no playful bounces
- **Decision-grade density**: More whitespace than dashboards, fewer but more meaningful cards

## Existing Primitives Reused (no new primitives needed)

- `ConfidenceBar` — advisor and recommendation confidence
- `ConfidenceBand` — projected outcome uncertainty
- `ScenarioComparison` — side-by-side scenario review
- `EvidenceChain` — how conclusions were reached
- `ExecutionChainTimeline` — 8-step execution visualization
- `DecisionSeal` — animated approval stamp
- `ApprovalGate` — pending approval cards
- `ProofReceipt` — receipt after execution
- `AdvisorAvatar` — advisor identity display
- `BoardroomSlide` — section containers with variant accents

## Files

| File | Action |
|------|--------|
| `src/components/sita/apps/boardroom/BoardroomAppShell.tsx` | **Rewrite** — cinematic shell with darker atmosphere |
| `src/components/sita/apps/boardroom/BoardroomHeader.tsx` | **New** — session header with scope/trust/freshness |
| `src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx` | **New** — main room: agenda + signals + motion |
| `src/components/sita/apps/boardroom/BoardroomPulseView.tsx` | **New** — domain pulse summaries |
| `src/components/sita/apps/boardroom/BoardroomSynthesisView.tsx` | **New** — advisor positions + disagreements |
| `src/components/sita/apps/boardroom/BoardroomSimulationView.tsx` | **New** — scenario comparison + confidence bands |
| `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` | **New** — approval gates + decision seals |
| `src/components/sita/apps/boardroom/BoardroomDecisionMemory.tsx` | **New** — historical decision timeline |

8 files total. All use demo mock data inline. No database changes needed.

