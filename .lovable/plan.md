

# SITA OS — Sections 2.7–2.17: Audit Results & Implementation Plan

## Verdict: 70% Implemented — Significant Gaps Found

All 11 workspaces exist as routed pages, but several are skeletal or missing critical integration. The sidebar also omits key workspace links.

---

## Gap Summary

| Section | File | Lines | Status | Issues |
|---|---|---|---|---|
| 2.7 Personal Life | `PersonalLifeWorkspace.tsx` | 264 | **Partial** | Mock data only, no Supabase, no demo mode toggle |
| 2.8 Communications | `CommunicationsPage.tsx` | 139 | **Partial** | Missing follow-up queue, draft center, reply-gap detection, priority inbox |
| 2.9 Tasks/Workflows | `WorkflowsCenter.tsx` | 230 | **Partial** | No dedicated task surface — no kanban board, dependency map, assigned view, personal tasks |
| 2.10 Calendar | `CalendarWorkspace.tsx` | 465 | **Complete** | Full CRUD, 4 views, domain colors, conflict detection |
| 2.11 Notes | `NotesWorkspace.tsx` | 194 | **Good** | Supabase-connected, folders, tags, search. Could add linked entities, templates |
| 2.12 Files | `FilesCenter.tsx` + 8 sub-pages | ~600+ | **Complete** | Full workspace with overview, all, processing, review, search, sensitive, settings |
| 2.13 Media | `MediaWorkspace.tsx` | 133 | **Partial** | Demo data only, no Supabase upload, no OCR, no annotation |
| 2.14 Document Editor | `DocumentEditor.tsx` | 110 | **Skeletal** | Plain textarea, no rich text, no templates, no AI drafting, no version history |
| 2.15 PDF Viewer | `PDFViewerWorkspace.tsx` | 258 | **Good** | Annotations, zoom, thumbnails, page nav, approval marks |
| 2.16 Spreadsheet | `SpreadsheetWorkspace.tsx` | 192 | **Good** | Inline editing, sort, filter, bulk select, row detail |
| 2.17 Reporting | `ReportingWorkspace.tsx` | 150 | **Partial** | Demo charts only, no Supabase queries, no saved reports, no export |

### Sidebar Navigation Gap
Calendar, Notes, Media, Reporting, Personal Life, Editor are **missing from the sidebar**. Users can only reach them via command surface or direct URL.

---

## Implementation Plan

### 1. Add Missing Sidebar Links
Add Calendar, Notes, Media, Reporting to the Workspace nav group in `AppSidebar.tsx`. Add Personal Life to primary nav.

### 2. Create Unified Task + Workflow Workspace
Create `TasksWorkflowsCenter.tsx` — a combined surface with:
- Task overview (today, overdue, waiting-on, recurring)
- Board/kanban view with drag-between-states
- Queue view for operations
- Workflow detail with state/approval/proof
- Dependency visualization
- Add route `/tasks` pointing to this center
- Wire existing WorkflowsCenter as a sub-view

### 3. Upgrade Personal Life Workspace
- Add `useDataMode()` demo/live toggle
- Create Supabase hooks for routines, goals, habits (or use existing task infrastructure)
- Add slipping-task detection logic
- Add weekly reset assistant UI
- Wire to calendar and household cross-links

### 4. Upgrade Communications Page
- Expand from 139 lines to full workspace (~400+ lines)
- Add priority inbox, follow-up queue, draft center
- Add reply-gap and stale-conversation detection
- Add thread summarization and action extraction
- Add communication timeline tied to CRM contacts
- Wire Supabase queries for messages

### 5. Upgrade Document Editor
- Replace textarea with a proper rich text editor (TipTap or similar contenteditable)
- Add toolbar with working formatting
- Add template system with domain templates
- Add version history UI
- Add save/autosave to Supabase
- Add AI drafting placeholder
- Add approval-ready draft mode

### 6. Upgrade Media Workspace
- Add Supabase storage upload integration
- Add drag-drop and bulk upload
- Add image preview modal
- Add tag editing
- Add entity linking (attach to notes, tasks, receipts)
- Add OCR placeholder surface

### 7. Upgrade Reporting Workspace
- Add Supabase queries for live data (leads count, revenue, tasks completed)
- Add saved reports
- Add export functionality
- Add boardroom tie-in
- Add "what changed" overlay
- Add date range filtering with live queries

### 8. Enhance Notes Workspace
- Add linked entity panel (show related tasks, contacts, workflows)
- Add note templates
- Add meeting-note auto-structure
- Add smart task extraction from notes

---

## Technical Approach

- All new/upgraded components use `SitaCard`, `SitaTabs`, `DemoModeBadge`, `SitaPageHeader` for shell grammar consistency
- All surfaces use `useDataMode()` with demo fallback data
- Supabase integration via `fromTable()` helper and `useQuery`
- New routes added to `App.tsx` within the ShellLayout tier
- Sidebar updated in `AppSidebar.tsx` workspaceNav array
- Estimated: ~8 files modified, ~2 files created, ~2000 lines of code

