# RB-005-AUTH — Payment Authentication Recovery

> **Switch:** `KS-PAYMENTS-AUTH` · **Owner:** finance-team · **Severity:** severe · **Dual-approval required**

## When to use

Activate when **payment authentication** is failing, but capture/settlement/refund flows are still healthy. Typical triggers:

- 3DS / SCA gateway 5xx rate > 2% over 5 minutes
- Tokenization provider returning `ERR_TOKEN_REJECTED` at scale
- Identity-provider WebAuthn challenges timing out
- Suspected credential-stuffing wave

Do **not** activate for routine capture/settlement issues — use the broader `KS-PAYMENTS` switch instead.

## What it does

| Subsystem | Behavior under switch |
|---|---|
| `payment-process` (auth path) | Returns `503 payments_auth_paused` with retry-after |
| `payment-process` (capture/refund) | **Continues normally** |
| `webauthn-challenge` | Returns `423 challenge_paused` |
| `sca_challenges` table writes | Blocked at edge-function gate |
| Existing tokenized payments | Continue to clear |

## Activation steps

1. Open `/admin/health/incidents` and confirm the incident pattern matches `payments:auth-error`.
2. From `/admin/trust-security` → **Kill switches** → `KS-PAYMENTS-AUTH` → **Activate**.
3. Justification (≥20 chars) is mandatory. Paste incident link or PagerDuty ID.
4. Second admin approves via the dual-approval queue (`/admin/approvals`).
5. Switch state propagates within 30s via Realtime.

## Verification

Within 60 seconds of activation:

```sh
curl -X POST $SUPABASE_URL/functions/v1/payment-process \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"authorize","amount":100,"currency":"USD"}'
# expect: 503 payments_auth_paused
```

```sh
curl -X POST $SUPABASE_URL/functions/v1/payment-process \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"capture","authorization_id":"existing"}'
# expect: 200 (still works)
```

## Rollback

1. Confirm 3DS provider health probe at `/admin/integrations/payments/health` shows green for ≥10 minutes.
2. Deactivate switch (single-admin sufficient for deactivation).
3. Run `payment-process` replay endpoint to flush queued auths:
   ```sh
   curl -X POST $SUPABASE_URL/functions/v1/payment-process \
     -d '{"action":"replay-queued-auths","window":"PT15M"}'
   ```
4. Watch `/admin/incidents/dashboard` for 15 minutes — auth success rate should return to baseline (>97%).

## Cooldown

Hard minimum **3 minutes** between toggles to prevent flapping.

## Audit trail

Every activation/deactivation is recorded in `kill_switch_audit_log` with:
- `actor_user_id`
- `reason` (justification text)
- `before_state` / `after_state`
- `metadata.dual_approver_user_id`

Export the trail for SIEM via the `audit-log-export` edge function.

## Related

- `KS-PAYMENTS` — broader switch for full payment outage
- `KS-WEBAUTHN` — disables platform authenticators only
- `RB-005` — full payment-stack recovery runbook
