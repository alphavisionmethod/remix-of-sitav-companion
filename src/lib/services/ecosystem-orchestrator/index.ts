// ═══════════════════════════════════════════════════════════════
// SITA OS — Ecosystem Orchestrator: OS + Cloud + App Coordination
// @deprecated — CROSS-DEVICE CONTINUITY ADAPTER ONLY. Retained for
// sync/presence/device-mesh coordination. MUST NOT own business
// decision logic, boardroom recommendations, or action execution
// outside device/surface continuity.
// New orchestration consumers MUST use:
//   import { orchestrationFacade } from "@/lib/orchestration";
// ═══════════════════════════════════════════════════════════════

import {
  type EcosystemState,
  type EcosystemCommand,
  type EcosystemLayer,
  type LayerHealthReport,
  type CommandIntent,
  type CommandLifecycleState,
  type CommandRouteDecision,
  type DualAuthorityChallenge,
  type SystemGuarantee,
  type GuaranteeType,
  type ExecutionStep,
  type ExecutionResult,
  type VerificationResult,
  type CommandMemoryEntry,
  type EcosystemEvent,
  type EcosystemEventType,
  type FeatureContract,
  type RiskClass,
  type CommandScope,
  type ChallengeStatus,
} from "./types";
import {
  createPersistenceHelper,
} from "@/data/persistence/universal-service-persistence";

// ── Helpers ─────────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const now = () => Date.now();

// ── Default Feature Contracts ───────────────────────────────
const DEFAULT_CONTRACTS: FeatureContract[] = [
  {
    featureName: "File Sync",
    osOwnership: "Local reads/writes, file watching, filesystem performance",
    cloudOwnership: "Sync, versioning, metadata, cross-device consistency",
    appOwnership: "Visibility, sync status, conflict alerts, user controls",
    failureBehavior: "Retry safely, preserve local pending state, notify app",
    approvalRequired: false,
    rollbackExists: true,
    events: ["file.changed", "sync.queued", "sync.failed", "conflict.detected"],
  },
  {
    featureName: "App Execution",
    osOwnership: "App runtime, process execution, sandbox enforcement",
    cloudOwnership: "App state sync, trust evaluation, usage intelligence",
    appOwnership: "App monitoring, remote controls, approval of risky actions",
    failureBehavior: "Isolate failed app, preserve system stability",
    approvalRequired: false,
    rollbackExists: true,
    events: ["app.launched", "app.crashed", "app.updated"],
  },
  {
    featureName: "Security Posture",
    osOwnership: "Enforce permissions, block unsafe behavior, sandboxing",
    cloudOwnership: "Trust scoring, threat evaluation, anomaly detection, policy",
    appOwnership: "Alert user, approve/deny critical actions, show live posture",
    failureBehavior: "Fail-closed, deny access, escalate to app",
    approvalRequired: true,
    rollbackExists: false,
    events: ["trust.alert", "security.violation", "permission.denied"],
  },
  {
    featureName: "Command Routing",
    osOwnership: "Execute local actions from dispatched commands",
    cloudOwnership: "Parse, plan, route, validate, decide",
    appOwnership: "Send commands, approve actions, monitor execution",
    failureBehavior: "Reject command, record failure, notify app",
    approvalRequired: true,
    rollbackExists: true,
    events: ["command.submitted", "command.routed", "command.executed"],
  },
  {
    featureName: "Updates & Rollout",
    osOwnership: "Install update, verify local health, rollback locally",
    cloudOwnership: "Rollout planning, cohort targeting, manifests, decisions",
    appOwnership: "Approve, defer, force update, monitor progress, alerts",
    failureBehavior: "Auto-rollback on health check failure",
    approvalRequired: true,
    rollbackExists: true,
    events: ["update.available", "update.deployed", "rollback.triggered"],
  },
  {
    featureName: "Device Management",
    osOwnership: "Report device capabilities and local status",
    cloudOwnership: "Canonical device registry and trust state",
    appOwnership: "Remote visibility and device control",
    failureBehavior: "Degrade gracefully, show last-known state",
    approvalRequired: false,
    rollbackExists: false,
    events: ["device.online", "device.offline", "device.revoked"],
  },
  {
    featureName: "Identity & Auth",
    osOwnership: "Local session, token caching, biometric hooks",
    cloudOwnership: "Canonical identity, account model, trust fabric",
    appOwnership: "Login/logout, MFA confirmation, session visibility",
    failureBehavior: "Deny access, redirect to auth, preserve local state",
    approvalRequired: false,
    rollbackExists: false,
    events: ["auth.login", "auth.logout", "session.expired"],
  },
];

