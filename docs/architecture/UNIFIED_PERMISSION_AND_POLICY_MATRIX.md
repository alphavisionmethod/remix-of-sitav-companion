# Unified Permission & Policy Matrix

> Phase 3 of the Meta-Architecture initiative. Canonical 9-dimension authority plane: every privileged action in SITA OS resolves through `resolveUnifiedPolicy()`.

## The 9 Dimensions

| # | Dimension | Source File | Values |
|---|---|---|---|
| 1 | **Actor** | `policy-actor-registry.ts` | user, owner-admin, platform-admin, advisor, automation, service-role, support-flow, anonymous |
| 2 | **Domain** | `policy-domain-map.ts` | business, money, concierge, boardroom, files, integrations, system, identity, trust, admin |
| 3 | **Surface** | `policy-surface-map.ts` (× Phase 2 surfaces) | web, electron, appliance, ios, android, offline, demo, real |
| 4 | **Risk Class** | `policy-proof-requirements.ts` | R0–R5 |
| 5 | **Device Trust** | `policy-trust-thresholds.ts` | 0 Untrusted → 4 Hardware-Bound |
| 6 | **Sensitivity** | `unified-policy-matrix.ts` | public, internal, confidential, restricted, regulated |
| 7 | **Tenant Scope** | `unified-policy-matrix.ts` | personal, shared, managed, admin |
| 8 | **Proof Requirement** | `policy-proof-requirements.ts` | derived from (domain × riskClass) |
| 9 | **Reversibility + Approval** | `policy-reversibility-map.ts` + `policy-approval-map.ts` | derived from (domain × riskClass) |

## Resolver Contract

```ts
import { resolveUnifiedPolicy } from "@/lib/policy";

const decision = resolveUnifiedPolicy({
  actor: "user",
  domain: "money",
  surface: "ios",
  riskClass: "R4",
  deviceTrust: 3,
  sensitivity: "confidential",
  tenantScope: "personal",
  biometricStepUpRecent: true,
  hasJustification: true,
});

if (!decision.allowed) {
  return refuseWithReceipt(decision.refusalReasons);
}
// decision.proofRequirement / .reversibility / .approval are bound for execution
```

## Cross-Linkage to Other Registries

- **Bounded Context (Phase 1)** — every `PolicyDomainKey` maps to a `BoundedContextId` via `policy-domain-map.ts → primaryContextId`.
- **Surface (Phase 2)** — every domain has an explicit allowed/read-only/prohibited state per canonical surface.
- **Approval Engine** — `policy-approval-map.ts` feeds the existing `approval-tiers.ts` resolver.
- **Proof Layer** — `policy-proof-requirements.ts` declares the components every receipt must carry.
- **Trust Governor** — `policy-trust-thresholds.ts` is the device-trust gate.

## Resolver Behavior

The resolver short-circuits to **deny** when ANY of these hold:
1. Actor cannot reach the requested risk class (e.g., anonymous → R3+)
2. Surface state is `prohibited` or (mutating) `read-only`
3. Step-up biometric required but not recent
4. Trust threshold not met (and step-up doesn't satisfy override)
5. Regulated data on demo/offline surface
6. Restricted data on demo surface
7. Admin tenant scope requested by non-platform actor
8. Required justification text missing
9. Boardroom approval required but not yet granted (warning, then enforced by approval engine)

## Validation

CI gate: `scripts/architecture/checks/check-policy-coverage.ts` (extended).

Asserts:
- Every `PolicyDomainKey` has a default risk class binding
- Every (domain × riskClass) cell appearing in the codebase has matching proof, reversibility, trust, and approval entries
- Every `PolicyDomainKey.primaryContextId` resolves in the bounded-context registry
- Surface override entries reference valid canonical surfaces

Run: `npx tsx scripts/architecture/checks/check-policy-coverage.ts`

## Wiring Map

| Consumer | Reads |
|---|---|
| Edge functions (`_shared/policy.ts`) | `resolveUnifiedPolicy` |
| Approval engine | `policy-approval-map` |
| Trust governor | `policy-trust-thresholds` |
| Executor receipts | `policy-proof-requirements` + `policy-reversibility-map` |
| Admin Policy Explorer (`PolicySimulator`) | full barrel |
| UI gating hooks | `policy-surface-map` |
| Refusal receipts | `denyAllQuery` for negative testing |
