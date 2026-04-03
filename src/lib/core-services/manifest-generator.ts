// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest Generator
// Auto-proof generation, service manifests, capability registry,
// and compliance bundle packaging
// ═══════════════════════════════════════════════════════════════

import { ReceiptService, type Receipt, type ProofPack } from "./receipt-service";
import { createReceiptService } from "./receipt-service";

// ── Types ───────────────────────────────────────────────────────

export type CapabilityStatus = "active" | "degraded" | "inactive" | "deprecated";
export type RegistryEntryType = "capability" | "service" | "schema" | "workflow" | "integration";

export interface ServiceManifestEntry {
  id: string;
  capabilityId: string;
  name: string;
  status: CapabilityStatus;
  version: string;
  lastExecutedAt: number | null;
  executionCount: number;
  errorCount: number;
  healthScore: number; // 0-100
  registeredAt: number;
  updatedAt: number;
}

export interface RegistryEntry {
  id: string;
  type: RegistryEntryType;
  key: string;
  name: string;
  description: string;
  schema?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  active: boolean;
  registeredAt: number;
  updatedAt: number;
}

export interface ComplianceBundle {
  id: string;
  domain: string;
  dateRange: { from: string; to: string };
  proofPacks: ProofPack[];
  manifestSnapshot: ServiceManifestEntry[];
  registrySnapshot: RegistryEntry[];
  totalReceipts: number;
  chainIntegrity: boolean;
  generatedAt: number;
}

export interface ManifestSnapshot {
  services: ServiceManifestEntry[];
  registryEntries: RegistryEntry[];
  totalCapabilities: number;
  activeCapabilities: number;
  healthScore: number; // aggregate 0-100
  lastUpdated: number;
}

export interface ActionProofResult {
  receipt: Receipt;
  proofPack: ProofPack;
  correlationId: string;
}

// ── Manifest Generator ──────────────────────────────────────────

export class ManifestGenerator {
  private manifests: Map<string, ServiceManifestEntry> = new Map();
  private registry: Map<string, RegistryEntry> = new Map();
  private receipts: ReceiptService;

  constructor(receiptService?: ReceiptService) {
    this.receipts = receiptService ?? createReceiptService();
    this.seedDefaults();
  }

  // ── Action Proof Generation ─────────────────────────────────────

  async generateActionProof(
    action: string,
    result: Record<string, unknown>,
    options?: { capabilityId?: string; domain?: string }
  ): Promise<ActionProofResult> {
    const correlationId = crypto.randomUUID();

    const receipt = await this.receipts.createReceipt(
      correlationId,
      "execution-summary",
      {
        action,
        result,
        domain: options?.domain ?? "general",
        capabilityId: options?.capabilityId,
        timestamp: Date.now(),
      },
      { capabilityId: options?.capabilityId }
    );

    // Update manifest if capability tracked
    if (options?.capabilityId) {
      this.recordExecution(options.capabilityId, true);
    }

    const proofPack = await this.receipts.generateProofPack(correlationId);

    return { receipt, proofPack, correlationId };
  }

  // ── Proposal Proof Generation ───────────────────────────────────

  async generateProposalProof(proposal: {
    id: string;
    title: string;
    category: string;
    status: string;
    risk: string;
    changes: { description: string; reversible: boolean }[];
  }): Promise<ActionProofResult> {
    const correlationId = proposal.id;

    const receipt = await this.receipts.createReceipt(
      correlationId,
      "approval-record",
      {
        proposalTitle: proposal.title,
        category: proposal.category,
        status: proposal.status,
        risk: proposal.risk,
        changesCount: proposal.changes.length,
        reversibleChanges: proposal.changes.filter((c) => c.reversible).length,
        timestamp: Date.now(),
      }
    );

    const proofPack = await this.receipts.generateProofPack(correlationId);
    return { receipt, proofPack, correlationId };
  }

  // ── Service Manifest Management ─────────────────────────────────

