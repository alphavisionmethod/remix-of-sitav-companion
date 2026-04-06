

# SITA OS — Road to 80% Project Completion

## Current Reality Assessment

**What's built:**
- 545 page routes, all rendering with DemoModeBadge
- 200+ DB tables with RLS on all, 33 edge functions deployed
- Auth flow (email + Google OAuth + demo mode)
- 160+ service directories (mostly scaffolds/stubs)
- Domain engines (business-os, finance-os, concierge-os) with analysis logic
- Shell layout with responsive mobile/tablet/desktop/watch support
- CI pipeline, launch gate, accessibility pass

**What's broken or empty:**
- **All 22 core tables are empty** — 0 leads, 0 customers, 0 tasks, 0 invoices, 0 bills, 0 events, 0 workflows. The seed function exists but is never auto-called on signup/login.
- **Demo mode shows hardcoded mock data** but real mode shows empty states everywhere.
- **No auto-seed on first login** — user must manually POST to seed-user-data.
- **~120 service directories** are stubs with types only, no working logic.
- **Connector Hub** has no real OAuth flows — just schema.
- **Personal Brain** calls `personal-brain` edge function but it returns canned responses.
- **Security finding**: `system_config` table has public SELECT policy (all authenticated users can read).
- **Leaked password protection** still disabled.

---

## 10-Step Plan to 80% Completion

### Step 1 — Auto-seed data on first login (Critical)
- In `AuthContext.tsx`, after successful auth (both email and Google), check if user has data and call `seed-user-data` edge function automatically.
- Remove the manual POST requirement. This makes every new user land on a populated dashboard instantly.
- Also trigger from `OSSetupExperience.tsx` completion (already partially wired).

### Step 2 — Wire real Supabase queries in 8 core pages
These pages already have `useQuery` hooks but show empty when not in demo mode. Ensure they properly fall through to demo data when DB is empty:

| Page | Table | Fix |
|------|-------|-----|
| DailyPulse | leads, invoices, bills, tasks | Already uses hooks — ensure seed data populates |
| LeadsInbox | leads | Already wired — needs seed data |
| CustomersPage | customers | Already wired — needs seed data |
| MoneyCenter/BillsWorkspace | bills | Already wired |
| WorkflowsCenter | workflows, workflow_runs | Already wired |
| ConnectorHub | connector_configs | Already wired |
| PolicyEditor | policies | Already wired |
| ActivityStream | audit_logs, events | Already wired |

**Primary fix**: Step 1 (auto-seed) solves most empty states. Additionally, ensure `useDataMode` gracefully shows demo data when real data is empty.

### Step 3 — Fix `system_config` RLS policy (Security)
- Migration: Replace the open `SELECT` policy on `system_config` with admin-only access using `has_role(auth.uid(), 'admin')`.

### Step 4 — Enable leaked password protection
- Document as operator action (Supabase Dashboard setting).
- Update security finding to mark as resolved or as operator-dependent.

### Step 5 — Make Personal Brain functional
- Update `personal-brain` edge function to use a real AI provider (OpenAI/Anthropic) if API key is set, falling back to canned responses.
- Check for `OPENAI_API_KEY` secret availability.
- Wire proper conversation history persistence to `user_memory` table.

### Step 6 — Make Advisor Chat functional
- Update `chat-advisor` edge function similarly — real AI responses when API key available.
- Persist advisor conversation history to `advisor_requests`/`advisor_responses` tables.

### Step 7 — Wire CRUD operations on 5 core pages
Add create/update/delete mutations (not just read) to:

| Page | Operations |
|------|-----------|
| LeadsInbox | Create lead, update status, delete (already has some) |
| CustomersPage | Create customer, edit details |
| HouseholdTasks | Create task, mark complete, delete |
| BillsWorkspace | Mark bill paid, create bill |
| PolicyEditor | Create policy, toggle active/inactive |

### Step 8 — Wire notifications and realtime
- Connect `notifications_queue` table to `NotificationCenter.tsx` with real Supabase queries.
- Enable Supabase Realtime subscription on `notifications_queue` for live push.
- Ensure `useRealtime` and `use-realtime-notifications` hooks actually subscribe to channels.

### Step 9 — Profile & Settings persistence
- Wire `SettingsPage.tsx` to read/write `profiles` table (display name, avatar, preferences).
- Persist theme/notification/privacy preferences to `user_preferences` or profile metadata.
- Wire profile picture upload to `documents` storage bucket.

### Step 10 — Update all documentation files
- Regenerate `FINAL_ARQ_REPORT_v3.md` with accurate completion percentages.
- Update `.lovable/plan.md` with these steps.
- Update seed-user-data to include workflows, workflow_runs, notifications, and connector_configs.

---

## Expected Outcome

| Area | Before | After |
|------|--------|-------|
| Data on first login | Empty (0 rows) | 80+ records across 22 tables |
| Core pages functional | ~20% (read-only, empty) | ~80% (seeded + CRUD) |
| AI features | Canned responses | Real AI if key set, canned fallback |
| Security findings | 2 warnings | 0 warnings |
| Notifications | Static/empty | Real-time from DB |
| Settings | Non-persistent | Persisted to profiles |

## Files Summary
- 1 context edit: `AuthContext.tsx` (auto-seed)
- 1 migration: `system_config` RLS fix
- 2 edge function edits: `personal-brain`, `chat-advisor`
- 5 page edits: CRUD mutations on core pages
- 2 hook edits: realtime notifications wiring
- 1 page edit: `SettingsPage.tsx` persistence
- 1 edge function edit: `seed-user-data` (add workflows, notifications)
- 2 doc updates: `FINAL_ARQ_REPORT_v3.md`, `plan.md`

