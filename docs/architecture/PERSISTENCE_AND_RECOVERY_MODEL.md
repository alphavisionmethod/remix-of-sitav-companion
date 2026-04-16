# Persistence and Recovery Model — SITA OS

> **Authority:** `generated/persistence-audit.json`
> **Generator:** `scripts/db/generate/generate-persistence-audit.ts`
> **CI gate:** `scripts/db/checks/check-persistence-coverage.ts`

## 1. The 9 Persistence-Critical Domains

For SITA OS to be supportable and recoverable, **every** runtime-critical concept must have explicit persistence backing. The audit tracks 9 such domains:

| Domain | What it preserves | Required |
|---|---|---|
| **Setup checkpoints** | Onboarding state, resume tokens, deferred items | ✅ |
| **Device registry** | Trusted devices, biometric credentials, environment identity | ✅ |
| **Prompt versions** | Prompt templates, model routing rules, runtime active version | ✅ |
| **Model/provider config** | AI provider configs, rollout states, safety versions | ✅ |
| **Feature flags** | Rollout flags, kill switches, maintenance mode | ✅ |
| **OAuth tokens** | Connector tokens, refresh state, expiry | ✅ |
| **Workflow runtime** | Workflow instances, command steps, retry state | ✅ |
| **Memory persistence** | Memory objects, corrections, confidence | ✅ |
| **Action/proof/reversal** | Audit trail, proof receipts, reversal records | ✅ |

## 2. Coverage Status

Live status (regenerate via `npx tsx scripts/db/generate/generate-persistence-audit.ts`):

```
generated/persistence-audit.json
```

Each domain reports:
- `coverage` — number of backing tables matched
- `status` — `covered` / `thin` / `missing`
- `backingTables` — list of matched table names

## 3. CI Enforcement

`check-persistence-coverage.ts` fails the build when:
- Any required domain has `status: missing` (0 backing tables)
- Any required domain with only 1 table emits a `warning`

## 4. Recovery Workflow

For each persistence domain:

1. **Backup proof** — `supabase/backups/` snapshots include the domain's tables
2. **Restore drill** — `scripts/support/drills/` contains DR drills per domain
3. **Verification** — Post-restore probe via `db-truth-introspect` confirms row counts and policy state

## 5. Backup Policy

- All `write` and `log` schema-class tables: nightly backup
- All `config` tables: backed up on change
- All `system` tables: ephemeral, may be re-derived
- Sensitive-data tables (tokens, credentials): encrypted at rest, separate restore policy

## 6. Reversal Trail

Mutating operations across SITA OS produce records in:
- `admin_action_audit` — admin operations
- `admin_action_confirmations` — gated admin actions
- `boardroom_decision_receipts` — board decisions
- `advisor_board_actions` (status: `reverted_at`) — advisor actions
- `timeline_events` — system-wide timeline

Together these form the **non-negotiable reversal/audit chain**.
