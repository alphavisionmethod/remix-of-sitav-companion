# RB-SECRET-ROTATION — Platform Secret Rotation

> **Owner:** trust-security · **Cadence:** 90 days (or on-demand for incident) · **Dual approval required**

## Cadence

| Secret class | Rotation interval | Notes |
|---|---|---|
| AI provider keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `LOVABLE_API_KEY`) | 90 days | Gateway fallback masks single-provider outage |
| Comms (`TWILIO_AUTH_TOKEN`) | 90 days | Twilio supports overlapping tokens for 60s |
| Push (`VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`) | 180 days | Requires browser re-subscription on next visit |
| Storefront (`SHOPIFY_ACCESS_TOKEN`) | 180 days | Re-issue from Shopify admin |
| Supabase service-role / DB URL | **never via this runbook** | Coordinated via Lovable Cloud control plane only |

## Standard procedure (per secret)

1. Open `/admin/trust-security/secret-rotation`.
2. Select secrets to rotate. Provide ≥20-char justification (incident ID, audit ID, or "scheduled-Q1-2026").
3. Click **Plan rotation** → calls `secret-rotation-orchestrator` edge function with `dryRun: true`.
4. Review the returned plan — it lists pre-checks, post-checks, and rollback path per secret.
5. Get second-admin approval via `/admin/approvals`.
6. Execute the plan steps:
   - Mint new credential at provider
   - Paste new value into Lovable Cloud secrets vault
   - Wait 60s for edge propagation
   - Run post-checks (test push, test SMS, AI health probe, etc.)
7. Submit completion receipt — `secret-rotation-orchestrator` writes an audit row.

## Post-check commands

```sh
# AI provider
curl -X POST $SUPABASE_URL/functions/v1/ai-health -H "Authorization: Bearer $TOKEN"

# Push
curl $SUPABASE_URL/functions/v1/vapid-public-key   # should return new public key
curl -X POST $SUPABASE_URL/functions/v1/push-dispatch \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"to":"self","title":"Rotation test","body":"VAPID rotated OK"}'

# Comms (Twilio)
curl -X POST $SUPABASE_URL/functions/v1/communications-api \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"smoke-test","channel":"sms","to":"+15555550100"}'
```

## Rollback window

You have **15 minutes** to roll back by re-pasting the previous secret value. After 15 minutes the old credential should be revoked at the provider.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Push notifications silent on all browsers | VAPID public key mismatch | Re-paste old VAPID pair, schedule re-subscription wave |
| Twilio webhook signature invalid | Auth token rotated mid-flight | Twilio honors both tokens for 60s — wait it out |
| AI gateway 401 on one provider | Provider key bad | Gateway falls back automatically; fix provider key |
| `vapid-public-key` returns empty | VAPID_PUBLIC_KEY not yet propagated | Wait 60s and retry |

## Audit

Every plan + execution writes to `admin_action_audit` with:
- `action: secret_rotation_planned` / `secret_rotation_executed`
- `target_id`: comma-separated secret names
- `metadata.receiptId`: UUID returned by orchestrator

Export the trail via `audit-log-export` edge function for SIEM.

## Emergency rotation (suspected compromise)

1. Immediately activate the relevant kill switch (`KS-AI-PROVIDERS`, `KS-OUTBOUND`, etc.) to halt the affected subsystem.
2. File incident at `/admin/health/incidents` with severity `critical`.
3. Skip the 60s overlap — paste new value, accept the brief outage.
4. Notify on-call via PagerDuty (alert-router will fan out automatically when severity=critical).
5. Post-mortem within 48h.
