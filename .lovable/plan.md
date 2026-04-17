

The user wants ISS-020 (`as any` usage in pages) fully resolved — replace all page-level `as any` casts with proper types so it can be marked DONE in the audit doc.

Let me first scope the actual surface so the plan is accurate.
<lov-tool-use id="toolu_vrtx_01UuDsBFX44AdcReKs4ygXRZ" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && grep -rEn \\\"\\\\bas any\\\\b\\\" src/pages --include=\\\"*.tsx\\\" --include=\\\"*.ts\\\" | wc -l && echo \\\"---FILES---\\\" && grep -rlE \\\"\\\\bas any\\\\b\\\" src/pages --include=\\\"*.tsx\\\" --include=\\\"*.ts\\\" | wc -l\", \"user_facing_description\": \"Counting remaining `as any` usages in pages\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01E7VCVV4EWGHCLnGRDbKPE7" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && echo \\\"===INSTANCE COUNT===\\\" && grep -rEn \\\"\\\\bas any\\\\b\\\" src/pages --include=\\\"*.tsx\\\" --include=\\\"*.ts\\\" | wc -l && echo \\\"===FILE COUNT===\\\" && grep -rlE \\\"\\\\bas any\\\\b\\\" src/pages --include=\\\"*.tsx\\\" --include=\\\"*.ts\\\" | wc -l && echo \\\"===TOP FILES===\\\" && grep -rcE \\\"\\\\bas any\\\\b\\\" src/pages --include=\\\"*.tsx\\\" --include=\\\"*.ts\\\" | grep -v \\\":0$\\\" | sort -t: -k2 -nr | head -25\", \"user_facing_description\": \"Auditing the real scope of remaining `as any` casts in pages\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01MXFQUqkKgGpQdLr4ygDDH9" name="code--exec" integration-id="code" data="{\"command\": \"cd /dev-server && echo \\\"=== CommunicationHub ===\\\" && grep -nE \\\"\\\\bas any\\\\b\\\" src/pages/admin/CommunicationHub.tsx & \\\\\\ncd /dev-server && echo \\\"=== ErrandsLogistics ===\\\" && grep -nE \\\"\\\\bas any\\\\b\\\" src/pages/concierge/ErrandsLogistics.tsx & \\\\\\ncd /dev-server && echo \\\"=== PLE02LawRegistry ===\\\" && grep -nE \\\"\\\\bas any\\\\b\\\" src/pages/admin/platform-law/PLE02LawRegistry.tsx & \\\\\\ncd /dev-server && echo \\\"=== ITC04WiringGraph ===\\\" && grep -nE \\\"\\\\bas any\\\\b\\\" src/pages/admin/implementation-truth/ITC04WiringGraph.tsx & \\\\\\ncd /dev-server && echo \\\"=== ConscienceGateDashboard ===\\\" && grep -nE \\\"\\\\bas any\\\\b\\\" src/pages/admin/ConscienceGateDashboard.tsx & \\\\\\nwait\", \"user_facing_description\": \"Inspecting top offenders to understand the cast patterns\"}">
</lov-tool-use>
I have enough context. Let me check the ConscienceGateDashboard details to understand the cleanest fix pattern, then present the plan.
<lov-tool-use id="toolu_vrtx_01E7qWHBFj69pzcGW1zHN81M" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/admin/ConscienceGateDashboard.tsx\", \"lines\": \"1-60\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_012hE4x4VQ3prpYMPd1f1H4W" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/admin/CommunicationHub.tsx\", \"lines\": \"1-60\"}">
</lov-tool-use>
I have what I need. Now let me present a focused, deployment-ready plan to eliminate ISS-020.

<lov-plan>

## Plan — Eliminate ISS-020 (`as any` in pages) — Production-Grade Cleanup

### Current truth (just verified)

| Metric | Value |
|---|---|
| Page files containing `as any` | **72** (was 68 — drift since v5.1) |
| Total `as any` instances in pages | **135** |
| Top offender | `src/pages/admin/CommunicationHub.tsx` (12) |
| Concentration | Top 15 files account for ~70 of 135 instances |

### Root-cause patterns (3 categories cover ~95% of casts)

