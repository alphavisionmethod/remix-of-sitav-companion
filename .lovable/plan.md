

# SITA OS — Master Document Refresh Plan

## What Exists Now (to be DELETED)

17 files in `/mnt/documents/`, all outdated with stale metrics (e.g., "440 tables" when we now have 480, "611 pages" when we now have 629, missing isDemoMode wiring status):

- `ARCHITECTURE_STATUS_SITA_OS.md` / `_v5.md`
- `FINAL_ARQ_REPORT_SITA_OS_v3.md` / `_v4.md` / `_v5.md`
- `SITA_OS_ARCHITECTURE_AUDIT.xlsx` / `_v2.xlsx`
- `SITA_OS_Architecture_Audit_v3.docx`
- `SITA_OS_Gap_Analysis_100.pdf`
- `SITA_OS_MASTER_AUDIT_REPORT_v6.md` / `_v7.md`
- `SITA_OS_Master_Audit_v2.pdf` / `Master_Report.pdf` / `Master_Report_v2.pdf`
- `SITA_OS_Screen_Inventory.mmd` / `_Spec.md`
- `SITA_Reality_Conversion_Architecture.mmd`

## Updated Metrics (from live codebase scan)

| Metric | Old (v7) | Current |
|--------|----------|---------|
| Pages | 611 | **629** |
| Routes | 674 | **704** |
| Tables | 440 | **480** |
| Views | — | **26** |
| Edge Functions | 46 | **50** |
| Migrations | ~102 | **110** |
| Components | ~332 | **344** |
| Hooks | ~40 | **57** |
| Data Services | — | **16** |
| Test Files | — | **169** |
| E2E Specs | 36 | **41** |
| isDemoMode-wired Pages | 0 | **412** (66%) |
| Admin Pages (root) | — | **215** |
| Admin Pages (subdirs) | — | **82** |

## New Documents to Generate

### 1. `SITA_OS_Master_Audit_v8.md` — Definitive Status Report
Complete rewrite of the master audit with current numbers. Sections:
- Executive Summary with updated Truth Score
- Architecture metrics (480 tables, 704 routes, 629 pages, 50 edge functions, 26 views)
- Data wiring status (412/629 pages wired to isDemoMode)
- Module-by-module breakdown (Revenue Office, Digital Presence, Concierge, Apps, Money, Business, Admin)
- Hook coverage (57 hooks, 16 data services)
- Test coverage (169 unit tests, 41 E2E specs)
- Security posture (RLS policies, audit logging)
- Remaining gaps and next actions

### 2. `SITA_OS_Architecture_Audit_v4.xlsx` — Spreadsheet Audit
Multi-sheet workbook:
- **Dashboard** — Key metrics, scores, sparklines
- **Pages Inventory** — All 629 pages with module, wiring status, hook used
- **Tables** — All 480 tables by domain
- **Edge Functions** — All 50 functions with purpose
- **Hooks & Services** — All 57 hooks + 16 data services
- **Test Coverage** — 169 test files mapped to source
- **Wiring Status** — 412 wired vs 217 remaining, by module

### 3. `SITA_OS_Module_Status.md` — Module-by-Module Completion
Detailed per-module status:
- Revenue Office (40 pages, hooks, wiring %)
- Digital Presence (19 pages)
- Concierge (16 pages)
- Money (13 pages)
- Business (15 pages)
- Apps (6 pages)
- Admin (297 pages: 215 root + 82 subdirs across 10 categories)
- Atlas (11 pages)
- Mobile (9 pages)
- Files (8 pages)
- Owner (8 pages)
- Mission (8 pages)
- App Platform (16 pages)
- Workspace (5 pages)
- Store (6 pages)
- Auth (4 pages)
- Settings (2 pages)
- Boardroom (2 pages)

### 4. `SITA_OS_Screen_Inventory_v2.md` — Updated Screen Inventory
Full inventory of all 629 screens with current component status.

### 5. `SITA_OS_Data_Wiring_Report.md` — Live Data Integration Status
Detailed report on the isDemoMode wiring pass:
- Which pages use which hooks
- Demo-only vs fully-wired breakdown
- Hook → table mapping
- Remaining static pages

## Technical Approach

1. Delete all 17 files from `/mnt/documents/`
2. Run Python scripts that scan the actual codebase to generate accurate data
3. Generate the MD reports with real numbers
4. Generate the XLSX workbook with openpyxl (formatted, multi-sheet)
5. QA all outputs by converting to images and inspecting

## Files Changed

| Action | File |
|--------|------|
| Delete | All 17 existing files in `/mnt/documents/` |
| Create | `SITA_OS_Master_Audit_v8.md` |
| Create | `SITA_OS_Architecture_Audit_v4.xlsx` |
| Create | `SITA_OS_Module_Status.md` |
| Create | `SITA_OS_Screen_Inventory_v2.md` |
| Create | `SITA_OS_Data_Wiring_Report.md` |

