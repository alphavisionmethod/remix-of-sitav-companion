# Dependency Upgrade Proposer — Specification

## Components
- **Edge function**: `supabase/functions/internal-agent-dependency-scanner/index.ts`
- **Findings table**: `dependency_upgrade_findings` (RLS: admin SELECT, service_role write)
- **Suggestion linkage**: each finding above `moderate` calls `propose_implementation_suggestion`
  with `proposed_change_type=dependency_upgrade` and `source_signal_ref=npm-advisory-{id}`
- **CI hook**: `scripts/runtime/post-dependency-audit.ts` (documented in `docs/runbooks/dependency-upgrade-proposer.md`)

## Real input contract
The function REFUSES synthetic data. Accepted POST body:
```json
{
  "audit_json": <output of `npm audit --json`>,
  "outdated_json": <output of `npm outdated --json`>  // optional
}
```
Returns 400 if `audit_json.advisories` and `audit_json.vulnerabilities` are both empty/absent.

## Normalization
Each finding stored as:
```
{ package, current_version, target_version, severity, advisory_id, ecosystem,
  source: 'npm-audit' | 'npm-outdated', linked_suggestion_id, raw_json }
```

## Idempotency
- `dependency_upgrade_findings`: UNIQUE `(package, advisory_id)`
- Suggestions: UNIQUE `source_signal_ref` prevents duplicate proposals

## Operator visibility
`/admin/ai-runtime/dependency-findings` lists all findings with severity filter and
linked suggestion status.
