# Business Advisors — Full Build-Spec System (per advisor, deployment-ready)

## What already exists (so we don't duplicate)

Verified in code:

- **Registry**: `src/lib/ai-platform/runtime/business-advisor-registry.ts` (all 9 advisors, authority levels L1–L5, risk tiers, blocked actions, context sources, capabilities)
- **Runtime**: `business-advisor-runtime.ts` (`askBusinessAdvisor`, `runAdvisorSimulation`, citation persistence, receipts)
- **Context loader**: `advisor-context-loader.ts`
- **Permission/escalation/reversibility maps**: 3 files in runtime/
- **Shared shell**: `src/components/business-advisors/AdvisorPageShell.tsx` with 6 tabs (Chat, Sources, Simulation, Recommendations, Memory, Proof)
- **Per-advisor component folders**: all 9 (sales, customer-service, cfo, marketing, growth, tech, imports-exports, taxes-laws, ceo) with HeaderStats, Recommendations, SimulationForm, DetailDrawer, Mobile panels
- **Routes**: OS (`/business-advisors/:id`) + Mobile (`/mobile/business-advisors/:id`)
- **Tables**: `advisor_registry`, `advisor_source_citations`, `advisor_simulation_runs`, deployment-readiness rows, knowledge & memory tables
- **CI gates**: `check-advisor-deployment-ready.ts`, `check-advisor-reversibility.ts`
- **Autonomy stack** (Phases 1–9 from previous loops): controllers, budgets, simulation receipts, reflections, boardroom kernel, standing missions, kill-switch — already wired and 62/62 tests passing

What is **missing** is the canonical per-advisor **Build Spec** as a single source of truth that the shell, the autonomy controllers, the test suite, the admin oversight surfaces, and humans can all read from. Today, advisor identity/mission/blocked actions live in the registry, but the 23-section spec (use cases, intelligence behaviors, output types, simulation contracts, automation level matrix, explainability requirements, analytics, admin oversight, testing matrix, DoD, phase roadmap, wow differentiators) is not codified.

This plan closes that gap.

---

## Architecture of the deliverable

For each of the 9 advisors we produce **three artifacts**, all kept in lockstep:

