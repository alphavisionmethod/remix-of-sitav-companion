
# SITA OS — Production-Truth Enforcement Plan

## Context discovered (read-only audit)

The repository **already has the canonical infrastructure**:

- `src/modules/business/PRODUCTION_TRUTH_MANIFEST.ts` — declares each Business page as `fully-wired | degraded | hidden` (54 entries).
- `scripts/architecture/check-business-truth.ts` — CI guardrail that validates pages against the manifest.
- `src/__tests__/business-os/pages/business-page-state-grammar.test.ts` — debt-tracking baseline for state grammar (only ratchets down).
- `src/platform/sita/components/sita/PageTruthBanner.tsx` — canonical Live/Demo/Partial/Connecting/Degraded banner.
- `src/platform/sita/components/sita/EmptyState.tsx` + `PremiumEmptyState` + `EmptyStateCard` + `LegacyEmptyStateCard` + `ConciergeEmptyState` — canonical empty primitives.
- `src/lib/ui/state-renderer.tsx` + `src/lib/reality/page-state-contract.ts` — canonical page-state grammar (loading/empty/error/degraded/permission-denied).
- `src/hooks/usePageData.ts` — canonical query → state resolver.
- `src/contexts/AuthContext` + `useRealityModeSafe()` — canonical auth + demo gating.

**No new parallel systems will be created.** Every change extends one of these.

## Confirmed truth gaps (must be closed)

### Tier-1 fake-live leaks (priority — manifest currently misclassifies these as `fully-wired`)
1. **`RevenueImpactDashboard`** — `generateTrend()` (line 53) emits **random fake numbers every render** even for authenticated users; `+X% vs target` badge computed from fake totals. `realRevenue` from invoices is fetched but only used as one branch; demo trend always renders.
2. **`LeadsInbox`** (via `useLeadInbox`) — falls back to `FALLBACK_INBOX_ITEMS` for **authenticated users with empty inbox** (line 33 of `useLeadInbox.ts`). Fake-live for any new account.
3. **`LeadRecovery`** — always uses `RECOVERY_CANDIDATES` mock (line 39). No demo gate, no real hook, no empty state.
4. **`ExecutionDesk`** (finance) — `setTimeout(() => setStatus("done"), 2500)` fakes trade execution (line 122). `liveData` is fetched but unused. Hardcoded `INSTRUMENTS`/`PLATFORM_CONNECTIONS`. Surface implies real execution.
5. **`PortfolioOffice` + 18 sister investment-office pages** — `usePortfolioPositions/useTradeOrders/etc.` fetched then **completely ignored**; render fixtures (`PORTFOLIO`, `SAMPLE_THESES`, `SPARKLINE_DATA`).

### Tier-2 honest-degraded surfaces that still render fake-live data
6. **`WebsiteBuilder`** — manifest says `degraded`, page renders `$52.4K revenue / 64 leads / A/B winners` static rows. Should render setup-required UI.
7. **`SocialCommand`** — manifest says `degraded`, page renders fake follower counts / scheduled posts / DM threads.
8. **`EcommerceManager`** — manifest says `degraded`, page renders fake `$2,847 today / 43 orders / Sarah Johnson`. Shopify connector exists at platform level but not wired.

### Tier-3 missing module manifests
9. **No `CONCIERGE_TRUTH_MANIFEST`** — Concierge pages have good `ConciergeEmptyState` patterns but no production-truth declaration.
10. **No `FINANCE_TRUTH_MANIFEST`** — Finance/Investment Office is the largest fake-live surface with zero classification.

### Tier-4 audit checker is too lenient
11. `check-business-truth.ts` doesn't catch:
    - Imports of `@/data/fixtures/mock-data/*` consumed unconditionally in `fully-wired` pages.
    - Fetched-but-unused `useQuery` results (the `liveData` ignored anti-pattern).
    - `setTimeout` "fake execute" patterns.
    - Pages declared `degraded` that still render hardcoded numeric KPIs.

## Plan — 8 phases, strict order, no skipping

Each phase has explicit completion criteria. **Next phase does not start until previous one passes its full gate.**

---

### Phase 1 — Tier-1 Fake-Live Removal (Business)

Fix the four highest-risk Business surfaces that masquerade as live.

