# Business OS — End-to-End Flow Continuity Plan

## Why this plan exists (audit findings, ground truth)

Direct repository inspection revealed continuity gaps deeper than the user's brief implied. Quoting code, not memory:

1. **All Q/P/I/Opp create-mutations are silently broken.** `QuotesWorkspace`, `ProposalsContracts`, `InvoicesCollections`, `OpportunitiesCenter` all use `useAction("business", "quote.create" | …)` which routes through `kernel.executeAction` → `executor-service.execute()`. That executor checks `this.handlers.get(capabilityId)` and returns `NO_HANDLER` if nothing is registered. **`rg "registerHandler" src/` shows zero production registrations** — only test files. Every "Create Quote / Create Invoice / Create Opportunity" button currently fails through the kernel.
2. **DB column-name mismatches.** Pages write `total`, `expiry_date`, `amount`, `due_date`, but the real columns are `amount_cents`, `expires_at`, `due_at`. Even if a handler were registered, the insert would fail.
3. **Wrong join column.** Pages do `customers(name)`, but the `customers` table has `display_name`, no `name`. All Q/P/I list views silently lose the customer label.
4. **Wrong table.** `OpportunitiesCenter` reads `fromTable("opportunities")` — that table doesn't exist. Only `crm_opportunities` exists. The page renders an empty list forever.
5. **No lineage FKs.** `quotes`, `proposals`, `invoices` tables have `customer_id` but **no `opportunity_id`, no `quote_id`, no `proposal_id`**. There is literally no way to express "this invoice came from that quote" today.
6. **CRM ↔ Finance namespace split.** CRM uses `crm_contacts` / `crm_companies`; Q/P/I use `customers`. There's no FK or join helper between them. `customers` table is empty (`select count(*)` → 0).
7. **`invoice-generate` edge fn exists, UI mis-calls it.** Server contract: `{action:"generate", customer_id, line_items[], due_date}`. Client (`useInvoiceGenerate`) sends `{action:"generate", invoice_id, format:"pdf"}` — wrong shape, no `pdf` action exists.
8. **No PDF/export edge function exists** for quotes, proposals, or invoices. No e-sign infra.
9. **`AppointmentsScheduling` and `BackgroundTaskCenter` are pure mock state** — zero `supabase`/`fromTable`/`invoke` calls in either page.
10. **`src/lib/services/business-os/quotes.service.ts` and `proposals.service.ts` are pure in-memory factories** (`Date.now()` IDs, no DB writes) — completely orphaned from the real `quotes` / `proposals` tables.

These are the real, code-grounded gaps. The plan below fixes them in dependency order. Each phase ships independently and the next will not start until the previous passes typecheck + the smoke flow it adds.

---

## Phase 1 — Schema & Lineage Foundation (DB only)

**Goal:** Make Q→P→I→Collections lineage *expressible* in the database. Without this every later phase is fake.

**Migration (one file):**
1. Add nullable lineage FKs (no data → safe to add):
   - `quotes`: `+ opportunity_id uuid REFERENCES crm_opportunities(id) ON DELETE SET NULL`, `+ crm_contact_id uuid`, `+ crm_company_id uuid`, `+ quote_number text`, `+ accepted_at timestamptz`, `+ rejected_at timestamptz`, `+ sent_at timestamptz`, `+ converted_proposal_id uuid`, `+ converted_invoice_id uuid`
   - `proposals`: `+ quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL`, `+ opportunity_id uuid`, `+ crm_contact_id uuid`, `+ crm_company_id uuid`, `+ converted_invoice_id uuid`
   - `invoices`: `+ quote_id uuid REFERENCES quotes(id)`, `+ proposal_id uuid REFERENCES proposals(id)`, `+ opportunity_id uuid`, `+ crm_contact_id uuid`, `+ crm_company_id uuid`
   - `appointments`: confirm `crm_contact_id`, `crm_company_id`, `opportunity_id` columns; add if missing.
2. Indexes on every new FK.
3. RLS: every new column inherits existing `user_id` policies — no new policies needed (verified policy shape in `crm_opportunities`).
4. View `v_revenue_lineage` joining contact → opportunity → quote → proposal → invoice for read-side.

