# SITA OS — Runbook Index

> **Phase 5 of the Meta-Architecture layer.** Generated truth lives in
> `src/lib/support/runbook-registry.ts` and is validated by
> `scripts/architecture/checks/check-runbook-coverage.ts`.

Each runbook below maps to a real markdown file under `docs/runbooks/`.
Every operational subsystem flagged `mandatory` in
[`runbook-subsystem-map.ts`](../../src/lib/support/runbook-subsystem-map.ts)
must have at least one runbook entry. Every kill switch with a `runbookRef`
must resolve to a real entry here.

## Catalogue

| ID | Title | Severity | Subsystem | Bounded Context | Kill Switch | File |
|---|---|---|---|---|---|---|
| RB-001 | Auth Outage Recovery | critical | auth | setup-identity | — | [auth-outage.md](../runbooks/auth-outage.md) |
| RB-002 | AI Provider Outage | high | ai-providers | runtime-kernel | KS-MODEL-PROVIDERS | [provider-outage.md](../runbooks/provider-outage.md) |
| RB-003 | Sync Lag Recovery | medium | sync | integrations | KS-SYNC | [sync-lag.md](../runbooks/sync-lag.md) |
| RB-004 | Stuck Workflow Recovery | medium | workflow | runtime-kernel | KS-WORKFLOW | [stuck-workflow.md](../runbooks/stuck-workflow.md) |
| RB-005 | Proof Mismatch Resolution | high | proof | proof-trust | — | [proof-mismatch.md](../runbooks/proof-mismatch.md) |
| RB-006 | Generated vs Runtime Drift | medium | manifest-drift | cloud-control-plane | — | [generated-vs-runtime-drift.md](../runbooks/generated-vs-runtime-drift.md) |
| RB-007 | Push Notification Failure | low | push | integrations | KS-MOBILE-PUSH | [push-failure.md](../runbooks/push-failure.md) |
| RB-008 | VMware/Desktop Boot Failure | medium | desktop-host | runtime-kernel | KS-APPLIANCE-UPDATE | [vmware-boot-failure.md](../runbooks/vmware-boot-failure.md) |
| RB-009 | Release Rollback | critical | release | cloud-control-plane | KS-RELEASE-ROLLOUT | [release-rollback.md](../runbooks/release-rollback.md) |
| RB-010 | AI Provider Degradation | high | ai-degradation | runtime-kernel | KS-MODEL-PROVIDERS | [ai-provider-degradation.md](../runbooks/ai-provider-degradation.md) |
| RB-011 | Connector Token Failure | medium | connectors | integrations | KS-CONNECTORS | [connector-token-failure.md](../runbooks/connector-token-failure.md) |
| RB-012 | Setup Checkpoint Corruption | medium | setup | setup-identity | — | [setup-checkpoint-corruption.md](../runbooks/setup-checkpoint-corruption.md) |
| RB-013 | Approval Queue Jam | high | approvals | boardroom | — | [approval-queue-jam.md](../runbooks/approval-queue-jam.md) |
| RB-014 | DB Restore Failure | critical | db | cloud-control-plane | — | [db-restore-failure.md](../runbooks/db-restore-failure.md) |
| RB-015 | RLS Misconfiguration | critical | rls | proof-trust | — | [rls-misconfig.md](../runbooks/rls-misconfig.md) |
| RB-016 | Desktop Host Bridge Failure | medium | desktop-host | runtime-kernel | — | [desktop-host-bridge-failure.md](../runbooks/desktop-host-bridge-failure.md) |
| RB-017 | Mobile Push Registration | low | mobile-push | mobile | KS-MOBILE-PUSH | [mobile-push-registration.md](../runbooks/mobile-push-registration.md) |
| RB-018 | Runtime Probe Failure | medium | runtime-probe | runtime-kernel | — | [runtime-probe-failure.md](../runbooks/runtime-probe-failure.md) |
| RB-019 | Support Escalation Failure | high | support-escalation | admin | KS-OUTBOUND | [support-escalation-failure.md](../runbooks/support-escalation-failure.md) |

## CI Gate

```bash
npx tsx scripts/architecture/checks/check-runbook-coverage.ts
```

Fails the build if:

- A mandatory subsystem has no runbook
- A runbook's `markdownRef` does not point to a real file
- A runbook references an unknown bounded context
- A runbook references an unknown kill switch
- A kill switch's `runbookRef` does not resolve

## Authority

The registry and these markdown files are the **only** authoritative source for
support runbook truth. The admin Runbook Center
(`FCC04RunbookCenter`) reads from them.
