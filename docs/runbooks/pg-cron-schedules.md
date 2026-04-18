# pg_cron Schedules — Phase 8/9 Continuous Loops

This runbook documents the cron schedules required to make Phase 8 (Continuous
Assurance) and Phase 9 (DR + Compliance) actually *continuous*. Without these
schedules, the corresponding edge functions are manual-only.

## Prerequisites

1. Enable the `pg_cron` and `pg_net` Postgres extensions in the Supabase project.
2. Have an authenticated `service_role` JWT or use the project anon key with the
   appropriate function-level auth.

## Required schedules

| Schedule name              | Cron        | Edge function                  | Purpose                                 |
|----------------------------|-------------|--------------------------------|-----------------------------------------|
| `sita-canary-chaos`        | `0 * * * *` | `canary-chaos-cron`            | Hourly canary + chaos drills            |
| `sita-webhook-retry`       | `*/2 * * * *` | `webhook-retry-processor`    | Process retry queue every 2 min         |
| `sita-compliance-evidence` | `0 6 * * *` | `compliance-evidence-cron`     | Daily SOC2/ISO evidence collection      |
| `sita-dr-drill`            | `0 5 * * 0` | `dr-drill-cron`                | Weekly Sunday DR simulation             |
| `sita-internal-agent-reflect` | `*/30 * * * *` | `internal-agent-reflect`  | Phase 3 — outcome scoring + EWMA trust  |
| `sita-suggestion-generator` | `0 */6 * * *` | `internal-agent-suggestion-generator` | Phase 3 — propose from real signals |
| `sita-weekly-digest`       | `0 7 * * 1` | `internal-agent-weekly-digest` | Phase 3 — Mon 07:00 UTC workforce digest |

## Install template

Replace `<PROJECT-REF>` and `<ANON-KEY>` with your project values, then run via
the **Insert** tool (these statements contain project-specific URLs and tokens
and must NOT be checked into the repository as a migration).

```sql
-- Enable extensions (one-time)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Hourly canary + chaos
select cron.schedule(
  'sita-canary-chaos',
  '0 * * * *',
  $$ select net.http_post(
       url := 'https://<PROJECT-REF>.supabase.co/functions/v1/canary-chaos-cron',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON-KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);

-- Webhook retry every 2 minutes
select cron.schedule(
  'sita-webhook-retry',
  '*/2 * * * *',
  $$ select net.http_post(
       url := 'https://<PROJECT-REF>.supabase.co/functions/v1/webhook-retry-processor',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON-KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);

-- Daily compliance evidence
select cron.schedule(
  'sita-compliance-evidence',
  '0 6 * * *',
  $$ select net.http_post(
       url := 'https://<PROJECT-REF>.supabase.co/functions/v1/compliance-evidence-cron',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON-KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);

-- Weekly DR drill (Sunday 5am UTC)
select cron.schedule(
  'sita-dr-drill',
  '0 5 * * 0',
  $$ select net.http_post(
       url := 'https://<PROJECT-REF>.supabase.co/functions/v1/dr-drill-cron',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON-KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
```

## Verifying schedules

```sql
select jobid, schedule, command, active from cron.job order by jobname;
select runid, jobid, status, return_message, start_time, end_time
  from cron.job_run_details order by start_time desc limit 20;
```

## Removing a schedule

```sql
select cron.unschedule('sita-dr-drill');
```
