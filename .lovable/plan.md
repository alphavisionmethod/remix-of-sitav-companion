

# Implement 6 Production Edge Functions — From Scaffold to Active

## Summary

Create 6 new edge functions that currently don't exist. Each will follow the established SITA OS edge function pattern (auth via `_shared/auth.ts`, CORS via `_shared/cors.ts`, rate limiting, Zod validation, audit logging, receipt generation).

All required database tables already exist: `invoices`, `financial_accounts`, `bookings`, `customers`, `leads`, `opportunities`, `approval_queue`, `audit_logs`, `communication_log`, `receipts`.

## Functions to Build

### 1. `invoice-generate` (~180 lines)
**Actions**: `generate` | `send` | `mark-paid` | `void` | `list`
- `generate`: Creates invoice record from customer + line items, auto-generates invoice number (`INV-{timestamp}`), calculates aging days from due date
- `send`: Updates invoice status to `sent`, logs to `communication_log`, creates receipt
- `mark-paid`: Updates status to `paid`, records payment proof, creates receipt
- `void`: Updates status to `void` with reason
- `list`: Returns user's invoices with optional status/customer filters

### 2. `payment-process` (~200 lines)
**Actions**: `initiate` | `verify` | `list-pending` | `cancel`
- `initiate`: Validates amount/account, creates approval queue entry (all payments require approval), logs audit
- `verify`: Checks approval status, if approved marks payment executed, creates receipt with hash
- `list-pending`: Returns pending payment approvals
- `cancel`: Cancels pending payment, logs cancellation
- Integrates with `financial_accounts` for balance checks (warn if insufficient, don't block)

### 3. `crm-sync` (~180 lines)
**Actions**: `sync-leads` | `sync-customers` | `sync-opportunities` | `health-check`
- `sync-leads`: Upserts lead records from external payload (connector-ready shape)
- `sync-customers`: Upserts customer records with dedup by email
- `sync-opportunities`: Upserts opportunities linked to customers
- `health-check`: Returns counts, last sync timestamps, data quality metrics
- All syncs log to `audit_logs` with category `crm-sync`

### 4. `cashflow-calculate` (~220 lines)
**Actions**: `analyze` | `forecast` | `safe-to-spend` | `burn-rate`
- `analyze`: Pulls invoices (receivables) + financial accounts, calculates net position, inflows/outflows by period
- `forecast`: Projects 30/60/90 day cash position from invoice due dates and recurring patterns
- `safe-to-spend`: Deterministic calculation — total liquid balance minus upcoming obligations minus reserve target
- `burn-rate`: Monthly spend rate from recent transaction patterns
- All calculations are **deterministic** (no LLM) per truth-status.yaml rules

### 5. `tax-estimate` (~200 lines)
**Actions**: `estimate-federal` | `estimate-quarterly` | `summary`
- `estimate-federal`: US 2024 brackets (deterministic), takes income + filing status, returns marginal/effective rates and tax owed
- `estimate-quarterly`: Divides annual estimate by 4, applies safe harbor rules
- `summary`: Combined federal + self-employment tax estimate
- Hard-coded 2024 US federal brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%)
- Self-employment tax: 15.3% on 92.35% of net SE income
- **Zero LLM involvement** — pure math per architecture rules

### 6. `booking-manage` (~170 lines)
**Actions**: `create` | `update` | `cancel` | `list` | `confirm`
- `create`: Creates booking with type/title/provider/date/details
- `update`: Updates booking details or reschedules
- `cancel`: Sets status to `cancelled`, logs reason
- `confirm`: Sets status to `confirmed`, creates receipt
- `list`: Returns bookings with optional type/status/date-range filters

## Shared Patterns (All 6 Functions)

```text
1. OPTIONS → CORS response
2. Rate limit check (60/min)
3. Auth via requireAuth()
4. Zod body validation per action
5. Business logic + DB operations
6. Audit log entry
7. Receipt generation (for mutations)
8. Structured JSON response with corsResponse()
```

## Files Created

| File | Lines (est.) |
|------|-------------|
| `supabase/functions/invoice-generate/index.ts` | ~180 |
| `supabase/functions/payment-process/index.ts` | ~200 |
| `supabase/functions/crm-sync/index.ts` | ~180 |
| `supabase/functions/cashflow-calculate/index.ts` | ~220 |
| `supabase/functions/tax-estimate/index.ts` | ~200 |
| `supabase/functions/booking-manage/index.ts` | ~170 |

## No Database Migration Needed
All tables exist. Pure edge function creation.

## Architecture Report Update
After implementation, update `/mnt/documents/FINAL_ARQ_REPORT_SITA_OS_v5.md` and `ARCHITECTURE_STATUS_SITA_OS_v5.md` to change all 6 functions from "Scaffold" to "Active" and update the edge function count from 40 to 46.