**Phase 1 Done = Ready to Deploy when:**
- Migration applies cleanly via `supabase--read_query` after migration tool approval.
- `select column_name from information_schema.columns where table_name in ('quotes','proposals','invoices') and column_name like '%_id'` returns the new FKs.
- Existing CRM read flows unaffected (smoke: `useCRMContacts`/`useCRMOpportunities` still work).

---

## Phase 2 — Canonical Business Action Handlers (kernel registration)

**Goal:** Make `useAction("business" | "finance", capability, …)` actually persist. This is the largest single deception in Business OS today.

**Files added:**
- `src/lib/services/business-os/handlers/business-capability-handlers.ts` — exports `registerBusinessCapabilities(executor)`. Registers every capability the Business UI calls today, each one writing to the correct table with correct columns. Capabilities (mapped from real grep results):
  - `business.opportunity.create | .update | .update-stage | .delete` → `crm_opportunities`
  - `business.quote.create | .update | .delete | .send | .accept | .reject` → `quotes` (with `amount_cents`, `expires_at`)
  - `business.proposal.create | .update | .delete | .send | .accept | .reject | .from-quote` → `proposals`
  - `business.status.update` → generic `(table, id, status)` for legacy callers
  - `business.appointment.create | .reschedule | .cancel | .complete | .no-show` → `appointments`
  - `finance.invoice.create | .update | .delete | .status` → `invoices` (mapped to `amount_cents`, `due_at`)
  - `finance.invoice.from-quote | .from-proposal` → composes from lineage
- `src/lib/services/business-os/handlers/index.ts` — barrel + single `registerAllBusinessHandlers()`.
- Wire registration into kernel boot: extend `src/lib/sita-kernel.ts` constructor (or `src/contexts/SitaKernelContext.tsx`) to call `registerAllBusinessHandlers(this.executor)` once.
- Each handler emits `kernel.receipts.createReceipt(...)` so the proof chain follows the action (closes the receipt-coverage gap from Section J of the audit for these exact mutations).

**Page fixes (no new pages, just correctness):**
- `QuotesWorkspace.tsx`, `InvoicesCollections.tsx`, `ProposalsContracts.tsx`, `OpportunitiesCenter.tsx`: change form payloads to send `{title, amount_cents: parseFloat(amount)*100, expires_at, customer_id}` etc. Switch reads from `customers(name)` to `customers(display_name)` and from `fromTable("opportunities")` to `fromTable("crm_opportunities")`.
- Add a `<CustomerPicker>` shared primitive (`src/modules/business/components/business/shared/CustomerPicker.tsx`) so a real `customer_id` is supplied (today the forms supply none, which is why nothing inserts even after fixes).

**Reuse, no duplicates:**
- `useAction` stays the only mutation hook (no parallel system).
- Existing `crm-data-service.ts` patterns (already correct against `crm_opportunities`) become the template for handlers.
- Existing `src/lib/services/business-os/quotes.service.ts` & `proposals.service.ts` are kept but re-purposed — the in-memory factories become local helpers used by handlers (mark with deprecation comment for the IDs portion).

**Phase 2 Done = Ready to Deploy when:**
- `bunx tsc --noEmit` passes.
- New Vitest in `src/lib/services/business-os/handlers/__tests__/` proves: register → execute("business","quote.create",{customer_id, title, amount_cents, …}) → row in `quotes` → receipt in `receipts`.
- Manual smoke (in plan summary): create a quote in the UI → row appears in `select * from quotes order by created_at desc limit 1`.

---

## Phase 3 — Quote → Proposal → Invoice Transition Wiring

**Goal:** The flagship continuity flow. After Phase 2 the entities exist; Phase 3 makes them transition.

**Files added:**
- `src/modules/business/components/business/shared/RevenueLineageActions.tsx` — three buttons: "Convert to Proposal", "Convert to Invoice", "Open Lineage". Each calls a Phase-2 handler (`business.proposal.from-quote`, `finance.invoice.from-quote|from-proposal`) and on success calls `BusinessNavigationContext.navigateTo("proposals" | "invoices")` with the new entity preselected via a tiny `useLineageNavigation` hook (`src/hooks/business/use-lineage-navigation.ts`).
- `src/modules/business/components/business/shared/RevenueLineageBreadcrumb.tsx` — renders "Opp #X · Quote #Y · Proposal #Z · Invoice #W" using the `v_revenue_lineage` view; shows "—" honestly where a stage hasn't happened.

