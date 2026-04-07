

# SITA OS — God-Tier Kernel Implantation Program

## Current State Assessment

The codebase **already has most kernel primitives** built and wired:

| Primitive | Current State | Gap |
|---|---|---|
| Canonical Chain Orchestrator | Full: Intent → Policy → Workflow → Execution → Verification → Receipt → Projection | No `ActionEnvelope` wrapper — raw params enter chain |
| Policy Engine | 249 lines, declarative rules, risk classification, durable persistence | Missing versioning, no kill-switch gate at kernel level |
| Receipt Service | Hash-chained, SHA-256, append-only, persisted to `sita_receipts` | No placeholder→finalize lifecycle |
| Executor Service | Mode-aware (real/shadow/simulation/draft), circuit breakers, idempotency | Missing `EMULATED`/`REAL_MOCK`/`REAL` tri-mode |
| Capability Router | Registration, routing, policy pre-check | No manifest enforcement or self-auth prevention |
| Approval Service | Full lifecycle: dual-approval, expiry, escalation, delegation | Not wired as resumable workflow suspension |
| Workflow Engine | State machine with transitions | No formal suspension/resume for approval |
| SitaKernel | 428 lines, boots 33 services, canonical execution path tracking | `executeAction` takes raw params, not ActionEnvelope |
| Kill Switch / Safe Mode | Exists in mock-data and demo-policy-engine | Not wired to kernel execution gate |
| Constitution Compiler | Evaluates before execution in kernel | Already integrated |
| Feature Governance | Owner boundary, intake, spec, capability registration validation | Already gating chain execution |
| Memory Service | Store with source/tags/confidence/entityId | No ingestion corridor or trust lens |

**Key finding:** The architecture is 85% built. What's missing is the **ActionEnvelope contract** as the universal entry point, the **receipt placeholder lifecycle**, the **tri-mode execution**, the **kernel kill switch**, and **boundary enforcement rules**.

## Implementation Plan (6 Steps)

### Step 1 — ActionEnvelope Contract (Sacred Entry Point)

Create `src/packages/contracts/kernel/action-envelope.ts`:

```text
ActionEnvelope {
  id, schemaVersion, actionType,
  tenantId, workspaceId, actorId, actorType,
  source (ui | advisor | system | workflow | connector),
  causationId, correlationId, traceId,
  intent { action, domain, description, parameters },
  risk { tier, costEstimate, sideEffectClass },
  approval { required, tier },
  execution { mode (EMULATED | REAL_MOCK | REAL), isReplay },
  evidence { references[], confidence },
  metadata (sandboxed Record),
  createdAt, expiresAt
}
```

Also create: `ActionPlan`, `ActionSpec`, `ReplayPacket`, `NegativeReceipt`, `EvidencePack`, `ReasoningTrace` — all as pure contracts with zero runtime deps.

Create barrel at `src/packages/contracts/kernel/index.ts`.

### Step 2 — Receipt Placeholder Lifecycle

Upgrade `ReceiptService` to enforce:
1. `createPlaceholder(correlationId, capabilityId)` → status `"pending"`
2. `execute(...)` → status `"executing"`
3. `finalize(receiptId, result)` → status `"valid"`, hash computed
4. No execution path can skip placeholder creation

Wire into `CanonicalChainOrchestrator.execute()` so the receipt is created *before* executor runs.

### Step 3 — Tri-Mode Execution + Kill Switch

**Execution Modes:** Add `EMULATED | REAL_MOCK | REAL` to `ActionEnvelope`. Map to existing executor modes:
- `EMULATED` → `draft` (no side effects, synthetic output)
- `REAL_MOCK` → `simulation` (real logic, mock adapters)  
- `REAL` → `real` (live execution)

**Invariant:** Output schema must be identical across all three modes. Add a runtime assertion in executor that validates output shape is mode-independent.

**Kill Switch:** Add `checkKillSwitch()` to `SitaKernel.executeAction()` before chain entry. Reads from DB/config. If active → force `EMULATED` mode or block entirely.

### Step 4 — Wrap SitaKernel with ActionEnvelope

Refactor `SitaKernel.executeAction()`:
- Accept `ActionEnvelope` instead of raw params
- Add `createActionEnvelope()` factory for UI/advisor/system callers
- Internal: convert envelope to chain input
- Reject any call that bypasses envelope (type enforcement)

Add `SitaKernel.replayAction(receiptId)` that loads receipt + original envelope and re-executes in `EMULATED` mode.

### Step 5 — Approval Suspension/Resume

Wire `ApprovalService` into canonical chain as true suspension:
1. When policy returns `require-approval` → create `ApprovalRequest` with `linkedEnvelopeId`
2. Store serialized `ActionEnvelope` in approval context
3. On approval decision → `SitaKernel.resumeAction(approvalId)` deserializes envelope and re-enters chain past policy gate
4. On rejection → create `NegativeReceipt` with reason

### Step 6 — Boundary Enforcement + Memory Trust Lens

**Boundary rules** (ESLint + architecture scripts):
- `packages/contracts/` → zero runtime imports
- `packages/kernel/` → imports only from contracts
- No direct model/LLM calls outside `ai-gateway`
- No raw execution params outside ActionEnvelope (grep-based CI check)

**Memory trust lens** — upgrade `MemoryService.store()`:
- Add `trustLevel: "verified" | "inferred" | "external" | "user-provided"`
- Add `ingestedAt`, `sourceType`, `sanitized` flag
- Add `sanitize()` step that strips HTML/script tags before storage
- Retrieval includes trust metadata so consumers can degrade confidence

## What Will NOT Change

- No new services or packages beyond contracts
- No physical monorepo restructure — logical boundaries enforced via lint/scripts
- No Temporal or heavy workflow infrastructure
- No knowledge graph or vector DB
- No changes to existing edge functions
- No UI changes in this phase
- All 33 existing kernel services remain as-is

## Files Created/Modified

| Action | File |
|---|---|
| Create | `src/packages/contracts/kernel/action-envelope.ts` |
| Create | `src/packages/contracts/kernel/action-plan.ts` |
| Create | `src/packages/contracts/kernel/replay-packet.ts` |
| Create | `src/packages/contracts/kernel/evidence-pack.ts` |
| Create | `src/packages/contracts/kernel/negative-receipt.ts` |
| Create | `src/packages/contracts/kernel/reasoning-trace.ts` |
| Create | `src/packages/contracts/kernel/index.ts` |
| Modify | `src/packages/contracts/index.ts` — add kernel barrel |
| Modify | `src/lib/core-services/receipt-service.ts` — placeholder lifecycle |
| Modify | `src/lib/core-services/executor-service.ts` — tri-mode + schema invariant |
| Modify | `src/lib/core-services/canonical-chain-orchestrator.ts` — envelope input + placeholder receipt |
| Modify | `src/lib/sita-kernel.ts` — ActionEnvelope entry, kill switch, replay, resume |
| Modify | `src/lib/core-services/memory-service.ts` — trust lens + sanitization |
| Create | `scripts/architecture/check-action-envelope-boundary.ts` — CI boundary check |
| Create | `src/lib/__tests__/action-envelope.test.ts` — contract + replay tests |

## Success Criteria

- No execution path accepts raw params — everything is ActionEnvelope
- Every execution creates placeholder receipt before running
- Tri-mode execution produces identical output schemas
- Kill switch blocks or downgrades execution globally
- Approvals suspend and resume deterministically
- Memory stores trust metadata on every entry
- Architecture script catches boundary violations
- Replay works via receipt + envelope lineage

