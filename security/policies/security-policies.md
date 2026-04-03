# SITA OS — Security Policies

## Overview
These policies govern how SITA OS handles data, access, and operations. They apply to all code, infrastructure, and processes.

---

## 1. Data Classification Policy

### Levels
| Level | Definition | Examples | Handling |
|-------|-----------|----------|----------|
| **Public** | Non-sensitive, no impact if disclosed | App UI text, public docs | Standard access |
| **Internal** | Business-relevant, limited impact | Invoices, task lists, budgets | RLS-protected, user-scoped |
| **Confidential** | Significant impact if disclosed | Contracts, financial statements, tax docs | RLS + UI sensitivity badges |
| **Restricted** | Severe impact; regulatory implications | Medical records, SSN, identity docs, bank credentials | RLS + re-auth + audit logging |

### Rules
- All data defaults to **Internal** unless explicitly classified
- **Restricted** data must never be logged in plaintext
- **Confidential** and **Restricted** data must be encrypted at rest
- Classification is determined during file ingestion and stored in `sensitivity` field

---

## 2. Access Control Policy

### Principles
- **Least Privilege**: Users access only their own data
- **Defense in Depth**: RLS + application-level checks + audit logging
- **No Anonymous Access**: All operations require authenticated session
- **Role Separation**: Admin operations require `user_roles` with `has_role()` check

### Rules
- Every database table MUST have RLS enabled
- Every RLS policy MUST include `auth.uid() = user_id` (or admin check for admin tables)
- No raw SQL execution from client or edge functions
- Service role key used only in edge functions, never exposed to client
- Admin functions must verify role server-side, never client-side

---

## 3. AI & Advisor Policy

### Principles
- **No Autonomous High-Risk Actions**: AI recommendations for payments, deletions, or external communications require owner approval
- **Transparency**: All AI reasoning is logged and visible in proof chain
- **No Hallucination Tolerance**: Grounding checks, confidence scoring, and refusal protocol enforced

### Rules
- Every AI request must have a `correlation_id` for traceability
- AI responses must include `confidence` score and `model_used`
- Actions with `confidence < 0.5` must be flagged for human review
- AI cost tracked per request; daily budget alerts configured
- No user data used for model training or fine-tuning

---

## 4. Incident Response Policy

### Severity Levels
| Severity | Response Time | Escalation |
|----------|--------------|------------|
| Critical | Immediate | Auto-safe-mode; owner notified |
| High | 1 hour | Mission Control alert; AI team paused |
| Medium | 4 hours | Dashboard notification |
| Low | 24 hours | Logged for review |

### Process
1. **Detection**: Automated via fraud sentinel, anomaly detection, health checks
2. **Triage**: Severity assessment, affected service identification
3. **Containment**: Safe mode activation if critical; pause affected workflows
4. **Resolution**: Root cause analysis, fix deployment
5. **Post-Mortem**: Incident recorded in `incidents` table with full timeline

---

## 5. Data Retention Policy

| Data Type | Retention | Deletion |
|-----------|-----------|----------|
| Audit logs | 2 years | Auto-archive |
| Proof records | 7 years | Manual archive only |
| AI request/response logs | 1 year | Auto-cleanup |
| User data | Until account deletion | CASCADE delete on auth.users |
| Sync logs | 90 days | Auto-cleanup |
| Firewall logs | 1 year | Auto-cleanup |

---

## 6. Connector Security Policy

- OAuth tokens encrypted before storage
- Tokens never sent to client; used only in edge functions
- Connector health monitored; stale connections flagged
- Credential rotation recommended every 90 days
- Failed sync attempts logged and alerted after 3 consecutive failures
