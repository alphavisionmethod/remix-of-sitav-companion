

## Fix C-018: Empty-state honesty across surfaces — what's actually broken

### Live findings

The empty-state infrastructure is already mature: 113 files use `EmptyState`/`PremiumEmptyState`/`ConciergeEmptyState`, and a `page-state-registry` + CI gate already enforce loading/empty/error/permission contracts on 36 routes. But there are 6 concrete leaks where users with no data see blank or broken layouts:

| # | Surface | File | Leak |
|---|---|---|---|
| 1 | Approval Chamber → Pending tab | `ApprovalChamber.tsx` L442 | Inline raw `<div>` empty state, not canonical |
| 2 | Approval Chamber → Resolved tab | `ApprovalChamber.tsx` L456 | Same — inline raw `<div>` |
| 3 | Approvals Center → Pending | `ApprovalsCenter.tsx` L93 | Bespoke `SitaCard` empty state, not canonical |
| 4 | Files Overview (the surface in the brief) | `FilesOverview.tsx` L123–134 | **No empty state at all** — when zero files, silently renders empty `Classified Files` heading with nothing below |
| 5 | Daily Pulse → Approvals card | `DailyPulse.tsx` L234 | Inline grey text "No pending approvals." |
| 6 | Revenue Forecast Monte Carlo | `RevenueForecast.tsx` L471 | Inline raw `<div>` placeholder |

Plus 2 governance gaps:
- `/files`, `/approvals`, `/approval-chamber`, `/notifications`, `/inbox`, `/daily-pulse` are **missing from `page-state-registry`** — no CI guarantee these surfaces declare `empty` state
- No lint guard preventing future regressions of inline empty-state patterns

### The fix — 3 surgical changes

**1. Replace 6 inline empty states with canonical primitives**

| File | Replace with |
|---|---|
| `ApprovalChamber.tsx` (pending) | `<EmptyState variant="contextual" icon={ShieldCheck} title="All clear" description="…" />` |
| `ApprovalChamber.tsx` (resolved) | `<EmptyState variant="card" icon={CheckCircle} ... />` |
| `ApprovalsCenter.tsx` | `<EmptyState variant="contextual" icon={CheckCircle} title="All caught up" description="…" />` |
| `FilesOverview.tsx` | After `classifiedFiles` is computed, when empty render `<PremiumEmptyState variant="first-use" icon={FolderOpen} title="No files yet" description="Upload your first file…" actions={[{label:"Upload", onClick: ...}]} domain="files" />` |
| `DailyPulse.tsx` | Replace inline "No pending approvals." with compact `<EmptyState variant="card" icon={CheckCircle} title="All clear" description="No pending approvals." />` |
| `RevenueForecast.tsx` | `<EmptyState variant="card" icon={Gauge} title="No simulation yet" description="Run a Monte Carlo…" actionLabel="Run simulation" onAction={…} />` |

**2. Extend page-state registry + CI floor**

Add 6 routes to `src/lib/reality/page-state-registry.ts` with `verified: ["loading","empty","error","permission-denied"]`:
- `/files` → `FilesCenter.tsx` (data-list)
- `/approvals` → `ApprovalsCenter.tsx` (data-list)
- `/approval-chamber` → `ApprovalChamber.tsx` (data-list)
- `/notifications` → `NotificationCenter.tsx` (data-list)
- `/inbox` → `InboxCapture.tsx` (data-list)
- `/daily-pulse` → `DailyPulse.tsx` (dashboard)

Bump `PAGE_STATE_REGISTRY_FLOOR` from 36 → 42 so CI fails if anyone removes them.

**3. Add lint guard to prevent regressions**

New `eslint-plugin-local` rule `no-inline-empty-state` (or simpler: a `scripts/architecture/checks/check-no-inline-empty-states.ts` that greps for the inline pattern `flex flex-col items-center justify-center py-1\d.*text-center` outside `src/components/sita/EmptyState*.tsx` / `src/components/primitives/feedback/EmptyState.tsx` / `src/components/concierge/ConciergeEmptyState.tsx`). Wire into existing `scripts/architecture/checks/` runner.

### Files

| File | Change |
|---|---|
| `src/pages/ApprovalChamber.tsx` | Replace 2 inline empty states with `EmptyState` primitive |
| `src/pages/ApprovalsCenter.tsx` | Replace 1 inline empty state with `EmptyState` primitive |
| `src/pages/files/FilesOverview.tsx` | Add empty state for zero `classifiedFiles` |
| `src/pages/DailyPulse.tsx` | Replace inline "No pending approvals" with `EmptyState` |
| `src/pages/business/RevenueForecast.tsx` | Replace inline Monte Carlo placeholder with `EmptyState` |
| `src/lib/reality/page-state-registry.ts` | +6 routes, bump floor 36→42 |
| `scripts/architecture/checks/check-no-inline-empty-states.ts` | NEW — CI gate against inline empty-state patterns |

### Acceptance

- New live user with zero data sees an honest, branded empty state on every major surface: Dashboard (Daily Pulse), Files, Boardroom, Approvals (Center + Chamber), Notifications
- Zero raw inline `<div className="flex flex-col items-center ... text-center">…</div>` empty states remain in `src/pages/**`
- Page-state registry floor enforces empty-state coverage on 6 additional surfaces
- New CI gate fails any future PR that introduces an inline empty state
- 0 TS errors, 0 visual regressions in demo mode (existing copy preserved)
- C-018 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready

