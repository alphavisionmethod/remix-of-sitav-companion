

## Wave 17 — AI Behavioral Proof and Safety Closure

### Summary

The AI layer has strong infrastructure: AI gateway with prompt family enforcement, budget gates, AI trust enforcer (tool-call boundary enforcement + receipts), advisor permission matrix, escalation policy, reversibility map, persona boundary map, memory aging policy, agent governance with autonomy ceilings, and compute-governance cost anomaly detection. What is missing: explicit capability-level fallback/refusal proofs, prompt drift detection, routing replay, receipt reconstruction, provider outage simulation, cross-domain restriction proof artifact, memory repair process, and boardroom outcome quality scoring. The existing `check-ai-capability-proof.ts` is a file-existence check only.

This wave extends existing canonical systems (`ai-trust-enforcer`, `agent-governance`, `margin-protection`, `advisor-*` contracts). No second AI platform.

---

### Phase A — Capability Registry, Fallback, and Refusal Policies (3 files)

**1. `src/lib/ai/ai-capability-registry.ts`**
- Canonical typed registry declaring every AI capability with: `capabilityId`, `owner`, `scope`, `allowedModels`, `preferredRoute`, `fallbackChain` (ordered model list), `refusalConditions` (list of trigger categories), `evidenceGradeRequired` (A-F), `receiptRequired`, `costPolicy` (ref to budget tier), `actionBoundarySensitivity` (none/low/high/critical), `autonomyCeilingRelevance`, `crossDomainRestriction`
- Covers ~15 capabilities: advisor.money, advisor.business, advisor.concierge, advisor.strategy, advisor.security, advisor.legal, advisor.tax, boardroom.synthesis, boardroom.debate, simulation.monte-carlo, brain.personal, brain.core, admin.intelligence, gateway.general, files.ai-processing
- Imports from existing `PERSONA_BOUNDARIES`, `ADVISOR_PERMISSION_MATRIX`, `ESCALATION_RULES`

**2. `src/lib/ai/ai-fallback-policy.ts`**
- Per capability: `primaryRoute`, `fallbackChain` (ordered), `fallbackTriggers` (timeout, error, budget-exceeded, model-unavailable), `degradedResultExpectation` (cached | simplified | refused), `noProviderBehavior` (refuse-with-receipt | cached-only | degrade-gracefully), `replayable` flag
- Exports `resolveFallback(capabilityId, triggerReason)` returning next model in chain or refusal
- Uses existing `BudgetGateResult.fallbackModelId` pattern from `budget-gate.ts`

**3. `src/lib/ai/ai-refusal-policy.ts`**
- Per capability family: `refusalTriggers` (budget-exceeded, confidence-below-threshold, domain-fence-violated, scope-violation, kill-switch-active, autonomy-ceiling-reached), `refusalPayload` structure, `remediationGuidance`, `humanEscalationPath`, `uiDisclosureRequired`, `auditReceiptRequired`
- Exports `evaluateRefusal(capabilityId, context)` returning refusal decision or null
- Extends existing `AIActionResult` types from `ai-trust-enforcer.ts`

### Phase B — Evidence Grade, Action Boundaries, and Prompt Drift (3 files)

**4. `src/lib/ai/ai-evidence-grade-policy.ts`**
- Maps AI surfaces to evidence grade requirements: advisory surfaces (grade C+), operational surfaces (grade B+), action-capable surfaces (grade A)
- Declares per-surface: `surfaceId`, `surfaceType` (advisory/operational/action-capable), `requiredEvidenceGrade`, `disclosureRequired`, `provenanceVisible`, `unverifiableBehavior` (refuse/caveat/degrade)
- Extends existing `PROOF_REQUIREMENTS` from `policy-proof-requirements.ts`
- Covers: advisor chat, boardroom items, boardroom decisions, admin AI pages, simulation engine, AI action cards

**5. `src/lib/ai/ai-action-boundary-tests.ts`**
- Declares boundary test cases as typed registry: `testId`, `category` (tool-approval, unsafe-mutation, missing-receipt, missing-policy, cross-domain-violation, confidence-violation, autonomy-violation), `description`, `expectedOutcome` (block/escalate/allow-with-receipt), `affectedSystems` (advisors/boardroom/workflows/tools)
- Exports `ACTION_BOUNDARY_TESTS` array (~20 test declarations)
- Cross-references `AIToolCall` interface from `ai-trust-enforcer.ts` and `REVERSIBILITY_MAP`

**6. `src/lib/ai/ai-prompt-drift-detection.ts`**
- Declares drift detection dimensions: `promptFamilyVersion`, `routingConfigChange`, `modelBehaviorShift`, `outputProfileDrift`, `evidenceGradeDrift`
- Per capability: `capabilityId`, `lastKnownPromptVersion`, `lastKnownModel`, `driftSignals` array, `detectionMethod` (version-compare/output-sampling/config-diff), `operatorAlertRequired`
- Exports `detectPromptDrift(capabilityId, currentConfig)` returning drift signals
- Reads from `ai_prompt_families` table schema for version tracking

