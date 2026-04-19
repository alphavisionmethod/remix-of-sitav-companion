# Connector Streak & Proof Model

_Phase 5 model._ Defines the 7-day rolling proof that promotes connector truth from "strong-partial" to "behaviorally proven".

## Streak object

Per provider (one row in `connector_refresh_streak_state`):

```
provider                    text   -- google | microsoft | slack
current_streak_days         int    -- consecutive nightly passes
longest_streak_days         int    -- all-time max
last_pass_at                ts     -- last successful nightly run
last_fail_at                ts     -- last failed nightly run
last_failure_class          text   -- e.g. 'reauth_required', 'expiry_pressure'
streak_started_at           ts     -- when current streak began (NULL on fail)
total_runs_7d               int    -- total nightly runs in last 7 days
successful_runs_7d          int    -- successful nightly runs in last 7 days
last_run_id                 text   -- most recent run_id touched
```

## Update behavior (automatic via trigger)

On every insert into `connector_refresh_nightly_runs` with status ≠ 'running':

- Provider IS in `providers_passed[]` → `current_streak_days += 1`, update `last_pass_at`
- Provider NOT in `providers_passed[]` → `current_streak_days := 0`, update `last_fail_at` + `last_failure_class`, `streak_started_at := NULL`

## Classification (computed by `get_connector_refresh_streak_summary()`)

- `green` — all 3 providers `current_streak_days >= 7` AND zero unack reauth in last 24h
- `yellow` — min streak 1–6 days
- `red` — any unack reauth_required tokens in last 24h
- `building` — no successful runs yet

## Proof requirement

To classify connector truth as **proven** (not just strong-partial):
- ≥ 7 consecutive clean nightly verifier runs across all 3 providers
- Zero `reauth_required` in current 24h window
- Expiry-pressure passed in all 7 of the last 7 nights

Surfaced in `ConnectorTruthSummaryPanel` and `connector-refresh-streak-status.json`.
