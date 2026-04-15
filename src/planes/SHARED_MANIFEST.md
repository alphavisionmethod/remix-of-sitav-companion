# Shared Plane Manifest

## Purpose
Zero-runtime-dependency contracts, schemas, types, auth scopes, event envelopes, design tokens, and capability definitions. The single source of interface truth across all planes.

## Ownership
- **Primary owner**: Platform Architecture
- **Trust level**: Interface authority — defines all cross-plane communication shapes

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/packages/contracts/` | Core kernel contracts (action envelopes, evidence, reasoning) |
| `src/packages/business-contracts/` | Business domain contracts |
| `src/packages/finance-contracts/` | Finance domain contracts |
| `src/packages/concierge-contracts/` | Concierge domain contracts |
| `src/packages/boardroom-contracts/` | Boardroom decision contracts |
| `src/packages/enterprise-contracts/` | Enterprise/multi-tenant contracts |
| `src/packages/moat-contracts/` | Competitive moat contracts |
| `src/packages/policy-contracts/` | Policy definition contracts |
| `src/packages/proof-model/` | Proof and receipt models |
| `src/packages/reality-contracts/` | Reality mode contracts |
| `src/packages/event-types/` | Canonical event type definitions |
| `src/packages/design-tokens/` | Design system tokens |
| `src/packages/auth/` | Auth scopes, roles, claims |
| `src/packages/protocols/` | Cross-plane communication protocols |
| `src/packages/database-schemas/` | Database schema definitions |
| `src/packages/client-sdk/` | Client SDK contracts |
| `src/packages/shell-grammar/` | Shell command grammar |
| `src/packages/workflow-primitives/` | Workflow building blocks |
| `src/packages/feature-flags/` | Feature flag definitions |
| `src/packages/entitlements/` | Plan/tier entitlements |
| `src/packages/telemetry/` | Telemetry event shapes |

## Migration Target
```
/shared/contracts/
/shared/events/
/shared/models/
/shared/auth/
/shared/design-tokens/
/shared/sdk/
/shared/database-schemas/
```

## Allowed Dependencies
- None (leaf node — no imports from any plane)

## Forbidden Dependencies
- `backend`, `os`, `admin`, `founder`, `mobile`, `product`, `internal-tools`
