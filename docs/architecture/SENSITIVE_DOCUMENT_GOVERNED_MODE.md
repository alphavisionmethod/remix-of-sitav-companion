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

## Policy Contracts

See `packages/policy-contracts`:
- `SensitiveDocumentPolicy`
- `RedactionRules`
- `AccessAuditEntry`

## Proof

- Classification receipt (why flagged sensitive)
- Access receipt (who viewed, when)
- Redaction receipt (what was hidden, for whom)