1. **`src/lib/ai-platform/specs/<advisor-id>.spec.ts`** — typed, machine-readable build spec (the 23 required sections as structured fields). Imported by the shell, the autonomy controllers, the analytics layer, and the CI gate. Single source of truth.
2. **`docs/advisors/<advisor-id>.spec.md`** — human-readable rendering of the same spec (long-form, exhaustive, "wow" framing). Generated from the `.ts` file by a one-shot script so they can never drift.
3. **`src/components/business-advisors/<domain>/<Advisor>SpecPanel.tsx`** — in-product "About this advisor" surface (mission, boundaries, what it can/can't do per automation level, wow differentiators, simulation contract, DoD checklist). Mounted as a 7th tab "Spec" in `AdvisorPageShell` so users can see what the advisor is, in product.

Cross-cutting infra (built once in Phase 0, then reused 9×):

- **`src/lib/ai-platform/specs/spec-types.ts`** — TypeScript contract for the 23 sections (Identity, Mission, Boundaries, UseCases, TypicalQuestions, ContextSources, IntelligenceBehaviors, OutputTypes, UISurfaces, OSIntegrationPoints, AutomationMatrix L0–L5, TrustRules, ExplainabilityRequirements, SimulationContract, MemoryRules, ProactiveBehavior, KnowledgeSources, AnalyticsEvents, AdminOversight, TestingMatrix, DoDChecklist, PhaseRoadmap{P1,P2,P3}, WowDifferentiators).
- **`src/lib/ai-platform/specs/index.ts`** — registry: `ADVISOR_SPECS` keyed by `BusinessAdvisorId`, with `getAdvisorSpec()` helper. Reused by shell + tests.
- **`src/components/business-advisors/AdvisorSpecPanel.tsx`** — generic renderer that takes a spec and renders the 23 sections with consistent visuals. Per-advisor `*SpecPanel.tsx` files pass their spec to this renderer (no duplicated UI).
- **`scripts/advisors/generate-advisor-spec-docs.ts`** — reads each `.spec.ts`, writes `docs/advisors/*.md`. Runs in CI to keep docs in sync.
- **`scripts/advisors/check-advisor-spec-completeness.ts`** — CI gate: every advisor in the registry must have a non-stub spec (every one of the 23 sections populated, automation matrix covers L0–L5, simulation contract present, DoD checklist has ≥10 items, etc.). Fails the build if any field is empty or marked `TODO`.
- **`AdvisorPageShell.tsx`** — add 7th tab "Spec" wired to `AdvisorSpecPanel`. Add a small "Authority · Risk · Phase" strip in the header reading from the spec.
- **`mem/architecture/advisor-build-specs.md`** — architecture memory entry so future loops know specs are the source of truth.

This means each advisor phase is "create one typed spec file + one per-advisor SpecPanel wrapper + verify it renders + verify it passes the completeness gate". No stubs, no duplicate UI, no parallel sources of truth.

---

## Phasing — strict sequential, no Phase N+1 until Phase N is 100% green

### Phase 0 — Spec infrastructure (must complete first)

- Create `spec-types.ts` (the 23-section contract)
- Create `specs/index.ts` registry skeleton
- Create generic `AdvisorSpecPanel.tsx` renderer
- Add "Spec" tab to `AdvisorPageShell.tsx` (rendered only when a spec exists for the advisor — empty-state honest)
- Create `check-advisor-spec-completeness.ts` CI gate (reads registry; for every advisor without a spec or with a stub field → fail)
- Create `generate-advisor-spec-docs.ts`
- Update `mem://architecture/advisor-build-specs.md` and add reference in `mem://index.md`
- Tests: `specs/__tests__/spec-types.test.ts` (validates the schema), `AdvisorSpecPanel.test.tsx` (renders all 23 sections with a fixture spec)

**Phase 0 done = ✅** when: gate exists and currently fails for all 9 advisors (proving it's wired), Spec tab renders empty-state cleanly for every advisor, infra tests pass.

### Phase 1 — Sales Advisor spec  *(build order #1, L3-draft, medium risk)*

- Author `specs/sales-advisor.spec.ts` (full 23 sections, no TODOs):
  - Wow framing: closer + pipeline strategist + objection coach
  - Simulation contract: script A/B, pricing angles, follow-up cadence
  - Automation matrix L0–L5 with explicit "never autonomous" set (uses existing `blockedActions`)
  - OS integration points: CRM, lead recovery, pipeline, quotes
  - Phase 1/2/3 roadmap and DoD checklist (≥12 items)
- Wire into `SalesAdvisorSpecPanel.tsx`
- Per-advisor tests: `sales-advisor.spec.test.ts` (passes completeness + renders + integrates with shell)
- Run `check-advisor-spec-completeness.ts` — must pass for sales-advisor; still fails for the other 8 (expected)

**Phase 1 done = ✅** when: Sales Advisor spec compiles, renders in Spec tab, passes the completeness gate, doc is generated, all tests green.

### Phase 2 — Customer Service Advisor *(L3-draft, medium)*

Same pattern. Wow framing: service-quality intelligence + issue detection + CSAT lift. Simulation contract: response policies, escalation patterns, refund thresholds (suggest only). Trust rules: never auto-send, never close ticket autonomously, never issue refund.

### Phase 3 — CFO Advisor *(L2-recommend, high, sensitive)*

Wow framing: scenario intelligence + cash discipline + financial clarity. Simulation contract: spend/hire/pricing scenarios with explicit non-authoritative banner. Trust rules tightened — never executes, never modifies budgets live. Explainability: every $ figure must cite source slice.

### Phase 4 — Marketing & Advertising Advisor *(L3-draft, medium)*

Wow framing: positioning + campaign architect + creative tester. Simulation contract: campaign direction A/B, channel mix, creative angles. Trust: drafts only, never launches paid.

### Phase 5 — Growth Advisor *(L2-recommend, medium)*

Wow framing: relentless opportunity engine, loops + cohorts + experiments. Simulation contract: experiment design, projected lift, cohort impact.

### Phase 6 — Tech Advisor *(L3-draft, medium)*

Wow framing: architecture strategist + tradeoff analyst + delivery realist. Simulation contract: implementation option compare, scaling scenarios. Trust: never deploys, never modifies infra.

### Phase 7 — Imports & Exports Advisor *(L2-recommend, high, sensitive)*

Wow framing: trade ops intelligence — sourcing, logistics, customs prep. Simulation contract: route/supplier/incoterm scenarios. Trust: never files customs, never commits supplier contracts.

### Phase 8 — Taxes & Laws Advisor *(L1-suggest, critical, sensitive, professional disclaimer ON)*

Wow framing: structured issue-spotter + preparation engine. Simulation contract: bounded "what if jurisdiction X / structure Y" with mandatory non-authoritative banner already enforced via `ProfessionalDisclaimerBanner.tsx`. Trust: never files, never gives legal advice; every output framed as preparation/issue-spotting.

### Phase 9 — CEO Advisor *(L2-recommend, high, sensitive — synthesis layer)*

Wow framing: cross-function executive synthesis + pressure-tester. Cross-advisor wiring: spec explicitly references the other 8 advisors' specs (via `synthesizesFrom: BusinessAdvisorId[]`) so the boardroom kernel + executive-synthesis capability key already wired in `business-advisor-runtime.ts` line 143 can read structured input. Simulation contract: strategic direction A/B with cross-domain impact map.

---

## Done-of-Done for each advisor phase (gating rule)

A phase is **only** complete when **all** of these are true:

1. `specs/<advisor>.spec.ts` exists, all 23 sections populated, no `TODO`/empty arrays
2. `<Advisor>SpecPanel.tsx` exists and is wired through `AdvisorSpecPanel`
3. Spec tab renders correctly on both OS (`/business-advisors/<id>`) and Mobile (`/mobile/business-advisors/<id>`)
4. `check-advisor-spec-completeness.ts` passes for that advisor
5. `check-advisor-deployment-ready.ts` (existing) still passes
6. `generate-advisor-spec-docs.ts` produced `docs/advisors/<id>.spec.md`
7. Per-advisor unit test passes (`specs/__tests__/<id>.spec.test.ts`)
8. The advisor's `blockedActions` in registry are reflected in the spec's TrustRules (cross-check enforced by the gate)
9. Automation matrix L0–L5 each have non-empty "can do" + "must not do" arrays
10. Simulation contract names at least one scenario type compatible with `runAdvisorSimulation`
11. No new `as any`, no inline raw colors (existing constraints)
12. Memory entry updated incrementally with the new advisor under "completed"

I will not advance to Phase N+1 until every item above is green for Phase N.

---

## Final deliverable

After all 10 phases (Phase 0 + 9 advisors):

- One typed registry of 9 deeply-specified advisors driving the shell, autonomy stack, boardroom kernel, simulation runner, and admin oversight
- Generated long-form Markdown specs in `docs/advisors/`
- Two CI gates protecting against drift (deployment + spec completeness)
- Recommended build order is encoded by `buildOrder` in the registry; this plan honors it (Sales → CS → CFO → Marketing → Growth → Tech → I/E → Taxes → CEO), with **Sales Advisor as the first to ship** because pipeline/CRM context is already richest in the existing context loader and it has the highest immediate operator ROI under the L3-draft authority ceiling.

Approve this plan and I'll execute Phase 0 first (infrastructure + gate), confirm green, then build Sales Advisor end-to-end before moving to Customer Service, and so on — strictly one phase at a time.