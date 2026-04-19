# RLS Under Stress — Validation

**Validator:** `scripts/validation/check-rls-under-stress.ts`  
**Probe script:** `os/scripts/run-rls-stress-probe.sh`  
**Evidence dir:** `generated/security-and-portability-closure/rls-stress-runs/`

## What is tested

1. **Concurrent multi-tenant probe** — N parallel sessions across distinct `auth.uid()` boundaries; assert no row leaks across tenants
2. **SECURITY DEFINER coverage** — every helper function (e.g., `has_role`, `has_admin_permission`) is reviewed for unintended privilege widening
3. **Edge-condition bypass** — null UID, expired JWT, replayed session, malformed RLS-relevant claims

## Pass criteria

- Zero `isolationBreach: true` results across all evidence files
- ≥1 evidence file in last 90 days
- All three required scenarios executed in at least one run

## Honest current status

⏳ **pending-execution** — probe script is wired and ready. The first scheduled run will produce the inaugural evidence file. Until then, `check-rls-under-stress.ts` returns WARN (not BLOCK) and surfaces the gap honestly on the truth panel.

## Operator runbook

```bash
# Dry-run (no DB writes, validates connectivity only)
npm run security:rls-stress -- --dry-run

# Real run (requires PG* env from Lovable Cloud secrets)
npm run security:rls-stress
```

Output is written to `generated/security-and-portability-closure/rls-stress-runs/<ISO-8601>.json`.
