

# Lead Recovery — Full Advanced Implementation Plan

## Current State
- `LeadRecovery.tsx`: ~150 lines, 5 hardcoded cold leads, 4 campaigns, basic 3-tab list (Cold Leads/Campaigns/ROI) + simple detail pane
- `LeadRecoveryPane.tsx`: ~109 lines, shows identity card + single AI message with send buttons
- No recovery engine, no queue classification, no recovery scoring logic, no rich detail view, no integration with CRM/advisors/Boardroom

## Implementation Plan

### File 1: Recovery Data Engine
**Create `src/lib/engines/lead-recovery-engine.ts`** (~300 lines)

Recovery object model with full typing:
- `RecoveryCandidate`: linked lead, failure mode, recovery reason, stage at slip, time since last action, value at risk, relationship sensitivity, time sensitivity, recovery score, likely success band, recommended recovery path, owner accountability, prepared drafts, advisor summary, boardroom candidacy
- `FailureMode` enum: no_response, missed_followup, quote_abandoned, lost_momentum, owner_dropped, appointment_incomplete, post_consult_drift, handoff_failure, silent_high_value, callback_missed
- `RecoveryPath` enum: soft_reactivation, direct_rescue, quote_rescue, consult_reactivation, relationship_repair, reassignment, strategic_rescue
- `RecoveryQueue` type with queue definitions matching all 12+ queues from spec
- Recovery scoring function: computes recoverability (0-100) from engagement quality, value, recency, failure mode, relationship context
- Recovery window heat calculator: time-based urgency
- Failure mode classifier: analyzes lead signals to determine what went wrong
- Relationship sensitivity scorer
- Likely success band calculator (strong/moderate/uncertain/low/archive)
- Recovery path recommender based on failure mode + context
- Queue assignment logic
- 25+ rich mock recovery candidates with realistic data spanning all failure modes and queues

### File 2: Recovery Overview Dashboard
**Create `src/components/business/lead-recovery/RecoveryOverview.tsx`** (~250 lines)

Premium strategic overview at top of workspace:
- Hero metrics row: Total Recoverable Leads, Value at Risk ($), Hottest Recovery Windows, Recovery Win Rate
- Recovery queue health visualization: horizontal bar chart showing leads per queue with color-coded urgency
- Top Priority Rescue grid: 3 cards showing highest-value recovery opportunities with score rings, failure mode badges, and time sensitivity indicators
- Advisor summary card with recovery intelligence insight
- Recovery momentum indicator: animated ring showing recovery trend (improving/stable/declining)
- Uses HeroCard, StatusCard, AdvisorCard from design system

### File 3: Recovery Queue Panel
**Create `src/components/business/lead-recovery/RecoveryQueuePanel.tsx`** (~200 lines)

Left sidebar queue navigator:
- 12 queue entries: No Response, Missed Follow-up, Quote Abandoned, Lost Momentum, Owner Dropped, Appointment Incomplete, Post-Consult Drift, Handoff Failure, Silent High-Value, Callback Missed, Winback/Reactivation, Strategic Recovery
- Each queue shows: icon, name, count badge, value-at-risk indicator, urgency dot
- "All Recovery" option at top
- Active queue highlighted with accent border
- Animated count transitions
- Compact, scrollable, glassmorphic queue list

### File 4: Recovery Card
**Create `src/components/business/lead-recovery/RecoveryCard.tsx`** (~180 lines)

Rich recovery candidate card (inspired by LeadTriageCard quality):
- Left urgency bar color-coded by time sensitivity
- Avatar with recovery score ring (color: green/gold/red)
- Name, company, value at risk
- Failure mode badge (e.g., "Quote Abandoned", "Owner Dropped")
- Recovery score with likely success band label
- Time since slip indicator
- Recovery path recommendation chip
- Quick action tray: Re-engage, Rebook, Reopen Quote, Reassign, Escalate, Archive
- Hover reveals full action set
- Selected state with accent border

### File 5: Recovery Detail Pane (rebuilt)
**Rewrite `src/components/business/LeadRecoveryPane.tsx`** (~400 lines)

Premium rescue briefing with 6 sections:

**A. Recovery Summary** — what happened, why it matters, recoverability score ring with band label

**B. What Went Wrong** — timeline visualization showing: when momentum started, when it slipped, when action was missed, why recovery is still viable. Uses a vertical step timeline with status dots (green → amber → red → current)

**C. Recovery Path** — suggested approach card with: path name, message tone, timing advice, who should own it, confidence indicator

**D. Time & Relationship Sensitivity** — two side-by-side indicator cards: urgency gauge (act today / this week / flexible) and relationship sensitivity gauge (handle carefully / standard / direct approach)

**E. Prepared Communication** — AI-generated recovery draft in a premium message card, with channel badge (Email/Phone/LinkedIn/SMS), tone indicator, Edit/Send/Add to Campaign buttons

**F. Suggested Next Actions** — action tray with prioritized recovery actions: send recovery message, schedule callback, reassign owner, reopen quote, invite to consult, escalate to Boardroom, archive with rationale

**G. Accountability View** — who owns this, what was missed, whether escalation needed, manager review recommended badge

### File 6: Recovery Celebration & States
**Create `src/components/business/lead-recovery/RecoveryStates.tsx`** (~150 lines)

- Empty state: hopeful "No active rescue opportunities right now" with shield icon, recovery performance tips, prevention suggestions
- First-use state: explains what Lead Recovery does with 3 benefit cards
- Recovered celebration: animated "Momentum Restored" card with confetti-style particle burst, shows value recovered and pipeline status
- High-pressure state: elevated urgency banner when many leads are slipping

### File 7: Main Page Rebuild
**Rewrite `src/pages/business/LeadRecovery.tsx`** (~250 lines)

Full workspace layout:
- Top: RecoveryOverview (collapsible)
- Below: SplitWorkspace with:
  - Left: Queue panel tabs + filtered RecoveryCard list with search/sort
  - Right: Full RecoveryDetailPane
- Tab bar: Overview | Queues | Campaigns | Analytics
- Campaigns tab retains campaign list with enhanced cards
- Analytics tab: recovery win rate chart, value recovered over time, top failure modes pie, recovery path effectiveness
- All wired to recovery engine data
- Smooth Framer Motion transitions between tabs/selections

## Design Language
All components follow existing SITA OS patterns:
- Dark glassmorphic: `bg-[hsl(0_0%_9%)]`, `border-[hsl(0_0%_100%/0.06)]`
- Accent: `hsl(265 55% 58%)` purple, `hsl(38 85% 58%)` gold, `hsl(152 55% 48%)` trust-safe green
- Typography: Space Grotesk display, Inter body
- Surface levels 0-3 via AppSurface
- Premium cards via HeroCard, StatusCard, AdvisorCard, QueueCard
- Framer Motion enter/exit animations
- Calm, non-punitive tone throughout

## File Summary
- **Create**: lead-recovery-engine.ts, RecoveryOverview.tsx, RecoveryQueuePanel.tsx, RecoveryCard.tsx, RecoveryStates.tsx (5 files)
- **Rewrite**: LeadRecoveryPane.tsx, LeadRecovery.tsx (2 files)
- **Total**: 7 files, ~1,700 lines