### Phase C — Routing Replay, Receipt Reconstruction, and Cost Anomaly (3 files)

**7. `src/lib/ai/ai-routing-replay.ts`**
- Declares replay contract: given a `receiptId` or `correlationId`, reconstruct the routing decision (model selected, fallback triggered, budget check result, capability matched)
- Exports `reconstructRoutingDecision(receiptId)` that maps receipt fields to routing trace
- Uses existing `ai_inference_receipts`, `ai_fallback_events`, `ai_usage_ledger` table schemas
- Exports `ROUTING_REPLAY_FAMILIES` listing which capability families support full replay

**8. `src/lib/ai/ai-receipt-reconstruction.ts`**
- Declares reconstruction contract: for any AI action, reconstruct provider, model, prompt version, policy checks, fallback path, cost, and output classification
- Exports `RECEIPT_RECONSTRUCTION_MAP` per capability: `tables` (which tables to join), `requiredFields`, `reconstructionMethod` (ledger-join/receipt-direct/inference-chain)
- Cross-references `ai-trust-enforcer.ts` receipt structure

**9. `src/lib/ai/ai-cost-anomaly-detector.ts`**
- Extends existing `CostAnomaly` from `compute-governance/margin-protection.ts` with capability-level anomaly detection
- Adds: `perCapabilitySpike`, `fallbackInducedCost`, `advisorBoardroomRunaway`, `budgetBypassRisk`
- Exports `AI_COST_ANOMALY_RULES` with per-rule: `ruleId`, `anomalyType`, `threshold`, `detectionWindow`, `mitigation`, `alertSeverity`
- Reuses `selectMitigation` from `margin-protection.ts`

### Phase D — Outage Simulation, Autonomy Ceiling, and Cross-Domain (3 files)

**10. `src/lib/ai/ai-provider-outage-simulator.ts`**
- Declares outage scenarios: `provider-unavailable`, `model-unavailable`, `timeout`, `invalid-output`, `fallback-chain-exhaustion`, `degraded-safe-mode`
- Per scenario: `scenarioId`, `description`, `affectedCapabilities`, `expectedBehavior`, `fallbackResult`, `operatorAlertPath`, `recoverySteps`
- Exports `OUTAGE_SCENARIOS` array and `simulateOutage(scenarioId)` that returns expected system behavior
- References `ai-fallback-policy.ts` for chain resolution

**11. `src/lib/ai/ai-autonomy-ceiling-policy.ts`**
- Consolidates autonomy governance from `agent-governance.ts` and `advisor-escalation-policy.ts`
- Per advisor/agent family: `agentId`, `maxAutonomyTier` (L0-L6), `approvalRequired` above tier, `blockedActions`, `escalationPath`, `auditRequirement`, `operatorRestrictions`
- Exports `AUTONOMY_CEILING_MAP` and `enforceAutonomyCeiling(agentId, requestedLevel)`
- Cross-references `AUTONOMY_ORDER` from `agent-governance.ts`

**12. `src/lib/ai/ai-cross-domain-restriction-map.ts`**
- Extends `PERSONA_BOUNDARIES.domainFence` into a full cross-domain restriction proof
- Per advisor: `advisorId`, `allowedDomains`, `blockedDomains`, `crossDomainReadAllowed`, `crossDomainWriteBlocked`, `approvalForCrossDomain`, `escalationRule`, `evidenceRequired`
- Exports `CROSS_DOMAIN_RESTRICTIONS` and `isCrossDomainAllowed(advisorId, targetDomain, actionType)`

### Phase E — Memory Repair, Boardroom Outcome Scoring (2 files)

**13. `src/lib/ai/ai-memory-repair-manager.ts`**
- Declares repair procedures for advisor memory systems
- Per memory domain: `domainId`, `corruptionDetection` (stale-check/integrity-hash/access-pattern-anomaly), `repairProcedure` (prune/rebuild/rollback/operator-manual), `preconditions`, `auditRequired`, `rollbackSafety`
- Covers: working memory corruption, preference drift, stale long-term memory, orphaned archival entries
- Extends `MEMORY_AGING_RULES` from `advisor-memory-aging-policy.ts`

**14. `src/lib/ai/boardroom-outcome-scoring.ts`**
- Declares quality model tying recommendations to outcomes
- Per recommendation class: `classId`, `evidenceQualityWeight`, `approvalOutcomeWeight`, `executionSuccessWeight`, `reversibilityScore`, `downstreamImpactWeight`, `confidenceCalibrationMetric`
- Exports `BOARDROOM_QUALITY_DIMENSIONS` and `scoreBoardroomOutcome(recommendation, outcome)` returning quality score 0-100
- References `boardroom_outcome_records` and `boardroom_followthrough_dispatches` table schemas

### Phase F — Generator Script and 14 Artifacts

