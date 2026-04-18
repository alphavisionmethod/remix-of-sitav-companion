# Dependency Upgrade Proposer — Runbook

The internal AI workforce includes a real dependency upgrade scanner that
ingests genuine `npm audit` output and emits implementation suggestions for
operator review.

Edge function: `internal-agent-dependency-scanner`
Findings table: `dependency_upgrade_findings`
Suggestion table: `ai_implementation_suggestions` (proposed_change_type=`dependency_upgrade`)
Admin pages:
- `/admin/ai-runtime/dependency-findings` — drilldown of normalized findings
- `/admin/ai-runtime/suggestions` — review queue

## What it does

1. Accepts `{ "audit_json": <npm audit --json output> }` OR `{ "findings": [...] }`
2. Normalizes each entry to a `dependency_upgrade_findings` row
3. For severity ≥ moderate, calls `propose_implementation_suggestion`
   (idempotent on `npm-advisory-<advisory_id>`)
4. Links the finding row back to its suggestion

It will **refuse to run** without real input — there are no fake samples.

## Posting real audit data (recommended workflow)

From the project root, after a fresh `npm install`:

```bash
# 1. Run the audit and capture JSON
npm audit --json > /tmp/npm-audit.json

# 2. Post it to the scanner
curl -X POST \
  "https://<PROJECT-REF>.supabase.co/functions/v1/internal-agent-dependency-scanner" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d "$(jq -c '{audit_json: .}' /tmp/npm-audit.json)"
```

Replace `<PROJECT-REF>` with your project ref and `<SERVICE_ROLE_KEY>` with
the service-role key (this endpoint requires service-role; it is not
called from the browser).

## Verifying

```sql
-- Latest normalized findings
select package_name, severity, current_version, target_version,
       advisory_id, related_suggestion_id, created_at
  from public.dependency_upgrade_findings
  order by created_at desc
  limit 50;

-- Linked suggestions
select id, title, priority, status, source_signal_ref
  from public.ai_implementation_suggestions
  where proposed_change_type = 'dependency_upgrade'
  order by created_at desc
  limit 50;
```

## Operator review

Suggestions land in `/admin/ai-runtime/suggestions` with type
`dependency_upgrade`. Use Accept / Reject / In-progress / Done from the
drilldown drawer. The scanner is idempotent — re-running with the same
audit produces no duplicate suggestions.

## Optional CI hook

A scheduled CI job can run the audit and POST the result on every PR or
nightly cron. The function is service-role only and idempotent, so it is
safe to invoke as often as you like.

## Severity threshold

The scanner only generates suggestions for severity ≥ **moderate**.
`low` severity rows are persisted as findings but do not create suggestion
noise.

## Related

- `docs/runbooks/pg-cron-schedules.md` — cron schedules for the rest of
  the Phase 3 loops (reflect, suggestion-generator, weekly-digest)
- `generated/internal-ai-runtime-phase3/DEPENDENCY_UPGRADE_PROPOSER_SPEC.md`
  — full spec
