

# Fix Critical Architecture Violations — Mock Data Elimination & EventBus Adapter

## Summary

Three critical violations exist:
1. **13 pages have inline `const MOCK_*` arrays** — hardcoded data directly in page files
2. **11 pages import from `useDomainMockData`** — pulling mock data/types through a legacy barrel
3. **EventBus → DB** — already connected via `event-bus-persistence.ts` (this is actually resolved; the report is stale)

The fix: extract all inline mock arrays into domain-specific demo-data files, create mode-aware hooks for each domain that doesn't have one yet, and eliminate all `useDomainMockData` imports from pages.

---

## Issue 1: EventBus → DB (Already Connected)

The EventBus **already imports** the persistence adapter (`event-bus-persistence.ts`) which writes to `os_event_log` via Supabase. No code change needed — this is a stale finding. The adapter exists at `src/lib/persistence/event-bus-persistence.ts` and is imported on line 9 of `event-bus.ts`.

**Action**: No code change. Mark as resolved.

---

## Issue 2: 13 Pages with Inline `MOCK_*` Arrays

These pages define hardcoded arrays directly in the component file:

| Page | Mock Constants |
|---|---|
| `CalendarWorkspace.tsx` | `MOCK_EVENTS` |
| `NotesWorkspace.tsx` | `MOCK_NOTES` |
| `MediaWorkspace.tsx` | `MOCK_MEDIA` |
| `CommunicationsPage.tsx` | `MOCK_COMMUNICATIONS` |
| `OutcomeEnginePage.tsx` | `MOCK_OUTCOMES`, `MOCK_INTERVENTIONS`, `MOCK_SPILLOVERS` |
| `ApprovalChamber.tsx` | `MOCK_APPROVALS` |
| `ImportExportCenter.tsx` | `MOCK_UPLOADS`, `MOCK_EXPORTS` |
| `AppReceiptsPage.tsx` | `MOCK_RECEIPTS` |
| `InvestmentOffice.tsx` | `MOCK_REGIME` + imported mocks |
| `RevenueAutopilot.tsx` | Imported mocks used at module scope |
| `admin/IncidentCommandCenter.tsx` | `MOCK_INCIDENTS` |
| `admin/AdminDurabilityBoard.tsx` | `MOCK_MUTATIONS` |
| `admin/MockReplacementProgram.tsx` | `MOCK_TYPES` (enum-like — acceptable) |

**Fix approach for each page:**

1. **Extract** the inline mock array into a new file under `src/lib/demo-data/<domain>.ts`
2. **Create a mode-aware data service** at `src/lib/data-services/<domain>-data-service.ts` (if not already existing) that returns demo data in demo mode, empty arrays in real mode
3. **Create a React Query hook** in `src/hooks/use-domain-data.ts` for the new data service
4. **Update the page** to use the hook instead of inline arrays

New demo-data files to create:
- `src/lib/demo-data/calendar-events.ts`
- `src/lib/demo-data/notes.ts`
- `src/lib/demo-data/media.ts`
- `src/lib/demo-data/communications.ts`
- `src/lib/demo-data/outcome-engine.ts`
- `src/lib/demo-data/approvals.ts`
- `src/lib/demo-data/import-export.ts`
- `src/lib/demo-data/app-receipts.ts`
- `src/lib/demo-data/incidents.ts`
- `src/lib/demo-data/durability.ts`

New data services + hooks to create (~10 services, ~10 hooks added to `use-domain-data.ts`).

---

## Issue 3: 11 Pages Import from `useDomainMockData`

These pages import mock constants or types from the legacy `useDomainMockData.ts` barrel:

| Page | What it imports |
|---|---|
| `OwnerCenter.tsx` | `buildMockSimResult` |
| `RevenueAutopilot.tsx` | `MOCK_RECOVERED_VALUES`, `MOCK_RAW_OPPORTUNITIES`, `MOCK_LEAKAGE_INPUT