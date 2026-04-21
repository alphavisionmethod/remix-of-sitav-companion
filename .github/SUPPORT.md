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