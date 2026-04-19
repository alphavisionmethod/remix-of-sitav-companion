# AI Runtime Failure Classes

The nightly verifier classifies failures into one of these canonical
classes. The first failed sub-check determines the `failure_class` stored
on the `ai_runtime_nightly_runs` row.

| Class | Triggered when | Severity | Operator action |
|---|---|---|---|
| `live_provider_call` | Gateway returns non-200, empty content, or LOVABLE_API_KEY missing | high | Check gateway health, key rotation |
| `receipt_persistence` | No receipt found within 2 minutes of invocation | high | Investigate receipt writer path in ai-gateway |
| `ledger_write` | No ledger row found within 2 minutes | high | Investigate ledger writer path |
| `fallback_path` | Cannot insert + read back `ai_fallback_events` row | medium | Check RLS / write permissions on fallback table |
| `budget_enforcement` | Budget classes empty OR ledger 0 rows in 24h | medium | Verify users are still invoking AI; check budget seed |
| `provider_unavailable` | Network/exception calling gateway | high | Check gateway connectivity |
| `invocation_invalid` | Gateway returned malformed JSON | high | Check gateway response schema |
| `model_routing_mismatch` | Returned model differs from requested | medium | Investigate routing policy |
| `verification_query_mismatch` | DB read returned unexpected shape | low | Investigate schema drift |

## Severity thresholds

- ≥3 sub-check failures → run status = `fail`
- 1–2 sub-check failures → run status = `degraded`
- 0 failures → run status = `pass`

Both `fail` and `degraded` reset the streak and create a `ai_runtime_failure_alerts` row.
