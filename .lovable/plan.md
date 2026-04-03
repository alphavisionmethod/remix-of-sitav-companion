

# Shared Services Layer — 13 Service Modules (~60 Files)

## What gets built

All services go under `src/lib/services/` following the established pattern: TypeScript interfaces, pure functions, mock data fallbacks, barrel exports. Each file imports types from existing `src/packages/` contracts.

### 1. Policy Engine (`src/lib/services/policy-engine/`)
- `truth-boundaries.service.ts` — Evaluates fields against `TRUTH_BOUNDARIES` from policy-contracts; returns violation reports when LLM-sourced data enters forbidden fields
- `approval-requirements.service.ts` — Given an action type + amount, resolves required approval level using `ApprovalThreshold` contracts; supports domain-specific overrides
- `sensitive-doc-policy.service.ts` — Classifies documents against `SENSITIVE_DOCUMENT_POLICIES`; returns privacy tier, redaction rules, audit requirements
- `outbound-comm-policy.service.ts` — Validates outbound communications against `OUTBOUND_POLICIES`; checks time windows, rate limits, opt-out, dual-approval requirements
- `index.ts` barrel

### 2. Approval Engine (`src/lib/services/approval-engine/`)
- `approval-requests.service.ts` — Creates/manages `ApprovalRequest` objects; tracks status lifecycle (pending → approved/rejected/expired)
- `approval-routing.service.ts` — Routes approvals to correct approver based on domain, risk tier, amount; supports delegation chains
- `escalation-rules.service.ts` — Time-based escalation logic; auto-escalates after timeout; supports multi-step `MultiStepApproval` flows
- `approval-history.service.ts` — Queries and aggregates past approval decisions; computes approval velocity, rejection rates
- `index.ts` barrel

### 3. Capability Router (`src/lib/services/capability-router/`)
- `capability-registry.service.ts` — Registry of all `CapabilityContract` entries; lookup by domain/family, risk tier filtering
- `pack-enablement.service.ts` — Checks which capabilities are enabled per tenant based on installed packs/entitlements
- `shell-space-routing.service.ts` — Maps capability IDs to shell surface routes; determines which UI space handles an action
- `index.ts` barrel

### 4. Executor Service (`src/lib/services/executor-service/`)
- `execute-action.service.ts` — Wraps action execution in `ExecutionEnvelope`; handles idempotency, mode (live/dry-run/simulation), status tracking
- `execute-workflow-step.service.ts` — Advances `WorkflowState` by executing a single step; handles step transitions, failure, retry
- `execute-connector-action.service.ts` — Executes connector-specific actions (sync, send, fetch); validates connector health before execution
- `index.ts` barrel

### 5. Receipt Service (`src/lib/services/receipt-service/`)
- `receipts.service.ts` — Creates typed `Receipt` objects with hash chaining; generates receipt IDs, computes hashes
- `proof-bundles.service.ts` — Assembles `ProofBundle` from multiple receipts; validates chain integrity
- `approval-receipts.service.ts` — Generates `ApprovalProof` receipts from approval decisions
- `execution-receipts.service.ts` — Generates `ExecutionProof` receipts from completed execution envelopes
- `index.ts` barrel

### 6. Verification Engine (`src/lib/services/verification-engine/`)
- `verification.service.ts` — Compares expected vs actual outcomes using `VerificationRecord`; flags discrepancies
- `rollback-signals.service.ts` — Detects rollback conditions; generates `RollbackProof` when verification fails critically
- `postcondition-checks.service.ts` — Runs post-execution assertions (balance changed, email delivered, record updated)
- `index.ts` barrel

### 7. Event Bus (`src/lib/services/event-bus/`)
- `event-envelope.ts` — Factory for `EventEnvelope` creation with auto-generated IDs, correlation tracking
- `publish-event.service.ts` — In-memory pub/sub publisher; queues `SitaEvent` instances to registered subscribers
- `subscribe-event.service.ts` — Subscription management; filter by event type, domain; handler registration
- `index.ts` barrel

### 8. Projections (`src/lib/services/projections/`)
Projection aggregators that compose data from domain services into view-ready shapes:
- `home/home-projection.service.ts` — Aggregates pulse metrics across all domains
- `business/business-projection.service.ts` — Pipeline + revenue + customer health rollup
- `money/money-projection.service.ts` — Cash position + obligations + reserves
- `concierge/concierge-projection.service.ts` — Household load + upcoming tasks
- `advisors/advisor-projection.service.ts` — Advisor status + recent recommendations
- `boardroom/boardroom-projection.service.ts` — Session readiness + packet summaries
- `proof/proof-projection.service.ts` — Recent receipts + chain status
- `store/store-projection.service.ts` — Installed packs + available upgrades
- `index.ts` barrel (with sub-barrels)

