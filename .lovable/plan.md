

# Boardroom ↔ Domain Advisor Connection — Final Wiring Plan

## The Core Gap

The three domain apps (Business, Finance, Concierge) have **zero connection** to the Boardroom. They are empty shells with placeholder "DATA CANVAS" text. There is no mechanism for:
- Domain advisors to escalate issues to the Boardroom
- The Boardroom to push approved decisions back to domain apps
- Individual module advisors to appear in both their domain app AND the Boardroom council

The Boardroom itself is rich and complete, but it operates in isolation.

## What This Plan Delivers

A bidirectional connection system between domain apps and the Boardroom, plus enriched domain app shells so advisors live in both places.

---

## Phase 1 — Shared Escalation Service + Hook

**`src/lib/services/boardroom-bridge.ts`** (new)
- `escalateToBoardroom(item)` — writes to `boardroom_items` table with source domain, severity, advisor summaries, escalation reason
- `pushDecisionToApp(receipt, domain)` — writes to `advisor_action_queue` with `action_type: "boardroom_decision"` linking the receipt
- Types: `EscalationPayload`, `DecisionPush`

**`src/hooks/useBoardroomBridge.ts`** (new)
- `escalate(title, domain, severity, advisorSummaries)` — calls bridge, shows toast, invalidates boardroom queries
- `pendingEscalations` — query `boardroom_items` by domain for badge counts
- `domainDecisions` — query `advisor_action_queue` where `action_type = "boardroom_decision"` for the domain

## Phase 2 — Enrich Domain App Shells

Each domain app currently shows only a sidebar and a blank canvas. Add:

**`BusinessAppShell.tsx`** (modify — major)
- Add an "Advisors" module to sidebar
- Add a "Boardroom" module to sidebar
- In the Advisors view: embed `DomainAdvisorBoard` (already exists, fully featured with 5 modes)
- In the Boardroom view: show domain-scoped boardroom items + decisions with "Escalate to Boardroom" button
- Add a notification badge on the Boardroom sidebar item showing pending items count
- Each advisor card gets an "Escalate to Boardroom" action button

**`FinanceAppShell.tsx`** (modify — major)
- Same pattern: add Advisors + Boardroom modules
- Embed `DomainAdvisorBoard` for finance domain
- Show finance-scoped boardroom items and approved decisions

**`ConciergeAppShell.tsx`** (modify — major)
- Same pattern: add Advisors + Boardroom modules
- Embed `DomainAdvisorBoard` for concierge domain
- Show concierge-scoped boardroom items and approved decisions

## Phase 3 — Boardroom Receives Domain Escalations

**`BoardroomExecutiveView.tsx`** (modify)
- Replace hardcoded `AGENDA_ITEMS` with live data from `useBoardroomLiveData` (the hook exists but Executive view still uses hardcoded data)
- Show escalation source badge (which domain app sent it) on each item
- Add "Return Decision" button on approved items that pushes back to domain via bridge

**`BoardroomAdvisorCouncil.tsx`** (modify)
- Replace hardcoded `ADVISOR_STANCES` map with dynamic stances pulled from `boardroom_items.advisor_summaries` for the active session's items
- When an advisor is clicked, show their domain-specific stance on the current boardroom item (not a static map)

**`BoardroomApprovalView.tsx`** (modify)
- After approval ceremony completes, call `pushDecisionToApp` to write the decision back to the originating domain's action queue
- Show "Decision sent to [Domain] App" confirmation

## Phase 4 — Visual Connection Indicators

**Domain apps** — Add a small "Boardroom Status" strip at the top of each domain app showing:
- Number of items currently in Boardroom from this domain
- Number of decisions awaiting action from Boardroom
- Quick link to open Boardroom app (via window launcher)

**Boardroom** — Add domain origin badges on all items showing which app they came from (Business = blue, Finance = green, Concierge = purple)

---

## Technical Details

- No new database tables needed — uses existing `boardroom_items` and `advisor_action_queue`
- Bridge service is a thin client-side module that wraps Supabase inserts
- Domain apps use `useWindowLauncher` from `ShellWindowLayer` to open Boardroom when clicking "View in Boardroom"
- All data flows through existing RLS policies (`auth.uid() = user_id`)
- Demo mode: bridge operations show toast but don't write to DB

## File Summary

| File | Action |
|------|--------|
| `src/lib/services/boardroom-bridge.ts` | New — escalation + decision push service |
| `src/hooks/useBoardroomBridge.ts` | New — React hook wrapping bridge |
| `src/components/sita/apps/business/BusinessAppShell.tsx` | Major modify — add Advisors + Boardroom modules |
| `src/components/sita/apps/finance/FinanceAppShell.tsx` | Major modify — add Advisors + Boardroom modules |
| `src/components/sita/apps/concierge/ConciergeAppShell.tsx` | Major modify — add Advisors + Boardroom modules |
| `src/components/sita/apps/boardroom/BoardroomExecutiveView.tsx` | Modify — live data, domain badges, return decision |
| `src/components/sita/apps/boardroom/BoardroomAdvisorCouncil.tsx` | Modify — dynamic stances from live items |
| `src/components/sita/apps/boardroom/BoardroomApprovalView.tsx` | Modify — post-approval domain push |

8 files. No new tables. No new dependencies.

