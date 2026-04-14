

# CRM Audit & Gap Implementation Plan

## What's Already Built (25 parts of 25 confirmed)

All 25 spec parts have corresponding implementations:

| Part | Status | Quality |
|------|--------|---------|
| 1-2. CRM Product + Philosophy | Done | CRM Home serves as relationship operating room |
| 3. Core Structure | Done | 14 sub-pages in BusinessCenter nav |
| 4. CRM Home | Done | 418-line dashboard with KPIs, advisor insights, what-matters-now |
| 5. Contacts | Done | Table/card views, search, filters, split-pane detail |
| 6. Companies | Done | Card/table views, create dialog, detail panel |
| 7. Pipeline | Done | Kanban + list, deal detail panel, stage navigation |
| 8. Health | Done | Composite scoring, health buckets, advisor recs |
| 9. Timeline | Done | Chronological stream with filters, log activity |
| 10. Tasks | Done | Stats, overdue grouping, priority flags |
| 11. Notes | Done | Pin, search, type categorization |
| 12. Manual Entry | Done | Quick add + full create via CRMContactForm |
| 13. CSV/Excel Import | Done | 7-step wizard (664 lines) with papaparse |
| 14. CRM Connections | Done | Integration hub with 20+ platforms |
| 15. Duplicate Detection | Done | Email + name matching, merge with field-level selection |
| 16. Custom Fields | Done | 5 types, per-entity tabs, create/delete |
| 17. Segments | Done | Smart views + custom filter builder |
| 18. Automations | Done | 8 workflow templates, trust gates, simulation |
| 19. Advisor Board | Done | Data-driven insights with priority categorization |
| 20. Boardroom Escalation | Partial | Referenced in automations only, no dedicated UI |
| 21-22. Visual + Empty States | Partial | Premium dark styling exists but empty states are basic |
| 23. Command/Search | Done | ⌘K palette with fuzzy search |
| 24. Backend/Data Model | Done | 12 tables + 30+ hooks + full CRUD |
| 25. Final Directive | N/A | Integration goal |

## Gaps to Fix

### Gap 1: Boardroom Escalation (Part 20)
No dedicated "Escalate to Boardroom" action from contact/company/deal detail. The spec requires attaching evidence, advisor summary, communications, and invoice/quote context when escalating.

**Fix:** Add `EscalateToBoardroom` dialog component reusable from ContactDetail, CompanyDetail, and DealDetail panels. Wire it to create a `boardroom_items` record with evidence.

### Gap 2: Quotes/Proposals and Invoices/Collections Linkage (Part 3, 5, 6)
Contact and Company detail panels don't show linked quotes/proposals or invoices. The spec explicitly requires these linkages.

**Fix:** Add "Proposals" and "Invoices" tabs to CRMContactDetail and CRMCompanyDetail. Since proposals/invoices are in separate Business OS pages, show cross-links and quick navigation.

### Gap 3: Support Linkage (Part 3, 5, 6)
No support ticket association in contact/company details.

**Fix:** Add "Support" tab referencing linked support items (or empty state with "No support issues").

### Gap 4: Company-Contact Linking via crm_contact_company (Part 6)
CRMCompanyDetail finds contacts via tag matching (`c.tags?.includes(company.name)`) instead of using the `crm_contact_company` junction table.

**Fix:** Use `useCRMContactCompanyLinks` to properly query linked contacts. Add link/unlink UI.

### Gap 5: Premium Empty States (Part 22)
Current empty states are minimal. The spec requires beautiful, honest, actionable first-use states for each CRM section.

**Fix:** Create a `CRMEmptyState` component with per-section illustrations and CTAs (e.g., "No contacts yet — Import or add your first contact").

### Gap 6: Excel (.xlsx) Import Support (Part 13)
Import wizard only supports CSV (uses papaparse). The spec explicitly requires Excel support.

**Fix:** Add xlsx parsing via the `xlsx` library alongside papaparse for .xlsx files.

### Gap 7: Custom Fields Not Persisted to Database
CRMCustomFields uses local state (`useState`) with hardcoded defaults. Not saved to DB.

**Fix:** Store custom field definitions in a jsonb column or a dedicated approach, persisting via the CRM data service.

### Gap 8: Automations Not Persisted
CRM Automations are hardcoded workflow templates with local `useState` for status toggling. Not saved to DB.

**Fix:** Wire automation status changes to a DB-backed store (could use `crm_segments` or a new lightweight structure).

## Implementation Plan

### Batch 1: Critical Wiring Fixes
1. **Fix Company-Contact linking** — Replace tag-based matching with `crm_contact_company` junction queries in CRMCompanyDetail
2. **Add Boardroom Escalation dialog** — Create `CRMEscalateToBoardroom.tsx`, wire to `boardroom_items` table, add trigger buttons in ContactDetail, CompanyDetail, DealDetail
3. **Add Excel import support** — Install `xlsx` package, detect file type in import wizard, parse .xlsx alongside CSV

### Batch 2: Cross-Domain Linkage
4. **Add Proposals/Invoices tabs** to ContactDetail and CompanyDetail — Show linked items from business data or empty states with navigation CTAs
5. **Add Support tab** to ContactDetail and CompanyDetail

### Batch 3: Persistence & Polish
6. **Persist custom fields** — Save field definitions via CRM data service
7. **Persist automation status** — Save workflow active/paused state to DB
8. **Premium empty states** — Create `CRMEmptyState` component with per-section content, illustrations, and actionable CTAs for all 14 CRM sub-pages

### Files to Create
- `src/components/business/crm/CRMEscalateToBoardroom.tsx`
- `src/components/business/crm/CRMEmptyState.tsx`

### Files to Modify
- `src/components/business/crm/CRMCompanyDetail.tsx` — Junction table linking + Proposals/Invoices/Support tabs + escalation
- `src/components/business/crm/CRMContactDetail.tsx` — Proposals/Invoices/Support tabs + escalation
- `src/components/business/crm/CRMDealDetail.tsx` — Escalation button
- `src/components/business/CRMImportWizard.tsx` — Excel support
- `src/components/business/crm/CRMCustomFields.tsx` — DB persistence
- `src/pages/business/CRMAutomations.tsx` — DB persistence
- Multiple CRM pages — Premium empty states

### No database changes required
All needed tables already exist. `boardroom_items` is ready for escalation records.

