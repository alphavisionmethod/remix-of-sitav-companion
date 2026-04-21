# Support — SITA OS

## Getting Help

### 🐛 Found a Bug?

[Open a bug report](../../issues/new?template=bug_report.yml) with reproduction steps.

### 💡 Feature Request?

[Open a feature request](../../issues/new?template=feature_request.yml) describing the problem and proposed solution.

### 🆘 Need Operational Support?

[Open a support request](../../issues/new?template=support_request.yml) with your environment details.

### 🔒 Security Issue?

**Do NOT open a public issue.** See [SECURITY.md](SECURITY.md) for responsible disclosure.

## Self-Service Resources

| Resource | Location |
|----------|----------|
| Architecture docs | `docs/architecture/` |
| Runbook library | `docs/runbooks/` |
| API contracts | `src/lib/contracts/` |
| Edge function ownership | `generated/edge-function-ownership.json` |
| Release readiness | `generated/ci-launch-gate-report.json` |
| Support bundle generator | `supabase/functions/generate-support-bundle` |

## Escalation Matrix

| Severity | Description | Response Target | Escalation Path |
|----------|-------------|----------------|-----------------|
| **P0 — Outage** | Production down, data loss risk | 15 min | On-call → platform-core → CTO |
| **P1 — Critical** | Major feature broken, no workaround | 1 hour | GitHub Issue → platform-core |
| **P2 — High** | Feature degraded, workaround exists | 4 hours | GitHub Issue → domain owner |
| **P3 — Medium** | Minor bug, cosmetic issue | 1 business day | GitHub Issue → triage |
| **P4 — Low** | Enhancement, nice-to-have | Best effort | GitHub Issue → backlog |

## Generating a Support Bundle

For backend issues, generate a diagnostic bundle:

```bash
# Via edge function (requires service role)
curl -X POST "$SUPABASE_URL/functions/v1/generate-support-bundle" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "<affected-user-id>"}'
```

Include the bundle ID in your support request for faster resolution.

## Support Channels

| Channel | Use For | SLA |
|---------|---------|-----|
| GitHub Issues | Bugs, features, support requests | Best effort |
| security@sita.os | Security vulnerabilities | 48h acknowledgment |
| On-call (internal) | Production incidents (P0/P1) | 15min response |

## Before Opening an Issue

1. Search [existing issues](../../issues) — your problem may already be tracked
2. Include your environment: browser, OS, commit SHA
3. For backend issues: include the correlation ID from the error response
4. For UI issues: include a screenshot or screen recording
5. For edge function issues: include the function name and invocation timestamp