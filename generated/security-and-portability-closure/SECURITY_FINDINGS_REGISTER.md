# Security Findings — Register

**Source of truth:** `generated/security-and-portability-closure/security-findings-register.json`  
**Lifecycle:** `open` → `pending-remediation` → (`closed` | `accepted-risk` | `blocked-externally`)

## Schema

```ts
interface Finding {
  id: string;                // FND-YYYY-NNNN
  severity: "low" | "med" | "high" | "crit";
  area: "rls" | "electron" | "debugger-tamper" | "session-threat" | "secret-rotation" | "portability";
  status: "open" | "pending-remediation" | "closed" | "accepted-risk" | "blocked-externally";
  opened_at: string;         // ISO-8601
  closed_at?: string;
  remediation_ref?: string;  // PR / commit / runbook id
  summary: string;
  evidence_path?: string;
}
```

## Initial register state

The register is bootstrapped empty. Findings flow in from:
- adversarial validator runs (`check-*-proof.ts`)
- security council reviews
- external penetration tests (when conducted)
- production incident retrospectives

## Closure rule

A release gate **never** silently masks an open `crit` or `high` finding. The aggregator (`check-security-adversarial-proof.ts`) reads the register and refuses to pass if any open finding has severity ≥ high without `accepted-risk` documentation.
