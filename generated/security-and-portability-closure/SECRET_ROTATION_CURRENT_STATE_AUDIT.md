# Secret Rotation — Current State Audit

**Generated:** 2026-04-19  
**Owner:** Security Council (Admin AI Engineer)  
**Scope:** All secret classes governed by SITA OS

## Inventory of secret-bearing surfaces

| Surface | Secret class(es) | Storage | Current rotation path |
|---|---|---|---|
| `secret-rotation-orchestrator` (edge fn) | push, comms, ai, auth, storage, webhook-signing, attestation-signing, audit-export-hmac | Lovable Cloud secrets store | Real orchestrator exists; logs to `secret_rotation_log` table (this closure) |
| `security-anomaly-rotation-trigger` (edge fn) | All | Lovable Cloud | Dual-admin gated dry-run only |
| Provider connectors (Google/Microsoft/Slack OAuth) | comms | `connector_tokens` table | Real refresh proven (`oauth-refresh-probe`) |
| Webhook signing | webhook-signing | env var `WEBHOOK_SIGNING_SECRET` | Manual rotation, now codified at 90d |
| Attestation packets | attestation-signing | env var `ATTESTATION_SIGNING_KEY` | Manual rotation, now codified at 180d |
| Audit export HMAC | audit-export-hmac | env var `AUDIT_EXPORT_HMAC_KEY` | Manual rotation, now codified at 180d |
| Auth signing keys | auth | Lovable Cloud control plane | Control-plane managed |
| Storage signing | storage | Lovable Cloud control plane | Control-plane managed |

## Pre-closure gaps (now resolved)

1. ❌ No codified cadence per class → ✅ `src/lib/security/secret-rotation-cadence.ts`
2. ❌ No durable rotation evidence → ✅ `secret_rotation_log` table + RLS
3. ❌ No freshness CI gate → ✅ `check-secret-rotation-freshness.ts` (BLOCK)
4. ❌ No cadence policy CI gate → ✅ `check-secret-rotation-cadence.ts` (BLOCK)
5. ❌ Orchestrator did not write evidence → ✅ INSERT wired into orchestrator

## Honest limits

- `auth` and `storage` classes are managed by the Lovable Cloud control plane. The freshness validator classifies these as `control-plane-blocked` (WARN-tier) — the cadence policy is documented but rotation is exercised by the platform, not by SITA OS.

## Closure status

- Cadence model: ✅ codified
- Durable evidence: ✅ wired
- CI enforcement: ✅ 2 gates BLOCK
- Operator visibility: ✅ Security & Portability Truth panel on AI Engineer hub