**Changes**
- `src/modules/business/components/business/lead-inbox/useLeadInbox.ts`: Replace authenticated-fallback-to-`FALLBACK_INBOX_ITEMS` with empty array; gate fixture path **only** on `useRealityModeSafe().isDemo`. Surface `isDemo` honestly.
- `src/modules/business/pages/LeadsInbox.tsx`: When authenticated + empty + not-demo → render `EmptyState` ("No leads in your inbox yet — connect a lead source or add manually") with action linking to integrations.
- `src/modules/business/pages/LeadRecovery.tsx`: Remove unconditional `RECOVERY_CANDIDATES` import. Read from new hook `useLeadRecoveryCandidates` (extends existing `recovery-engine.service`). In demo mode → show fixture; in live + empty → honest empty state; in live + data → render real candidates.
- `src/modules/business/pages/RevenueImpactDashboard.tsx`: Remove `generateTrend()` and `pieData`-from-empty-PLAYBOOK_REVENUE patterns. Use only `realRevenue` from `recovered_value_ledger` aggregation. Loading skeleton via existing `PageSkeleton`. Empty → `EmptyState` ("No revenue impact recorded yet — autopilot playbooks will populate this dashboard"). Remove fake `+X% vs target` badge.
- `src/modules/business/pages/CollectionsCommandCenter.tsx`: Add explicit empty/loading state grammar (currently relies on `accounts = []` silent fallback). Honest empty when no accounts.

**Phase 1 Gate (all must pass)**
- `bunx tsx scripts/architecture/check-business-truth.ts` exits 0.
- `bunx vitest run src/__tests__/business-os/` passes.
- `tsc --noEmit` clean.
- `rg "FALLBACK_INBOX_ITEMS|RECOVERY_CANDIDATES|generateTrend"` returns zero matches inside `src/modules/business/pages/` and `src/modules/business/components/business/lead-inbox/useLeadInbox.ts` (allowed only inside `src/data/fixtures/`).

---

### Phase 2 — Honest-Degraded Conversion (Website / Social / Ecommerce)

Convert the three Tier-2 surfaces to true setup-required UIs that match their `degraded` manifest declaration. **No invented numbers.**

**Changes**
- `src/modules/business/pages/WebsiteBuilder.tsx`: Rewrite to show:
  - `PageTruthBanner truthState="partial"` (already supported).
  - `EmptyStateCard` with title "Connect a website provider" and `ctaPath="/business/integrations"` listing available connectors (Webflow / Framer / WordPress / Custom DNS).
  - Below the empty state: a **read-only preview block** of what becomes available once connected (no fake numbers — descriptive text only, e.g. "Once connected, this surface will show Sites, A/B Tests, SEO Rankings, Heatmaps").
  - Remove all hardcoded `sites`, `abTests`, `seoKeywords`, `heatmapData`, `templates` arrays.
- `src/modules/business/pages/SocialCommand.tsx`: Same treatment. Remove hardcoded `platforms`, `scheduled`, `topPerforming`, `hashtags`, `comments`, `competitors`. Replace with setup-required + descriptive preview.
- `src/modules/business/pages/EcommerceManager.tsx`: Same treatment. Detect existing Shopify connection via `standard_connectors` listing (canonical hook) — if connected, show `connecting` banner + empty awaiting first sync; if not connected, show setup-required.

**Phase 2 Gate**
- `rg "(?:^|\s)const\s+[A-Z_]+\s*=\s*\[\s*\{" src/modules/business/pages/{WebsiteBuilder,SocialCommand,EcommerceManager}.tsx` returns zero matches.
- New Vitest spec `src/__tests__/business-os/pages/honest-degraded.test.tsx` asserts each renders the setup-required EmptyState and no hardcoded numeric values.
- Manifest banner state remains `partial`. PageTruthBanner renders correctly.
- `tsc --noEmit` + business-truth checker pass.

---

### Phase 3 — Audit Guard Hardening

Strengthen `check-business-truth.ts` so Tier-1/2/3 patterns can never re-enter.

