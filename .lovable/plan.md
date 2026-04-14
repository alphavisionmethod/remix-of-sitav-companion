

# Full Advanced CRM — Implementation Plan

## Current State

- **UI exists** for Customers, Leads, Opportunities, Quotes, Invoices, Communications — but they are shallow pages backed by demo/mock data
- **Zero CRM database tables** exist (no customers, leads, opportunities, quotes, invoices, contacts, companies tables)
- Existing components: `CRMImportWizard` (CSV only, 3-step), `CRMConnectModal` (simulated OAuth), `CustomerDetailPane` (basic), `RelationshipTimeline`, `CustomerHealthDashboard`, `RelationshipGraphPanel`
- Data service (`business-data-service.ts`) returns hardcoded demo customers when DB has no data
- The `BusinessCenter` shell already has sidebar navigation with Core, Sales, Growth, Intelligence, Office groups

## Architecture

The CRM will be restructured as a **CRM sub-application** within Business OS, adding a new "CRM" nav group to BusinessCenter and building real database-backed CRUD with premium UI.

## Phase 1: Database Foundation (Migration)

Create ~12 new tables with RLS policies:

| Table | Purpose |
|-------|---------|
| `crm_contacts` | People records (name, email, phone, title, lifecycle_stage, owner, source, health_score, tags, custom_fields jsonb) |
| `crm_companies` | Account/company records (name, domain, industry, size, revenue, health_score, tags, custom_fields jsonb) |
| `crm_contact_company` | Many-to-many link between contacts and companies with role |
| `crm_opportunities` | Pipeline deals (title, value, stage, probability, expected_close, source, contact_id, company_id) |
| `crm_pipeline_stages` | Configurable pipeline stages per user |
| `crm_communications` | Timeline events (type: email/call/note/meeting, contact_id, company_id, content, direction) |
| `crm_tasks` | Follow-up tasks linked to contacts/companies/opportunities |
| `crm_notes` | Rich notes linked to any CRM entity |
| `crm_tags` | Tag definitions per user |
| `crm_import_jobs` | Import history (source, file_name, status, stats jsonb, mappings jsonb) |
| `crm_segments` | Saved filter/segment definitions (name, filter_config jsonb) |
| `crm_merge_log` | Deduplication merge audit trail |

All tables: `user_id uuid NOT NULL`, RLS `auth.uid() = user_id`, `created_at`/`updated_at` timestamps.

## Phase 2: Data Service Layer

**Files to create/modify:**

- `src/lib/data-services/crm-data-service.ts` — Full CRUD for all CRM tables with mode-aware demo fallback
- `src/hooks/use-crm-data.ts` — React Query hooks: `useCRMContacts`, `useCRMCompanies`, `useCRMOpportunities`, `useCRMTasks`, `useCRMNotes`, `useCRMCommunications`, `useCRMImportJobs`, `useCRMSegments`
- Update `src/hooks/use-domain-data.ts` — Add CRM hook re-exports

## Phase 3: CRM Navigation Restructure

**Modify `src/pages/BusinessCenter.tsx`:**

Add a new "CRM" nav group at the top of TAB_GROUPS:
```
CRM: Home, Contacts, Companies, Pipeline, Health, Timeline, Tasks, Notes, Import, Connections, Segments, Automations
```

Add new SubPage entries and route mappings.

## Phase 4: CRM Home Page (New)

**Create `src/pages/business/CRMHome.tsx`**

Premium relationship operating room:
- Top zone: Relationship pulse KPIs (total contacts, active pipeline value, follow-up pressure, health overview)
- Hero zone: "What Matters Now" cards (contacts needing follow-up, at-risk accounts, stalled opportunities, health changes)
- Secondary zone: Recent communications, new leads, pending tasks, overdue follow-through, boardroom-worthy items
- Quick actions: Add contact, Import, Connect CRM
- Advisor summary strip

## Phase 5: Contacts Experience (Major Rebuild)

**Create `src/pages/business/CRMContacts.tsx`** — Replace current CustomersPage with premium contacts:

- **List views**: Table view, compact list, relationship-rich card view (toggle)
- **Filters**: Lifecycle stage, owner, tags, segment, follow-up state, company, last contacted, import source, health
- **Saved views/segments** dropdown
- **Search** with fuzzy matching
- **Quick add** inline form + full create dialog
- **Bulk actions**: Tag, assign owner, change stage, export, merge