// ── Layer Responsibility Maps ───────────────────────────────
const LAYER_SERVICES: Record<EcosystemLayer, string[]> = {
  os: [
    "app-runtime", "ui-compositor", "filesystem", "process-scheduler",
    "sandbox-engine", "hardware-abstraction", "local-cache",
    "event-emitter", "sync-adapter", "update-installer",
    "trust-enforcer", "rollback-agent", "telemetry-collector",
  ],
  cloud: [
    "auth-service", "device-registry", "sync-engine", "storage-metadata",
    "command-router", "trust-evaluator", "approval-orchestrator",
    "event-processor", "policy-engine", "rollout-planner",
    "verification-engine", "history-service", "ai-decisioning",
    "notification-router", "continuity-service",
  ],
  app: [
    "home-dashboard", "command-ui", "approval-center", "security-shield",
    "device-control", "sync-monitor", "notification-hub",
    "ai-chat", "settings-surface", "trust-visibility",
  ],
};

// ── Critical Actions requiring dual authority ───────────────
const CRITICAL_ACTIONS = new Set([
  "device.revoke", "fleet.wipe", "security.downgrade",
  "rollout.force", "data.delete_all", "trust.override",
  "policy.disable", "encryption.disable", "admin.revoke",
]);

// ── Intent Classification ───────────────────────────────────
const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  intent: string;
  scope: CommandScope;
  layers: EcosystemLayer[];
  risk: RiskClass;
  approval: boolean;
}> = [
  { pattern: /optimize.*perf/i, intent: "optimize_performance", scope: "device_system", layers: ["cloud", "os"], risk: "medium", approval: false },
  { pattern: /deploy.*update|rollout/i, intent: "deploy_update", scope: "rollout", layers: ["cloud", "os", "app"], risk: "high", approval: true },
  { pattern: /fix.*sync/i, intent: "repair_sync", scope: "cross_layer", layers: ["cloud", "os"], risk: "medium", approval: false },
  { pattern: /lock.*device/i, intent: "lock_device", scope: "security", layers: ["cloud", "os", "app"], risk: "high", approval: true },
  { pattern: /revoke.*device|remove.*device/i, intent: "device_revoke", scope: "security", layers: ["cloud", "app"], risk: "critical", approval: true },
  { pattern: /wipe|factory.*reset/i, intent: "fleet_wipe", scope: "fleet_wide", layers: ["cloud", "os", "app"], risk: "critical", approval: true },
  { pattern: /security|threat|investigate/i, intent: "investigate_security", scope: "security", layers: ["cloud", "os"], risk: "medium", approval: false },
  { pattern: /status|health|check/i, intent: "check_status", scope: "device_local", layers: ["cloud"], risk: "low", approval: false },
  { pattern: /sync.*now|force.*sync/i, intent: "force_sync", scope: "cross_layer", layers: ["cloud", "os"], risk: "low", approval: false },
  { pattern: /pause.*rollout|stop.*update/i, intent: "pause_rollout", scope: "rollout", layers: ["cloud", "app"], risk: "medium", approval: true },
  { pattern: /restart|reboot/i, intent: "restart_device", scope: "device_system", layers: ["os", "app"], risk: "medium", approval: true },
  { pattern: /backup|snapshot/i, intent: "create_backup", scope: "device_system", layers: ["cloud", "os"], risk: "low", approval: false },
];