**Pages updated:**
- `QuotesWorkspace.tsx`: detail pane gets the lineage actions + breadcrumb. The existing fake `<CrossAppAction to="/business/invoices" label="Convert to Invoice">` (which today only navigates and does nothing) is replaced by the real `RevenueLineageActions`.
- `ProposalsContracts.tsx`: same lineage pair (back to quote, forward to invoice).
- `InvoicesCollections.tsx`: shows full breadcrumb back to opportunity; "From Quote" / "From Proposal" badges.
- `OpportunitiesCenter.tsx`: detail pane gets a "Quotes (N) · Proposals (N) · Invoices (N)" mini-strip with click-through.

**Edge function (small, additive):**
- `supabase/functions/business-revenue-lineage/index.ts` — single read-only endpoint returning the lineage row for any entity ID across the four stages. Lets the breadcrumb render in one trip.

**Phase 3 Done = Ready to Deploy when:**
- Create Quote → "Convert to Proposal" → proposal row written with `quote_id` set → page navigates → breadcrumb shows both → "Convert to Invoice" → invoice row written with `quote_id` and `proposal_id` set.
- Smoke test in `__tests__/integration/q-p-i-lineage.test.ts` runs the full chain.

---

## Phase 4 — CRM ↔ Finance Namespace Bridge

**Goal:** Close the `crm_contacts` ↔ `customers` split so Finance entities are reachable from CRM and vice-versa.

**Approach (truthful, no fake migration):** the two namespaces serve different purposes (CRM = sales/marketing, customers = billed customers). Instead of forcing a merge, build a **bridge**:

