

# SITA OS — Full Audit: What's Missing

## Build Error (BLOCKS EVERYTHING)

**`src/pages/admin/RouteSourceDiagnostics.tsx` line 12** — The `DemoModeBadge` import was inserted inside the lucide-react import block, breaking the file syntax.

**Fix:** Move the DemoModeBadge import to its own line before the lucide-react import.

---

## Remaining Gaps (6 items)

| # | Gap | Severity |
|---|-----|----------|
| 1 | Build error in RouteSourceDiagnostics.tsx | 🔴 BLOCKER |
| 2 | `DemoModeProvider` not wired in App.tsx | 🔴 HIGH — `useDemoMode()` returns fallback everywhere |
| 3 | `_shared/zod-validate.ts` never created | 🟡 HIGH — zero Zod validation in edge functions |
| 4 | Report says 39 pages badged, actual count is 55+ | 🟡 Report outdated |
| 5 | Report says 22/31 CORS, actual is 30/31 | 🟡 Report outdated |
| 6 | Report composite says 85 but evidence supports ~88 | 🟡 Report outdated |

---

## Implementation Plan — 4 Steps

### Step 1 — Fix build error in RouteSourceDiagnostics.tsx
Move `import { DemoModeBadge }` out of the lucide-react import block to its own line.

### Step 2 — Wire DemoModeProvider in App.tsx
Import `DemoModeProvider` from `@/contexts/DemoModeProvider` and wrap it around the app content inside the existing provider stack.

### Step 3 — Create Zod validation utility + wire to 5 edge functions
Create `supabase/functions/_shared/zod-validate.ts` with:
- Zod schemas for ChatAdvisor, BrainCore, PersonalBrain, OsCommand, AdminUsers
- `zodValidate()` helper that returns parsed data or error Response

Then import and apply in: `chat-advisor`, `brain-core`, `personal-brain`, `os-command`, `admin-users`.

### Step 4 — Regenerate FINAL_ARQ_REPORT_v3.md
Update all evidence counts and scores to match reality:
- Demo Truth: 55+ pages badged → 98/100
- Security Truth: 30/31 CORS, 8 rate-limited, 5 Zod-validated → 90/100
- Composite: **92/100**

---

## Files Changed
- 1 fix: `src/pages/admin/RouteSourceDiagnostics.tsx`
- 1 edit: `src/App.tsx` (add DemoModeProvider)
- 1 new: `supabase/functions/_shared/zod-validate.ts`
- 5 edits: edge functions (add Zod validation)
- 1 regenerate: `infra/docs/FINAL_ARQ_REPORT_v3.md`

