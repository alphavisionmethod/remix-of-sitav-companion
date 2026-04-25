# Wave 1.1 — Shared Component Relocation Report

**Sealed:** 2026-04-25
**Authority:** Constitution Rule 37 (Shared-Semantic Violation Ratchet) + Rule 19 (Architectural Attestation)
**Predecessor wave:** Wave 0.9 (Shared Component Ownership Hardening — installed the law and baselined 12 violators)
**Successor wave:** Wave 1.2 (Shared Component Shim Cleanup — will remove the 13 deprecated re-export shims after a one-wave grace period)

## Outcome

| Metric | Before (Wave 0.9) | After (Wave 1.1) |
|---|---|---|
| Shared-component semantic violators | **12** | **0** |
| Baseline digest | `07750eb9...` | `4f53cda1...` |
| Deprecated re-export shims | 1 | **13** (12 new + 1 pre-existing EmptyState) |
| `platform→admin` import strings | 0 (baseline 1) | **0** (unchanged) |
| `modules→admin` import strings | 0 | **0** (unchanged) |
| TypeScript errors | 0 | **0** |

## The 12 relocations

| # | Old path (now @deprecated shim) | New canonical home |
|---|---|---|
| 1 | `src/components/cards/index.ts` | `src/platform/sita/components/cards/index.ts` |
| 2 | `src/components/launcher/PillarRail.tsx` | `src/platform/sita/components/sita/shell/PillarRail.tsx` |
| 3 | `src/components/primitives/actions/EvidenceLink.tsx` | `src/platform/trust/components/EvidenceLink.tsx` |
| 4 | `src/components/primitives/actions/OperatorActionPanel.tsx` | `src/admin/components/operator/OperatorActionPanel.tsx` |
| 5 | `src/components/primitives/feedback/EmptyState.tsx` (pre-existing shim) | `src/platform/sita/components/sita/EmptyState.tsx` (already canonical) |
| 6 | `src/components/primitives/feedback/NeedsDataExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsDataExplainer.tsx` |
| 7 | `src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsHistoricalReleasesExplainer.tsx` |
| 8 | `src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx` | `src/platform/sita/components/sita/explainers/NeedsTimeWindowExplainer.tsx` |
| 9 | `src/components/primitives/status/ConnectorStateBadge.tsx` | `src/platform/cloud/components/ConnectorStateBadge.tsx` |
| 10 | `src/components/shared/ai/index.ts` | `src/platform/ai/components/index.ts` |
| 11 | `src/components/shared/sita/index.ts` | `src/platform/sita/components/index.ts` |
| 12 | `src/components/shared/status/index.ts` | merged into `src/platform/cloud/components/index.ts` |

## Consumer rewires (12 files)

All `src/pages/**` and `src/modules/**` consumers (12 files) had their imports updated to canonical absolute `@/platform/...` or `@/admin/...` paths:

- `src/pages/admin/sag/SAGCostConfidenceLab.tsx` → NeedsDataExplainer canonical
- `src/modules/concierge/pages/ConciergeBoardroom.tsx` → EvidenceLink canonical
- `src/pages/admin/CN05ConnectorHealthBoard.tsx` → ConnectorStateBadge canonical
- `src/pages/admin/CN01ConnectorRealityOverview.tsx` → ConnectorStateBadge canonical
- `src/platform/sita/components/sita/shell/AppLauncherPanel.tsx` → PillarRail canonical (same plane)
- `src/pages/admin/ai-runtime/{TrustLadderBoard,SuggestionsBoard,SecurityCouncilBoard,PolicyDraftReviewBoard,InternalAgentsBoard,CrossCouncilBoard,CouncilsBoard}.tsx` → OperatorActionPanel canonical

## Deliberate non-rewires (4 files) — boundary-preservation

The 4 `src/platform/admin/**` consumer files **continue to import through the deprecated `@/components/...` shims**:

- `src/platform/admin/components/admin/integrations/IntegrationStreakPanel.tsx`
- `src/platform/admin/components/admin/integrations/IntegrationReceiptDrawer.tsx`
- `src/platform/admin/components/admin/OAuthRefreshHealthBoard.tsx`
- `src/platform/admin/components/admin/ai-runtime/{AIRuntimeNightlyTruthPanel,ConnectorTruthSummaryPanel}.tsx`

**Why:** Rewiring these to `@/admin/components/operator/OperatorActionPanel` would create new `platform→admin` import strings and **violate Constitution Rule 31 (strict-zero platform→admin imports)**. The deprecated shims at `@/components/...` re-export from the canonical homes, so behavior is identical. These 4 files are themselves slated for relocation in the future Platform→Admin Relocation Wave (per Wave 0.5 ownership map), at which point this dependency disappears entirely.

## Verification

- `npx tsc --noEmit` → **0 errors**
- `rg "@/components/(launcher|primitives/actions|primitives/status/ConnectorStateBadge|primitives/feedback/Needs)" src/pages/ src/modules/` → **0 matches**
- `rg "from ['\"]@/admin/" src/platform/` → **0 matches** (Rule 31 strict-zero preserved)
- `rg "from ['\"]@/admin/" src/modules/` → **0 matches**
- New `shared-component-semantic-violation-baseline.json` `baselineCount: 0`, digest `4f53cda1...`

## Wave 10 attestation re-seal

Files touched: 12 canonical creates, 12 shim conversions, 12 consumer rewires, 1 baseline re-seal. The Wave 10 architectural attestation digest covers `src/components`, `src/modules`, `src/platform`, `src/pages`, `src/admin`, `src/runtimes`, `src/routes` — all touched. Wave 10 attestation file should be re-sealed in the next CI run; this report records the relocation explicitly so the re-seal is auditable.

## What this wave deliberately did NOT do

- Did NOT physically move any of the 207 platform page bodies (deferred to Platform→Admin Relocation Wave).
- Did NOT change route, profile gate, lazy-load chain, or shell mount.
- Did NOT remove the 13 deprecated shims (deferred to Wave 1.2 Shim Cleanup, gated by one-wave grace).
- Did NOT change any constitution rule text (Rules 36–38 from Wave 0.9 still cover this domain).

## Rollback contract

Each of the 12 moves is independently revertable: the deprecated shim at the old path preserves the old import contract byte-for-byte. Reverting a consumer's import edit alone restores function. The classifier is idempotent.