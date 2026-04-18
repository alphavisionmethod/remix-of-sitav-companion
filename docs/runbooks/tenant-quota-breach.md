# Runbook: Tenant Quota Breach

**Risk tier:** R2  
**Autonomy ceiling:** L3  
**Owner:** Customer Success / Platform

## Trigger

Tenant `current_usage` ≥ `quota_value` on any row in `tenant_quotas`.

## Tenant-side actions (self-service)

Tenants can act first via `/admin/tenant-console`:

1. **View usage** — Quotas card shows used / limit / hard ceiling.
2. **Request increase** — Edit the quota up to (but never above) `hard_ceiling`.
3. **Pause workload** — Toggle the relevant kill-switch (`ai_actions`, `external_api`).

## Operator-side actions

If tenant cannot self-resolve:

1. Open `/admin/tenant-console` (operator view).
2. Locate the breached row (filter by `over_limit = true`).
3. Decide:
   - **Grant** — raise hard ceiling (justification required, audit-logged).
   - **Throttle** — leave quota, notify tenant.
   - **Suspend** — flip `quotas_pause` kill switch and contact tenant.

## Evidence

- `tenant_self_service_actions` (action_kind = `quota_change` or `kill_switch_toggle`).
- `admin_action_audit` (operator-side raises).
- `compliance_evidence` (collector `change_management`).

## SLOs

- Acknowledge breach within 1 business hour.
- Resolution path agreed within 24 hours.
- No silent suspensions — always notify the tenant.