### 9. Memory Service (`src/lib/services/memory-service/`)
- `profile-memory.service.ts` — User profile preferences and settings memory using `MemoryObject`
- `workflow-memory.service.ts` — Stores workflow context for resume/retry
- `preference-memory.service.ts` — UI and behavioral preferences (notification settings, display modes)
- `boardroom-memory.service.ts` — Past boardroom decisions and carryover items using `DecisionRecord`
- `trust-memory.service.ts` — Trust score history and flag tracking using `TrustState`
- `correction.service.ts` — Records user corrections to AI outputs; adjusts confidence scores
- `index.ts` barrel

### 10. Connector Control Plane (`src/lib/services/connector-control-plane/`)
- `connectors/gmail.connector.ts` — Gmail send/read/label capability shape
- `connectors/calendar.connector.ts` — Calendar event CRUD shape
- `connectors/crm.connector.ts` — CRM contact/deal sync shape
- `connectors/accounting.connector.ts` — QuickBooks/Xero sync shape
- `connectors/banking.connector.ts` — Plaid account/transaction shape
- `connectors/travel.connector.ts` — Booking/itinerary sync shape
- `connectors/cloud-drive.connector.ts` — Google Drive/Dropbox file operations shape
- `connectors/signature.connector.ts` — DocuSign/HelloSign e-signature shape
- `connectors/forex-broker.connector.ts` — FX trade execution shape
- `connectors/crypto-exchange.connector.ts` — Crypto position/trade shape
- `connectors/wallet.connector.ts` — Crypto wallet balance/transfer shape
- `connector-health.service.ts` — Health checks, staleness detection using `ConnectorFreshnessPolicy`
- `connector-auth.service.ts` — OAuth token state, refresh status
- `connector-fake-mode.service.ts` — Mock connector for development/demo; returns synthetic data
- `index.ts` barrel

### 11. Boardroom Service (`src/lib/services/boardroom/`)
- `packets/business-packet.service.ts` — Full `BoardroomPacket` for business domain with sections, advisor tracks
- `packets/finance-packet.service.ts` — Finance boardroom packet with cash, reserves, investment sections
- `packets/family-packet.service.ts` — Family/household boardroom packet
- `packets/opportunity-packet.service.ts` — Cross-domain opportunity review packet
- `packets/committee-packet.service.ts` — Investment committee briefing packet
- `carryover.service.ts` — Manages `CarryoverItem` lifecycle; aging, escalation
- `decision-memory.service.ts` — Stores and retrieves `DecisionRecord` entries
- `advisor-track-composer.service.ts` — Composes `AdvisorTrack` arrays with disagreement detection
- `index.ts` barrel

### 12. Support Diagnostics (`src/lib/services/support-diagnostics/`)
Enhances the existing `shared/support-diagnostics.service.ts`:
- `diagnostic-bundle.service.ts` — Extended diagnostic bundle with connector health, workflow status
- `support-summary.service.ts` — PII-redacted summary for support tickets using `DiagnosticBundle`
- `replay-metadata.service.ts` — Captures session replay metadata for debugging
- `incident-classification.service.ts` — Classifies incidents by severity, category, auto-healability
- `index.ts` barrel

### 13. Sovereign Calculation (`src/lib/services/sovereign-calculation/`)
Deterministic financial calculations (no LLM allowed per truth boundaries):
- `reserves/reserve-calculator.service.ts` — Reserve funding math, allocation waterfall
- `receivables/receivables-calculator.service.ts` — AR aging buckets, weighted collection probability
- `risk/risk-calculator.service.ts` — VaR, max drawdown, Sharpe ratio computations
- `regime/regime-classifier.service.ts` — Market regime classification (bull/bear/sideways/crisis)
- `formulas/financial-formulas.service.ts` — Core formulas: burn multiple, runway, CAGR, IRR, NPV
- `scenario/scenario-engine.service.ts` — Monte Carlo-style scenario projections for treasury
- `index.ts` barrel

## Integration

- Update `src/lib/services/index.ts` to export all 13 new modules
- Each service imports only from `src/packages/` contracts — no circular dependencies
- Existing `shared/` services remain untouched; new `support-diagnostics/` and `boardroom/` modules extend (not duplicate) them

## File count: ~60 new files + barrel updates

## No database changes needed

