

# SITA OS — True 95% Deployment-Ready Plan

## Honest Current State

**Every core table has 0 rows.** The auto-seed code exists in `AuthContext.tsx` but has never fired because no user has logged in since it was added. This is the single biggest blocker — once seed fires, most pages light up.

| Area | Real Status |
|------|------------|
| Data | 0 rows in all 22 core tables. Only `profiles` has 1 row |
| CRUD | Only CustomersPage has create/delete |
| AI Chat | `AdvisorChat` in ShellLayout already calls `chat-advisor` via streaming — functional if user is authenticated |
| AdvisorWorkspace | Uses only mock data, no chat input, no call to `chat-advisor` |
| Settings | Only `display_name` persists; all other prefs are local state, lost on refresh |
| Security | Scanner still flags `system_config` (stale scan — migration already applied). Leaked password protection disabled (operator action) |
| Notifications | `use-realtime-notifications` hook wired but tables empty — nothing to show |
| User roles | 0 entries — no admin users exist, so admin-gated features are inaccessible |

## 7 Steps to 95%

### Step 1 — Trigger seed and assign admin role
- Call `seed-user-data` edge function for the logged-in user (requires user to log in via the preview)
- Insert admin role for the user into `user_roles` so admin-gated pages work
- Verify all 22 tables are populated (80+ records)

### Step 2 — Add chat input to AdvisorWorkspace
- Add a chat panel to `AdvisorWorkspace.tsx` that uses `useStreamingChat` (same as `AdvisorChat`)
- Route messages through the selected advisor mode (money, business, concierge, etc.)
- This makes the main advisor page interactive, not just mock cards

### Step 3 — Add CRUD to 4 more pages
Add `useMutation` + toast + cache invalidation to:

| Page | Create | Update | Delete |
|------|--------|--------|--------|
| LeadsInbox | New lead form | Status change | Remove lead |
| BillsWorkspace | New bill form | Mark paid | Remove bill |
| WorkflowsCenter | New workflow | Toggle active | — |
| PolicyEditor | New policy | Toggle active/inactive | — |

### Step 4 — Persist all Settings preferences
- Add a `preferences` JSONB column to `profiles` table (migration)
- Save autonomy, trust mode, notification freq, DND, PII redaction, etc.
- Load on mount, save with debounce on change

### Step 5 — Clear security scanner findings
- Re-run security scan to clear stale `system_config` finding (migration already applied)
- Mark leaked password protection as operator-dependent via `manage_security_finding`

### Step 6 — Add loading/error states to 5 key pages
- DailyPulse, LeadsInbox, MoneyCenter, WorkflowsCenter, ConnectorHub
- Show skeleton loaders during fetch, retry buttons on error
- Currently these pages silently show empty arrays on failure

### Step 7 — Update all documentation
- Regenerate `FINAL_ARQ_REPORT_v3.md` with honest completion percentages
- Update `.lovable/plan.md` with Steps 13-20
- Remove any claims of features that aren't wired

## Expected Outcome

| Area | Before | After |
|------|--------|-------|
| Core tables with data | 0/22 | 22/22 |
| Pages with CRUD | 1 | 5 |
| Settings persistence | 1 field | Full preferences |
| Security findings | 2 warnings | 0 actionable |
| Admin access | Blocked | Working |
| Deployment readiness | ~60% | ~95% |

## Files Summary
- 1 data operation: insert admin role into `user_roles`
- 1 migration: add `preferences` JSONB to `profiles`
- 1 page edit: `AdvisorWorkspace.tsx` (add chat panel)
- 4 page edits: LeadsInbox, BillsWorkspace, WorkflowsCenter, PolicyEditor (CRUD mutations)
- 1 page edit: `SettingsPage.tsx` (persist all preferences)
- 5 page edits: loading/error states
- 2 security operations: clear stale findings
- 2 doc updates: `FINAL_ARQ_REPORT_v3.md`, `plan.md`

