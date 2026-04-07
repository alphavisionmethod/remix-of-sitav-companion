

# SITA OS — Full Contract & Implementation Audit

## Audit Scope
Reviewed: 30 packages, 18 contract families, 50 edge functions, 600+ routes, 443 tables, all barrel exports, all service directories, security scan, TSC compilation, test coverage.

## What's 100% Solid (No Action Needed)
- TypeScript compiles clean (zero errors)
- All 30 packages have valid barrel exports with actual type exports
- All 18 contract families (core, capability, approval, execution, proof, advisor, runtime, memory, graph, read-models, specialized, admin, kernel, MSA, native, api-schemas, domain-types, msa) are properly wired through the root barrel
- 600+ routes, all lazy-loaded (518 lazy imports)
- All 443 tables have RLS enabled, all policies target `authenticated` role
- Security scan: clean (leaked password protection is dashboard-only, already marked as ignored)
- Domain engines (business-os, finance-os, concierge-os, investment-office, revenue-autopilot, playbook-simulator) — all implemented, no TODOs
- Mnemosyne context assembler — fully implemented (286 lines), not a stub
- Push registration service — fully wired with VAPID from env, Capacitor, Electron support
- VITE_VAPID_PUBLIC_KEY configured in `.env`
- All secrets present (VAPID, OpenAI, Anthropic, Twilio, Supabase)
- 20 E2E specs, 34+ unit tests, 16 Deno edge function tests

---

## Gap 1: 17 Edge Functions Missing from API Schema Map (MEDIUM)

**Issue:** `EdgeFunctionMap` in `api-schemas/index.ts` defines typed request/response for 33 functions but is missing 17:

`admin-ai-workforce-run`, `ai-gateway`, `booking-manage`, `cashflow-calculate`, `connector-batch`, `connector-discover`, `connector-oauth`, `connector-transform`, `crm-sync`, `ecosystem-operations`, `invoice-generate`, `payment-process`, `push-dispatch`, `push-track`, `tax-estimate`, `vapid-public-key`, `verification-recorder`

**Impact:** These functions work fine but lack typed contracts. Any frontend code invoking them uses untyped responses.

**Fix:** Add request/response interfaces and EdgeFunctionMap entries for all 17 functions. Read each function's Zod schema to derive the correct types.

---

## Gap 2: 5 Edge Functions Not Referenced from Frontend (LOW)

**Issue:** These edge functions exist but are never invoked from any frontend code:
- `connector-transform` — backend-only data transformer
- `payment-process` — payment processing (should be wired to payment flows)
- `push-track` — delivery tracking (called by push-dispatch internally)
- `vapid-public-key` — public key endpoint (frontend uses env var directly)
- `verification-recorder` — called by other edge functions

**Impact:** `payment-process` is the only concern — it should be wired to payment execution UI. The others are backend-to-backend or env-var-based, which is correct.

**Fix:** Wire `payment-process` to the payment execution page/service. The other 4 are correctly backend-only — no action needed.

---

## Gap 3: Security Posture Engine Lists Known Gaps (INFO)

**Issue:** `src/lib/services/security/security-posture-engine.ts` self-documents 15 known gaps (G01-G15) as an honesty engine. Key ones:
- G12: "Database backup recovery not tested" (HIGH, blocks launch)
- G13: "Maintenance mode kill switch not implemented" (MEDIUM)
- G01: "Virus/malware scanning on uploads" — not implemented (LOW — type validation only)

**Impact:** These are accurately self-reported. G12 is an operational procedure (run Supabase test restore), not code. G13 is a feature request.

**Fix:** No code changes needed — these are operational items. The honesty engine correctly reports them. Optionally add a maintenance-mode edge function.

---

## Implementation Plan

| # | Task | Files | Priority |
|---|------|-------|----------|
| 1 | Add 17 missing EdgeFunctionMap entries | `src/packages/contracts/api-schemas/index.ts` | MEDIUM |
| 2 | Wire payment-process to payment UI | `src/pages/*` payment pages + service | MEDIUM |
| 3 | (Optional) Add maintenance-mode edge function | `supabase/functions/maintenance-mode/index.ts` | LOW |

**Total: 2 actionable gaps, 1 optional enhancement.** The project's contract layer, routing, security, and service architecture are fully connected and implemented.

