

The user wants me to re-verify the audit document is complete. Let me do a fresh sweep to confirm nothing is missing from `generated/FULL_ISSUES_AND_FIXES.md` v2.0.

I'll check:
1. Current document coverage vs live state
2. Any new gaps introduced since last write
3. Anything I missed in prior audit (cron jobs, edge function logs, secret state, etc.)

From the edge function logs in context: scheduler-dispatch, webhook-process, ai-health, health-cron, workflow-stuck-detector, connector-token-refresh are all booting/shutting down cleanly — no errors in runtime. Good signal.

Let me verify what's in the current document and cross-check against fresh evidence.

## Plan — Re-Audit & Top-Up `FULL_ISSUES_AND_FIXES.md` v2.1

### Verification sweep (read-only checks I'll run)

1. Read current `generated/FULL_ISSUES_AND_FIXES.md` to confirm v2.0 contents
2. Re-run Supabase linter for fresh findings
3. Re-run security scan for any net-new findings
4. Re-count: pages, components, edge functions, tables, policies, migrations, scripts, generated artifacts, tests
5. Re-check secrets list for any newly-set/missing secrets
6. Scan for new categories I may have missed:
   - pg_cron job presence (audit-log retention scheduled?)
   - Edge function runtime errors in last 24h
   - Orphan generated artifacts (>30 days stale)
   - Storage buckets inventory + policy coverage
   - Auth provider config (only Google enabled?)
   - Realtime publication membership (which tables stream?)
   - Database extension list (pgvector, pg_cron, pg_net presence)
   - Webhook secret rotation policy
   - Service worker version pinning
   - CSP / security headers in `nginx/default.conf`
   - Mobile app store assets (icons, splash, screenshots)
   - Translation completeness (en vs es/fr/de/ar key parity)
   - DSAR/account-delete UI surface in Settings (function exists, button wired?)

### Net-new categories likely missing from v2.0

Based on the edge logs and memory snapshot, candidates to add:

**P0 candidates (newly surfaced)**
- `OPN-P0-06` — pg_cron extension status unverified; `trim_kill_switch_audit_log` SQL helper exists but not scheduled
- `OPN-P0-07` — DSAR `data-export` and `account-delete` edge functions deployed but **no UI surface in Settings** to invoke them (compliance gap)

**P1 candidates**
- `OPN-P1-09` — Translation key parity not verified across 5 locales (machine-translated locales may have stale/missing keys)
- `OPN-P1-10` — CSP / security headers in `nginx/default.conf` not audited for prod hardening
- `OPN-P1-11` — Realtime publication membership not documented (which tables stream to clients)
- `OPN-P1-12` — Auth provider catalog: only Google + email; LinkedIn/Microsoft/Apple Sign-In missing for B2B

**P2 candidates**
- `OPN-P2-08` — Database extension inventory (pgvector? pg_net? pg_cron?) not asserted in CI
- `OPN-P2-09` — Storage bucket inventory + per-bucket policy coverage report missing
- `OPN-P2-10` — Mobile store assets (1024 icon, splash screens, store screenshots) not generated
- `OPN-P2-11` — Service worker version pinning / cache-busting strategy unverified

**P3 candidates**
- `OPN-P3-06` — Edge function cold-start metrics (logs show 30-200ms boots — within budget but unmonitored)
- `OPN-P3-07` — No SLO/SLA dashboard for the 5 flagship loops
- `OPN-P3-08` — Disaster recovery runbook exists but no quarterly drill schedule

### Document update target

**`generated/FULL_ISSUES_AND_FIXES.md` v2.1** — append/update only

Keep all 12 sections from v2.0. Update:
- Header version → v2.1
- Live snapshot → re-verified counts
- Section A → add OPN-P0-06, OPN-P0-07 if confirmed
- Section B → add OPN-P1-09 through OPN-P1-12 if confirmed
- Section C → add OPN-P2-08 through OPN-P2-11 if confirmed
- Section D → add OPN-P3-06 through OPN-P3-08
- Section E (per-surface matrix) → recompute with new blockers
- Section H (secrets) → add any newly-identified missing secrets
- Section I (evidence index) → add evidence paths for new IDs

### Files

| Action | Path |
|---|---|
| **Overwrite** | `generated/FULL_ISSUES_AND_FIXES.md` (v2.1) |

### Acceptance

- All v2.0 entries preserved (no regressions)
- Net-new gaps from re-audit added with IDs OPN-P0-06+, OPN-P1-09+, OPN-P2-08+, OPN-P3-06+
- Every new entry: ID, priority, surface, evidence path, remediation
- Live snapshot re-verified within the last execution
- Per-surface go/no-go matrix updated
- Document remains truth-only (no resolved log)
- Phase 32 verdict re-cited from latest `its-real-gate-report.json`

