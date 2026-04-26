// ═══════════════════════════════════════════════════════════════
// SITA OS — Unified Runtime Kernel
// Single boot, shared services, entity-scoped operations
//
// CANONICAL EXECUTION PATH (non-negotiable spine):
//   surface → api-gateway → brain-core → domain-os →
//   policy-engine → approval-service → capability-router →
//   executor-service → receipt-service → verification-engine →
//   event-bus → projection-service → surfaces
//
// IDENTITY/TRUST SIDECAR (attached before execution):
//   identity → entity-graph → role-permission →
//   memory-service → trust-state
// ═══════════════════════════════════════════════════════════════

import { EventBus } from "./core-services/event-bus";
import { ReceiptService } from "./core-services/receipt-service";
import { MemoryService } from "./core-services/memory-service";
import { TrustStateService } from "./core-services/trust-state-service";
import { WorkflowEngine, WorkflowRecoveryManager, WorkflowReplayEngine, WorkflowTimeoutManager, TransitionValidator, WorkflowVerificationHooks } from "./core-services/workflow-engine";
import { EntityGraphService } from "./core-services/entity-graph";
import { IdentityService } from "./core-services/identity-graph";
import { ProjectionService } from "./core-services/projection-service";
import { VerificationEngine } from "./core-services/verification-engine";
import { ExecutorService } from "./core-services/executor-service";
import { CanonicalChainOrchestrator } from "./core-services/index";
// Execution adapter — subordinate to canonical orchestration facade
import { AgentOrchestrator } from "./core-services/agent-orchestrator";
// Canonical 4-layer orchestration facade (single authority entry point)
import { orchestrationFacade } from "@/platform/orchestration";
import { LeaseManager } from "./core-services/lease-manager";
import { ConstitutionCompiler } from "./core-services/constitution-compiler";
import { ApiGateway } from "./core-services/api-gateway";
import { CapabilityRouter } from "./core-services/capability-router";
import { ApprovalService } from "./core-services/approval-service";
import { RolePermissionEngine } from "./core-services/role-permission-engine";
import { FraudSentinelService } from "./core-services/fraud-sentinel";
import { GovernanceSimulatorService } from "./core-services/governance-simulator";
import { SearchFabricService } from "./core-services/search-fabric";
import { SupportDiagnosticsService } from "./core-services/support-diagnostics";
import { AnalyticsService } from "./core-services/analytics-service";
import { ReceiptVerificationService } from "./services/verification-engine/receipt-verification.service";
import { ReplayVerificationService } from "./services/verification-engine/replay-verification.service";
import { WebsiteManager } from "./services/business-os/website-management.service";
import { CloudControlPlaneService } from "./services/cloud-control-plane-infra";
import { KernelSubsystem } from "./core-services/kernel";
import { EdgeDeviceRuntimeService } from "./services/edge-device-runtime";
import { FleetOTAService } from "./services/fleet-ota";
import { IncidentManagementService } from "./services/incident-management";
import { EmergencyHaltService } from "./services/emergency-halt";
import {
  createExecutionPath, advanceStage, attachSidecar, finalizePath,
  type ExecutionPathRecord,
  ADMIN_REQUIRED_SUBSCRIPTIONS,
} from "./core-services/canonical-execution-path";
import type { EntityProfile } from "@/contexts/EntityContext";
import { registerCanonicalHandlers } from "./kernel-handlers";

// ── Kernel Class ────────────────────────────────────────────────

export class SitaKernel {
  // ── Tier 1: Canonical Platform Organs ──────────────────────
  readonly eventBus: EventBus;
  readonly receipts: ReceiptService;
  readonly memory: MemoryService;
  readonly trust: TrustStateService;
  readonly workflows: WorkflowEngine;
  readonly entityGraph: EntityGraphService;
  readonly identityGraph: IdentityService;
  readonly projections: ProjectionService;
  readonly verification: VerificationEngine;
  readonly executor: ExecutorService;
  readonly chain: CanonicalChainOrchestrator;
  readonly apiGateway: ApiGateway;
  readonly capabilityRouter: CapabilityRouter;
  readonly approvals: ApprovalService;
  readonly permissions: RolePermissionEngine;
  readonly analytics: AnalyticsService;
  readonly diagnostics: SupportDiagnosticsService;

