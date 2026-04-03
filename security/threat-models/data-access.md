# Threat Model: Data Access & Row-Level Security

## System Description
All user data in SITA OS is stored in Lovable Cloud (Supabase PostgreSQL) with Row-Level Security (RLS) enforced on every table. The client uses the anon key; all data access is filtered by `auth.uid()`.

## Assets
- Business data (leads, customers, opportunities, invoices, quotes, communications)
- Financial data (bills, subscriptions, reserves, budgets, financial documents)
- Concierge data (tasks, bookings, events)
- System data (workflows, proof records, audit logs, trust state)
- Sensitive documents (medical, identity, tax, contracts)

## Trust Boundaries
1. **Client App ↔ PostgREST** — Anon key + JWT; RLS enforces per-row access
2. **Edge Functions ↔ Database** — Service role key bypasses RLS; used only for system operations
3. **User A ↔ User B** — Complete data isolation via `user_id` foreign key in every table

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Access data as another user | Critical | Every table: `auth.uid() = user_id` in RLS USING clause | Mitigated |
| Bypass RLS with crafted requests | Critical | PostgREST enforces RLS; no direct SQL access from client | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Modify another user's records | Critical | RLS WITH CHECK: `auth.uid() = user_id` on INSERT/UPDATE | Mitigated |
| Delete audit logs | High | `audit_logs` has no DELETE policy; users cannot delete logs | Mitigated |
| Modify capabilities table | High | `capabilities` table: authenticated can only SELECT, not INSERT/UPDATE/DELETE | Mitigated |
| Tamper with firewall logs | Medium | `tenant_firewall_logs`: no UPDATE/DELETE policies | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Cross-tenant data leakage | Critical | Every table uses `auth.uid() = user_id` filter | Mitigated |
| Sensitive document exposure | High | `financial_documents.sensitivity` field + RLS isolation | Mitigated |
| Query result set too large | Medium | Supabase default 1000-row limit per query | Accepted |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Create admin role for self | Critical | `user_roles` INSERT/UPDATE/DELETE requires `has_role(auth.uid(), 'admin')` | Mitigated |
| Access admin-only functions | High | `has_role()` is SECURITY DEFINER; cannot be spoofed client-side | Mitigated |

---

## RLS Coverage Audit

| Table | RLS Enabled | Policy Type | Verified |
|-------|-------------|-------------|----------|
| profiles | ✅ | SELECT/INSERT/UPDATE (no DELETE) | ✅ |
| leads | ✅ | ALL (uid = user_id) | ✅ |
| customers | ✅ | ALL (uid = user_id) | ✅ |
| opportunities | ✅ | ALL (uid = user_id) | ✅ |
| invoices | ✅ | ALL (uid = user_id) | ✅ |
| quotes | ✅ | ALL (uid = user_id) | ✅ |
| communications | ✅ | ALL (uid = user_id) | ✅ |
| bills | ✅ | ALL (uid = user_id) | ✅ |
| subscriptions | ✅ | ALL (uid = user_id) | ✅ |
| reserves | ✅ | ALL (uid = user_id) | ✅ |
| tasks | ✅ | ALL (uid = user_id) | ✅ |
| bookings | ✅ | ALL (uid = user_id) | ✅ |
| budgets | ✅ | ALL (uid = user_id) | ✅ |
| deals | ✅ | ALL (uid = user_id) | ✅ |
| financial_documents | ✅ | ALL (uid = user_id) | ✅ |
| proof_records | ✅ | ALL (uid = user_id) | ✅ |
| events | ✅ | ALL (uid = user_id) | ✅ |
| workflows | ✅ | ALL (uid = user_id) | ✅ |
| workflow_runs | ✅ | ALL (uid = user_id) | ✅ |
| workflow_steps | ✅ | ALL (uid = user_id) | ✅ |
| advisor_configs | ✅ | ALL (uid = user_id) | ✅ |
| advisor_requests | ✅ | ALL (uid = user_id) | ✅ |
| advisor_responses | ✅ | ALL (uid = user_id) | ✅ |
| approval_queue | ✅ | ALL (uid = user_id) | ✅ |
| user_memory | ✅ | ALL (uid = user_id) | ✅ |
| policies | ✅ | ALL (uid = user_id) | ✅ |
| connector_configs | ✅ | ALL (uid = user_id) | ✅ |
| connector_credentials | ✅ | CRUD (authenticated, uid = user_id) | ✅ |
| audit_logs | ✅ | SELECT + INSERT only | ✅ |
| capabilities | ✅ | SELECT only (authenticated) | ✅ |
| trust_state | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| execution_envelopes | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| projections | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| receipts | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| incidents | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| council_decisions | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| device_statuses | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| sync_logs | ✅ | ALL (authenticated, uid = user_id) | ✅ |
| tenant_firewall_logs | ✅ | SELECT + INSERT only | ✅ |
| user_roles | ✅ | Admin-gated via has_role() | ✅ |

## Residual Risks
1. **Service role key exposure** — If edge function secret leaks, attacker bypasses all RLS. Mitigation: secrets managed by Lovable Cloud; never exposed to client.
2. **Overly permissive ALL policies** — Some tables use `FOR ALL` instead of granular per-operation policies. Acceptable for single-tenant personal OS where user owns all their data.