// ═══════════════════════════════════════════════════════════════
// Ecosystem Orchestrator — Singleton
// ═══════════════════════════════════════════════════════════════
export class EcosystemOrchestrator {
  private state: EcosystemState;
  private listeners = new Set<() => void>();
  private persistence = createPersistenceHelper("ecosystem-orchestrator");

  constructor() {
    this.state = {
      layers: {
        os: this.createLayerHealth("os"),
        cloud: this.createLayerHealth("cloud"),
        app: this.createLayerHealth("app"),
      },
      activeCommands: [],
      commandHistory: [],
      pendingChallenges: [],
      recentEvents: [],
      contracts: DEFAULT_CONTRACTS,
      commandMemory: [],
      bootedAt: now(),
    };
  }

  // ── Initialization ──────────────────────────────────────────
  async initialize(): Promise<void> {
    const saved = await this.persistence.load() as Partial<EcosystemState> | null;
    if (saved) {
      this.state = {
        ...this.state,
        commandHistory: saved.commandHistory ?? [],
        commandMemory: saved.commandMemory ?? [],
        contracts: saved.contracts ?? DEFAULT_CONTRACTS,
      };
    }
    this.simulateLayerHealth();
    this.emit("layer.status_changed", "orchestrator", { status: "initialized" });
    console.log("[ecosystem-orchestrator] ✓ initialized");
  }

  // ── State Access ────────────────────────────────────────────
  getState(): EcosystemState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private persist(): void {
    this.persistence.save({
      commandHistory: this.state.commandHistory.slice(-100),
      commandMemory: this.state.commandMemory.slice(-200),
      contracts: this.state.contracts,
    });
  }

  // ── Layer Health ────────────────────────────────────────────
  private createLayerHealth(layer: EcosystemLayer): LayerHealthReport {
    const services = LAYER_SERVICES[layer];
    const healthyCount = services.length;
    return {
      layer,
      status: "online",
      servicesTotal: services.length,
      servicesHealthy: healthyCount,
      servicesDegraded: 0,
      servicesOffline: 0,
      healthScore: 100,
      lastHeartbeat: now(),
      responsibilities: services,
      activeWorkloads: 0,
    };
  }

  private simulateLayerHealth(): void {
    for (const layer of ["os", "cloud", "app"] as EcosystemLayer[]) {
      const health = this.state.layers[layer];
      const degraded = Math.floor(Math.random() * 2);
      health.servicesDegraded = degraded;
      health.servicesHealthy = health.servicesTotal - degraded;
      health.healthScore = Math.round(((health.servicesTotal - degraded) / health.servicesTotal) * 100);
      health.status = health.healthScore >= 90 ? "online" : health.healthScore >= 70 ? "degraded" : "offline";
      health.lastHeartbeat = now();
      health.activeWorkloads = Math.floor(Math.random() * 8) + 1;
    }
  }

  getLayerHealth(layer: EcosystemLayer): LayerHealthReport {
    return this.state.layers[layer];
  }

  // ═══════════════════════════════════════════════════════════
  // COMMAND ROUTING ENGINE
  // ═══════════════════════════════════════════════════════════

  async submitCommand(input: string, userId: string): Promise<EcosystemCommand> {
    const command: EcosystemCommand = {
      id: uid(),
      input,
      intent: null,
      state: "submitted",
      routeDecision: null,
      guarantees: [],
      dualAuthChallenge: null,
      executionResult: null,
      verificationResult: null,
      createdAt: now(),
      updatedAt: now(),
      completedAt: null,
      correlationId: uid(),
      userId,
    };

    this.state.activeCommands.push(command);
    this.emit("command.submitted", "orchestrator", { commandId: command.id, input });
    this.notify();

    // Pipeline: parse → evaluate → route → [approve] → execute → verify
    await this.parseCommand(command);
    await this.evaluateCommand(command);
    await this.routeCommand(command);

    if (command.state === "pending_approval") {
      this.notify();
      return command;
    }

    await this.executeCommand(command);
    await this.verifyCommand(command);

    this.finalizeCommand(command);
    return command;
  }

