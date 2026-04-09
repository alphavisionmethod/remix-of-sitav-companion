# SITA OS — Sensitive Document Governed Mode

## Trigger

Activated when documents contain:
- SSN, Tax ID, EIN
- Medical records (HIPAA-adjacent)
- Bank account numbers
- Legal documents (contracts, wills)
- Insurance policies with PII

## Automatic Actions

1. Privacy tier elevated to `restricted`
2. Memory scope narrowed
3. Support-safe redaction applied
4. Access audit trail activated
5. Advisor memory of contents time-limited
6. No LLM training data inclusion

## Access Control

| Role | Can View | Can Download | Audit Logged |
|------|----------|-------------|-------------|
| Owner | Full | Yes | Yes |
| Family Member | Redacted | No | Yes |
| Advisor | Metadata only | No | Yes |
| Support | Redacted summary | No | Yes |

## RLS Hardening

As of 2026-04-09, all sensitive document tables (`vault_items` and related) have RLS policies enforced with `TO authenticated` (not `public`). This ensures:
- No unauthenticated access to sensitive data
- All access requires valid JWT
- Audit trail tied to authenticated `auth.uid()`

## Policy Contracts

See `packages/policy-contracts`:
- `SensitiveDocumentPolicy`
- `RedactionRules`
- `AccessAuditEntry`

## Proof

- Classification receipt (why flagged sensitive)
- Access receipt (who viewed, when)
- Redaction receipt (what was hidden, for whom)