**Create `src/components/business/crm/CRMContactDetail.tsx`** — Deep contact dossier:

- Identity card (avatar, name, title, company, methods)
- Lifecycle stage + health score
- Relationship timeline (communications, notes, tasks)
- Linked opportunities, quotes, invoices
- Tags/segments
- Advisor guidance + next best action
- Files/attachments
- Quick actions (email, call, note, task, quote)

## Phase 6: Companies/Accounts Experience (New)

**Create `src/pages/business/CRMCompanies.tsx`**

- Company list with health, revenue, contact count
- Company detail: associated contacts, open opportunities, invoices, payment behavior, support load, notes, advisor summary
- Company-to-contact linking UI

## Phase 7: Pipeline/Opportunities (Major Upgrade)

**Upgrade `src/pages/business/OpportunitiesCenter.tsx`** or create `src/pages/business/CRMPipeline.tsx`:

- Kanban board with configurable stages
- List view with sorting/filtering
- Deal detail slide panel: value, probability, timeline, linked contacts/companies, quotes, communications, tasks
- Stage drag-and-drop with value tracking
- Win/loss tracking and source attribution

## Phase 8: Relationship Health System (New)

**Create `src/pages/business/CRMHealth.tsx`**

- Health dashboard: healthy, warming, drifting, at-risk, high-potential, delicate, blocked
- Contact frequency analysis
- Stalled state detection
- Growth potential scoring
- Risk-of-drift indicators
- Advisor recommendations
- Boardroom escalation triggers

## Phase 9: Communication Timeline (Upgrade)

**Create `src/pages/business/CRMTimeline.tsx`**

- Unified chronological timeline across all contacts
- Filter by type (email, call, note, meeting, proposal, invoice)
- Expandable entries with linked outcomes
- Manual entry support
- Per-contact and global views

## Phase 10: Tasks/Follow-Through (New CRM-specific)

**Create `src/pages/business/CRMTasks.tsx`**

- Next actions, overdue, reminders
- Linked to contacts/companies/opportunities
- Draft follow-up suggestions
- Prepared sequences
- Integration with Follow-Through Center

## Phase 11: Notes/Memory System (New)

**Create `src/pages/business/CRMNotes.tsx`**

- Quick notes, meeting notes, call notes, pinned notes
- Note-to-task conversion
- Note-to-boardroom escalation
- Per-entity and global views
- Rich text support

## Phase 12: Import Center (Major Upgrade)

**Upgrade `src/components/business/CRMImportWizard.tsx`** into full 7-step wizard:

1. Upload (drag-drop, browse, template download, row preview)
2. Structure detection (auto-detect columns, preview mappings)
3. Field mapping (manual mapping, merge/split name fields, custom fields)
4. Validation (missing values, duplicate emails, invalid formats, warnings vs blocking)
5. Deduplication (create new, update existing, merge by email/phone/company+name, manual review queue)
6. Import review (counts: create/update/skip/review, field mapping summary)
7. Post-import summary (success stats, errors, undo option, import receipt, view imported CTA)

Support CSV, Excel (.xlsx), and template download.

## Phase 13: CRM Connections/Sync Center (Upgrade)

**Upgrade `src/pages/business/CRMIntegrationHub.tsx`** and `CRMConnectModal.tsx`:

- Provider cards: HubSpot, Salesforce, GoHighLevel, Pipedrive, Zoho, Close, Airtable, Google Contacts
- Connection flow: choose provider → auth → choose objects → field mapping → dedup strategy → sync config
- Post-connection dashboard: sync status, last synced, errors, stale warnings, mapping config, disconnect/resync
- One-way vs two-way sync options
- Conflict resolution rules

## Phase 14: Segments/Smart Views (New)

**Create `src/pages/business/CRMSegments.tsx`**

- Saved filter builder (conditions on any CRM field)
- Pre-built segments: My contacts, at-risk, no contact in X days, linked to open opps, high-value accounts
- Segment-to-automation linking

## Phase 15: CRM Automations (New)

**Create `src/pages/business/CRMAutomations.tsx`**