**Changes (extend, do not duplicate)**
- Extend `scripts/architecture/check-business-truth.ts` with:
  - **Rule 5 (no-mock-fixture-import-in-fully-wired)**: A `fully-wired` page must not unconditionally import from `@/data/fixtures/mock-data/*` unless the import is gated by `useRealityModeSafe().isDemo` or `isDemo` in the same file.
  - **Rule 6 (no-fake-execute)**: `setTimeout(.*set(?:Status|State|Progress).*"(?:done|complete|success)"|setTimeout\(\(\)\s*=>\s*set[A-Z]\w+\("(?:done|complete|success)"\))` triggers a violation in `fully-wired` pages.
  - **Rule 7 (degraded-must-render-empty)**: A `degraded` page must contain `EmptyStateCard|EmptyState|PremiumEmptyState|setup-required|connect` and must not contain top-level fake-live arrays.
  - **Rule 8 (fetched-but-unused-query)**: Detect `const { data: liveData } = use…()` followed by no `liveData` reference further in the file → warning (informational, not blocking, to allow whitelisted exceptions).
- Wire the script into `.github/workflows/check-boundaries.yml` (already exists from Phase 7 of prior program).

**Phase 3 Gate**
- New rules implemented, pre-existing pages still pass (Phase 1 + 2 must have already removed every violation).
- New Vitest spec `src/__tests__/business-os/architecture/business-truth-audit-rules.test.ts` covers each new rule with positive + negative fixtures.
- CI workflow updated and green.

---

### Phase 4 — Concierge Production-Truth Manifest

Create the Concierge equivalent of the Business truth system.

**Changes**
- New file `src/modules/concierge/PRODUCTION_TRUTH_MANIFEST.ts` modeled exactly on the Business manifest. Classify all 22 Concierge pages.
  - Most are already `fully-wired` (good `ConciergeEmptyState` patterns, real hooks `useErrands`, `useReservations`, etc.).
  - Identify any that should be `degraded` (e.g. provider/event surfaces lacking real data sources).
- New file `scripts/architecture/check-concierge-truth.ts` — identical structure to business checker, importing the new manifest, applying the same 8 rules.
- For any page found violating, do one of:
  - Wire it (Concierge mostly has empty-state grammar already).
  - Mark `degraded` with honest reason.
  - Mark `hidden` if not exposed in IA.
- New Vitest spec `src/__tests__/concierge/concierge-page-state-grammar.test.ts` mirroring the business one.

**Phase 4 Gate**
- `bunx tsx scripts/architecture/check-concierge-truth.ts` exits 0.
- New tests pass.
- Manifest covers 100% of `src/modules/concierge/pages/*.tsx`.

---

### Phase 5 — Finance / Investment Office Production-Truth Manifest

The largest fake-live surface area. Same canonical pattern.

**Changes**
- New file `src/modules/finance/PRODUCTION_TRUTH_MANIFEST.ts`. Classify:
  - **`fully-wired`**: pages already using real hooks correctly (e.g. `MoneyOverview`, `WealthCommandCenter`, `EventProbabilityLab`).
  - **`degraded`** (most investment-office pages): `PortfolioOffice`, `MarketExplorer`, `RiskOffice`, `ResearchLibrary`, `InvestmentBoardroom`, `WatchlistsSignals`, `TradingFloor`, `WarRoom`, `OpportunityMap`, `ConvictionEngine`, `DecisionTheater`, `DecisionReadiness`, `ThesisJournal`, `IntelligenceDossier`, `InvestmentConstitution`, `CrossAssetStoryEngine`, `DisagreementEngine`, `EventMarketsWorkspace`, `FamilyOffice` — they fetch real data but render fixtures. Mark each `degraded` with honest reason ("Awaiting brokerage connector — preview shows reference layout").
  - **`hidden`**: surfaces that overclaim (e.g. `ExecutionDesk` → reclassify as `hidden` until real broker execution exists, OR rewrite as honest "Trade Prep" surface that produces a draft order with no fake-execute).
- For each `degraded` page in investment-office: replace the fixture-driven KPI/holdings block with:
  - A "Awaiting brokerage data" `EmptyStateCard` when `liveData` is empty.
  - When `liveData.length > 0`: render real data via the already-fetched hook.
  - Keep the descriptive layout but remove invented numbers.