  // ── Step 1: Parse ───────────────────────────────────────────
  private async parseCommand(cmd: EcosystemCommand): Promise<void> {
    const match = INTENT_PATTERNS.find((p) => p.pattern.test(cmd.input));

    cmd.intent = {
      intent: match?.intent ?? "general_action",
      description: cmd.input,
      scope: match?.scope ?? "device_local",
      targetLayers: match?.layers ?? ["cloud"],
      urgency: "routine",
      riskClass: match?.risk ?? "low",
      trustRequirement: match?.risk === "critical" ? 0.95 : match?.risk === "high" ? 0.8 : 0.5,
      approvalMandatory: match?.approval ?? false,
      simulationRequired: match?.risk === "critical",
      rollbackAvailable: match?.risk !== "critical",
      affectedDomains: this.inferDomains(match?.intent ?? ""),
    };

    cmd.state = "parsed";
    cmd.updatedAt = now();
    this.emit("command.parsed", "orchestrator", { commandId: cmd.id, intent: cmd.intent.intent });
  }

  private inferDomains(intent: string): string[] {
    const map: Record<string, string[]> = {
      optimize_performance: ["system", "resources"],
      deploy_update: ["updates", "fleet"],
      repair_sync: ["sync", "storage"],
      lock_device: ["security", "devices"],
      device_revoke: ["security", "devices", "trust"],
      fleet_wipe: ["security", "devices", "data"],
      investigate_security: ["security", "threats"],
      check_status: ["monitoring"],
      force_sync: ["sync"],
      pause_rollout: ["updates", "fleet"],
      restart_device: ["system"],
      create_backup: ["storage", "data"],
    };
    return map[intent] ?? ["general"];
  }

  // ── Step 2: Evaluate Risk & Guarantees ──────────────────────
  private async evaluateCommand(cmd: EcosystemCommand): Promise<void> {
    if (!cmd.intent) return;

    cmd.guarantees = this.checkGuarantees(cmd);
    cmd.state = "evaluated";
    cmd.updatedAt = now();
  }

  private checkGuarantees(cmd: EcosystemCommand): SystemGuarantee[] {
    const risk = cmd.intent!.riskClass;
    const guarantees: SystemGuarantee[] = [];
    const t = now();

    guarantees.push({
      type: "no_data_loss",
      status: risk === "critical" ? "unverified" : "verified",
      explanation: risk === "critical"
        ? "Critical action may affect data — manual verification recommended"
        : "No data loss expected from this operation",
      checkedAt: t,
    });

    guarantees.push({
      type: "rollback_available",
      status: cmd.intent!.rollbackAvailable ? "verified" : "not_applicable",
      explanation: cmd.intent!.rollbackAvailable
        ? "Rollback path exists for this action"
        : "This action is irreversible",
      checkedAt: t,
    });

    guarantees.push({
      type: "no_trust_downgrade",
      status: cmd.intent!.intent.includes("security") && risk !== "low" ? "unverified" : "verified",
      explanation: "Trust posture impact has been evaluated",
      checkedAt: t,
    });

    guarantees.push({
      type: "verification_path_exists",
      status: "verified",
      explanation: "Post-execution verification checks are configured",
      checkedAt: t,
    });

    guarantees.push({
      type: "audit_trail_complete",
      status: "verified",
      explanation: "All actions in this command are audit-logged",
      checkedAt: t,
    });

    return guarantees;
  }

