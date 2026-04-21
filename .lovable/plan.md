

## Wave 18 — Advisor Boardroom Behavioral Closure Validators

### Summary

The advisor and boardroom governance layer is already **comprehensively implemented** across 13 canonical policy files, a unified runtime contracts package, edge function governance, and 13 proof artifacts. No new policy files, registries, identity contracts, or governance logic need to be created — all 19 steps from the prompt are already addressed by existing canonical implementations.

The single remaining gap is **validation scripts** — dedicated validators that verify the governance contracts are complete, consistent, and deployment-ready. Currently only `check-advisor-registry.ts` exists. This wave creates 12 focused validators in `scripts/advisors/` and registers them in the release-readiness aggregator.

### Part 1 — Canonical Systems to Preserve (No Changes)

These files are complete and require no modification:

**Policy Files (src/lib/advisors/):**
- `advisor-identity-registry.ts` — 34 advisors with full governance fields
- `advisor-persona-boundary-map.ts` — 7 high-risk advisor boundaries
- `advisor-confidence-policy.ts` — 8 confidence gates
- `advisor-debate-orchestrator.ts` — debate policy with consensus/majority/escalation
- `advisor-conflict-resolution-policy.ts` — 6 conflict resolution rules
- `advisor-disablement-policy.ts` — 6 disablement reasons with fallback behaviors
- `advisor-memory-aging-policy.ts` — 4-layer memory aging
- `advisor-reflection-policy-loop.ts` — reflection-to-policy adjustments
- `advisor-override-model.ts` — 7 override scopes with audit requirements
- `advisor-support-diagnostics.ts` — 16-field diagnostic snapshots

**Runtime Contracts (src/lib/ai-platform/runtime/):**
- `advisor-permission-matrix.ts` — 6-role permission matrix
- `advisor-escalation-policy.ts` — 8 escalation rules
- `advisor-reversibility-map.ts` — 12 action type reversibility entries

**Unified Package (src/packages/advisor-runtime-contracts/):**
- `types.ts` — AdvisorRuntimeContext combining all contracts
- `resolver.ts` — resolveAdvisorContext() assembling full governance
- `index.ts` — barrel re-exporting all contracts

**Edge Function Governance:**
- `supabase/functions/_shared/advisor-governance.ts` — consumed by 4 edge functions

**Proof Artifacts (generated/advisor-boardroom-proof/):**
- 13 proof JSON files covering all governance dimensions

### Part 2 — Duplicates (None Found)

No duplicate advisor registries, persona configs, or governance logic found. The `src/lib/advisors/index.ts` barrel and `src/packages/advisor-runtime-contracts/index.ts` both re-export from the same canonical sources — this is intentional layered access, not duplication.

### Part 3 — What Will Be Created: 12 Validator Scripts

All validators will be created in `scripts/advisors/` following the existing `ViolationCollector` pattern used by `scripts/architecture/checks/`.

Each validator:
- Inspects real source files and generated proof artifacts
- Classifies findings as BLOCK or ADVISORY
- Emits a generated report
- Exits non-zero on BLOCK violations

| # | Validator | Level | What It Checks |
|---|-----------|-------|----------------|
| 1 | `check-advisor-identity-closure.ts` | BLOCK | Every advisor in registry has id, display name, domain scope, trust floor/ceiling, disabled fallback |
| 2 | `check-advisor-persona-boundaries.ts` | ADVISORY | High-risk advisors (money, legal, tax, security) have explicit persona boundaries |
| 3 | `check-advisor-tool-permissions.ts` | BLOCK | Every advisor role has a permission entry; no advisor role is unmapped |
| 4 | `check-advisor-confidence-governance.ts` | ADVISORY | Confidence gates exist for all 8 action classes |
| 5 | `check-advisor-escalation-coverage.ts` | ADVISORY | Escalation rules cover financial, external, low-confidence, irreversible, system-config |
| 6 | `check-advisor-reversibility.ts` | BLOCK | All action types have reversibility classification |
| 7 | `check-advisor-memory-aging.ts` | ADVISORY | All 4 memory layers have aging rules |
| 8 | `check-advisor-reflection-policy-loop.ts` | ADVISORY | Reflection signals produce policy adjustments for rejection/acceptance/fitness |
| 9 | `check-advisor-disablement-modes.ts` | ADVISORY | All 6 disablement reasons have fallback behavior |
| 10 | `check-advisor-override-model.ts` | ADVISORY | All 7 override scopes have audit and approval requirements |
| 11 | `check-advisor-supportability.ts` | ADVISORY | Diagnostic snapshot has all 16 fields; support bundle has 4 sections |
| 12 | `check-boardroom-conflict-resolution.ts` | ADVISORY | Conflict resolution rules cover same-domain, cross-domain, safety, irreversible, low-confidence |

### Part 4 — Integration

1. **Register in `scripts/validate-all.ts`** — add `"advisors"` category with all 12 validators
2. **Register BLOCK validators in release-readiness aggregator** — `check-advisor-identity-closure.ts`, `check-advisor-tool-permissions.ts`, and `check-advisor-reversibility.ts` as BLOCK gates
3. **Regenerate proof artifacts** — update timestamps in all 13 `generated/advisor-boardroom-proof/` files

### Part 5 — Verification

- Run all 12 validators and confirm they pass (3 BLOCK, 9 ADVISORY)
- TypeScript build verification with 0 errors
- No new files created in `src/lib/advisors/` or `src/packages/advisor-runtime-contracts/` (all governance is already complete)

### Deployment Closure Checklist

All items already satisfied by existing implementation:
- [x] 34 advisor identities with full governance fields
- [x] 7 high-risk persona boundaries
- [x] 6-role permission matrix with blocked/allowed/approval categories
- [x] Debate orchestrator with consensus/majority/escalation/tiebreaker
- [x] 6 conflict resolution rules
- [x] 8 confidence gates with below-threshold behaviors
- [x] 8 escalation rules with priority and destination
- [x] 12 action type reversibility entries
- [x] 4-layer memory aging with promotion/expiry
- [x] Reflection-to-policy feedback loop with 3 adjustment paths
- [x] 6 disablement policies with auto-reenable conditions
- [x] 7 override scopes with dual-approval requirements
- [x] 16-field diagnostic snapshots with support bundles
- [x] Edge function governance mirroring client contracts
- [x] Unified runtime contracts package with resolver
- [x] 13 proof artifacts
- [ ] 12 dedicated validator scripts (this wave)
- [ ] Validators registered in release-readiness aggregator (this wave)

