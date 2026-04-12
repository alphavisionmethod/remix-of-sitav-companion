

# Business App — Remaining Gaps to Implement

## Confirmed: All 16 spec workspaces exist with full UI, demo data, tabs, and routing.

## What's still missing (4 items from the enhancement list):

### 1. Dedicated Operations Workspace (Spec Section 14) — NOT IMPLEMENTED
No `BusinessOperations.tsx` exists. The spec calls for a standalone workspace with:
- Operating queues, escalations, bottleneck map
- Team ownership/activity view
- Commitments at risk, delayed processes
- Workflow exceptions, customer-impacting operational issues
- Business day pulse

### 2. Relationship Graph Panel (Spec Section 7.3) — NOT IMPLEMENTED as UI Component
A `RelationshipGraph` service exists in `src/lib/services/relationship-intelligence/` but there is no visual `RelationshipGraphPanel` component showing linked people, related businesses, household crossover on customer detail pages.

### 3. Reusable Component Extraction (Spec Section 25) — NOT EXTRACTED
25 named components exist inline in pages but none are standalone files. This is refactoring, not new functionality. **Skipping this — not worth the churn for demo-mode pages.**

### 4. Business File/Document Integration (Spec Section 21) — NOT IMPLEMENTED
No business-specific file picker, attach-to-lead, or document preview panel. The OS has a generic Files page but nothing business-context-specific. **Deferring — this requires deeper OS integration beyond the Business app scope.**

---

## Implementation Plan — 2 New Items

### Phase 1 — Business Operations Workspace (NEW)
**Create `src/pages/business/BusinessOperations.tsx`**
- KPI strip: Open queues, Escalations, Bottlenecks, At-risk commitments
- Tabs: All, Queues, Escalations, Team, Bottlenecks, Delayed
- Demo data: 8-10 operational items across statuses
- Queue cards with owner, status, customer impact, urgency
- Team activity view with workload indicators
- Bottleneck detection cards with suggested actions
- AI Operations Advisor card
- Follows existing patterns: GlassCard, SitaTabs, motion, DemoModeBadge

### Phase 2 — Relationship Graph Panel Component (NEW)
**Create `src/components/business/RelationshipGraphPanel.tsx`**
- Visual node graph showing linked entities for a customer/account
- Node types: Person, Business, Household, Team Member
- Connection lines with relationship labels
- Uses data from existing `RelationshipGraph` service
- Compact card-based layout (not a full D3 graph — fits in a side panel)
- Demo data: 4-6 linked entities per customer

**Integrate into `CustomersPage.tsx`**
- Add RelationshipGraphPanel to customer detail view

### Phase 3 — Wire Operations into BusinessCenter
**Modify `src/pages/BusinessCenter.tsx`**
- Add `operations` to SubPage type
- Import BusinessOperations
- Add to pages map
- Add "Operations" tab to "Core" group (after Appointments)
- Add to subpageFromPath

### Phase 4 — Add Route
**Modify `src/App.tsx`**
- Add `/business/operations` route

---

## File Summary

| Action | File |
|---|---|
| Create | `src/pages/business/BusinessOperations.tsx` |
| Create | `src/components/business/RelationshipGraphPanel.tsx` |
| Modify | `src/pages/business/CustomersPage.tsx` — add RelationshipGraphPanel |
| Modify | `src/pages/BusinessCenter.tsx` — add operations tab |
| Modify | `src/App.tsx` — add 1 route |

