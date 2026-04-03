# Threat Model: Payment Execution

## System Description
Payment execution in SITA OS is policy-gated. Every payment intent goes through fraud pre-check, policy evaluation, optional approval, simulation, execution, and receipt generation.

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Unauthorized payment initiation | Critical | RLS on bills/invoices; payment execution requires authenticated user_id match | Mitigated |
| Fake payment confirmation | High | Payment receipts generated server-side with hash; stored in proof_records | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Modify payment amount after approval | Critical | Approval records are immutable; re-approval required for any change | Mitigated |
| Alter bill status without payment | Medium | Status changes require owner auth via RLS | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Bank account details in transit | High | All API calls over TLS 1.3; no account numbers stored in plaintext | Mitigated |
| Payment history visible to non-owners | High | RLS: `auth.uid() = user_id` on all financial tables | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Bulk payment scheduling flood | Medium | Rate limiting; policy engine caps concurrent payment executions | Mitigated |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Auto-pay bypass of approval | High | Auto-pay flag is owner-controlled; high-amount payments still require approval per policy | Mitigated |
| Fraud sentinel override | High | Fraud hold cannot be released without explicit owner decision | Mitigated |

---

## Controls
- **Fraud Sentinel**: Pre-check on every payment (amount, timing, recipient, velocity, geo anomalies)
- **Policy Engine**: Configurable thresholds for auto-approve vs. manual approval
- **Simulation**: Dry-run before execution shows impact on cash position
- **Receipt Chain**: Every completed payment generates a hashed receipt in proof_records
