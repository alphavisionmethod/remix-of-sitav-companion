

# Product Model & Hard Proof Closure — Implementation Plan

## Summary

Implement a formal product-model layer (11 canonical contracts + generator + 12 validators) and a 7-category hard-proof model (8 contracts + generator + 8 validators) to close the gap between "many pages exist" and "one coherent, provably working product." All work extends existing canonical systems (`src/platform/`, `src/lib/platform/proof/`, `src/lib/truth/`) rather than creating parallel platforms.

## Existing Systems to Preserve and Extend

| System | Location | Action |
|---|---|---|
| Proof Registry (10 classes) | `src/lib/platform/proof/proof-registry.ts` | Extend with 7-category model |
| Proof Requirement Map | `src/lib/platform/proof/proof-requirement-map.ts` | Keep as-is |
| Notifications barrel | `src/platform/notifications/index.ts` | Extend with center model |
| Search barrel | `src/platform/search/index.ts` | Extend with command-search model |
| Auth barrel | `src/platform/auth/index.ts` | Extend with user model contract |
| Shell runtime profiles | `src/shell-runtime/` | Reference from navigation model |
| Truth governance | `src/lib/truth/` | Wire proof categories into claims |
| Feature-runtime-tier registry | `src/runtimes/feature-runtime-tier-registry.ts` | Reference from offline matrix |
| Command palettes | `src/components/sita/CommandPalette.tsx` + domain variants | Reference from command-search model |

## Phase 1 — Product Model Contracts (11 files)

Create `src/platform/product/` with these canonical TypeScript contracts:

1. **user-model-contract.ts** — Canonical user identity (auth ID, roles, entity scope, persona, session context, settings ownership, operator distinction). References existing `AuthContext` and role system.

2. **navigation-model.ts** — Canonical navigation across shells, route families, app launches, admin paths, deep links. References existing route-plane-map and shell-runtime profiles.

3. **task-action-model.ts** — Cross-domain work object and action grammar (task ID, domain, action type, approval/escalation binding, notification/search discoverability, evidence attachment).

4. **notification-center-model.ts** — Unified notification semantics (alerts, reminders, approvals, AI recommendations, integration failures, actionable vs informational, history/dismissal). Extends existing notification hooks.

5. **command-search-model.ts** — Universal command/search/discovery layer (command palette, global search, cross-domain entity lookup, action invocation, help/diagnostic discovery). References existing `CommandPalette` and `use-global-search`.

6. **deep-link-registry.ts** — Cross-app deep-link routing (link identities, parameters, auth/runtime restrictions, shell/window behavior, context restoration).

7. **state-grammar.ts** — Shared product states (loading, empty, error, blocked, degraded, recovering, ready, attention-required, stale-data, permission-required, evidence-required).

8. **trust-explanation-layer.ts** — Unified "why am I seeing this?" model (provenance, AI disclosure, permission explanation, trust copy, support escalation).

9. **offline-degraded-matrix.ts** — Product-wide offline/degraded behavior matrix per domain (online-only, offline-read, degraded-safe, blocked, sync/recovery). References existing `mobile-offline-policy` and `offline-queue`.

10. **settings-coherence-map.ts** — Unified settings ownership (user-level vs domain-level vs operator-level, visibility rules, runtime constraints). References existing `settings-profile.ts`.

11. **index.ts** — Barrel export for all product model contracts.

Supporting contracts (4 files):
- **domain-boundary-map.ts** — Domain purposes, core objects, allowed/forbidden overlaps, navigation entries, ownership.
- **recent-history-model.ts** — Resume recent work, cross-app context recovery, action history.
- **permission-explanation-policy.ts** — What permission, why needed, what if denied, help path.
- **evidence-disclosure-map.ts** — Evidence/provenance disclosure requirements per domain.

## Phase 2 — Hard Proof Model (7-Category, 8 files)

Create `src/lib/proof/` with these canonical contracts:

1. **proof-category-model.ts** — Defines the 7 proof categories: implementation, wiring, behavior, failure, recovery, operational, release. Each with description, minimum evidence requirements, and confidence weight.

