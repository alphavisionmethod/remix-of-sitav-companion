# Backend Plane Manifest

## Purpose
Source of truth for all canonical services, orchestration, trust evaluation, AI gateway, cloud backbone, persistence, and observability. The backend plane owns authoritative state and command execution.

## Ownership
- **Primary owner**: Backend Engineering
- **Services**: ~45 canonical services (budget enforced)
- **Trust level**: Highest — sole authority for receipts, proofs, approvals

## Directories (Current Lovable SPA)
| Path | Description |
|------|-------------|
| `src/lib/core-services/` | Canonical service implementations |
| `src/lib/cloud-backbone/` | Cloud infrastructure services (11 services) |
| `src/lib/platform-plane/` | BFF, RBAC, safety, notification routing |
| `src/lib/persistence/` | Supabase persistence adapters |
| `src/lib/observability/` | Structured logging, tracing, SLOs, health |
| `src/lib/ai/` | AI capability client |
| `src/lib/services/ai-gateway/` | AI gateway service layer |
| `src/lib/intelligence-architecture/` | Intelligence pipeline architecture |
| `src/lib/advisor-intelligence/` | Advisor specialization and confidence |
| `src/lib/advisor-protocol/` | Advisor handoff/escalation protocols |
| `src/lib/boardroom/` | Boardroom decision orchestration |
| `src/lib/strategic-intelligence/` | Cost-to-confidence, quality floors, AI portfolio |
| `src/lib/domain-engines/` | Business/Finance/Concierge pure engines |
| `src/lib/compute-governance/` | Model routing, budget policy, margin protection |
| `src/lib/no-hallucination/` | Anti-hallucination controls |
| `src/lib/ai-engineering/` | Monte Carlo, market intelligence |
| `src/lib/detection/` | Reality detection engine |
| `supabase/functions/` | Edge functions (deployed to Deno) |

## Migration Target
```
/backend/services/
/backend/gateway/
/backend/workers/
/backend/libs/persistence/
/backend/libs/observability/
/backend/edge-functions/
```

## Allowed Dependencies
- `shared` (contracts, types, schemas)

## Forbidden Dependencies
- `os`, `admin`, `founder`, `mobile` (no UI imports)
- No `react` imports
- No `@/pages/` or `@/components/` imports

## Deployment Target
- Edge Functions → Deno (Supabase)
- Services → Node.js / Deno containers
- Gateway → API Gateway + WebSocket

## Build Pipeline
```bash
turbo run build --filter=@sita/backend
turbo run typecheck --filter=@sita/backend
turbo run test --filter=@sita/backend
```

## Environment Schema
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Database endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role for backend operations |
| `AI_GATEWAY_URL` | Yes | AI inference endpoint |
| `REDIS_URL` | No | Cache layer for rate limiting |
