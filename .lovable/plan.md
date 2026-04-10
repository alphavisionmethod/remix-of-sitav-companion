

# Cron / Scheduler / Automation Reality — Remaining Gaps

## What's Already Working (Fully Built)
- **3 DB tables**: `scheduled_jobs` (24 cols), `job_executions` (19 cols), `automation_kill_switches` (13 cols) — all with RLS
- **pg_cron**: 4 active cron jobs calling `scheduler-dispatch` (*/3), `agent-scheduler` (*/5), `agent-heartbeat` (*/10), `runtime-probes` (*/15)
- **scheduler-dispatch edge function** (270 lines): kill switch check, due job finder, edge function dispatcher, execution recorder, next-run calculator, retry/degradation logic
- **self-healing edge function** (127 lines): stuck workflow recovery, connector freshness, notification checks, incident creation, telemetry
- **agent-scheduler edge function** (135 lines): due agent detection, scheduled execution, schedule updates
- **agent-heartbeat edge function** (80 lines): council-based heartbeat telemetry
- **system-updates edge function** (113 lines): update checks, device registration, update reporting
- **9 AR admin pages** (AR01–AR09): all with real Supabase queries, ARSubNav, DemoModeBadge
- **9 command palette entries**: all AR pages discoverable via Cmd+K
- **Seed data**: 16 canonical jobs covering all 14 job classes with correct schema

## Critical Gap Found: target_function Format Mismatch

The `scheduler-dispatch` edge function checks `job.target_function.startsWith("edge:")` to dispatch jobs. But the seeder writes bare function names (`"self-healing"`, `"agent-heartbeat"`, `"system-updates"`, `"agent-scheduler"`).

When `scheduler-dispatch` processes a job, it hits the `else` branch:
```
outcome = "failure";
errorMessage = `Unknown target_function format: ${job.target_function}`;
```

**Every seeded job will fail at dispatch.** This is the single most critical wiring bug.

### Fix
Two options — I recommend fixing the seeder to use the `edge:` prefix since that's what the dispatcher expects:

1. **Update `scheduledJobRows()` in the seeder** — prefix all target functions with `edge:` (e.g., `"edge:self-healing"`, `"edge:agent-heartbeat"`)

This is a 1-line change per job (16 jobs). The dispatcher already handles `edge:` targets correctly by stripping the prefix and calling the function URL.

## Implementation Steps

1. **Fix seeder target_function values** — change all 16 job targets from bare names to `edge:` prefixed format
2. **Build verification** — confirm clean TypeScript build

### Technical Details
- Change `"self-healing"` → `"edge:self-healing"`, `"agent-heartbeat"` → `"edge:agent-heartbeat"`, etc. in `scheduledJobRows()`
- ~16 line edits in one function
- No new files, tables, or migrations needed