**15. `scripts/ai/generate-ai-behavioral-proof-artifacts.ts`**
- Imports all registries from Phase A-E
- Generates 14 artifacts into `generated/`:
  - `ai-capability-proof-matrix.json` (REPLACE existing stub)
  - `ai-refusal-proof.json`
  - `ai-evidence-grade-coverage.json`
  - `ai-routing-replay-report.json`
  - `ai-receipt-reconstruction-audit.json`
  - `ai-cost-anomaly-report.json`
  - `ai-autonomy-ceiling-proof.json`
  - `ai-cross-domain-restriction-proof.json`
  - `ai-memory-repair-coverage.json`
  - `boardroom-outcome-quality-report.json`
  - `prompt-drift-detection.json`
  - `model-outage-simulation-results.json`
  - `advisor-action-reversibility-report.json` (REPLACE existing stub)
  - `ai-fallback-replay-bundle/replay-summary.json`

### Phase G — Validators (11 scripts)

Replace existing stub `check-ai-capability-proof.ts` and `check-advisor-reversibility.ts`, add 9 new validators:

**16. `scripts/ai/checks/check-ai-capability-proof.ts`** -- BLOCK. Real validation: every capability has providers, fallbacks, refusals, evidence grade.

**17. `scripts/ai/checks/check-ai-fallback-replay.ts`** -- BLOCK. Fallback chains explicit, replay families declared.

**18. `scripts/ai/checks/check-ai-refusal-coverage.ts`** -- ADVISORY. Refusal policy wired for all relevant capabilities.

**19. `scripts/ai/checks/check-ai-evidence-grade-coverage.ts`** -- ADVISORY. AI surfaces enforce evidence grade.

**20. `scripts/ai/checks/check-ai-receipt-reconstruction.ts`** -- ADVISORY. Reconstruction map exists for critical capabilities.

**21. `scripts/ai/checks/check-ai-cost-anomaly-detection.ts`** -- ADVISORY. Anomaly rules cover critical pathways.

**22. `scripts/ai/checks/check-ai-provider-outage-simulation.ts`** -- ADVISORY. Outage scenarios declared and documented.

**23. `scripts/ai/checks/check-ai-autonomy-ceiling.ts`** -- BLOCK. Autonomy ceilings declared for all agents/advisors.

**24. `scripts/ai/checks/check-ai-cross-domain-restrictions.ts`** -- ADVISORY. Cross-domain restrictions explicit.

**25. `scripts/ai/checks/check-ai-memory-repair.ts`** -- ADVISORY. Memory repair procedures declared.

**26. `scripts/ai/checks/check-boardroom-outcome-scoring.ts`** -- ADVISORY. Quality scoring dimensions declared.

### Phase H — Barrel Export, Gate Registration, and Verification

- Create `src/lib/ai/index.ts` barrel exporting all new registries
- Register `ai-capability-proof`, `ai-fallback-replay`, and `ai-autonomy-ceiling` as BLOCK gates in release readiness
- Register 8 ADVISORY gates
- `npx tsc --noEmit` -- zero errors
- Run all 11 validators -- all green

### No-Duplication Enforcement

- `ai-cost-anomaly-detector.ts` extends existing `CostAnomaly` from `margin-protection.ts` -- no second anomaly system
- `ai-autonomy-ceiling-policy.ts` consolidates from `agent-governance.ts` autonomy checks -- no second autonomy system
- `ai-cross-domain-restriction-map.ts` extends `PERSONA_BOUNDARIES.domainFence` -- no second boundary system
- `ai-refusal-policy.ts` extends `AIActionResult` from `ai-trust-enforcer.ts` -- no second trust system
- `ai-evidence-grade-policy.ts` extends `PROOF_REQUIREMENTS` -- no second evidence system
- `ai-memory-repair-manager.ts` extends `MEMORY_AGING_RULES` -- no second memory system
- Replaces stub `check-ai-capability-proof.ts` and `check-advisor-reversibility.ts` with real validators

### Deployment Closure Checklist

- [ ] 15 AI capabilities registered with providers, fallbacks, refusals, evidence grades
- [ ] Fallback chains explicit with replay families declared
- [ ] Refusal policy covering 6 trigger categories
- [ ] Evidence grade enforcement for 6 AI surface types
- [ ] 20 action boundary test declarations
- [ ] Prompt drift detection for all capability families
- [ ] Routing replay for critical capabilities
- [ ] Receipt reconstruction map for critical AI actions
- [ ] Cost anomaly rules extending compute-governance
- [ ] 6 outage scenarios declared and documented
- [ ] Autonomy ceilings for all 7 advisors + agent families
- [ ] Cross-domain restrictions for all 7 advisors
- [ ] Memory repair procedures for 4 memory layers
- [ ] Boardroom outcome quality scoring with 6 dimensions
- [ ] 14 generated proof artifacts
- [ ] 11 validator scripts (3 BLOCK + 8 ADVISORY) all green
- [ ] TypeScript builds with 0 errors
- [ ] No duplicate AI safety/routing/proof systems

