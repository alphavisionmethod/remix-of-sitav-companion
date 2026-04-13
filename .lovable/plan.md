

# Boardroom — Remaining Gaps & Completion Plan

## What Already Exists (Checked Off)

The Boardroom has strong coverage across the original prompt:
- Session lifecycle (SessionBar, 6 states, timer, stage dots)
- Issue framing (IssueFrame card at top of Executive view)
- Evidence panel (slide-out with lineage, freshness, trust posture)
- Advisor stances (7 stance types, tension map, dot overlays)
- Simulation integrity (contract panel, timeline, risk thermometer, "What Is Not Modeled")
- Approval ceremony (signature animation, seal stamp, pre-checklist, post-closure card)
- Decision memory with session replay snapshots
- Lineage view (signal-to-outcome node graph)
- Cross-app impact (ripple map)
- Explainability (Q&A panel)
- Entry/exit ceremony (assembling overlay, ambient spotlight)
- 10 navigable modules in sidebar

## What Is Still Missing

### GAP 1 — Mobile / Responsive Layout (Critical)
The 180px fixed sidebar and 4-column grids are completely unusable below ~768px. The evidence panel (400px) covers the entire viewport on mobile.

**Fix**: Convert sidebar to a collapsible bottom tab bar on mobile. Make all grids responsive (4-col → 2-col → 1-col). Evidence panel becomes full-screen sheet on mobile.

### GAP 2 — Real Database Wiring (Critical)
Every view uses hardcoded arrays: `AGENDA_ITEMS`, `PULSE_DATA`, `MOCK_APPROVALS`, `DECISIONS`, `SCENARIOS`, etc. The 5 database tables (`boardroom_sessions`, `boardroom_items`, `boardroom_evidence`, `boardroom_recommendations`, `boardroom_decision_receipts`) exist but are never queried.

**Fix**: Create a `useBoardroomLiveData` hook that queries all 5 tables with demo-mode fallback. Replace hardcoded arrays with live data in Executive, Pulse, Approval, and Memory views.

### GAP 3 — Persistent Actions (Critical)
Approve, Adjourn, Advance Stage, and Add Evidence buttons only change local React state. Nothing writes to the database.

**Fix**: Wire `handleApprove` to insert into `boardroom_decision_receipts`. Wire session lifecycle changes to update `boardroom_sessions`. Wire evidence submission to insert into `boardroom_evidence`.

### GAP 4 — Follow-Through & Outcome Tracking
Approved decisions don't convert to action items. No mechanism to compare expected vs actual outcomes. No auto-return to Boardroom for follow-up review.

**Fix**: After approval, insert linked execution items into `advisor_action_queue`. Add an outcome recording form in Decision Memory. Add a "Follow-up Due" filter showing decisions past their review date.

### GAP 5 — Trust State Badges (Visual)
The prompt specifies 11 trust states (verified, evidence-backed, inferred, simulation-only, stale, source-missing, needs-human-review, blocked-by-secret, blocked-by-connector, mathematically-constrained, advisory-only). Currently only ~4 are used in Simulation view. These should appear as small inline badges throughout all views.

**Fix**: Create a `TrustStateBadge` component with all 11 states. Add it to metric cards, agenda items, recommendation cards, and evidence entries.

### GAP 6 — Ambient Visual Polish
Missing: floating background particles, glassmorphic card hover effects (lift + glow), metric "flash" on data change, richer module transitions.

**Fix**: Add a subtle particle canvas to `BoardroomAppShell`. Add hover lift + border glow to all major cards. Add a brief highlight flash when metrics update.

### GAP 7 — File & Document Integration
The evidence panel references documents conceptually but has no actual links to the `user-files` storage bucket or `concierge_documents` table.

**Fix**: Add a "Linked Documents" section to the evidence panel that queries `concierge_documents` for items referenced in evidence entries.

---

## Implementation Order

### Round 1 — Mobile Layout + Trust Badges (2 files new, 3 modified)
| File | Change |
|------|--------|
| `TrustStateBadge.tsx` | New shared component — 11 visual trust states |
| `BoardroomAppShell.tsx` | Responsive sidebar (bottom tabs on mobile), particle canvas |
| `BoardroomEvidencePanel.tsx` | Full-screen on mobile |
| `BoardroomExecutiveView.tsx` | Responsive grids, TrustStateBadges on metrics/agenda |
| `BoardroomPulseView.tsx` | Responsive grids |

### Round 2 — Database Wiring + Persistent Actions (2 files new, 4 modified)
| File | Change |
|------|--------|
| `useBoardroomLiveData.ts` | New hook — queries 5 boardroom tables, demo fallback |
| `BoardroomExecutiveView.tsx` | Replace AGENDA_ITEMS with live data |
| `BoardroomApprovalView.tsx` | Write approvals to `boardroom_decision_receipts` |
| `BoardroomAppShell.tsx` | Persist session lifecycle to `boardroom_sessions` |
| `BoardroomDecisionMemory.tsx` | Query live receipts, add outcome recording |

### Round 3 — Follow-Through + Document Links + Polish (3 modified)
| File | Change |
|------|--------|
| `BoardroomApprovalView.tsx` | Post-approval: insert action items into `advisor_action_queue` |
| `BoardroomEvidencePanel.tsx` | Query `concierge_documents` for linked files |
| All card components | Glassmorphic hover effects (lift + glow) |

~8 files across 3 rounds. No new database tables needed. No new dependencies.

