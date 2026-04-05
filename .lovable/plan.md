

# SITA OS — Remaining Gaps & World-Class Hardening Plan

## Current State After Previous Rounds

GlobalErrorBoundary, query-config, real-data AdminDashboard/TeamManagement, DB indexes, dedup triggers, and atomic budget RPC are all in place. The Supabase linter shows zero issues.

## Remaining Gaps (Ordered by Impact)

### 1. Zero Input Validation on All 22 Edge Functions
No edge function uses Zod or any schema validation. Raw `req.json()` is trusted everywhere — personal-brain, chat-advisor, admin-users, os-command, etc. One malformed payload crashes the function.

**Fix**: Create `supabase/functions/_shared/validate.ts` with reusable CORS headers, auth helper, and Zod-like validation (lightweight, no npm — manual schema checks for Deno). Update all edge functions to validate input shape and reject oversized bodies (>100KB).

### 2. SystemManagement Still Uses Local Service Stubs
`SystemManagement.tsx` calls `SystemUpdateService.getDevices()` etc. — these are in-memory stubs returning hardcoded data. No admin guard either.

**Fix**: Wire to real `device_statuses` table + `os-command` edge function. Add `useRequireAdmin` guard.

### 3. AdminDashboard Missing Admin Guard
`AdminDashboard.tsx` has no `useRequireAdmin` check — any authenticated user can view it.

**Fix**: Add admin guard like UserManagement/AITokenDashboard already have.

### 4. 19 Mock Data Files Still Feeding Production Pages
`src/lib/mock-data/` has 19 files (customers, revenue, inbox, etc.) used by pages like InboxCapture, ImportExportCenter, ReservesSavings. Demo mode should use them; live mode should query Supabase.

**Fix**: Audit the top 5 most-used mock files and wire their consuming pages to use real DB queries when `isDemoMode === false`. Pages already have the pattern (ReservesSavings does it partially).

### 5. App.tsx Route Bloat (606 lines, 100+ lazy imports)
Single file with every route — hard to maintain, slow to parse.

**Fix**: Split into route group files: `AdminRoutes.tsx`, `WorkspaceRoutes.tsx`, `MobileRoutes.tsx`, `OwnerRoutes.tsx`. App.tsx becomes ~150 lines.

### 6. Edge Function CORS + Auth Boilerplate Duplicated 22x
Every edge function copy-pastes the same CORS headers and auth check pattern.

**Fix**: Shared `_shared/cors.ts` and `_shared/auth.ts` imported by all functions.

### 7. No Rate Limiting on AI Endpoints
`chat-advisor` and `personal-brain` have no throttle — a user could burn unlimited tokens.

**Fix**: Add simple in-DB rate check: count requests in last minute from `ai_token_usage`, reject if >20/min.

## Implementation Priority (What to Build Now)

| # | Task | Files |
|---|------|-------|
| 1 | Shared edge function utilities (CORS, auth, validation) | `_shared/cors.ts`, `_shared/auth.ts`, `_shared/validate.ts` — 3 new |
| 2 | Harden all edge functions with validation + size limits | 22 edge function edits (apply shared utils) |
| 3 | Add admin guard to AdminDashboard + SystemManagement | 2 page edits |
| 4 | Wire SystemManagement to real DB + os-command | 1 page rewrite |
| 5 | Split App.tsx into route groups | `AdminRoutes.tsx`, `WorkspaceRoutes.tsx`, `MobileRoutes.tsx`, `OwnerRoutes.tsx` — 4 new, 1 edit |
| 6 | Add rate limiting to chat-advisor + personal-brain | 2 edge function edits |
| 7 | Wire top mock-dependent pages to real DB (InboxCapture, ImportExportCenter) | 2 page edits |

**Total: 7 new files, ~28 edits. No new migration needed — all tables already exist.**

## Technical Notes

- Deno edge functions cannot use npm Zod — validation will be manual type-checking functions in `_shared/validate.ts`
- Rate limiting uses existing `ai_token_usage` table (count recent rows) — no new table needed
- Route splitting preserves all existing paths — zero breaking changes
- Mock data files are kept for demo mode — only live-mode paths change

