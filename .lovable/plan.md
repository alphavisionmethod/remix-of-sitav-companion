

# SITA OS — Live Data Wiring for All User-Facing Pages

## Problem
36 pages hardcode MOCK/DEMO data directly instead of querying Supabase. The tables already exist (documents, communications, calendar_events, approval_queue, etc.) but pages bypass them.

## Pages Already Working (have real Supabase queries)
CommunicationsPage, CalendarWorkspace, AutomationCenter, MediaWorkspace, ApprovalChamber (partial), IncidentCommandCenter, AppReceiptsPage, FilesProcessing — these already have `useQuery` + `isDemoMode` gating.

## Pages Needing Live Data Wiring

### Tier 1: Core User Pages (HIGH priority — 7 pages)

| Page | Current State | Supabase Table | Fix |
|------|--------------|----------------|-----|
| **NotesWorkspace** | 100% DEMO_NOTES hardcoded | `documents` (type='note') | Add useQuery for documents, isDemoMode gate |
| **OutcomeEnginePage** | 100% DEMO hardcoded | `outcome_verifications` + `outcome_economics_records` | Add useQuery, isDemoMode gate |
| **ImportExportCenter** | 100% MOCK hardcoded | `documents` + `sovereign_exports` | Add useQuery for uploads/exports |
| **RevenueCallingPage** | MOCK_CONTACTS/LOGS/SCRIPTS hardcoded | `customers` + `communication_log` | Wire to customers table + comm log |
| **InvestmentOffice** | 22 MOCK refs, module-level mutables | `capital_purpose_buckets` + `investment_watchlists` + `investment_strategy_records` | Replace module-level MOCK with hook data |
| **RevenueAutopilot** | 15 MOCK refs | `revenue_leak_items` + `deals` | Wire to revenue tables |
| **CollectionsCommandCenter** | Uses hook but type imports from mock | Already wired via `useCollectionsAccounts` | Clean up mock type imports |

### Tier 2: Workspace Pages (MEDIUM — 3 pages)
These already have data services (`workspace-data-service.ts`) querying Supabase but the hooks pass `mode="real"` as default — they work. Only need to verify the mode gate is correct in the component.

| Page | Status |
|------|--------|
| **DocsWorkspace** | Already wired via `useDocs()` → `fetchDocs()` → Supabase |
| **SheetsWorkspace** | Already wired via `useSheets()` → `fetchSheets()` → Supabase |
| **SlidesWorkspace** | Already wired via `useDecks()` → `fetchDecks()` → Supabase |

### Tier 3: Admin/System Pages (LOW — 13 pages)
These are admin-only config/diagnostic pages. They use demo data for display purposes. They should still get isDemoMode gates but are lower priority.

| Pages | Fix |
|-------|-----|
| HRS01-05, NRC01-04, NSS01/03, AdminDurabilityBoard, RealityClassificationMatrix, MockReplacementProgram | Add isDemoMode gate + empty state for live mode |

### Tier 4: Store Page (LOW — 1 page)
| Page | Fix |
|------|-----|
| **PackStorePage** | Pack catalog is config-driven, not user data. Add `installed_packs` table query for install states. |

---

## Implementation Pattern (applied to each page)

```typescript
// Before (broken):
const data = MOCK_CONTACTS;

// After (live):
const { isDemoMode } = useDataMode();
const { user } = useAuth();
const { data: realData } = useQuery({
  queryKey: ["contacts", user?.id],
  enabled: !!user && !isDemoMode,
  queryFn: async () => {
    const { data } = await supabase.from("customers")
      .select("*").eq("user_id", user!.id);
    return data?.length ? data.map(mapToContact) : null;
  },
});
const contacts = isDemoMode ? DEMO_CONTACTS : (realData ?? []);
```

For pages with no matching table, we create the table via migration.

---

## Database Migrations Needed

### New tables required:
1. **`notes`** — user notes (title, content, folder, tags, pinned, starred)
2. **`media_items`** — user media files (name, type, size, url, folder, tags)
3. **`outcome_tracking`** — outcome goals with progress, interventions, spillovers
4. **`import_export_jobs`** — upload/export history with status tracking
5. **`calling_contacts`** — revenue calling contacts (name, company, value, priority, stage)
6. **`call_logs`** — call history (contact_id, duration, status, notes, revenue)
7. **`pack_installs`** — installed packs per user (pack_id, status, installed_at)

### Existing tables to use:
- `documents` — DocsWorkspace, SheetsWorkspace, SlidesWorkspace (already working)
- `customers` — can serve as calling contacts base
- `calendar_events` — CalendarWorkspace (already working)
- `communications` — CommunicationsPage (already working)
- `approval_queue` — ApprovalChamber (already partially working)
- `revenue_leak_items` — RevenueAutopilot
- `capital_purpose_buckets` — InvestmentOffice
- `incidents` — IncidentCommandCenter (already working)

---

## Implementation Plan

| # | Task | Files | Priority |
|---|------|-------|----------|
| 1 | Create 7 new tables (notes, media_items, outcome_tracking, import_export_jobs, calling_contacts, call_logs, pack_installs) | Migration SQL | HIGH |
| 2 | Wire NotesWorkspace to `notes` table | NotesWorkspace.tsx | HIGH |
| 3 | Wire OutcomeEnginePage to `outcome_tracking` table | OutcomeEnginePage.tsx | HIGH |
| 4 | Wire ImportExportCenter to `import_export_jobs` table | ImportExportCenter.tsx | HIGH |
| 5 | Wire RevenueCallingPage to `calling_contacts` + `call_logs` | RevenueCallingPage.tsx | HIGH |
| 6 | Wire InvestmentOffice to use hook data instead of module-level MOCK | InvestmentOffice.tsx | HIGH |
| 7 | Wire RevenueAutopilot to `revenue_leak_items` + `deals` | RevenueAutopilot.tsx | HIGH |
| 8 | Add isDemoMode gates to 13 admin pages | admin/*.tsx | MEDIUM |
| 9 | Wire PackStorePage `pack_installs` for install state | PackStorePage.tsx | LOW |

**Total: ~25 files changed, 1 migration, all pages live-data-ready.**