  // ── Isolated: Trust & Safety ──────────────────────────────
  readonly fraudSentinel: FraudSentinelService;
  readonly governanceSimulator: GovernanceSimulatorService;
  readonly searchFabric: SearchFabricService;

  // ── Tier 2: Subdomains ────────────────────────────────────
  readonly agents: AgentOrchestrator;
  readonly leases: LeaseManager;
  readonly constitution: ConstitutionCompiler;

  // ── Tier 3: Enhanced Sub-capabilities ─────────────────────
  readonly workflowRecovery: WorkflowRecoveryManager;
  readonly workflowReplay: WorkflowReplayEngine;
  readonly workflowTimeouts: WorkflowTimeoutManager;
  readonly transitionValidator: TransitionValidator;
  readonly verificationHooks: WorkflowVerificationHooks;
  readonly receiptVerification: ReceiptVerificationService;
  readonly replayVerification: ReplayVerificationService;
  readonly websiteManager: WebsiteManager;

  // ── Tier 4: Infrastructure Services ───────────────────────
  readonly cloudControlPlane: CloudControlPlaneService;
  readonly edgeDeviceRuntime: EdgeDeviceRuntimeService;
  readonly fleetOTA: FleetOTAService;
  readonly incidentManagement: IncidentManagementService;
  readonly emergencyHalt: EmergencyHaltService;

  // ── Tier 5: Kernel Architecture & Security Model ──────────────
  readonly kernelArch: KernelSubsystem;

  // ── Runtime State ─────────────────────────────────────────
  private _activeEntity: EntityProfile | null = null;
  private _bootedAt: number;
  private _eventCount = 0;

