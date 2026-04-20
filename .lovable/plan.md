

## Wave 11 — MASTER_AUDIT.md v3.0 (Comprehensive 100% Coverage Rewrite)

### What's missing from v2.0

After a full project scan, these sections are absent or incomplete:

| Gap | What's missing | Why it matters |
|---|---|---|
| **Page inventory** | Audit says "29 top-level routes" but there are **110+ page files** plus **28 admin sub-directories** with **230+ admin pages**. No page-level breakdown. | Cannot verify dead-page or feature coverage claims |
| **Context/Provider inventory** | 23 React contexts powering the app are undocumented | These are the app's nervous system — unaudited wiring |
| **Component inventory** | 1,014 files across 34 component domains — zero domain breakdown | Impossible to assess UI coverage or orphans |
| **Package contract inventory** | 33 contract/SDK packages in `src/packages/` — listed by count only, no domain map | Contract integrity is unverifiable |
| **CI/CD workflow inventory** | 17 GitHub Actions workflows exist — not documented in audit | Release pipeline is invisible |
| **Kill-switch registry detail** | Audit says "15+ kill-switches" — actual registry in `src/lib/control-plane/kill-switch-registry.ts` has **18 entries** with impact levels, affected services, affected tables | Operator can't assess blast radius |
| **Runbook registry detail** | Audit says "19 runbooks" — no mapping to edge functions, tables, or golden paths | Incident response chain unverifiable |
| **Golden path registry detail** | 15 paths exist in `src/lib/operations/golden-path-registry.ts` — audit mentions them but no per-path status | User journey coverage is untracked |
| **Route family breakdown** | 15 route family files in `src/routes/` — not enumerated | Route composition is invisible |
| **Infrastructure layer** | `infra/` directory (ci, deploy, docs, runbooks) completely absent from audit | Deployment topology undocumented |
| **Error monitoring** | `initErrorMonitoring()` called at boot — no audit of error capture pipeline | Observability gap |
| **Dependency health** | No `npm audit` results, no outdated package count, no bundle size | Supply chain risk unquantified |
| **Performance baseline** | No bundle size, no route-level code-split count, no lazy-load inventory | Performance regression risk |
| **Test coverage** | `__tests__/` dirs exist under pages, components, contexts, lib — no coverage metrics | Quality assurance gap |
| **Marketing site audit** | 10 public marketing pages — not individually assessed for content/SEO readiness | Launch readiness gap |
| **Admin page taxonomy** | 230+ admin pages across 26 sub-directories — no domain classification table | Admin surface is a black box |
| **Edge function shared utilities** | `_shared/` directory in supabase/functions — undocumented | Backend code reuse patterns invisible |

### Plan

Rewrite MASTER_AUDIT.md to v3.0 adding these new parts while preserving all existing content:

**New Part XX — Full Page & Route Inventory**
- Enumerate all 15 route families with child route counts
- Classify 110+ top-level pages by domain (marketing, workspace, admin, settings, OS)
- List all 28 admin sub-directories with page counts per domain
- Total: ~340+ pages across all tiers
- Flag the 12 dead pages by name

**New Part XXI — Context & Provider Architecture**
- List all 23 React contexts with purpose, scope (global/route/component), and dependencies
- Map provider nesting order from App.tsx (critical for debugging)
- Flag any unused/orphan contexts

**New Part XXII — Component Domain Map**
- Break down 34 component directories with file counts and domain owners
- Identify the top-10 largest component clusters
- Cross-reference against page imports to find orphaned components

**New Part XXIII — Package & Contract Registry**
- List all 33 packages with purpose classification (contract, SDK, config, primitives)
- Map package consumers (which services/hooks import them)

**New Part XXIV — CI/CD Pipeline Inventory**
- Enumerate all 17 GitHub Actions workflows with triggers, jobs, and BLOCK gate mappings
- Map to VALIDATION_MATRIX.md rows
- Document the deployment pipeline: PR → CI → staging → production

**New Part XXV — Kill-Switch & Runbook Cross-Reference**
- Full 18-entry kill-switch table with: ID, impact level, affected services, affected tables, affected edge functions, user-facing impact
- Full 19-entry runbook table with: ID, trigger condition, recovery steps, golden path refs
- Cross-link matrix: which kill-switches trigger which runbooks

**New Part XXVI — Golden Path Status Matrix**
- All 15 golden paths with: steps, surfaces, runtime probe status, last certified date, blocking kill-switches, recovery runbook refs
- Gate ref mapping to release gates

**New Part XXVII — Infrastructure & Deployment Topology**
- Document `infra/ci/`, `infra/deploy/`, `infra/runbooks/` contents
- Map deployment targets: Web (Vite), Edge (Supabase), Desktop (Electron), OS (ISO/OVA/RAW)
- Document the `os-artifact.yaml` packaging spec

**New Part XXVIII — Performance & Bundle Baseline**
- Lazy-loaded route count (from App.tsx `lazy()` calls)
- Code-split entry points
- Known heavy dependencies

**New Part XXIX — Test & Quality Baseline**
- Test directory locations and file counts
- Framework (Vitest) configuration status
- Coverage baseline (if available)

**Enhance existing Parts:**
- **Part II**: Update page count from "29 routes" to actual ~340+ pages; add context count (23), component domain count (34), package count (33), workflow count (17)
- **Part III**: Add admin cluster breakdown (26 sub-dirs, 230+ pages)
- **Part X**: Expand from 4 bullet points to full admin domain taxonomy with page counts per domain
- **Part XVII**: Add `npm audit` summary, bundle size estimate, outdated dependency count
- **Appendix A**: Expand edge function sample to include `_shared/` utilities documentation
- **Appendix D**: Replace prose lists with structured tables including cross-references

### Files to edit
1. `public/generated/MASTER_AUDIT.md` — full v3.0 rewrite (~1,200 lines)
2. `public/generated/artifacts/audits/MASTER_AUDIT.md` — mirror

### What does NOT change
- No database migrations
- No code changes
- No new gates or validators
- Pure documentation enhancement

### What this delivers
- Every layer of the project is individually enumerated and classified
- Operator can trace any feature from page → route → context → component → hook → edge function → table → RLS policy
- Kill-switch blast radius is visible at a glance
- CI pipeline is fully mapped to release gates
- Score justification is traceable to specific evidence per index
- Audit moves from 667 lines to ~1,200 lines — comprehensive enough to onboard a new engineer or auditor cold