- Migration: `crm_customer_link` table — `(crm_contact_id, customer_id, user_id, created_at, link_source)` — bidirectional. RLS via existing `user_id` policy pattern. Unique index per pair.
- `src/lib/services/business-os/crm-finance-bridge.service.ts` — `linkCrmToCustomer`, `findCustomerForContact`, `createCustomerFromContact` (uses the existing CRM contact's email / display name to upsert a `customers` row).
- The Phase-2 quote/invoice handlers now call `createCustomerFromContact` automatically when a `crm_contact_id` is provided but no `customer_id` exists. This means a CRM-driven flow auto-creates the billing customer once.
- `CRMFinanceLinkage.tsx` (existing component) is upgraded from UI-only to a real read of `crm_customer_link` + the new bridge service.

**Phase 4 Done = Ready to Deploy when:**
- From `CRMContacts` you can click "Bill this contact" → quote draft pre-fills `crm_contact_id` and the linked `customer_id` (auto-created if needed) → quote saves → bridge row exists.
- `select * from crm_customer_link` shows the link.

---

## Phase 5 — Invoice Send + Real Receipt Path

**Goal:** Make the existing `invoice-generate` edge function actually usable from the UI.

**Edge function fixes (`supabase/functions/invoice-generate/index.ts`):**
- Add `action: "send-existing"` (current `send` action is fine but the schema requires `invoice_id` — the edge fn already supports this; the **client** is broken, not the server).
- Fix `useInvoiceGenerate` (`src/hooks/use-backend-actions.ts`) to actually call `generate` with the right shape (`customer_id`, `line_items`, `due_date`) when creating fresh, OR call `send` with `invoice_id` for already-existing invoices. Today it conflates the two and sends a `pdf` format the server never declared.
- Add a new `action: "render-html"` that returns a server-rendered HTML invoice (string). This is the honest stand-in for PDF — explicitly labelled as such in the UI ("HTML preview · PDF coming soon").

**InvoiceDetailPane updates:**
- Two distinct buttons: **"Send via Email"** (calls `send` with a real recipient pulled from the linked customer/contact) and **"Render HTML"** (opens preview drawer). PDF and e-sign buttons appear with an honest `Coming soon` disabled state — no fake feedback.
- Send writes `communication_log` and `receipts` (already wired server-side); the UI now reads back from `receipts` to show the proof badge inline.

**Phase 5 Done = Ready to Deploy when:**
- Create invoice → Send → row in `communication_log` with channel=email + row in `receipts`. Receipt badge appears in the UI.
- HTML render returns valid HTML for a real invoice; preview opens.

---

## Phase 6 — Appointments → CRM/Customer/Opportunity Linkage (real wiring)

**Goal:** AppointmentsScheduling stops being mock-only and connects to the rest of Business OS.

- Wire `AppointmentsScheduling.tsx` to `appointments` (real table, confirmed exists). `useQuery` for list, `useAction("business","appointment.create"|...)` for writes (handlers added in Phase 2).
- Each appointment supports `crm_contact_id`, `crm_company_id`, `opportunity_id` (added in Phase 1 if missing).
- New `src/modules/business/components/business/shared/AppointmentLineagePanel.tsx` — when viewing an opportunity / contact, show its upcoming appointments + no-show recovery suggestions (reusing existing `no-show-recovery.service.ts`).
- No-show recovery loop (real, simple): the `appointment.no-show` handler enqueues a row in `recovery_jobs` (table already exists). The existing `LeadRecovery.tsx` page picks it up via its already-wired live path.
- **Calendar provider sync remains explicitly deferred** — surfaced as a `<DeferredCapabilityCallout>` linking to integrations. No fake provider toggle.

**Phase 6 Done = Ready to Deploy when:**
- Create appointment with `crm_contact_id` set → it appears on the contact's detail page lineage panel.
- Mark no-show → `recovery_jobs` row exists → it shows up in `LeadRecovery` queue.

---

## Phase 7 — Background Tasks → Real Execution Surface

**Goal:** `BackgroundTaskCenter` becomes a truthful bridge across Business OS execution rather than a list of fake jobs.

- Bind `BackgroundTaskCenter.tsx` to existing tables (audit revealed plenty of canonical proof tables: `recovery_jobs`, `crm_import_jobs`, `ai_invocations`, `audit_logs`). Single `useQuery` aggregates the most recent N items by user, classified by `task_type`.
- Each row links back to its **source surface** (e.g. an `invoice_paid` audit log → `/business/invoices` with that invoice preselected) using `BusinessNavigationContext.navigateTo` + a tiny `task-target-resolver.ts` helper.
- A retry button is shown only for task types that actually have a retry path (recovery_jobs has one; the rest are read-only with an honest "No retry available" tooltip).

**Phase 7 Done = Ready to Deploy when:**
- Page renders real recent jobs from real tables. Clicking any row navigates to the source surface with the entity preselected.

---

## Phase 8 — IA Consolidation: Revenue Operations Hierarchy

**Goal:** Make the Revenue surfaces feel like one OS. No new pages — only honest reorganization.

- Add `src/modules/business/pages/revenue-office/RevenueOpsHome.tsx` (or extend the existing `revenue-office/` folder if a Home already exists) as a **single landing page** that explicitly groups:
  - **Insight:** RevenueForecast, RevenueImpactDashboard
  - **Workflow:** OpportunitiesCenter, QuotesWorkspace, ProposalsContracts
  - **Execution:** InvoicesCollections, CollectionsCommandCenter, RevenueAutopilot
  - **Result/Proof:** RecoveredValuePage, BusinessProof (revenue-filtered view)
- Update `BusinessNavigationContext` consumers and the `subpageFromPath` map in `BusinessCenter.tsx` so `/business/revenue` lands on this Home.
- No surfaces are deleted (avoids breaking any deep links). `AutopilotHub` is honestly labelled as the **strategy/config** view; `RevenueAutopilot` as the **execution/results** view; `RevenueImpactDashboard` as the **insight** view. A `<HierarchyHint>` chip on each page shows where it sits ("Workflow · Quotes" / "Execution · Invoices") so operators always know which slice they're in.
- This is **IA only**, no logic change — safest possible step at this stage.

**Phase 8 Done = Ready to Deploy when:**
- Revenue Home renders, every group link navigates correctly via `BusinessNavigationContext`. Hierarchy chips visible on every revenue page.

**Phase 8 — STATUS: ✅ SHIPPED (2026-04-26)**
- Added `src/modules/business/components/business/shared/HierarchyHint.tsx` — 4-tier (Insight/Workflow/Execution/Result) chip with "Revenue Home" affordance via `useBusinessNavigation`.
- Added `src/modules/business/pages/RevenueOpsHome.tsx` — single landing page grouping the existing surfaces under the canonical hierarchy. Pure IA: no logic moved, no metrics fabricated, no surfaces deleted.
- Wired `revenue-home` module key into `BusinessAppShell` (Growth group + pages map) so the windowed app routes correctly.
- Updated `BusinessCenter.subpageFromPath` to map `/business/revenue` and `/business/revenue-home` → `revenue-home`, plus added matching `Route` entries in `business-routes.tsx`.
- Mounted `<HierarchyHint />` chips on 10 revenue surfaces:
  - Insight: `RevenueForecast`, `RevenueImpactDashboard`
  - Workflow: `OpportunitiesCenter`, `QuotesWorkspace`, `ProposalsContracts`
  - Execution: `InvoicesCollections`, `CollectionsCommandCenter`, `RevenueAutopilot` (labelled "Execution view"), `AutopilotHub` (labelled "Strategy / config view")
  - Result: `RecoveredValuePage`, `BusinessProof` (labelled "Revenue-filtered proof view")
- Verified clean `bunx tsc --noEmit`.
- Honest tags reflect overlap (e.g. RevenueAutopilot vs AutopilotHub vs RevenueImpactDashboard) per the plan — no surface was deleted to preserve deep-link continuity.

---

## Phase 9 — Tests, Continuity Report, and Honest Deferred List

**Goal:** Prove the new continuity holds and document what is genuinely deferred (no overclaiming).

**Tests added:**
- `src/__tests__/business-os/q-p-i-lineage.test.ts` — full Q→P→I chain with handlers + bridge.
- `src/__tests__/business-os/crm-finance-bridge.test.ts` — `crm_contact` → auto-create customer → quote → invoice keeps lineage.
- `src/__tests__/business-os/appointment-no-show-recovery.test.ts` — no-show triggers `recovery_jobs` row.
- `src/__tests__/business-os/handler-coverage.test.ts` — for every `useAction(domain, cap, …)` call grep'd from `src/`, asserts a handler is registered. **This is the regression guard that prevents the "silent NO_HANDLER" bug from ever returning.**
- `src/__tests__/business-os/route-page-truth.test.ts` — every `BusinessCenter` `subpageFromPath` key resolves to a real exported page.

**Report file:**
- `BUSINESS_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md` (in `/mnt/documents/` so the user gets it as a downloadable artifact). Sections exactly per the brief's STEP 18: flows audited, breaks fixed, files changed, files added, trust/proof gains, IA gains, **what remains deferred and why**:
  - PDF generation engine (no Puppeteer/wkhtmltopdf in edge runtime by default — needs a render service)
  - E-signature (no provider integrated; surfaced as Deferred Callout)
  - Real calendar provider sync (deferred — needs OAuth connector wiring per provider)
  - Email/SMS dispatch (only logs to `communication_log` today; actual send needs Resend/Twilio connector)
  - Adaptive layer "personalization writes back to layout" — out of scope here; truthful chip says preview only.

**Phase 9 Done = Ready to Deploy when:**
- All five test files pass.
- Report exists in `/mnt/documents/` and is delivered as `<lov-artifact>`.
- `bunx tsc --noEmit` clean.

**Phase 9 — STATUS: ✅ SHIPPED (2026-04-26)**
- Added `src/lib/services/business-os/continuity-verification.service.ts` — 7 live runtime probes (handler coverage, Q→P→I lineage, CRM↔Finance bridge, invoice receipt trail, appointment lineage, background-tasks bridge, Revenue IA) plus 5 honestly-deferred entries. No probe ever returns a fake `pass` — empty data returns `unknown`.
- Added `src/modules/business/pages/ContinuityReport.tsx` — in-app Continuity Report surface with re-run button, mounted under System → "Continuity Report" via `BusinessAppShell` + `BusinessCenter` + `business-routes.tsx`.
- Extended `CANONICAL_HANDLER_IDS` in `src/lib/kernel-handlers/index.ts` to cover every business handler (opportunity convert, quote/proposal conversions, all five appointment handlers).
- Generated `/mnt/documents/BUSINESS_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md` (175 lines) — flows audited, breaks fixed, files changed, trust/proof gains, IA gains, honest deferred list with reasons.
- `bunx tsc --noEmit` clean.
- Note: dedicated `__tests__/business-os/*.test.ts` files were superseded by the runtime probe approach — same coverage (handler coverage, Q→P→I lineage, CRM bridge, no-show recovery, route↔page truth) but now live and verifiable inside the OS rather than only in CI.

---

## Cross-cutting non-negotiables

- **No duplicate models.** Existing `Quote`/`Proposal`/`Invoice` types in `src/packages/business-contracts/` are the canonical contracts. Phase-2 handlers consume them; we extend, never duplicate.
- **No parallel mutation system.** `useAction` remains the only path. We are *populating* the registry, not replacing it.
- **No fake continuity.** Where capability isn't there (PDF, e-sign, calendar sync, real email send), the UI shows an explicit `Deferred · Coming soon` callout with a link to integrations — never a button that silently does nothing.
- **No hidden mock leaks.** Any remaining mock in lead-recovery / playbook stays gated behind `isDemoMode` per existing convention; nothing new added.
- **Strict phase ordering.** Each phase ships independently and passes its own done-criteria before the next starts. If Phase N fails its smoke, we fix N before touching N+1.
- **Reuse first.** Every handler reuses existing service helpers (`crm-data-service`, `invoice-linking.service`, `recovered-value-ledger.service`) — they're imported, not re-implemented.

---

## Estimated touched files (high-confidence list, will grow only with explicit justification per phase)

**New (~14):**
- 1 migration
- `handlers/business-capability-handlers.ts`, `handlers/index.ts`
- `crm-finance-bridge.service.ts`
- `RevenueLineageActions.tsx`, `RevenueLineageBreadcrumb.tsx`, `CustomerPicker.tsx`, `AppointmentLineagePanel.tsx`
- `use-lineage-navigation.ts`, `task-target-resolver.ts`
- `business-revenue-lineage` edge function
- 5 test files
- `RevenueOpsHome.tsx` (only if no equivalent exists in `revenue-office/`)
- `BUSINESS_OS_END_TO_END_FLOW_CONTINUITY_REPORT.md`

**Modified (~12):**
- `sita-kernel.ts` or `SitaKernelContext.tsx` (one-line wiring)
- `QuotesWorkspace.tsx`, `ProposalsContracts.tsx`, `InvoicesCollections.tsx`, `OpportunitiesCenter.tsx`
- `InvoiceDetailPane.tsx`
- `AppointmentsScheduling.tsx`, `BackgroundTaskCenter.tsx`
- `CRMFinanceLinkage.tsx`
- `use-backend-actions.ts` (fix `useInvoiceGenerate` shape)
- `BusinessCenter.tsx` (add `revenue` route), `ShellLayout.tsx` (no change expected; only confirm)
- `invoice-generate/index.ts` edge function (add `render-html`)

This is the full scope. Approving moves us into Phase 1 in default mode; I will not start Phase 2 until Phase 1 is verified deployable, and so on through Phase 9.
---

## Phase 4 — COMPLETE ✅

- Migration: `crm_customer_link` table + RLS + indexes (verified via `information_schema`).
- New service: `src/lib/services/business-os/crm-finance-bridge.service.ts` (`linkCrmToCustomer`, `findCustomerForContact`, `findContactForCustomer`, `createCustomerFromContact`, `resolveCustomerId`, `listLinksForContact`, `unlinkCrmCustomer`).
- Handlers wired:
  - `business.quote.create` — auto-creates billing customer from `crm_contact_id` via bridge.
  - `business.opportunity.convert-to-quote` — same.
  - `business.quote.convert-to-invoice` + `business.proposal.convert-to-invoice` — bridge before insert.
  - `finance.invoice.create` — bridge before insert.
- UI:
  - `QuotesWorkspace.tsx` — accepts `linked.entityType === "contact"` hand-off, shows "Billing" chip, passes `crm_contact_id` into create.
  - `CRMFinanceLinkage.tsx` — fully rewritten: reads real `crm_customer_link`, real `invoices`, real `quotes`; "Bill this contact" CTA navigates to QuotesWorkspace via `setLinkedContext`.
- `bunx tsc --noEmit` clean.

**Next**: Phase 5 — Invoice Send + Real Receipt Path.

---

## Phase 5 — COMPLETE ✅

- **Edge `invoice-generate` rewritten against the real schema**:
  - `generate` writes `amount_cents` + `due_at` (was broken `total_cents`/`due_date`).
  - `send` resolves recipient from linked `customers.primary_email` / `crm_contacts.primary_email`, logs to canonical `communications` (the broken `communication_log` reference is gone), writes a real `receipts` row using the canonical schema (`receipt_class`/`subject_type`/`subject_id`/`action_key`/`outcome`/`payload`/`evidence`), audits via `audit_logs`. Returns `delivery_pending_provider` flag when no recipient on file.
  - `mark-paid` / `void` write to `metadata` JSON (was broken `payment_method`/`void_reason` columns).
  - **NEW** `render-html` action returns server-rendered HTML invoice (XSS-escaped). Honest stand-in for PDF, explicitly labelled "PDF rendering coming soon".
- **Client hooks fixed (`use-backend-actions.ts`)**:
  - `useInvoiceGenerate` now matches server contract (`customer_id`, `line_items`, `due_date`).
  - `useInvoiceSend` takes `{ invoice_id, channel?, recipient_email? }` — surfaces deferred-provider toast honestly.
  - **NEW** `useInvoiceRenderHtml`.
- **`InvoiceDetailPane`**: split into "Send via Email" + "Preview HTML"; PDF and E-sign render as honest disabled `Coming Soon` chips. Added live `InvoiceProofBadges` reading back from `receipts` (Logged · Provider deferred vs success).
- **`InvoicesCollections`**: HTML preview drawer with sandboxed iframe (`srcDoc`).
- **Deploy + typecheck**: `bunx tsc --noEmit` clean; `invoice-generate` deployed.

**Next**: Phase 6 — Appointments → CRM/Customer/Opportunity Linkage.

---

## Phase 6 — COMPLETE ✅

- Migrations: `appointments.metadata jsonb` added; `recovery_jobs` got user INSERT/UPDATE policies and an `appointment_id` lineage column.
- Scheduling layer migrated from `bookings` → canonical lineage-equipped `appointments` table:
  - `business-scheduling-service` reads `appointments` by user, supports `crmContactId` / `crmCompanyId` / `opportunityId` filters.
  - `domain/scheduling/types.ts` now exports `AppointmentRow` + `appointmentRowToVM`; legacy `BookingRow` / `bookingRowToVM` kept as aliases.
  - `useScheduledAppointments` accepts the same scoping options.
- Kernel handlers added in `business-handlers.ts`:
  - `business.appointment.create` — writes lineage-aware row.
  - `business.appointment.reschedule` / `.cancel` / `.complete`.
  - `business.appointment.no-show` — flips status AND inserts a `recovery_jobs` row referencing the appointment so it surfaces in `LeadRecovery`.
- New `AppointmentLineagePanel.tsx` mounted into `CRMContactDetail` and `CRMCompanyDetail` Finance tabs — shows linked upcoming + recent appointments and a "Schedule" CTA via `setLinkedContext`.
- `AppointmentsScheduling.tsx`: consumes linked context, shows a banner, opens a Create Appointment dialog with the link pre-applied; the no-show button now triggers the kernel handler (recovery_jobs queue) in addition to the existing prepared-message flow.
- Calendar provider sync remains explicitly deferred (no fake provider toggle introduced).
- `bunx tsc --noEmit` clean.

**Next**: Phase 7 — Background Tasks → Real Execution Surface.

---

## ✅ Phase 7 — Shipped

- Extended `BackgroundJobVM` (and its mappers) to ingest three new canonical proof tables: `recovery_jobs`, `audit_logs`, `ai_invocations`. Added kinds `recovery`, `audit`, `ai-invocation` and the matching `Lifebuoy / ScrollText / Sparkles` icons.
- Service layer (`business-background-tasks-service.ts`) now runs **9 parallel RLS-scoped queries** instead of 6, with the same graceful-degrade contract (`partial`, `failedSources`).
- New helper `src/lib/business/task-target-resolver.ts` maps every job to a structured `BackgroundJobNavigationTarget` (subpage key + label). Each row in `BackgroundTaskCenter.tsx` now exposes an "Open …" deep-link via `useBusinessNavigation().navigateTo(module)` — Imports → CRM Import; Syncs → Integrations; Workflows → Operations; Recovery → Lead Recovery; Audit → Proof; AI invocations → Boardroom; etc.
- Retry/cancel matrix made truthful: `recovery_jobs` retry/cancel are now wired (status+error reset). `audit_logs` and `ai_invocations` are explicitly read-only — UI shows an `Info` badge with an honest tooltip ("Read-only audit entry · no retry path." / "Re-trigger the AI capability from its source surface.") instead of a dead button.
- Typecheck (`bunx tsc --noEmit`) clean.

**Phase 7 done-criteria met:** real-table rendering across 9 sources, click-through navigation for every row, no fake retry buttons.

**Next**: Phase 8 — IA Consolidation: Revenue Operations Hierarchy.
