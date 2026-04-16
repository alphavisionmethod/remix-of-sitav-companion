# SITA OS — Kill Switch Registry

> **Phase 4 of the Meta-Architecture layer.** This document is generated from
> `src/lib/control-plane/` and validated by
> `scripts/architecture/checks/check-kill-switch-coverage.ts`.

## Purpose

The Kill Switch Registry is the **emergency brake panel** of SITA OS.
Every switch corresponds to a real subsystem, points at a real bounded
context (Phase 1), declares **enforcement points** in code, **dependencies**
to other switches, and a **runtime consequence** that the UI honors.

## The 14 Canonical Switches

| ID | Target | Impact | Bounded Context | Dual Approval | Runbook |
|---|---|---|---|---|---|
| KS-ADVISORS | advisors | significant | boardroom | no | RB-010 |
| KS-OUTBOUND | outbound-comms | moderate | integrations | no | RB-PUSH-FAILURE |
| KS-CONNECTORS | connectors | moderate | integrations | no | RB-CONNECTOR-TOKEN-FAILURE |
| KS-SYNC | sync | moderate | integrations | no | RB-003 |
| KS-PAYMENTS | payments | severe | finance-os | **yes** | RB-005 |
| KS-MOBILE-PUSH | mobile-push | minimal | mobile | no | RB-PUSH-FAILURE |
| KS-MODEL-PROVIDERS | model-providers | significant | runtime-kernel | **yes** | RB-AI-PROVIDER-DEGRADATION |
| KS-WORKFLOW | workflow | moderate | runtime-kernel | no | RB-STUCK-WORKFLOW |
| KS-SIMULATIONS | simulations | minimal | boardroom | no | — |
| KS-AUTOMATIONS | automations | moderate | concierge-os | no | — |
| **KS-RELEASE-ROLLOUT** | release-rollout | severe | cloud-control-plane | **yes** | RB-RELEASE-ROLLBACK |
| **KS-APPLIANCE-UPDATE** | appliance-update | significant | cloud-control-plane | **yes** | RB-VMWARE-BOOT-FAILURE |
| **KS-SELF-HEALING** | self-healing | moderate | runtime-kernel | no | RB-SUPPORT-ESCALATION-FAILURE |
| **KS-PROVIDER-INGESTION** | provider-ingestion | moderate | integrations | no | RB-CONNECTOR-TOKEN-FAILURE |

## Enforcement Layers

Each switch declares which layers in the runtime stack honor it:

- `edge-function` — Deno edge function rejects requests with a structured 503
- `domain-service` — Service-layer guard before any side-effecting call
- `ui-gate` — `useKillSwitchGate` disables buttons / shows degraded banner
- `scheduler` — Background worker / cron loop refuses to fire
- `connector` — Outbound provider call is blocked
- `ai-gateway` — Sovereign AI Gateway refuses model invocation
- `release-pipeline` — `check-deploy-readiness` refuses to ship
- `appliance-update` — OTA agent on the appliance refuses pull
- `self-healing` — Reconciler refuses repair attempts

Enforcement points are declared in
[`kill-switch-enforcement-map.ts`](../../src/lib/control-plane/kill-switch-enforcement-map.ts).
The CI check requires **every** switch to have at least one enforcement point
that points at a real file.

## Runtime Consequences

`kill-switch-runtime-consequence.ts` defines, per switch, the user-visible
behavior when the switch becomes active:

| Class | Meaning |
|---|---|
| `block-mutation` | Mutations are refused with a negative receipt |
| `queue-and-defer` | Mutations are accepted into a queue and replayed later |
| `show-degraded-banner` | Read-only UX continues, banner explains state |
| `hide-feature` | Feature surface is removed from navigation |
| `force-refusal` | Structured negative receipt + analytics event |
| `stop-scheduled-runs` | Background loops idle without firing |
| `rollback-release` | Release pipeline rolls back to last green |
| `freeze-ingestion` | Webhooks acknowledged but not processed |

## Dependency Graph

`kill-switch-dependency-map.ts` encodes how switches relate:

- **depends-on** — A is meaningful only if B is also active
- **supersedes** — A subsumes B (no need to flip B separately)
- **co-activates** — Operators should generally flip them together

`recommendCascade(switchId)` returns the full set of switches an operator
should consider when activating one.

## Runtime Hook

```ts
import { useKillSwitchGate, checkKillSwitchOrReject } from "@/lib/control-plane";

// React UI:
const { allowed, consequence } = useKillSwitchGate("KS-PAYMENTS");
if (!allowed) return <DegradedBanner consequence={consequence} />;

// Edge function (Deno):
await checkKillSwitchOrReject("KS-PAYMENTS"); // throws 503 if active
```

The same module is safe to import from edge runtimes and the browser bundle.

## Cross-Registry Links

| Registry | Field | Purpose |
|---|---|---|
| Phase 1 — Bounded Contexts | `boundedContextId` | Every switch protects exactly one context |
| Phase 5 — Runbooks | `runbookRef` | Every switch points at the recovery runbook |
| Phase 7 — Meta Integrity | dependency edges | Validated by `check-registry-integrity` |

## CI Gate

```bash
npx tsx scripts/architecture/checks/check-kill-switch-coverage.ts
```

The check fails the build if:
- A required high-risk subsystem has no switch
- A switch references an unknown bounded context
- A switch has no enforcement point or no consequence
- A dependency edge references an unknown switch
- A runbook ref does not resolve

## Authority

This document, the registry files, and the CI check are the **only**
authoritative source for kill-switch truth. Admin UIs (`AR08KillSwitchCenter`)
read from these files.