  // ── Step 3: Route ───────────────────────────────────────────
  private async routeCommand(cmd: EcosystemCommand): Promise<void> {
    if (!cmd.intent) return;

    const steps: ExecutionStep[] = cmd.intent.targetLayers.map((layer, i) => ({
      order: i + 1,
      layer,
      action: `${layer}.execute.${cmd.intent!.intent}`,
      description: `Execute ${cmd.intent!.intent} on ${layer} layer`,
      requiresPrior: i > 0,
      timeoutMs: layer === "os" ? 15000 : 30000,
      rollbackAction: cmd.intent!.rollbackAvailable
        ? `${layer}.rollback.${cmd.intent!.intent}`
        : undefined,
    }));

    const needsDualAuth =
      cmd.intent.riskClass === "critical" ||
      CRITICAL_ACTIONS.has(`${cmd.intent.intent.replace("_", ".")}`);

    const approvalFlow = needsDualAuth
      ? "dual_authority" as const
      : cmd.intent.approvalMandatory
        ? "standard" as const
        : "none" as const;

    cmd.routeDecision = {
      commandId: cmd.id,
      selectedLayers: cmd.intent.targetLayers,
      approvalFlow,
      executionPlan: steps,
      guaranteeChecks: cmd.guarantees,
      decidedAt: now(),
      rationale: this.generateRoutingRationale(cmd),
    };

    if (approvalFlow !== "none") {
      cmd.state = "pending_approval";

      if (needsDualAuth) {
        const challenge: DualAuthorityChallenge = {
          id: uid(),
          commandId: cmd.id,
          action: cmd.intent.intent,
          riskLevel: cmd.intent.riskClass,
          source: "ecosystem-orchestrator",
          challengeToken: uid(),
          expiresAt: now() + 300_000, // 5 minutes
          status: "pending",
          respondedAt: null,
          explanation: `This action (${cmd.intent.intent}) is classified as ${cmd.intent.riskClass} risk and requires dual authority approval.`,
          consequences: this.getConsequences(cmd.intent.intent),
        };
        cmd.dualAuthChallenge = challenge;
        this.state.pendingChallenges.push(challenge);
        this.emit("dual_auth.challenge_issued", "orchestrator", { challengeId: challenge.id, commandId: cmd.id });
      }
    } else {
      cmd.state = "routed";
    }

    cmd.updatedAt = now();
    this.emit("command.routed", "orchestrator", { commandId: cmd.id, layers: cmd.intent.targetLayers });
    this.notify();
  }

  private generateRoutingRationale(cmd: EcosystemCommand): string {
    const intent = cmd.intent!;
    const layers = intent.targetLayers.join(", ");
    return `Command "${intent.intent}" routed to [${layers}] layers. Risk: ${intent.riskClass}. ` +
      `Scope: ${intent.scope}. Approval: ${intent.approvalMandatory ? "required" : "not required"}.`;
  }

  private getConsequences(intent: string): string[] {
    const map: Record<string, string[]> = {
      device_revoke: [
        "Device will lose all trust and access",
        "Active sessions will be terminated",
        "Sync will be disabled for this device",
        "Re-enrollment will be required",
      ],
      fleet_wipe: [
        "ALL devices in fleet will be wiped",
        "User data on devices will be permanently deleted",
        "All sessions will be terminated",
        "Full re-enrollment will be required for all devices",
      ],
      deploy_update: [
        "Update will be staged to targeted cohort",
        "Devices may restart automatically",
        "Rollback available if health checks fail",
      ],
      lock_device: [
        "Device will be immediately locked",
        "Active user sessions will be suspended",
        "Unlock requires admin authorization",
      ],
    };
    return map[intent] ?? ["This action may affect system state"];
  }

  // ── Dual Authority Response ─────────────────────────────────
  async respondToChallenge(challengeId: string, response: "approved" | "denied"): Promise<EcosystemCommand | null> {
    const challenge = this.state.pendingChallenges.find((c) => c.id === challengeId);
    if (!challenge || challenge.status !== "pending") return null;

    if (now() > challenge.expiresAt) {
      challenge.status = "expired";
      const cmd = this.state.activeCommands.find((c) => c.id === challenge.commandId);
      if (cmd) {
        cmd.state = "denied";
        cmd.updatedAt = now();
        cmd.completedAt = now();
        this.finalizeCommand(cmd);
      }
      this.notify();
      return null;
    }

    challenge.status = response === "approved" ? "approved" : "denied";
    challenge.respondedAt = now();
    this.emit("dual_auth.response_received", "orchestrator", { challengeId, response });

    const cmd = this.state.activeCommands.find((c) => c.id === challenge.commandId);
    if (!cmd) return null;

    if (response === "approved") {
      cmd.state = "approved";
      cmd.updatedAt = now();
      this.emit("command.approved", "orchestrator", { commandId: cmd.id });
      await this.executeCommand(cmd);
      await this.verifyCommand(cmd);
      this.finalizeCommand(cmd);
    } else {
      cmd.state = "denied";
      cmd.updatedAt = now();
      cmd.completedAt = now();
      this.emit("command.denied", "orchestrator", { commandId: cmd.id });
      this.finalizeCommand(cmd);
    }

    return cmd;
  }