- `ExecutionDesk`: rewrite to "Trade Prep Workbench" — generates a draft order saved to `trade_orders` with `status='draft'`, **no setTimeout**. Or mark `hidden` and remove from routes — decided per the new finance manifest.
- New file `scripts/architecture/check-finance-truth.ts` (same pattern).
- New Vitest spec `src/__tests__/finance/finance-page-state-grammar.test.ts`.

**Phase 5 Gate**
- All three module truth checkers exit 0 (`business`, `concierge`, `finance`).
- `rg "PORTFOLIO|SAMPLE_THESES|SPARKLINE_DATA|PERFORMANCE_TIMELINE"` returns zero unconditional consumers in `src/modules/finance/pages/` (only fixture files may export them).
- Investment-office pages render honest empty when `liveData` is empty for authenticated users.
- `tsc --noEmit` clean.

---

### Phase 6 — Route & Navigation Honesty

Make sure no route advertises a surface that is `hidden` in any of the three manifests, and that `degraded` surfaces carry an honest hint in nav.

**Changes**
- New helper `src/routes/registry/truth-aware-route-helpers.ts` (small, additive — extends existing `route-family-registry.ts`):
  - `isHiddenInTruthManifest(pagePath: string): boolean` — checks all three manifests.
  - `getDegradedReason(pagePath: string): string | undefined`.
- Update launchers / sidebars (`src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx`, concierge equivalent, finance investment-office shell):
  - Skip nav entries pointing at `hidden` pages.
  - Append a small "Setup needed" badge on entries pointing at `degraded` pages (using the existing `Badge` primitive).
- Remove route declarations for any page reclassified as `hidden`.
- New Vitest spec `src/__tests__/architecture/truth-aware-navigation.test.ts`: asserts every nav entry points at a page that is **not** `hidden`, and that `degraded` entries either carry a setup hint or open a setup-required surface.

**Phase 6 Gate**
- All nav/launcher tests pass.
- `tsc --noEmit` clean.
- Routes for any newly `hidden` surfaces removed; redirects added in `src/routes/redirects/user-redirect-map.ts` if needed.

---

### Phase 7 — Trust / Approval Surface Honesty

For pages implying execution, automation, scheduling, or proof, ensure the trust layer is wired or the implied execution is removed.

**Changes**
- Audit `BusinessAdvisorBoardPage`, `AutopilotHub`, `RevenueAutopilot`, `BackgroundTaskCenter`, `LeadRecovery` for action-button truth.
- For each "Execute / Approve / Send" action that is **not actually wired** to a real edge function, either:
  - Wire it through the canonical `useAction` hook + existing trust pipeline.
  - Replace it with a `disabled` button + tooltip ("Approval pipeline not yet provisioned for this action") and add the page to its module's `degraded` set.
- Verify Receipts / Proof tabs read from `ai_action_receipts` (already true on most surfaces).
- New Vitest spec `src/__tests__/business-os/trust-surface-honesty.test.tsx` — for each `fully-wired` page, every visible action button must either invoke a real mutation or be `disabled`/`aria-disabled`.

**Phase 7 Gate**
- Trust honesty test passes.
- Production-truth manifests updated for any pages whose state changed.
- All three module checkers green.

---

### Phase 8 — Final Report + Deployment Gate

**Changes**
- Generate `SITA_OS_PRODUCTION_TRUTH_ENFORCEMENT_REPORT.md` at repo root with:
  - Per-page final classification (Business / Concierge / Finance).
  - Wiring improvements per surface (old problem → new truth state).
  - Fake-live removals enumerated with file:line references.
  - Route/nav exposure changes.
  - Tests added/updated.
  - Remaining future-facing surfaces (with explicit reasons + tracking issue link if applicable).
- Update `src/domains/ARCHITECTURE.md` to reference the three-module truth manifest system as canonical.
- Add memory entry `mem://constraints/production-truth-enforcement.md` capturing the rules:
  - Every visible surface in Business / Concierge / Finance MUST be classified in its module's `PRODUCTION_TRUTH_MANIFEST`.
  - `fully-wired` pages MUST NOT import from `@/data/fixtures/mock-data/*` unconditionally.
  - `degraded` pages MUST render an `EmptyStateCard` and MUST NOT render hardcoded KPI numbers.
  - `hidden` pages MUST NOT appear in any nav / launcher / route.
