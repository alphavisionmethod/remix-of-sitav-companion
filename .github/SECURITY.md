# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| develop | :white_check_mark: |
| < main  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue.
2. Email **security@sita.os** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
3. You will receive an acknowledgment within **48 hours**.
4. We aim to provide a fix or mitigation within **7 business days**.

## Security Measures

- All database tables require Row-Level Security (RLS) policies
- Edge functions use shared authentication helpers
- Admin actions require audit logging
- Secrets are managed via environment variables, never committed
- Dependencies are monitored via `npm audit` in CI
- Architecture boundary checks prevent privilege escalation paths