2. **system-proof-registry.ts** — Maps 14 major subsystems (AI runtime, advisor/boardroom, connectors, app platform, frontend, mobile, desktop, OS, security, admin, release, truth governance, notifications, search) to proof coverage across all 7 categories.

3. **proof-gap-engine.ts** — Detects missing proof coverage per subsystem per category. Computes gap severity and blocker status.

4. **proof-threshold-policy.ts** — Minimum evidence thresholds per category for "working" claims. Downgrade rules when categories are incomplete.

5. **proof-confidence-model.ts** — Confidence scoring per subsystem based on proof category coverage. Maps to approved readiness language.

6. **behavior-proof-map.ts** — Maps behavioral proof artifacts (e2e tests, nightly runs, runtime probes) to subsystems.

7. **failure-proof-map.ts** — Maps failure/recovery proof artifacts (chaos drills, DR drills, kill-switch tests, rollback validation) to subsystems.

8. **index.ts** — Barrel export.

## Phase 3 — Generator Script

Create `scripts/product/generate-product-proof-artifacts.ts`:

Generates all 23 required artifacts in `generated/`:

**Product model artifacts (13):**
- product-model-closure.json
- navigation-coherence-report.json
- task-action-model-report.json
- notification-center-coverage.json
- command-search-coverage.json
- deep-link-coverage.json
- state-grammar-coverage.json
- trust-explanation-coverage.json
- offline-degraded-coverage.json
- settings-coherence-report.json
- domain-boundary-clarity-report.json
- recent-history-recovery-report.json
- permission-explanation-coverage.json

**Proof model artifacts (10):**
- system-proof-matrix.json
- proof-gap-report.json (extends existing)
- behavior-proof-coverage.json
- failure-proof-coverage.json
- recovery-proof-coverage.json
- operational-proof-coverage.json
- release-proof-coverage.json
- proof-confidence-scoreboard.json
- subsystem-proof-readiness.json
- proof-threshold-audit.json

## Phase 4 — Validators (20 scripts)

**Product model validators (12) in `scripts/product/`:**

1. check-user-model-coherence.ts
2. check-navigation-coherence.ts
3. check-task-action-model.ts
4. check-notification-center-coverage.ts
5. check-command-search-coverage.ts
6. check-deep-link-coverage.ts
7. check-state-grammar-coverage.ts
8. check-trust-explanation-coverage.ts
9. check-offline-degraded-matrix.ts
10. check-settings-coherence.ts
11. check-domain-boundary-clarity.ts
12. check-permission-explanation-coverage.ts

**Proof model validators (8) in `scripts/proof/`:**

13. check-system-proof-matrix.ts
14. check-proof-gap-engine.ts
15. check-behavior-proof-coverage.ts
16. check-failure-proof-coverage.ts
17. check-recovery-proof-coverage.ts
18. check-operational-proof-coverage.ts
19. check-release-proof-coverage.ts
20. check-proof-thresholds.ts

Each validator uses the existing `emitGateReport` utility and checks for both source contracts and generated artifacts.

## Technical Details

- All contracts use TypeScript `as const` readonly arrays for registry data
- Product model contracts reference existing canonical systems (AuthContext, route-plane-map, shell-runtime profiles, CommandPalette, notification hooks) rather than replacing them
- Proof model extends the existing `ProofClass` / `ProofRegistryEntry` system with 7 deployment-readiness categories that are orthogonal to the runtime proof classes
- Generator script is idempotent, safe for CI and local execution
- Validators use the shared `emitGateReport` from `scripts/validation/_lib/`
- Approximately 35 new files total: 15 product contracts, 8 proof contracts, 1 generator, 20 validators, plus barrel exports

## No-Duplication Enforcement

- The product model does not replace existing `CommandPalette`, notification hooks, or search hooks — it provides the governance contract they conform to
- The 7-category proof model does not replace the existing runtime `ProofRegistry` (which tracks approval/execution/audit proofs) — it adds a deployment-readiness proof taxonomy
- No new React components, pages, or routes are created
- No existing files are deleted; barrel exports are added to wire new contracts into the platform

