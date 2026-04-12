

# Business App Audit — Spec vs Implementation

## What Exists (21 sub-pages, well-built)

| Spec Section | Existing Page | Status |
|---|---|---|
| Business Home | `BusinessOverview.tsx` (493 lines) | Implemented — WhatMattersNow, PreparedActions, QuickActionBar, WhatChangedFeed, bento grid, leakage panel, funnel |
| Leads & Pipeline | `LeadsInbox.tsx` + `OpportunitiesCenter.tsx` | Implemented — lead list, pipeline, detail views |
| Lead Recovery | `LeadRecovery.tsx` (236 lines) | Implemented — campaigns, cold leads with AI messages, triggers, ROI dashboard |
| Customers & Relationships | `CustomersPage.tsx` (332 lines) | Implemented — health scores, detail panels, CRM sync |
| Communications | `CommunicationsCenter.tsx` (373 lines) | Implemented — draft/review/sent/delivered states, approval flow |
| Quotes & Proposals | `QuotesWorkspace.tsx` + `ProposalsContracts.tsx` | Implemented |
| Invoices & Collections | `InvoicesCollections.tsx` + `CollectionsCommandCenter.tsx` (415 lines) | Implemented — chase sequences, escalation ladders, aging buckets |
| Ecommerce | `EcommerceManager.tsx` (330 lines) | Implemented — orders, products, cart recovery, KPIs |
| Follow-Through | `FollowThroughCenter.tsx` (171 lines) | Implemented — 6 queue tabs (callbacks, no-touch, waiting, drafts, overdue, recovery) |
| Boardroom | `BusinessBoardroom.tsx` | Implemented |
| Proof | `BusinessProof.tsx` | Implemented |
| Revenue Autopilot | `RevenueAutopilot.tsx` + `AutopilotHub.tsx` | Implemented |
| Revenue Intelligence | `RevenueImpactDashboard.tsx` + `RevenueForecast.tsx` + `PlaybookBuilder.tsx` | Implemented |
| Automations (shared) | `AutomationCenter.tsx` (domain-shared) | Implemented — rules, executions, toggles, risk tiers |
| Social | `SocialCommand.tsx` | Implemented |
| Website | `WebsiteBuilder.tsx` | Implemented |

## What's Missing from the Spec

### 1. Customer Support Workspace (Spec Section 9) — NOT IMPLEMENTED
The spec calls for a dedicated support workspace with:
- Support inbox/queue, urgency/severity, SLA/aging
- Waiting on business reply vs waiting on customer reply
- Escalated items, refunds/adjustments
- AI thread summarization, response drafts
- Customer-impact view

No `CustomerSupport.tsx` or equivalent exists in `src/pages/business/`. Support is partially covered by CommunicationsCenter but not as a dedicated workspace.

### 2. Appointments & Scheduling (Spec Section 13) — NOT IN BUSINESS APP
A `BookingCenter.tsx` exists in `src/pages/revenue-office/` and `AppointmentsPrep.tsx` exists in Concierge, but there is no appointments tab inside the Business app itself. The spec calls for it as a Business workspace: confirmation outreach, no-show risk, missed appointment recovery, staff assignment.

### 3. Tasks & Follow-Through as Full Workspace (Spec Section 15) — PARTIALLY IMPLEMENTED
`FollowThroughCenter.tsx` handles queues well, but the spec's "Tasks" workspace is broader: today/overdue/assigned/workflow/recurring/blocked/waiting-on/review-needed tasks with entity linking. Currently follow-through is queue-only, not a full task management surface.

### 4. Missing Tab Entries in BusinessCenter Navigation
The current `SubPage` type and `TAB_GROUPS` do not include:
- `support` (Customer Support)
- `appointments` (Appointments & Scheduling)
- `tasks` (separate from follow-through)

### 5. Cart Recovery as Dedicated Sub-View (Spec Section 12)
Ecommerce has cart data but the spec calls for a dedicated abandoned cart queue with recovery message drafts, recovery cadence, and suppression rules. This is partially present but could be more prominent.

### 6. Relationship Graph Panel (Spec Section 7.3)
The spec calls for linked people, related businesses, household/business crossover on customer detail. Not currently implemented.

### 7. Business File/Document Integration (Spec Section 21)
File picker, attach-to-lead, upload quote/proposal, document preview, drag-drop. Not implemented as a dedicated surface.

---

## Implementation Plan

### Phase 1 — Customer Support Workspace (NEW)
**Create `src/pages/business/CustomerSupportCenter.tsx`**

- Support inbox with urgency tiers (critical/high/medium/low)
- Issue cards: customer, severity, status, owner, linked order/invoice, last action
- Tabs: All, Urgent, Waiting on Us, Waiting on Customer, Escalated, Resolved
- KPI strip: Open issues, avg resolution time, escalated count, customer impact score
- AI advisor: thread summary, draft response, suggest escalation
- Demo data for 8-10 support issues across statuses

### Phase 2 — Appointments Workspace (NEW)
**Create `src/pages/business/AppointmentsScheduling.tsx`**

- Upcoming appointments list with confirmation status
- No-show risk indicators (based on history, time)
- Confirmation outreach actions (send reminder, call)
- Missed appointment recovery queue
- Post-appointment follow-up queue
- Staff/resource assignment view
- Demo data for 6-8 appointments

### Phase 3 — Wire New Pages into BusinessCenter
**Modify `src/pages/BusinessCenter.tsx`**

- Add `support` and `appointments` to `SubPage` type
- Import new components
- Add to `pages` map
- Add to `TAB_GROUPS`:
  - Support goes in "Core" group after "Follow-Through"
  - Appointments goes in "Core" group after Support
- Add to `subpageFromPath`

### Phase 4 — Add Routes
**Modify `src/App.tsx`**

- Add `/business/support` route
- Add `/business/appointments` route

---

## Technical Details

- Both new pages follow existing patterns: `GlassCard`, `SitaTabs`, `motion` animations, `DemoModeBadge`, demo data arrays
- No database changes needed — demo data only
- Reuse existing shared components: `WhatMattersNow`, `PreparedActions` where appropriate
- ~200-300 lines per new page, consistent with existing business pages

## File Summary

| Action | File |
|---|---|
| Create | `src/pages/business/CustomerSupportCenter.tsx` |
| Create | `src/pages/business/AppointmentsScheduling.tsx` |
| Modify | `src/pages/BusinessCenter.tsx` — add 2 tabs + imports |
| Modify | `src/App.tsx` — add 2 routes |

