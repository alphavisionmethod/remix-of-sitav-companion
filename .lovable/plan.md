

# SITA OS 2.7–2.17: Audit & Fix Plan

## Current Status

All 11 workspaces exist as substantial, shell-native pages with proper design grammar. Here's the line count and quality assessment:

| # | Workspace | File | Lines | Quality | Issues |
|---|-----------|------|-------|---------|--------|
| 2.7 | Personal Life | `PersonalLifeWorkspace.tsx` | 392 | Excellent | No route in sidebar (uses `/personal-life`) |
| 2.8 | Communications | `CommunicationsPage.tsx` | 334 | Excellent | Already full: overview, inbox, follow-ups, drafts, threads |
| 2.9 | Tasks/Workflows | `TasksWorkflowsCenter.tsx` | 479 | Excellent | **Not routed in App.tsx** — `/tasks` sidebar link is broken |
| 2.10 | Calendar | `CalendarWorkspace.tsx` | 465 | Complete | Full CRUD, 4 views, conflict detection |
| 2.11 | Notes | `NotesWorkspace.tsx` | 315 | Good | Supabase-connected, templates, linked entities |
| 2.12 | Files | `FilesCenter.tsx` + sub-pages | 600+ | Complete | Full workspace with 8 sub-routes |
| 2.13 | Media | `MediaWorkspace.tsx` | 259 | Good | Supabase storage, drag-drop, gallery, tagging |
| 2.14 | Document Editor | `DocumentEditor.tsx` | 294 | Good | Toolbar, templates, versions, autosave, approval mode |
| 2.15 | PDF Viewer | `PDFViewerWorkspace.tsx` | 258 | Good | Annotations, zoom, thumbnails |
| 2.16 | Spreadsheet | `SpreadsheetWorkspace.tsx` | 192 | Good | Inline edit, sort, filter, bulk select |
| 2.17 | Reporting | `ReportingWorkspace.tsx` | 357 | Excellent | Recharts, saved reports, trust analytics |

## Issues Found

### 1. Critical: `/tasks` route missing from App.tsx
The sidebar links to `/tasks` but `TasksWorkflowsCenter` is never imported or routed in `App.tsx`. Clicking "Tasks" in the sidebar leads to a 404.

**Fix:** Add lazy import and route for `TasksWorkflowsCenter` at `/tasks`.

### 2. No other gaps
- All other workspaces are routed and reachable
- Sidebar has all workspace links (Tasks, Calendar, Notes, Docs, Editor, Sheets, Slides, Media, Reporting)
- `FileTemplate` icon is fully replaced — zero occurrences in codebase
- `PlusCircle` is correctly imported in `ReportingWorkspace.tsx`
- All pages use `useDataMode()`, `DemoModeBadge`, `SitaPageHeader`, and shell grammar components
- Cross-domain links exist in Personal Life, Communications, Tasks, and Reporting
- Supabase queries wired in Communications, Calendar, Notes, Media, Reporting, and Tasks

## Implementation

One change needed:

**In `App.tsx`:**
1. Add lazy import: `const TasksWorkflowsCenter = lazy(() => import("./pages/TasksWorkflowsCenter"));`
2. Add route: `<Route path="/tasks" element={<TasksWorkflowsCenter />} />`

That's it. Everything else is implemented, wired, and deduplicated.