- Update `mem://index.md` to add this rule.

**Phase 8 Gate (final deployment-readiness gate)**
- All three module truth checkers exit 0.
- All new + existing Vitest specs pass.
- `tsc --noEmit` clean.
- `bunx tsx scripts/architecture/check-engine-purity.ts` clean (Phase 4 of previous program, must remain green).
- `bunx tsx scripts/architecture/audits/check-no-empty-domain-barrels.ts` clean.
- `bunx tsx scripts/architecture/audits/check-investment-route-namespace.ts` clean.
- Final report written.
- Memory updated.

---

## Files involved (summary)

### Modified (existing canonical files extended)
- `src/modules/business/pages/LeadsInbox.tsx`
- `src/modules/business/pages/LeadRecovery.tsx`
- `src/modules/business/pages/RevenueImpactDashboard.tsx`
- `src/modules/business/pages/CollectionsCommandCenter.tsx`
- `src/modules/business/pages/WebsiteBuilder.tsx`
- `src/modules/business/pages/SocialCommand.tsx`
- `src/modules/business/pages/EcommerceManager.tsx`
- `src/modules/business/components/business/lead-inbox/useLeadInbox.ts`
- `src/modules/finance/pages/investment-office/ExecutionDesk.tsx`
- `src/modules/finance/pages/investment-office/PortfolioOffice.tsx` (+ ~18 sister pages)
- `scripts/architecture/check-business-truth.ts`
- `src/routes/registry/route-family-registry.ts`
- `src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx` (+ concierge / finance app shells)
- `src/domains/ARCHITECTURE.md`
- `mem://index.md`

### Created (new canonical, no parallel systems)
- `src/modules/concierge/PRODUCTION_TRUTH_MANIFEST.ts`
- `src/modules/finance/PRODUCTION_TRUTH_MANIFEST.ts`
- `scripts/architecture/check-concierge-truth.ts`
- `scripts/architecture/check-finance-truth.ts`
- `src/routes/registry/truth-aware-route-helpers.ts`
- `src/__tests__/business-os/pages/honest-degraded.test.tsx`
- `src/__tests__/business-os/architecture/business-truth-audit-rules.test.ts`
- `src/__tests__/business-os/trust-surface-honesty.test.tsx`
- `src/__tests__/concierge/concierge-page-state-grammar.test.ts`
- `src/__tests__/finance/finance-page-state-grammar.test.ts`
- `src/__tests__/architecture/truth-aware-navigation.test.ts`
- `src/hooks/use-lead-recovery-candidates.ts` (new canonical hook over existing `recovery-engine.service`)
- `SITA_OS_PRODUCTION_TRUTH_ENFORCEMENT_REPORT.md`
- `mem://constraints/production-truth-enforcement.md`

### Removed
- Hardcoded fixture arrays inside the Tier-2 pages (moved/already exist under `src/data/fixtures/`).
- Any route registration for surfaces reclassified as `hidden` (Phase 6).

## Duplication-avoidance summary

| Need | Reused canonical |
|---|---|
| Empty / setup state | `EmptyState`, `EmptyStateCard`, `PremiumEmptyState`, `ConciergeEmptyState` |
| Truth banner | `PageTruthBanner` |
| Page state grammar | `usePageData`, `StateRenderer`, `PAGE_STATE_CONTRACTS` |
| Auth + demo gating | `useAuth`, `useRealityModeSafe` |
| Per-module classification | `PRODUCTION_TRUTH_MANIFEST` (extended to concierge + finance) |
| CI guardrail | `check-business-truth.ts` (extended + cloned to concierge/finance) |
| Action wiring | `useAction` |
| Receipts/proof | `ai_action_receipts` table + existing `ProofTimelinePanel` |
| Trust mode | existing `TrustModeIndicator` |

No parallel page-state system, no parallel banner system, no parallel manifest schema.

## Hard rule

**Each phase ends with all gate items GREEN. If any gate item fails, that phase is not complete and the next phase does not start.** The user's directive — "no duplicates, no stubs, do a plan in phases and don't continue to the next phase until you have 100% completed the previous one ready for deployment" — is the binding constraint throughout.
