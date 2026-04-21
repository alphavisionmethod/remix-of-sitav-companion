# Security Policy

## Supported Versions

| Branch | Supported | Notes |
| ------- | --------- | ----- |
| `main` | ✅ | Production-ready, receives security patches |
| `develop` | ✅ | Pre-release, receives security patches |
| Feature branches | ❌ | Not monitored for vulnerabilities |
| Tags < latest | ❌ | Upgrade to latest release |

## Reporting a Vulnerability

**⚠️ Do NOT open a public GitHub issue for security vulnerabilities.**

### Responsible Disclosure Process

1. **Email** `security@sita.os` with:
   - Clear description of the vulnerability
   - Steps to reproduce (PoC if possible)
   - Potential impact assessment (CVSS score if known)
   - Affected component (frontend, edge function, database, AI, etc.)

2. **Response timeline:**
   | Stage | SLA |
   |-------|-----|
   | Acknowledgment | 48 hours |
   | Severity classification | 72 hours |
   | Fix for Critical/High | 7 business days |
   | Fix for Medium/Low | 30 business days |
   | Public disclosure (coordinated) | After fix deployed |

3. **What to expect:**
   - A tracking ID for your report
   - Regular status updates until resolution
   - Credit in the security advisory (if desired)

## Security Architecture

### Database Security
- All tables require **Row-Level Security (RLS)** policies — enforced by CI (`check-rls-coverage.ts`)
- User roles stored in dedicated `user_roles` table — never on `profiles`
- Admin actions logged to append-only `admin_action_audit` table
- Sensitive data redacted in support bundles

### Authentication & Authorization
- Edge functions use shared auth helpers (`_shared/validate-service-role.ts`)
- Admin sessions with MFA verification and expiry
- No anonymous sign-ups — email verification required
- Service-role key usage audited

### Secrets Management
- No secrets committed to the repository
- Runtime secrets managed via Lovable Cloud / environment variables
- Secret rotation tracked via `secret-rotation-orchestrator` edge function
- `.env.production.example` documents required variables without values

### CI/CD Security
- All workflows use `permissions:` least-privilege declarations
- Dependency updates monitored via Dependabot
- `npm audit` runs on every CI pipeline
- Architecture boundary checks prevent privilege escalation imports
- Sensitive document privacy validated in CI

### AI Safety
- Epistemic firewall on high-stakes AI outputs (finance, tax, boardroom)
- Structured negative receipts for all blocked/refused actions
- Budget enforcement prevents unbounded AI spend
- Action proof packs for reversible AI-executed operations

## Security-Related CI Gates

| Gate | Script | Blocking? |
|------|--------|-----------|
| RLS Coverage | `scripts/check-rls-coverage.ts` | Advisory |
| Sensitive Doc Privacy | `scripts/architecture/check-sensitive-document-privacy.ts` | Advisory |
| Edge Function Health | `scripts/check-edge-function-health.ts` | Advisory |
| npm Audit | `npm audit --audit-level=critical` | Advisory |
| Architecture Boundaries | `scripts/architecture/check-plane-boundaries.ts` | Blocking |
| Workflow Governance | `scripts/root/check-workflow-governance.ts` | Advisory |