  constructor() {
    // ── Instantiate Tier 1 services exactly once ────────────
    this.eventBus = new EventBus();
    this.receipts = new ReceiptService();
    this.memory = new MemoryService();
    this.trust = new TrustStateService();
    this.workflows = new WorkflowEngine();
    this.entityGraph = new EntityGraphService();
    this.identityGraph = new IdentityService();
    this.projections = new ProjectionService();
    this.verification = new VerificationEngine();
    this.executor = new ExecutorService();
    this.apiGateway = new ApiGateway();
    this.capabilityRouter = new CapabilityRouter();
    this.approvals = new ApprovalService();
    this.permissions = new RolePermissionEngine();
    this.analytics = new AnalyticsService();
    this.diagnostics = new SupportDiagnosticsService();

    // ── Isolated services ──────────────────────────────────
    this.fraudSentinel = new FraudSentinelService();
    this.governanceSimulator = new GovernanceSimulatorService();
    this.searchFabric = new SearchFabricService();

    // ── Wire the canonical chain to shared services ─────────
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

    // ── Wire Tier 2 subdomains to shared services ───────────
    this.agents = new AgentOrchestrator({ eventBus: this.eventBus, receipts: this.receipts });
    this.leases = new LeaseManager({ eventBus: this.eventBus, receipts: this.receipts });
    this.constitution = new ConstitutionCompiler({ eventBus: this.eventBus, receipts: this.receipts });

    // ── Wire Tier 3 enhanced sub-capabilities ──────────────
    this.workflowRecovery = new WorkflowRecoveryManager();
    this.workflowReplay = new WorkflowReplayEngine();
    this.workflowTimeouts = new WorkflowTimeoutManager({
      onTimeout: (wfId) => {
        this.eventBus.publish("workflow.timeout.v1", { workflowId: wfId }, { source: "timeout-manager" });
        this.workflows.transition(wfId, "failed", "SLA timeout breached");
      },
      onWarning: (wfId, remainingMs) => {
        this.eventBus.publish("workflow.timeout.warning.v1", { workflowId: wfId, remainingMs }, { source: "timeout-manager" });
      },
    });
    this.transitionValidator = new TransitionValidator();
    this.verificationHooks = new WorkflowVerificationHooks();
    this.receiptVerification = new ReceiptVerificationService();
    this.replayVerification = new ReplayVerificationService();
    this.websiteManager = new WebsiteManager();

    // ── Tier 4: Infrastructure services ────────────────────
    this.cloudControlPlane = new CloudControlPlaneService();
    this.edgeDeviceRuntime = new EdgeDeviceRuntimeService();
    this.fleetOTA = new FleetOTAService();
    this.incidentManagement = new IncidentManagementService();
    this.emergencyHalt = new EmergencyHaltService();

    // ── Tier 5: Kernel Architecture & Security Model ────────
    this.kernelArch = new KernelSubsystem({ tpmAvailable: true });

    // ── Register canonical capability handlers (business/finance/concierge) ──
    // Without this, every useAction() write returns NO_HANDLER from the executor.
    registerCanonicalHandlers(this.executor);

    // ── Admin/owner event subscriptions (same truth chain) ──
    this.eventBus.subscribe("*", () => { this._eventCount++; }, "kernel-counter");

    // Wire admin-required event subscriptions for observability
    for (const topic of ADMIN_REQUIRED_SUBSCRIPTIONS) {
      this.eventBus.subscribe(topic, (event) => {
        this.analytics.increment(`event.${topic}`, "platform", { source: "admin-integration" });
      }, `admin-integration-${topic}`);
    }

    this._bootedAt = Date.now();

    // Emit boot event with full service inventory
    this.eventBus.publish("kernel.booted.v1", {
      services: [
        "eventBus", "receipts", "memory", "trust", "workflows",
        "entityGraph", "identityGraph", "projections", "verification",
        "executor", "chain", "apiGateway", "capabilityRouter",
        "approvals", "permissions", "analytics", "diagnostics",
        "fraudSentinel", "governanceSimulator", "searchFabric", "agents", "leases", "constitution",
        "workflowRecovery", "workflowReplay", "workflowTimeouts",
        "transitionValidator", "verificationHooks",
        "receiptVerification", "replayVerification", "websiteManager",
        "cloudControlPlane", "edgeDeviceRuntime", "fleetOTA", "incidentManagement",
        "kernelArch",
      ],
      tier1Count: 17,
      tier2Count: 3,
      tier3Count: 8,
      tier4Count: 4,
      tier5Count: 1,
      isolatedCount: 1,
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

  get tenantId(): string {
    return this._activeEntity?.id ?? "personal";
  }

  // ── Kill Switch ──────────────────────────────────────────────
  private _killSwitchActive = false;
  private _killSwitchMode: "block" | "downgrade" = "downgrade";

  /** Activate global kill switch — forces EMULATED mode or blocks execution */
  setKillSwitch(active: boolean, mode: "block" | "downgrade" = "downgrade"): void {
    this._killSwitchActive = active;
    this._killSwitchMode = mode;
    this.eventBus.publish("kernel.kill-switch.v1", { active, mode }, { source: "sita-kernel" });
  }

  get killSwitchActive(): boolean { return this._killSwitchActive; }

  private checkKillSwitch(): { blocked: boolean; reason?: string; forcedMode?: "EMULATED" } {
    // Check both internal flag and EmergencyHaltService
    const haltCheck = this.emergencyHalt.checkHalt("global");
    const isActive = this._killSwitchActive || haltCheck.halted;
    if (!isActive) return { blocked: false };
    const mode = haltCheck.halted ? "downgrade" : this._killSwitchMode;
    if (mode === "block") return { blocked: true, reason: haltCheck.reason ?? "Kill switch active — all execution blocked" };
    return { blocked: false, forcedMode: "EMULATED" };
  }

  // ── Canonical Execution via ActionEnvelope (with path tracking) ──

  async executeAction(input: {
    intent: string;
    domain: string;
    capabilityId: string;
    payload: Record<string, unknown>;
    amount?: number;
    isSimulation?: boolean;
    leaseId?: string;
    advisorId?: string;
  }) {
    // ── Kill Switch Gate ───────────────────────────────────
    const killCheck = this.checkKillSwitch();
    if (killCheck.blocked) {
      return { correlationId: crypto.randomUUID(), blocked: true, blockReason: killCheck.reason };
    }

    // Force EMULATED mode if kill switch is in downgrade mode
    const effectiveSimulation = killCheck.forcedMode === "EMULATED" ? true : input.isSimulation;

    // ── Build execution path record ────────────────────────
    let path = createExecutionPath(crypto.randomUUID());

    // ── Stage 1: Surface ingress ───────────────────────────
    path = advanceStage(path, "surface-ingress", { intent: input.intent });

    // ── Stage 2: API Gateway ───────────────────────────────
    path = advanceStage(path, "api-gateway", { routed: true });

    // ── Sidecar: Identity/Trust ────────────────────────────
    path = attachSidecar(path, {
      identity: { userId: this.tenantId, tenantId: this.tenantId, resolved: true },
      entityGraph: {
        entityId: this._activeEntity?.id ?? "personal",
        entityType: this._activeEntity?.type ?? "personal",
        resolved: true,
      },
      permissions: {
        role: "owner",
        actions: ["read", "write", "execute", "approve"],
        resolved: true,
      },
      memory: { contextLoaded: true, staleWarnings: [] },
      deviceTrust: { level: "trusted" },
      trustState: {
        score: 85,
        posture: "verified",
        flags: [],
      },
    });

    // ── Lease Gate ──────────────────────────────────────────
    if (input.leaseId) {
      const validation = this.leases.validate(
        input.leaseId, input.capabilityId, input.domain, input.amount ?? 0
      );
      if (!validation.valid) {
        const violationSummary = validation.violations.map(v => v.type).join(", ");
        this.eventBus.publish("lease.validation.failed.v1", {
          leaseId: input.leaseId, violations: violationSummary,
        }, { source: "canonical-chain" });
        return { correlationId: path.correlationId, blocked: true, blockReason: `Lease validation failed: ${violationSummary}`, leaseViolations: validation.violations, remainingBudget: validation.remainingBudget, remainingTime: validation.remainingTime };
      }
      if (validation.lease?.requireSimulation && !effectiveSimulation) {
        return { correlationId: path.correlationId, blocked: true, blockReason: "Lease requires simulation before execution", requiresSimulation: true };
      }
    }

    // ── Constitution Gate ───────────────────────────────────
    const constitutionResult = this.constitution.evaluate({
      domain: input.domain,
      amount: input.amount,
      advisorId: input.advisorId,
      action: input.capabilityId,
      time: new Date(),
    });

    if (constitutionResult.overallEffect === "deny") {
      this.eventBus.publish("constitution.denied.v1", {
        capabilityId: input.capabilityId, domain: input.domain,
        matchedRules: constitutionResult.matchedRules.map(r => r.naturalLanguage),
      }, { source: "canonical-chain" });
      return { correlationId: path.correlationId, blocked: true, blockReason: `Denied by personal constitution: ${constitutionResult.matchedRules[0]?.naturalLanguage ?? "rule match"}`, constitutionRules: constitutionResult.matchedRules.map(r => r.id) };
    }

    // ── Stage 3-4: Brain-core + Domain OS (delegated to chain) ──
    path = advanceStage(path, "brain-core", { classified: true });
    path = advanceStage(path, "domain-os", { domain: input.domain });

    // ── Execute via canonical chain (stages 5-12) ──────────
    const result = await this.chain.execute({
      ...input,
      isSimulation: effectiveSimulation,
      payload: {
        ...input.payload,
        _entityId: this.tenantId,
        _entityType: this._activeEntity?.type ?? "personal",
        _leaseId: input.leaseId,
        _constitutionEffect: constitutionResult.overallEffect,
        _pathCorrelationId: path.correlationId,
        _killSwitchDowngraded: !!killCheck.forcedMode,
      },
    });

    // ── Advance remaining stages based on result ────────────
    path = advanceStage(path, "policy-engine", { effect: result.policyResult.effect });

    if (result.blocked && result.blockReason?.includes("approval")) {
      path = advanceStage(path, "approval-service", { awaiting: true });
    } else {
      path.skippedStages.push("approval-service");
    }

    if (!result.blocked) {
      path = advanceStage(path, "capability-router");
      path = advanceStage(path, "executor-service", { status: result.envelope?.status });
      path = advanceStage(path, "receipt-service", { receiptId: result.receipt?.id });
      path = advanceStage(path, "verification-engine", { passed: result.verificationPassed });
      path = advanceStage(path, "event-bus");
      path = advanceStage(path, "projection-service");
      path = advanceStage(path, "surface-delivery");
    }

    // ── Finalize path and check violations ──────────────────
    path = finalizePath(path);

    // Store in memory for audit
    this.storeMemory(`action.${input.domain}.${input.capabilityId}`, {
      correlationId: result.correlationId,
      pathCorrelationId: path.correlationId,
      blocked: result.blocked,
      leaseId: input.leaseId,
      constitutionEffect: constitutionResult.overallEffect,
      pathViolations: path.violations.length,
      killSwitchDowngraded: !!killCheck.forcedMode,
      timestamp: Date.now(),
    }, { source: "canonical-chain", tags: [input.domain, input.capabilityId] });

    // Emit path violations if any
    if (path.violations.length > 0) {
      this.eventBus.publish("execution.path.violations.v1", {
        correlationId: path.correlationId,
        violations: path.violations,
      }, { source: "sita-kernel" });
    }

    return { ...result, executionPath: path };
  }

  // ── Replay ──────────────────────────────────────────────────

  async replayAction(receiptId: string): Promise<{
    replayCorrelationId: string;
    originalReceiptId: string;
    result: unknown;
    mode: "EMULATED";
  }> {
    const receipts = this.receipts.getReceipts();
    const original = receipts.find(r => r.id === receiptId);
    if (!original) throw new Error(`Receipt ${receiptId} not found for replay`);

    const replayResult = await this.executeAction({
      intent: `replay:${original.correlationId}`,
      domain: (original.data?.domain as string) ?? "system",
      capabilityId: original.capabilityId ?? (original.data?.capabilityId as string) ?? "unknown",
      payload: { _replayOf: receiptId, ...(original.data ?? {}) },
      isSimulation: true, // Replay always runs in EMULATED mode
    });

    return {
      replayCorrelationId: replayResult.correlationId,
      originalReceiptId: receiptId,
      result: replayResult,
      mode: "EMULATED",
    };
  }

  // ── Resume from Approval ────────────────────────────────────

  async resumeAction(approvalId: string): Promise<unknown> {
    // Look up the approval to find the original correlation/envelope
    const pendingApprovals = this.approvals.getPending?.() ?? [];
    const approval = pendingApprovals.find((a: any) => a.id === approvalId);

    if (!approval) {
      return { blocked: true, blockReason: `Approval ${approvalId} not found` };
    }

    const approvalData = approval as unknown as Record<string, unknown>;
    // Re-execute with the original payload, bypassing approval gate
    const result = await this.chain.execute({
      intent: `resume:${approvalId}`,
      domain: String(approvalData.domain ?? "system"),
      capabilityId: String(approvalData.capabilityId ?? "unknown"),
      payload: {
        ...((approvalData.payload && typeof approvalData.payload === "object" ? approvalData.payload : {}) as Record<string, unknown>),
        _resumedFromApproval: approvalId,
      },
    });

    // Create approval receipt
    await this.receipts.createReceipt(result.correlationId, "approval-record", {
      approvalId,
      effect: "approved",
      resumedAt: new Date().toISOString(),
    });

    return result;
  }

  // ── Scoped Operations ───────────────────────────────────────

  async emitEvent(topic: string, payload: Record<string, unknown>, correlationId?: string): Promise<void> {
    await this.eventBus.publish(topic, payload, {
      source: "sita-kernel", tenantId: this.tenantId, correlationId,
    });
  }

  storeMemory(key: string, value: unknown, options?: { source?: string; tags?: string[]; confidence?: number }): void {
    this.memory.store(key, value, {
      source: options?.source ?? "kernel",
      tags: [...(options?.tags ?? []), this.tenantId],
      confidence: options?.confidence ?? 1.0,
      entityId: this.tenantId,
    });
  }

  async createReceipt(
    correlationId: string,
    type: "execution-summary" | "approval-record" | "refusal" | "verification-proof" | "verification-failure",
    data: Record<string, unknown>
  ) {
    return this.receipts.createReceipt(correlationId, type, {
      ...data, entityId: this.tenantId, entityName: this._activeEntity?.name ?? "Personal",
    });
  }

  // ── Telemetry ───────────────────────────────────────────────

  get bootedAt(): number { return this._bootedAt; }
  get uptimeMs(): number { return Date.now() - this._bootedAt; }
  get totalEvents(): number { return this._eventCount; }

  getStatus() {
    return {
      uptimeMs: this.uptimeMs,
      totalEvents: this._eventCount,
      receiptChainLength: this.receipts.getChainLength(),
      workflowCount: this.workflows.getAllWorkflows().length,
      memoryEntries: this.memory.query({}).length,
      eventLogSize: this.eventBus.getLog().length,
      activeEntity: this._activeEntity?.id ?? "personal",
      deadLetterQueue: this.eventBus.getDeadLetterQueue().length,
      services: {
        tier1: 17,
        tier2: 3,
        tier3: 8,
        isolated: 1,
        total: 29,
      },
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

export function resetKernel(): void {
  if (_kernel) {
    _kernel.eventBus.clear(true);
  }
  _kernel = null;
}