- Workflow templates: new lead → assign owner, no contact X days → reminder, quote no response → follow-up, invoice overdue → collections, health threshold → escalate
- Simulation/preview before activation
- Execution log with receipts
- Trust-aware approval gates

## Phase 16: CRM Advisor Board (New)

**Create `src/components/business/crm/CRMAdvisorBoard.tsx`**

- Specialized advisors: Relationship, Follow-Through, Opportunity, Recovery, Account Health, Communication
- Contextual insights per page
- Next best action recommendations
- Boardroom escalation suggestions

## Phase 17: Duplicate Detection & Merge (New)

**Create `src/components/business/crm/CRMDuplicateReview.tsx`**

- Duplicate detection by email, phone, name+company, fuzzy matching
- Side-by-side merge UI with field-level winner selection
- Preserve timeline, notes, tasks
- Merge receipt/audit trail

## Phase 18: Custom Fields (New)

**Create `src/components/business/crm/CRMCustomFields.tsx`**

- Custom field definitions stored in `custom_fields` jsonb columns
- Field types: text, number, date, boolean, picklist, URL, tags
- Elegant inline rendering in contact/company detail views
- Custom field management settings panel

## Phase 19: Empty/Loading/Import States

- Premium empty states for each CRM section (first-use, no data, connecting, syncing, import error, stale connection)
- Skeleton loading states matching each layout
- Actionable CTAs in every empty state

## Phase 20: CRM Command/Search Integration

**Update `src/hooks/use-global-search.ts`** to search new CRM tables and support CRM-specific commands (add contact, import, connect HubSpot, show overdue follow-ups, etc.)

---

## Files Summary

### New files (~25):
- `src/pages/business/CRMHome.tsx`
- `src/pages/business/CRMContacts.tsx`
- `src/pages/business/CRMCompanies.tsx`
- `src/pages/business/CRMPipeline.tsx`
- `src/pages/business/CRMHealth.tsx`
- `src/pages/business/CRMTimeline.tsx`
- `src/pages/business/CRMTasks.tsx`
- `src/pages/business/CRMNotes.tsx`
- `src/pages/business/CRMSegments.tsx`
- `src/pages/business/CRMAutomations.tsx`
- `src/components/business/crm/CRMContactDetail.tsx`
- `src/components/business/crm/CRMCompanyDetail.tsx`
- `src/components/business/crm/CRMDealDetail.tsx`
- `src/components/business/crm/CRMDuplicateReview.tsx`
- `src/components/business/crm/CRMCustomFields.tsx`
- `src/components/business/crm/CRMAdvisorBoard.tsx`
- `src/components/business/crm/CRMContactForm.tsx`
- `src/components/business/crm/CRMFilterBuilder.tsx`
- `src/components/business/crm/CRMViewToggle.tsx`
- `src/lib/data-services/crm-data-service.ts`
- `src/hooks/use-crm-data.ts`

### Modified files (~8):
- `src/pages/BusinessCenter.tsx` — Add CRM nav group + page mappings
- `src/pages/business/CRMIntegrationHub.tsx` — Upgrade connection center
- `src/components/business/CRMImportWizard.tsx` — 7-step upgrade
- `src/components/business/CRMConnectModal.tsx` — Enhanced auth flow
- `src/hooks/use-domain-data.ts` — CRM hook exports
- `src/hooks/use-global-search.ts` — CRM table search
- `src/routes/business-routes.tsx` — New CRM routes
- `src/lib/types/domain-types.ts` — CRM type exports

### Database: 1 migration with ~12 new tables + RLS policies

---

## Implementation Order

Due to scope, implementation will proceed in batches:

**Batch 1** (Foundation): DB migration + data service + hooks + CRM Home + CRM nav restructure
**Batch 2** (Core Records): Contacts + Companies + Contact/Company detail panes + quick add + full create forms
**Batch 3** (Pipeline): Pipeline/Opportunities upgrade + deal detail + stage management
**Batch 4** (Intelligence): Health system + Timeline + Tasks + Notes
**Batch 5** (Import/Sync): 7-step import wizard + CRM connections upgrade + duplicate detection + merge
**Batch 6** (Advanced): Segments + Automations + Custom fields + Advisor board + Boardroom escalation + Command search

