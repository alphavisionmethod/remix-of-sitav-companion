# Secret Rotation Cadence — Canonical Model

**Source of truth:** `src/lib/security/secret-rotation-cadence.ts`  
**Evidence sink:** `secret_rotation_log` (Postgres, admin-RLS)  
**CI gates:** `check-secret-rotation-cadence`, `check-secret-rotation-freshness`

## Class registry

| Class | Interval | Stale threshold | Owner | Backup | Alert | Notes |
|---|---|---|---|---|---|---|
| `push` | 90d | 105d | Security Council | Platform Eng | high | VAPID push signing |
| `comms` | 180d | 210d | Connector Owners | Security Council | medium | OAuth refresh tokens |
| `ai` | 90d | 105d | AI Runtime Owner | Security Council | high | Provider API keys |
| `auth` | control-plane | n/a | Lovable Cloud | n/a | info | Managed externally |
| `storage` | control-plane | n/a | Lovable Cloud | n/a | info | Managed externally |
| `webhook-signing` | 90d | 105d | Platform Eng | Security Council | high | HMAC for external workforce API |
| `attestation-signing` | 180d | 210d | Compliance Owner | Security Council | high | Sealed compliance packets |
| `audit-export-hmac` | 180d | 210d | Compliance Owner | Security Council | high | Immutable log integrity |

## Workflow

1. **Plan** — operator invokes `secret-rotation-orchestrator` (dryRun OR real)
2. **Execute** — orchestrator rotates each class; for control-plane classes, defers to platform
3. **Record** — orchestrator INSERTs into `secret_rotation_log` with `cadence_due_at = now() + intervalDays`
4. **Verify** — `emit-secret-rotation-status.ts` reads log + registry → `secret-rotation-status.json`
5. **Block** — `check-secret-rotation-freshness.ts` fails BLOCK on overdue (excluding control-plane WARN-tier)

## Alert escalation

- Stale >0d → WARN on admin truth panel
- Stale >threshold → BLOCK release readiness gate
- Anomaly trigger → `security-anomaly-rotation-trigger` enqueues dual-admin approval

## What we never put in evidence

- Raw secret values
- Pre-images or partial fingerprints
- Provider-side error bodies that may include token fragments

We record: class, name (logical), timestamp, dry-run flag, sanitized result JSON, next due timestamp.
