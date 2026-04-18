# AI Cost Metering — Remediation Status

_Generated: 2026-04-18T13:42:32.439Z_

## Audit verdict: REAL

### Edge function
- ✅ `supabase/functions/ai-gateway`

### Capability consumers (7)
- `src/lib/ai/ai-capability-client.ts`
- `src/lib/ai/hooks/use-advisor-chat.ts`
- `src/lib/ai/hooks/use-ai-capability.ts`
- `src/lib/ai/index.ts`
- `src/lib/ai/workforce-executor.ts`
- `src/pages/admin/AITSetupChecklist.tsx`
- `src/planes/backend.ts`

### Ledger writers (36)
- `src/domains/customer-journey/ai-journey-classifier.ts`
- `src/hooks/use-compute-governance.ts`
- `src/hooks/use-sag-data.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/ai/ai-launch-honesty-reclassifier.ts`
- `src/lib/ai/hooks/use-ai-runtime-verification.ts`
- `src/lib/backend-topology/edge-function-migration-map.ts`
- `src/lib/backend-topology/edge-function-table-io-map.ts`
- `src/lib/canonical-backend/index.ts`
- `src/lib/control-plane/kill-switch-registry.ts`
- `src/lib/db/db-audit-registry.ts`
- `src/lib/db/db-truth-registry.ts`
- `src/lib/db/migration-registry.ts`
- `src/lib/db/rls-policy-registry.ts`
- `src/lib/db/schema-registry.ts`

### Ledger tables
`ai_usage_ledger`, `ai_invocations`, `ai_inference_receipts`, `ai_workforce_invocations`, `ai_budget_alerts`

### Classification
**REAL METERING** — every AI invocation routes through the gateway and writes to the ledger. Budget alerts surface threshold breaches.

