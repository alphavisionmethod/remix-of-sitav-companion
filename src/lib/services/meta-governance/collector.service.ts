// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Governance Collector Service
// Subscribes to EventBus topics and routes events to the
// MetaGovernanceEngine. Engines are pure; this is effectful.
// ═══════════════════════════════════════════════════════════════

import { getEventBus } from "../../core-services/event-bus";
import { getMetaGovernanceEngine } from "../../engines/meta-governance-engine";
import type { BusEvent } from "../../core-services/event-bus";
import type { DebtEvidence } from "../../types/meta-governance.types";
import type { OSDomain, EntityScope } from "../../types/os-unified.types";

const DEFAULT_ENTITY_SCOPE: EntityScope = {
  ownerId: "system",
  visibility: "private",
};

function extractEvidence(event: BusEvent): DebtEvidence {
  return {
    sourceEventId: event.id,
    timestamp: new Date(event.timestamp).toISOString(),
    metric: event.topic,
    value: 1,
    description: `Event: ${event.topic} from ${event.source}`,
  };
}

export class MetaGovernanceCollectorService {
  private subscriptionIds: string[] = [];

  /** Start collecting events from the EventBus */
  start(): void {
    const bus = getEventBus();
    const engine = getMetaGovernanceEngine();

    // Trust-relevant events
    this.subscriptionIds.push(
      bus.subscribe("action.executed", (event) => {
        const confidence = (event.payload.confidence as number) ?? 0.5;
        if (confidence < 0.7) {
          engine.trustDebt.record({
            category: "poor_confidence_disclosure",
            severity: confidence < 0.3 ? "critical" : "high",
            source: { type: "workflow", id: event.payload.workflowId as string ?? event.id, name: `Workflow ${event.payload.workflowId ?? "unknown"}` },
            entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
            domain: (event.payload.domain as OSDomain) ?? "system",
            trustDimension: "proofCompleteness",
            evidence: [extractEvidence(event)],
            proofGaps: [],
            policyGaps: [],
            replayGaps: [],
            description: `Action executed with low confidence (${confidence})`,
            impact: "Reduces trust in action outcomes",
            recommendation: "Require higher confidence threshold or additional verification before execution",
            confidenceAtDetection: confidence,
            correlationId: event.correlationId,
          });
        }
      }, "trust-debt-low-confidence-collector")
    );

    this.subscriptionIds.push(
      bus.subscribe("policy.bypassed", (event) => {
        engine.trustDebt.record({
          category: "policy_bypass",
          severity: "high",
          source: { type: "policy", id: event.payload.policyId as string ?? "unknown", name: `Policy ${event.payload.policyId ?? "unknown"}` },
          entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
          domain: (event.payload.domain as OSDomain) ?? "system",
          trustDimension: "policyCompliance",
          evidence: [extractEvidence(event)],
          proofGaps: [],
          policyGaps: [event.payload.policyId as string ?? "unknown"],
          replayGaps: [],
          description: `Policy bypassed: ${event.payload.reason ?? "no reason given"}`,
          impact: "Weakens policy enforcement and governance integrity",
          recommendation: "Review bypass justification and consider policy exception process",
          correlationId: event.correlationId,
        });
      }, "trust-debt-policy-bypass-collector")
    );

    // Execution-relevant events
    this.subscriptionIds.push(
      bus.subscribe("workflow.stuck", (event) => {
        engine.executionDebt.record({
          category: "stuck_workflow",
          severity: "high",
          source: { type: "workflow", id: event.payload.workflowId as string ?? event.id, name: `Workflow ${event.payload.workflowId ?? "unknown"}` },
          entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
          domain: (event.payload.domain as OSDomain) ?? "system",
          workflowFamily: event.payload.workflowFamily as string ?? "unknown",
          actionStateBottleneck: (event.payload.currentState as "executing") ?? "executing",
          evidence: [extractEvidence(event)],
          sourceActionIds: [event.payload.actionId as string ?? event.id],
          patternCount: 1,
          downstreamImpact: [],
          affectedEntities: [(event.payload.entityScope as EntityScope)?.ownerId ?? "unknown"],
          recommendation: "Review stuck workflow and unblock or rollback",
          remediationType: "manual_fix",
          correlationId: event.correlationId,
        });
      }, "execution-debt-stuck-collector")
    );

    this.subscriptionIds.push(
      bus.subscribe("connector.retry", (event) => {
        engine.executionDebt.record({
          category: "connector_retry",
          severity: "medium",
          source: { type: "connector", id: event.payload.connectorId as string ?? "unknown", name: `Connector ${event.payload.connectorId ?? "unknown"}` },
          entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
          domain: (event.payload.domain as OSDomain) ?? "connector",
          workflowFamily: event.payload.workflowFamily as string ?? "unknown",
          actionStateBottleneck: "executing",
          evidence: [extractEvidence(event)],
          sourceActionIds: [],
          patternCount: (event.payload.retryCount as number) ?? 1,
          downstreamImpact: [],
          affectedEntities: [],
          recommendation: "Check connector health and consider fallback strategy",
          remediationType: "connector_hardening",
          correlationId: event.correlationId,
        });
      }, "execution-debt-connector-retry-collector")
    );

    // Drag events
    this.subscriptionIds.push(
      bus.subscribe("drag.*", (event) => {
        engine.drag.recordEvent({
          dimension: event.payload.dimension as never ?? "manual_work",
          score: (event.payload.score as number) ?? 0.5,
          evidence: [extractEvidence(event)],
          entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
          module: event.payload.module as string ?? event.source,
          domain: (event.payload.domain as OSDomain) ?? "system",
          correlationId: event.correlationId,
        });
      }, "drag-event-collector")
    );

    // Founder bottleneck — collect approval pending signals for batch detection
    this.subscriptionIds.push(
      bus.subscribe("approval.pending", (event) => {
        const founderId = event.payload.founderId as string;
        if (founderId) {
          engine.founderBottleneck.recordBottleneck({
            bottleneckType: "approval_stall",
            founderId,
            blockedWorkflows: [event.payload.workflowId as string ?? event.id],
            domain: (event.payload.domain as OSDomain) ?? "business",
            costEstimate: {
              estimationMethod: "delay_impact",
              estimatedCost: 50,
              currency: "USD",
              confidence: 0.4,
              inputs: { pending: 1 },
              explanation: "Single pending approval — cost estimated at $50/hr delay",
            },
            severity: "medium",
            evidence: [extractEvidence(event)],
            entityScope: (event.payload.entityScope as EntityScope) ?? DEFAULT_ENTITY_SCOPE,
            handoffRecommendation: "Review pending approval or delegate to operator",
            delegationCandidates: [],
          });
        }
      }, "bottleneck-signal-collector")
    );
  }

  /** Stop collecting and unsubscribe */
  stop(): void {
    const bus = getEventBus();
    for (const id of this.subscriptionIds) {
      bus.unsubscribe(id);
    }
    this.subscriptionIds = [];
  }
}

let collectorInstance: MetaGovernanceCollectorService | null = null;

export function getMetaGovernanceCollector(): MetaGovernanceCollectorService {
  if (!collectorInstance) {
    collectorInstance = new MetaGovernanceCollectorService();
  }
  return collectorInstance;
}