1. **Untyped JSON columns from Supabase** (e.g. `(status as any)?.health`, `(posture as any)?.devices`) — generated `Database` types return `Json` for `jsonb` fields. Fix: declare explicit interface + safe accessor.
2. **Domain type widening for demo/seed data** (e.g. `"R2" as any` for `RiskClass`, `"sufficient" as any` for `EvidenceState`) — actual literal unions exist in `@/lib/core-services/conscience-gate/conscience-gate`. Fix: import + use the literal types directly (no cast needed).
3. **shadcn `<select>` value handlers** (e.g. `setCatFilter(e.target.value as any)`) — Fix: cast at the typed boundary using the existing union (e.g. `as Severity`) or use `Select` from `@/components/ui/select` with typed `onValueChange`.

### Strategy — surgical, batch by pattern, zero behavior change

**Batch 1 — Top 5 files (40 instances, ~30%)**
- `src/pages/admin/CommunicationHub.tsx` — define `SystemStatus`, `SecurityPosture`, `SyncStatus` interfaces; remove all 12 casts
- `src/pages/concierge/ErrandsLogistics.tsx` — extend `Errand` view-model with `status`, `dueDate`, `bundleId`; remove all 10 casts
- `src/pages/admin/platform-law/PLE02LawRegistry.tsx` — type `BadgeVariant` union for `sevColor`; type select `onChange` with literal unions; remove all 5
- `src/pages/admin/implementation-truth/ITC04WiringGraph.tsx` — replace `"R2" as any` etc. with the proper imported literal types from `conscience-gate`; type `edge` extras via interface extension; remove all 5
- `src/pages/admin/ConscienceGateDashboard.tsx` — use `RiskClass`, `EvidenceState`, `BudgetState`, `RoutingHints` from canonical type module; replace `as any` with the literal unions; remove all 5

**Batch 2 — Mid-tier (28 instances across 10 files)**
- `PLT05ViolationTriage`, `AIG04BudgetCenter`, `CampaignOrchestrator`, `CRMPipeline`, `CRMNotes`, `PLE04CIGateMonitor`, `HQApprovalQueue`, `FCC01FounderCommandConsole`, `AIEngineeringBoard`, `Boardroom`
- Pattern: introduce one local view-model interface per page + use existing domain unions for badge variants and select handlers.

**Batch 3 — Tail (~67 instances across 57 files, ≤2 per file)**
- Mechanical sweep: replace `(x as any).field` with typed accessor `(x as Record<string, unknown>).field` only when the JSON shape is genuinely opaque, otherwise add a one-line `interface` at the top of the file.
- Replace `e.target.value as any` in `<select>` handlers with the correct literal union or `Select` `onValueChange`.

### Guardrails

- **No behavior changes.** Pure type tightening — runtime identical.
- **No `unknown` shotgun.** Each cast becomes a real interface or imported domain type.
- **Build must stay green.** Validate with TS noEmit after each batch.
- **Re-add a CI check** in `scripts/architecture/checks/check-platform-anti-patterns.ts`: lower the `as any` threshold from `>3` per file to `>0` for `src/pages/**` once Batch 3 lands.
- **Update `generated/FULL_ISSUES_AND_FIXES.md`**: flip ISS-020 / OPN-P2-04 status from "IN PROGRESS" to "RESOLVED" only after `grep -rE "\bas any\b" src/pages | wc -l` returns `0`.

### Files touched

- ~72 page files under `src/pages/**` (additive interfaces, removed casts only)
- 1 governance check: `scripts/architecture/checks/check-platform-anti-patterns.ts` (tighten rule)
- 1 doc: `generated/FULL_ISSUES_AND_FIXES.md` (mark ISS-020 / OPN-P2-04 resolved)

### Acceptance criteria

| Check | Target |
|---|---|
| `grep -rE "\bas any\b" src/pages \| wc -l` | **0** |
| `tsc --noEmit` | **0 errors** |
| Phase 32 "It's Real" gate | **stays 13/13 green** |
| Anti-pattern check on `src/pages/**` | **0 violations** at threshold `>0` |
| ISS-020 / OPN-P2-04 in `FULL_ISSUES_AND_FIXES.md` | **removed from open register** |

### Out of scope (explicit)

- `src/lib/**`, `src/components/**`, `src/hooks/**` `as any` casts (separate effort, not part of ISS-020)
- Behavior changes, refactors, or feature additions
- Rewriting Supabase generated types