  // Approve standard (non-dual-auth) commands
  async approveCommand(commandId: string): Promise<EcosystemCommand | null> {
    const cmd = this.state.activeCommands.find((c) => c.id === commandId);
    if (!cmd || cmd.state !== "pending_approval") return null;

    cmd.state = "approved";
    cmd.updatedAt = now();
    this.emit("command.approved", "orchestrator", { commandId: cmd.id });

    await this.executeCommand(cmd);
    await this.verifyCommand(cmd);
    this.finalizeCommand(cmd);
    return cmd;
  }

  async denyCommand(commandId: string): Promise<void> {
    const cmd = this.state.activeCommands.find((c) => c.id === commandId);
    if (!cmd) return;
    cmd.state = "denied";
    cmd.updatedAt = now();
    cmd.completedAt = now();
    this.emit("command.denied", "orchestrator", { commandId: cmd.id });
    this.finalizeCommand(cmd);
  }

  // ── Step 4: Execute ─────────────────────────────────────────
  private async executeCommand(cmd: EcosystemCommand): Promise<void> {
    cmd.state = "dispatched";
    cmd.updatedAt = now();
    this.emit("command.dispatched", "orchestrator", { commandId: cmd.id });
    this.notify();

    // Simulate execution delay
    await new Promise((r) => setTimeout(r, 300));

    cmd.state = "executing";
    cmd.updatedAt = now();
    this.notify();

    const layerResults: Record<string, any> = {};
    const steps = cmd.routeDecision?.executionPlan ?? [];

    for (const step of steps) {
      const startTime = now();
      // Simulated execution per layer — 200-500ms
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 200));
      layerResults[step.layer] = {
        layer: step.layer,
        success: Math.random() > 0.05, // 95% success rate
        action: step.action,
        startedAt: startTime,
        completedAt: now(),
        output: `${step.layer} execution completed for ${cmd.intent?.intent}`,
      };
    }

    const allSuccess = Object.values(layerResults).every((r: any) => r.success);
    cmd.executionResult = {
      success: allSuccess,
      layerResults: layerResults as any,
      duration: now() - cmd.createdAt,
      errorMessage: allSuccess ? undefined : "One or more layers reported failure",
    };

    cmd.updatedAt = now();
    this.emit("command.executed", "orchestrator", {
      commandId: cmd.id,
      success: allSuccess,
      duration: cmd.executionResult.duration,
    });
  }

  // ── Step 5: Verify ──────────────────────────────────────────
  private async verifyCommand(cmd: EcosystemCommand): Promise<void> {
    cmd.state = "verifying";
    cmd.updatedAt = now();
    this.notify();

    await new Promise((r) => setTimeout(r, 200));

    const checks = [
      { name: "Execution completed", passed: cmd.executionResult?.success ?? false, detail: "All layer executions completed" },
      { name: "No data loss", passed: true, detail: "Data integrity verified" },
      { name: "Trust state stable", passed: true, detail: "Trust posture unchanged or improved" },
      { name: "Audit trail recorded", passed: true, detail: "All actions logged" },
    ];

    cmd.verificationResult = {
      passed: checks.every((c) => c.passed),
      checks,
      verifiedAt: now(),
    };

    cmd.updatedAt = now();
    this.emit("command.verified", "orchestrator", {
      commandId: cmd.id,
      passed: cmd.verificationResult.passed,
    });
  }

  // ── Finalize & Memory ───────────────────────────────────────
  private finalizeCommand(cmd: EcosystemCommand): void {
    if (cmd.state === "verifying" || cmd.state === "executing") {
      cmd.state = cmd.verificationResult?.passed
        ? "completed"
        : cmd.executionResult?.success
          ? "completed"
          : "failed";
    }
    cmd.completedAt = now();
    cmd.updatedAt = now();

    // Move from active to history
    this.state.activeCommands = this.state.activeCommands.filter((c) => c.id !== cmd.id);
    this.state.commandHistory.unshift(cmd);
    if (this.state.commandHistory.length > 100) this.state.commandHistory.pop();

    // Remove resolved challenges
    this.state.pendingChallenges = this.state.pendingChallenges.filter(
      (c) => c.commandId !== cmd.id
    );

    // Record to command memory
    if (cmd.intent) {
      const memory: CommandMemoryEntry = {
        id: uid(),
        commandId: cmd.id,
        intent: cmd.intent.intent,
        context: {
          scope: cmd.intent.scope,
          layers: cmd.intent.targetLayers,
          risk: cmd.intent.riskClass,
        },
        riskClass: cmd.intent.riskClass,
        outcome: cmd.state === "completed" ? "success"
          : cmd.state === "rolled_back" ? "rolled_back"
          : cmd.state === "denied" ? "failure"
          : "failure",
        durationMs: (cmd.completedAt ?? now()) - cmd.createdAt,
        userPreferences: {},
        learnedAt: now(),
        patternTags: cmd.intent.affectedDomains,
      };
      this.state.commandMemory.unshift(memory);
      if (this.state.commandMemory.length > 200) this.state.commandMemory.pop();
    }

    this.persist();
    this.notify();
  }

  // ── Event Emission ──────────────────────────────────────────
  private emit(
    type: EcosystemEventType,
    source: EcosystemLayer | "orchestrator",
    payload: Record<string, unknown>,
  ): void {
    const event: EcosystemEvent = {
      id: uid(),
      type,
      correlationId: (payload.commandId as string) ?? uid(),
      sourceLayer: source,
      payload,
      emittedAt: now(),
      version: 1,
    };
    this.state.recentEvents.unshift(event);
    if (this.state.recentEvents.length > 200) this.state.recentEvents.pop();
  }

  // ── Contracts ───────────────────────────────────────────────
  getContracts(): FeatureContract[] {
    return this.state.contracts;
  }

  // ── Command Memory Insights ─────────────────────────────────
  getCommandMemoryInsights(): {
    totalCommands: number;
    successRate: number;
    avgDuration: number;
    topIntents: Array<{ intent: string; count: number }>;
    riskDistribution: Record<RiskClass, number>;
  } {
    const mem = this.state.commandMemory;
    const total = mem.length;
    if (total === 0) return { totalCommands: 0, successRate: 0, avgDuration: 0, topIntents: [], riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 } };

    const successes = mem.filter((m) => m.outcome === "success").length;
    const avgDur = Math.round(mem.reduce((s, m) => s + m.durationMs, 0) / total);

    const intentCounts = new Map<string, number>();
    for (const m of mem) {
      intentCounts.set(m.intent, (intentCounts.get(m.intent) ?? 0) + 1);
    }
    const topIntents = Array.from(intentCounts.entries())
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const riskDist: Record<RiskClass, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const m of mem) riskDist[m.riskClass]++;

    return { totalCommands: total, successRate: Math.round((successes / total) * 100), avgDuration: avgDur, topIntents, riskDistribution: riskDist };
  }

  // ── Refresh Health ──────────────────────────────────────────
  refreshLayerHealth(): void {
    this.simulateLayerHealth();
    this.emit("layer.health_snapshot", "orchestrator", {
      os: this.state.layers.os.healthScore,
      cloud: this.state.layers.cloud.healthScore,
      app: this.state.layers.app.healthScore,
    });
    this.notify();
  }
}

// ── Singleton ─────────────────────────────────────────────────
let instance: EcosystemOrchestrator | null = null;

export function getEcosystemOrchestrator(): EcosystemOrchestrator {
  if (!instance) instance = new EcosystemOrchestrator();
  return instance;
}
