# Trust Layer — Platform Manifest

**Type**: Cross-cutting platform layer (NOT a pillar — it serves all 4 pillars)
**Route group**: `/trust/*`
**Primary surface**: `src/pages/TrustCenter.tsx` (already exists) + new sub-pages under `src/pages/trust/`
**Principle**: *Receipts, security, and automation under user authority — non-negotiable.*

## Owned Capabilities

| Capability               | Surface                                          | Service                                            |
| ------------------------ | ------------------------------------------------ | -------------------------------------------------- |
| Receipts (proof chain)   | `/trust/receipts`                                | `supabase/functions/_shared/emit-action-receipt`   |
| Approvals queue          | `/trust/approvals`                               | `src/lib/services/approval-engine`                 |
| Permissions / scopes     | `/trust/permissions`                             | `src/lib/services/identity-auth`                   |
| Automation authority     | `/trust/automation-authority`                    | `src/lib/services/action-safety`                   |
| Audit logs               | `/trust/audit`                                   | `src/lib/services/audit-ledger`                    |
| Device & session trust   | `/trust/devices`                                 | `src/lib/services/biometric-auth` + `device-mesh`  |
| Suspicious activity      | `/trust/threats`                                 | `src/lib/services/fraud-sentinel`                  |
| Data retention           | `/trust/retention`                               | `src/lib/services/memory-governance`               |
| Explainability           | `/trust/explain`                                 | `src/lib/services/explainability`                  |

## Module Hooks (the contract every pillar uses)
```ts
import { emitActionReceipt } from "@/modules/_trust/receipts";
import { requireApproval } from "@/modules/_trust/approvals";
import { checkPermission } from "@/modules/_trust/permissions";
import { logAudit } from "@/modules/_trust/audit";
```
These re-export the existing services through a stable, module-agnostic surface so future refactors don't break callers.

## Forbidden
- ❌ Any pillar reimplementing receipts, approvals, audit, or permissions locally.
- ❌ Direct calls to provider SDKs that bypass receipt emission.

## Receipt Coverage Targets (CI-enforced)
| Pillar      | Current | Target |
| ----------- | ------- | ------ |
| Business OS | partial | 100% of mutating actions by Q2 |
| Concierge OS| partial | 100% of bookings + 3rd-party actions |
| Finance OS  | strong  | 100% of money movement (already enforced) |
| Health OS   | n/a     | 100% from day 1 (no shipping without it)   |