  updateServiceManifest(
    capabilityId: string,
    update: Partial<Pick<ServiceManifestEntry, "name" | "status" | "version">>
  ): ServiceManifestEntry {
    const existing = this.manifests.get(capabilityId);

    if (existing) {
      const updated = { ...existing, ...update, updatedAt: Date.now() };
      this.manifests.set(capabilityId, updated);
      return updated;
    }

    const entry: ServiceManifestEntry = {
      id: crypto.randomUUID(),
      capabilityId,
      name: update.name ?? capabilityId,
      status: update.status ?? "active",
      version: update.version ?? "1.0.0",
      lastExecutedAt: null,
      executionCount: 0,
      errorCount: 0,
      healthScore: 100,
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.manifests.set(capabilityId, entry);
    return entry;
  }

  recordExecution(capabilityId: string, success: boolean): void {
    const entry = this.manifests.get(capabilityId);
    if (!entry) return;

    entry.executionCount++;
    entry.lastExecutedAt = Date.now();
    if (!success) {
      entry.errorCount++;
    }
    // Recalculate health: 100 * (1 - errorRate), min 0
    const errorRate = entry.executionCount > 0 ? entry.errorCount / entry.executionCount : 0;
    entry.healthScore = Math.max(0, Math.round(100 * (1 - errorRate)));
    entry.updatedAt = Date.now();
  }

  // ── Registry Management ─────────────────────────────────────────

  updateRegistryEntry(
    type: RegistryEntryType,
    key: string,
    data: { name: string; description: string; schema?: Record<string, unknown>; metadata?: Record<string, unknown> }
  ): RegistryEntry {
    const existing = this.registry.get(key);

    if (existing) {
      const updated: RegistryEntry = {
        ...existing,
        ...data,
        metadata: { ...existing.metadata, ...data.metadata },
        updatedAt: Date.now(),
      };
      this.registry.set(key, updated);
      return updated;
    }

    const entry: RegistryEntry = {
      id: crypto.randomUUID(),
      type,
      key,
      name: data.name,
      description: data.description,
      schema: data.schema,
      metadata: data.metadata ?? {},
      active: true,
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.registry.set(key, entry);
    return entry;
  }

  deactivateRegistryEntry(key: string): boolean {
    const entry = this.registry.get(key);
    if (!entry) return false;
    entry.active = false;
    entry.updatedAt = Date.now();
    return true;
  }

  // ── Compliance Bundle ─────────────────────────────────────────

  async generateComplianceBundle(domain: string, from: string, to: string): Promise<ComplianceBundle> {
    const allReceipts = this.receipts.getReceipts();
    const domainReceipts = allReceipts.filter((r) => {
      const data = r.data as Record<string, unknown>;
      return (data.domain === domain || domain === "all") && r.createdAt >= new Date(from).getTime() && r.createdAt <= new Date(to).getTime();
    });

    // Group by correlation and generate proof packs
    const correlationIds = [...new Set(domainReceipts.map((r) => r.correlationId))];
    const proofPacks: ProofPack[] = [];
    for (const corrId of correlationIds) {
      proofPacks.push(await this.receipts.generateProofPack(corrId));
    }

    const chainResult = await this.receipts.verifyChain();

    return {
      id: crypto.randomUUID(),
      domain,
      dateRange: { from, to },
      proofPacks,
      manifestSnapshot: this.getManifestEntries(),
      registrySnapshot: this.getRegistryEntries(),
      totalReceipts: domainReceipts.length,
      chainIntegrity: chainResult.valid,
      generatedAt: Date.now(),
    };
  }

  // ── Snapshot ───────────────────────────────────────────────────

  getManifestSnapshot(): ManifestSnapshot {
    const services = this.getManifestEntries();
    const active = services.filter((s) => s.status === "active");
    const avgHealth = services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.healthScore, 0) / services.length)
      : 100;

    return {
      services,
      registryEntries: this.getRegistryEntries(),
      totalCapabilities: services.length,
      activeCapabilities: active.length,
      healthScore: avgHealth,
      lastUpdated: Date.now(),
    };
  }

  // ── Queries ───────────────────────────────────────────────────

  getManifestEntries(): ServiceManifestEntry[] {
    return Array.from(this.manifests.values());
  }

  getRegistryEntries(type?: RegistryEntryType): RegistryEntry[] {
    const entries = Array.from(this.registry.values());
    return type ? entries.filter((e) => e.type === type) : entries;
  }

  getManifestEntry(capabilityId: string): ServiceManifestEntry | undefined {
    return this.manifests.get(capabilityId);
  }

  // ── Seed Defaults ─────────────────────────────────────────────

  private seedDefaults(): void {
    const defaults: { id: string; name: string; status: CapabilityStatus }[] = [
      { id: "canonical-chain", name: "Canonical Chain Orchestrator", status: "active" },
      { id: "policy-engine", name: "Policy Engine", status: "active" },
      { id: "receipt-service", name: "Receipt Service", status: "active" },
      { id: "companion-engine", name: "Companion Engine", status: "active" },
      { id: "life-intelligence", name: "Life Intelligence Engine", status: "active" },
      { id: "feature-proposals", name: "Feature Proposal Engine", status: "active" },
      { id: "identity-graph", name: "Identity & Household Graph", status: "active" },
      { id: "memory-service", name: "Memory Service", status: "active" },
      { id: "workflow-engine", name: "Workflow Engine", status: "active" },
      { id: "fraud-sentinel", name: "Fraud Sentinel", status: "active" },
    ];

    for (const d of defaults) {
      this.updateServiceManifest(d.id, { name: d.name, status: d.status, version: "1.0.0" });
    }

    // Seed registry entries
    this.updateRegistryEntry("service", "proof-generation", {
      name: "Proof Generation",
      description: "Hash-chained cryptographic proof generation for all actions",
    });
    this.updateRegistryEntry("service", "manifest-tracking", {
      name: "Manifest Tracking",
      description: "Service health and capability tracking",
    });
    this.updateRegistryEntry("schema", "life-context", {
      name: "Life Context Schema",
      description: "Holistic user context model across all domains",
    });
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createManifestGenerator(receiptService?: ReceiptService): ManifestGenerator {
  return new ManifestGenerator(receiptService);
}
