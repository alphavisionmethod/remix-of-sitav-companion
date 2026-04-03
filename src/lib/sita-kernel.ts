// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Runtime Kernel
// Single boot, shared services, entity-scoped operations
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./core-services/event-bus";
import { ReceiptService } from "./core-services/receipt-service";
import { MemoryService } from "./core-services/memory-service";
import { TrustStateService } from "./core-services/trust-state-service";
import { WorkflowEngine } from "./core-services/workflow-engine";
import { EntityGraphService } from "./core-services/entity-graph";
import { IdentityService } from "./core-services/identity-graph";
import { ProjectionService } from "./core-services/projection-service";
import { VerificationEngine } from "./core-services/verification-engine";
import { ExecutorService } from "./core-services/executor-service";
import { CanonicalChainOrchestrator } from "./core-services/index";
import { AgentOrchestrator } from "./core-services/agent-orchestrator";
import type { EntityProfile } from "@/contexts/EntityContext";

// ── Kernel Class ────────────────────────────────────────────────

export class SitaKernel {
  // Core services — instantiated once
  readonly eventBus: EventBus;
  readonly receipts: ReceiptService;
  readonly memory: MemoryService;
  readonly trust: TrustStateService;
  readonly workflows: WorkflowEngine;
  readonly entityGraph: EntityGraphService;
  readonly identityGraph: IdentityGraph;
  readonly projections: ProjectionService;
  readonly verification: VerificationEngine;
  readonly executor: ExecutorService;
  readonly chain: CanonicalChainOrchestrator;
  readonly agents: AgentOrchestrator;

  // Active entity context
  private _activeEntity: EntityProfile | null = null;
  private _bootedAt: number;
  private _eventCount = 0;

  constructor() {
    // Instantiate all services exactly once
    this.eventBus = new EventBus();
    this.receipts = new ReceiptService();
    this.memory = new MemoryService();
    this.trust = new TrustStateService();
    this.workflows = new WorkflowEngine();
    this.entityGraph = new EntityGraphService();
    this.identityGraph = new IdentityGraph();
    this.projections = new ProjectionService();
    this.verification = new VerificationEngine();
    this.executor = new ExecutorService();

    // Wire the canonical chain to shared services
    this.chain = new CanonicalChainOrchestrator(
      this.executor,
      this.receipts,
      this.workflows,
      this.projections,
      this.eventBus,
      this.memory,
      this.verification,
      this.trust
    );

    // Wire agent orchestrator to shared EventBus + ReceiptService
    this.agents = new AgentOrchestrator(this.eventBus, this.receipts);

    // Track all events for telemetry
    this.eventBus.subscribe("*", () => {
      this._eventCount++;
    }, "kernel-counter");

    this._bootedAt = Date.now();

    // Emit boot event
    this.eventBus.publish("kernel.booted.v1", {
      services: [
        "eventBus", "receipts", "memory", "trust", "workflows",
        "entityGraph", "identityGraph", "projections", "verification",
        "executor", "chain", "agents",
      ],
    }, { source: "sita-kernel" });
  }

  // ── Entity Scoping ──────────────────────────────────────────

  get activeEntity(): EntityProfile | null {
    return this._activeEntity;
  }

  setActiveEntity(entity: EntityProfile): void {
    const previous = this._activeEntity;
    this._activeEntity = entity;

    this.eventBus.publish("entity.switched.v1", {
      from: previous?.id ?? null,
      to: entity.id,
      type: entity.type,
      name: entity.name,
    }, { source: "sita-kernel", tenantId: entity.id });
  }

  /** Get the tenantId for current entity — used by all scoped operations */
  get tenantId(): string {
    return this._activeEntity?.id ?? "personal";
  }

  // ── Scoped Operations ───────────────────────────────────────

  /** Publish an event auto-tagged with current entity */
  async emitEvent(topic: string, payload: Record<string, unknown>, correlationId?: string): Promise<void> {
    await this.eventBus.publish(topic, payload, {
      source: "sita-kernel",
      tenantId: this.tenantId,
      correlationId,
    });
  }

  /** Store memory auto-tagged with current entity */
  storeMemory(key: string, value: unknown, options?: { source?: string; tags?: string[]; confidence?: number }): void {
    this.memory.store(key, value, {
      source: options?.source ?? "kernel",
      tags: [...(options?.tags ?? []), this.tenantId],
      confidence: options?.confidence ?? 1.0,
      entityId: this.tenantId,
    });
  }

  /** Create a receipt auto-tagged with current entity */
  async createReceipt(
    correlationId: string,
    type: "execution-summary" | "approval-record" | "refusal" | "verification-proof" | "verification-failure",
    data: Record<string, unknown>
  ) {
    return this.receipts.createReceipt(correlationId, type, {
      ...data,
      entityId: this.tenantId,
      entityName: this._activeEntity?.name ?? "Personal",
    });
  }

  /** Execute through canonical chain with entity context injected */
  async executeAction(input: {
    intent: string;
    domain: string;
    capabilityId: string;
    payload: Record<string, unknown>;
    amount?: number;
    isSimulation?: boolean;
  }) {
    const result = await this.chain.execute({
      ...input,
      payload: {
        ...input.payload,
        _entityId: this.tenantId,
        _entityType: this._activeEntity?.type ?? "personal",
      },
    });

    // Store execution in memory for cross-domain visibility
    this.storeMemory(`action.${input.domain}.${input.capabilityId}`, {
      correlationId: result.correlationId,
      blocked: result.blocked,
      timestamp: Date.now(),
    }, {
      source: "canonical-chain",
      tags: [input.domain, input.capabilityId],
    });

    return result;
  }

  // ── Telemetry ───────────────────────────────────────────────

  get bootedAt(): number {
    return this._bootedAt;
  }

  get uptimeMs(): number {
    return Date.now() - this._bootedAt;
  }

  get totalEvents(): number {
    return this._eventCount;
  }

  getStatus() {
    return {
      uptimeMs: this.uptimeMs,
      totalEvents: this._eventCount,
      receiptChainLength: this.receipts.getChainLength(),
      workflowCount: this.workflows.getAll().length,
      memoryEntries: this.memory.getAll().length,
      eventLogSize: this.eventBus.getLog().length,
      activeEntity: this._activeEntity?.id ?? "personal",
      deadLetterQueue: this.eventBus.getDeadLetterQueue().length,
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────

let _kernel: SitaKernel | null = null;

export function getSitaKernel(): SitaKernel {
  if (!_kernel) {
    _kernel = new SitaKernel();
  }
  return _kernel;
}

/** For testing — reset the singleton */
export function resetKernel(): void {
  if (_kernel) {
    _kernel.eventBus.clear(true);
  }
  _kernel = null;
}
