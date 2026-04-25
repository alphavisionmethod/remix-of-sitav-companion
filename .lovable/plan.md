## Module Audit Pack — Plan

### Critical finding from initial exploration

**Health OS does not exist in this codebase.** A repo-wide search for `health.?os|"Health OS"` returns zero hits. The only health-adjacent directories are `src/lib/core-services/connector-health-service`, `src/lib/services/fleet-health`, and `src/pages/admin/health` — all infrastructure/system-health, not a user health module. Per your decision, I will produce **3 documents only** (Business / Concierge / Finance) and include a brief cover note acknowledging Health OS as absent from the current architecture.

### Confirmed module footprint

| Module | Pages dir | Domain dir | Components dir | Approx. in-scope files |
|---|---|---|---|---|
| Business OS | `src/pages/business/` (50 files) | `src/domains/business/` | `src/components/business/`, `src/components/business-advisors/` | ~150–200 |
| Concierge OS | `src/pages/concierge/` (21 files) | `src/domains/concierge/` | `src/components/concierge/` | ~50–70 |
| Finance OS (incl. Investment Office) | `src/pages/money/` (34 files) + `src/pages/investment-office/` (40 files) | `src/domains/finance/`, `src/domains/investment/` | `src/components/money/`, `src/components/finance/`, `src/components/investment/` | ~120–160 |

Plus shared dependencies: `src/lib/services/`, `src/lib/core-services/`, `src/lib/data-services/`, `src/lib/ai-platform/specs/` (advisor specs already authored), `src/contexts/`, `src/routes/`, `supabase/functions/` (214 edge functions), and `src/integrations/supabase/types.ts` for tables.

### Output

Three Markdown files written to `/mnt/documents/`:

1. `business-os-audit.md`
2. `concierge-os-audit.md`
3. `finance-os-audit.md`

Each delivered with a `<lov-artifact>` tag for download. Plus a short `module-audit-cover-note.md` explaining the Health OS situation.

Estimated length: 80–150 pages each (Business OS will be longest given its surface area).

### Per-document structure (matches your spec sections A–L)

Every document will contain all 12 sections you requested:

- **A — Executive overview** (purpose, maturity, coherence verdict)
- **B — Feature map** grouped by subdomain
- **C — File & folder inventory** — *every* `.ts/.tsx` file in the module's footprint annotated individually with: path · purpose · what it contains · what it connects to · activity classification (active/core/shared/legacy/duplicate/experimental/unclear) · completeness (complete/partial/not-wired) · placement verdict
- **D — Page/route/screen audit** — every route under the module, including hidden/unlinked
- **E — Component audit**
- **F — Backend / API / service / logic audit** — services in `src/lib/services/*`, edge functions referenced by the module, RLS-protected tables consumed
- **G — Wiring / connection map** — narrative architecture map with dependency call-outs to identity, files/knowledge, AI runtime, advisors, memory, notifications, receipts/proof, approvals/authority, security, analytics, admin
- **H — Working vs Partial vs Broken vs Unclear** — explicit categorized lists with reasoning
- **I — Missing features / gaps / weaknesses** — both feature gaps and architectural weaknesses (duplicated logic, scattered ownership, weak boundaries)
- **J — Trust / security / receipts / authority audit** — receipt emission, explainability, approval gating, RLS, sensitive flow protection
- **K — Testing / stability / deployment readiness** — what's tested, what's fragile, ship-blockers
- **L — Recommended next actions** — prioritized, actionable sequence

### Methodology

**Static + generated artifact cross-check** (your selected approach):

1. **Static reading** — walk every file in the module's footprint, parse imports/exports, grep for TODO/FIXME/`isDemoMode`/mock data flags, look for unused exports and missing service wiring.
2. **Generated artifact triangulation** — cross-reference findings against existing proof artifacts in `generated/` and `public/generated/`:
   - `advisor-spec-completeness.json` — which advisors are spec-complete (all 9 are, per recent phases)
   - `artifact-ownership-graph-report.json` — producer/consumer wiring
   - `STUBS_AND_PLACEHOLDERS_REGISTER.md` — known stub inventory
   - `FULL_ISSUES_AND_FIXES.md`, `SITA_MASTER_AUDIT.md` — prior architectural findings
   - Component governance, service governance, runtime tier reports
3. **Database surface** — query `src/integrations/supabase/types.ts` for tables consumed by each module (e.g. `crm_contacts`, `crm_pipeline`, `finance_*`, `concierge_*`).
4. **Routing** — read `src/routes/` and `src/App.tsx` to confirm every page is reachable, flag hidden/unlinked routes.
5. **Receipt/trust audit** — grep for `emitActionReceipt`, `ai_action_receipts`, `ai_workforce_approval_queue` usage per module to evaluate Section J.

Where ownership is ambiguous (e.g. a shared CRM component used in both Business and Concierge), the file appears in *both* docs with a cross-reference and an "ambiguous ownership" tag.

### Execution order

1. **Business OS** first (largest, most subdomains, most CRM-heavy — sets the template for the other two)
2. **Concierge OS** (smallest, fastest — household, travel, life admin)
3. **Finance OS** (Money + Investment Office — second largest, has dual nature: budgeting/cash flow AND investment desk)
4. Cover note + final delivery with all four artifact tags

### What this plan does *not* include

- No code changes to the SITA OS app itself — purely a documentation/analysis deliverable.
- No runtime smoke tests (you chose static + artifact cross-check, not browser verification).
- No PDF rendering (Markdown only per your selection).
- No Health OS document — only a one-paragraph cover-note acknowledgement.

### Approval

Approve to switch to default mode and begin generation. I'll start with Business OS and deliver each document as it completes so you can read the first one while the next is being generated.