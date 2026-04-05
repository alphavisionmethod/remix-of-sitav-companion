

# SITA OS — Admin Backend, ISO Profiles, AI Token Governance, Personal Brain & OS-App Bridge

## Status: Previously Approved Plan Was Never Implemented

The plan approved in the previous conversation (12 new files, 7 edits, 1 migration) was never built. This plan implements all of it.

## What Gets Built

### Part 1: Database Migration (4 new tables)

```sql
ai_token_usage        -- every LLM call logged: user, advisor, model, tokens, cost
user_ai_budgets       -- per-user monthly/daily token & cost limits
advisor_performance   -- accuracy, satisfaction, corrections per advisor per period
system_config         -- key/value feature flags & defaults, admin-editable
```

All with RLS: users see own data, admins see everything via `has_role()`.

### Part 2: Edge Functions (5 new, 1 edit)

| Function | Purpose |
|----------|---------|
| `admin-users` | User CRUD: list, suspend, promote, impersonate (admin-only) |
| `device-telemetry` | Receives heartbeats from ISO devices, writes metrics |
| `personal-brain` | General-purpose AI companion — learn, build, create, think modes. Injects cross-advisor memory. Uses Lovable AI gateway |
| `os-status` | Receives CPU/RAM/disk/docker metrics from local agent |
| `os-command` | Admin-only remote commands: restart-service, update-now, run-backup |
| `chat-advisor` (edit) | Add pre-call budget check against `user_ai_budgets`, post-call insert into `ai_token_usage` |

### Part 3: Frontend Pages (4 new)

| Page | Description |
|------|-------------|
| `UserManagement.tsx` | Real user list with search, suspend, role assignment, impersonation |
| `AITokenDashboard.tsx` | Token spend analytics: by user, advisor, model. Budget editor. Anomaly alerts. Forecasted month-end cost |
| `PersonalBrain.tsx` | Full-screen chat with mode tabs (Think/Learn/Build/Create). Shows token spend badge. Cross-references all advisor knowledge |
| `AdminDashboard.tsx` (edit) | Wire real data from new tables instead of mocks |

### Part 4: Admin Guard Hook

`src/hooks/useRequireAdmin.ts` — checks `has_role(uid, 'admin')`, redirects non-admins.

### Part 5: ISO Dual-Profile Build

- `build-iso.sh` gains `--profile admin|user` flag
- New `scripts/release/iso/profiles/admin.json` and `user.json`
- `sita-first-boot.sh` reads profile, assigns admin role via Supabase Admin API on first user creation
- Admin ISO: Mission Control unlocked, all admin pages, advanced mode default
- User ISO: standard onboarding, personalization-first, no admin access

### Part 6: OS-App Bridge

- `scripts/release/iso/sita-metrics-agent.sh` — systemd timer (5min), reports CPU/RAM/disk/docker to `os-status` edge function
- Admin can trigger remote commands (restart, backup, update) from SystemManagement page via `os-command` edge function
- Personal Brain "Create" mode can submit feature requests that appear in Mission Control

### Part 7: Sidebar & Routing

- Add "Brain" to primary nav (alongside Home, Business, Finance, Concierge)
- Add `/admin/users`, `/admin/ai-tokens`, `/personal-brain` routes
- Wire update to `AppSidebar.tsx`

## File Summary

| # | File | Action |
|---|------|--------|
| 1 | Migration: 4 tables | New |
| 2 | `supabase/functions/admin-users/index.ts` | New |
| 3 | `supabase/functions/device-telemetry/index.ts` | New |
| 4 | `supabase/functions/personal-brain/index.ts` | New |
| 5 | `supabase/functions/os-status/index.ts` | New |
| 6 | `supabase/functions/os-command/index.ts` | New |
| 7 | `supabase/functions/chat-advisor/index.ts` | Edit — budget check + token logging |
| 8 | `src/hooks/useRequireAdmin.ts` | New |
| 9 | `src/pages/admin/UserManagement.tsx` | New |
| 10 | `src/pages/admin/AITokenDashboard.tsx` | New |
| 11 | `src/pages/admin/AdminDashboard.tsx` | Edit — real data |
| 12 | `src/pages/PersonalBrain.tsx` | New |
| 13 | `scripts/release/build-iso.sh` | Edit — `--profile` flag |
| 14 | `scripts/release/iso/profiles/admin.json` | New |
| 15 | `scripts/release/iso/profiles/user.json` | New |
| 16 | `scripts/release/iso/sita-first-boot.sh` | Edit — profile-based role provisioning |
| 17 | `scripts/release/iso/sita-metrics-agent.sh` | New |
| 18 | `src/components/sita/AppSidebar.tsx` | Edit — add Brain + admin links |
| 19 | `src/App.tsx` | Edit — add routes |

**Total: 12 new files, 7 edits, 1 migration.**

## Technical Notes

- Personal Brain uses Lovable AI gateway (`google/gemini-3-flash-preview`) via edge function — no new API keys needed
- Budget enforcement: `chat-advisor` checks `user_ai_budgets` before calling AI; if over limit, auto-downgrades to cheaper model or blocks
- Token logging: every LLM call inserts into `ai_token_usage` with user, advisor, model, token counts, cost
- Self-learning cost: tagged separately in `ai_token_usage` so admin can cap learning budget independently
- ISO profiles: same Docker image, different `/opt/sita/profile.json` — first-boot reads it to assign roles

