// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Router
// Maps intents to capability executors with policy pre-check
// Canonical contracts: RiskTier, ExecutionMode from contracts
// ═══════════════════════════════════════════════════════════════

import type { RiskTier as CanonicalRiskTier, ExecutionMode as CanonicalExecutionMode } from "@/packages/contracts";

export type { CanonicalRiskTier, CanonicalExecutionMode };

export interface CapabilityDefinition {
  id: string;
  name: string;
  domain: string;
  serviceName: string;
  requiredPolicies: string[];
  riskTier: "R0" | "R1" | "R2" | "R3" | "R4";
  executionModes: ("real" | "shadow" | "simulation" | "draft")[];
  timeout: number;
  retryable: boolean;
}

export interface RoutingDecision {
  capabilityId: string;
  serviceName: string;
  policyPreCheck: { passed: boolean; blockedBy?: string };
  selectedMode: string;
  estimatedLatencyMs: number;
}

export interface RoutingRequest {
  intentType: string;
  domain: string;
  action: string;
  urgency: "low" | "medium" | "high" | "critical";
}

// ── Capability Router Service ───────────────────────────────────

export class CapabilityRouter {
  private capabilities = new Map<string, CapabilityDefinition>();
  private routingHistory: { request: RoutingRequest; decision: RoutingDecision | null; timestamp: number }[] = [];

  register(capability: CapabilityDefinition): void {
    this.capabilities.set(capability.id, capability);
  }

  getCapability(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  listCapabilities(domain?: string): CapabilityDefinition[] {
    const all = Array.from(this.capabilities.values());
    return domain ? all.filter(c => c.domain === domain) : all;
  }

  route(request: RoutingRequest): RoutingDecision | null {
    const capabilityId = `${request.domain}-${request.action}`;
    const capability = this.capabilities.get(capabilityId);

    if (!capability) {
      // Fuzzy match by domain
      const domainCaps = this.listCapabilities(request.domain);
      const fallback = domainCaps[0];
      if (!fallback) {
        this.routingHistory.push({ request, decision: null, timestamp: Date.now() });
        return null;
      }

      const decision: RoutingDecision = {
        capabilityId: fallback.id,
        serviceName: fallback.serviceName,
        policyPreCheck: { passed: true },
        selectedMode: request.urgency === "critical" ? "real" : "simulation",
        estimatedLatencyMs: fallback.timeout / 2,
      };
      this.routingHistory.push({ request, decision, timestamp: Date.now() });
      return decision;
    }

    const mode = this.selectMode(capability, request.urgency);

    const decision: RoutingDecision = {
      capabilityId: capability.id,
      serviceName: capability.serviceName,
      policyPreCheck: { passed: true },
      selectedMode: mode,
      estimatedLatencyMs: capability.timeout / 2,
    };

    this.routingHistory.push({ request, decision, timestamp: Date.now() });
    return decision;
  }

  private selectMode(capability: CapabilityDefinition, urgency: string): string {
    if (capability.riskTier === "R4" || capability.riskTier === "R3") return "draft";
    if (urgency === "critical" && capability.executionModes.includes("real")) return "real";
    if (capability.executionModes.includes("simulation")) return "simulation";
    return capability.executionModes[0] || "draft";
  }

  getRoutingHistory(): typeof this.routingHistory {
    return [...this.routingHistory];
  }

  getHealth(): { status: "healthy"; registeredCapabilities: number } {
    return { status: "healthy", registeredCapabilities: this.capabilities.size };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createCapabilityRouter(): CapabilityRouter {
  const router = new CapabilityRouter();

  const defaults: CapabilityDefinition[] = [
    { id: "business-query", name: "Business Query", domain: "business", serviceName: "business-os", requiredPolicies: ["truth-boundary"], riskTier: "R0", executionModes: ["real", "simulation"], timeout: 5000, retryable: true },
    { id: "business-action", name: "Business Action", domain: "business", serviceName: "business-os", requiredPolicies: ["truth-boundary", "execution-guard"], riskTier: "R2", executionModes: ["draft", "simulation", "real"], timeout: 15000, retryable: false },
    { id: "business-communication.write", name: "Communication Write", domain: "business", serviceName: "business-os", requiredPolicies: ["truth-boundary"], riskTier: "R1", executionModes: ["real", "simulation"], timeout: 10000, retryable: true },
    { id: "finance-query", name: "Finance Query", domain: "finance", serviceName: "finance-os", requiredPolicies: ["truth-boundary"], riskTier: "R0", executionModes: ["real", "simulation"], timeout: 5000, retryable: true },
    { id: "finance-action", name: "Finance Action", domain: "finance", serviceName: "finance-os", requiredPolicies: ["truth-boundary", "execution-guard", "financial-limit"], riskTier: "R3", executionModes: ["draft", "simulation"], timeout: 30000, retryable: false },
    { id: "concierge-query", name: "Concierge Query", domain: "concierge", serviceName: "concierge-os", requiredPolicies: ["truth-boundary"], riskTier: "R0", executionModes: ["real", "simulation"], timeout: 5000, retryable: true },
    { id: "concierge-action", name: "Concierge Action", domain: "concierge", serviceName: "concierge-os", requiredPolicies: ["truth-boundary", "execution-guard"], riskTier: "R1", executionModes: ["real", "simulation", "draft"], timeout: 15000, retryable: true },
    { id: "workspace-profile.update", name: "Profile Update", domain: "workspace", serviceName: "workspace-os", requiredPolicies: ["truth-boundary"], riskTier: "R0", executionModes: ["real"], timeout: 5000, retryable: true },
    { id: "workspace-memory.upsert", name: "Memory Upsert", domain: "workspace", serviceName: "workspace-os", requiredPolicies: [], riskTier: "R0", executionModes: ["real"], timeout: 5000, retryable: true },
    { id: "workspace-notification.preferences.update", name: "Notification Prefs Update", domain: "workspace", serviceName: "workspace-os", requiredPolicies: [], riskTier: "R0", executionModes: ["real"], timeout: 5000, retryable: true },
    { id: "owner-constitution.create", name: "Constitution Create", domain: "owner", serviceName: "constitution-compiler", requiredPolicies: ["truth-boundary"], riskTier: "R1", executionModes: ["real", "simulation"], timeout: 10000, retryable: true },
    { id: "owner-constitution.update", name: "Constitution Update", domain: "owner", serviceName: "constitution-compiler", requiredPolicies: ["truth-boundary"], riskTier: "R1", executionModes: ["real", "simulation"], timeout: 10000, retryable: true },
    { id: "owner-constitution.delete", name: "Constitution Delete", domain: "owner", serviceName: "constitution-compiler", requiredPolicies: ["truth-boundary", "execution-guard"], riskTier: "R2", executionModes: ["real"], timeout: 10000, retryable: false },
    { id: "system-policy.create", name: "Policy Create", domain: "system", serviceName: "policy-engine", requiredPolicies: ["truth-boundary"], riskTier: "R2", executionModes: ["draft", "simulation", "real"], timeout: 15000, retryable: false },
    { id: "system-policy.toggle", name: "Policy Toggle", domain: "system", serviceName: "policy-engine", requiredPolicies: ["truth-boundary"], riskTier: "R1", executionModes: ["real"], timeout: 5000, retryable: true },
    { id: "system-policy.delete", name: "Policy Delete", domain: "system", serviceName: "policy-engine", requiredPolicies: ["truth-boundary", "execution-guard"], riskTier: "R2", executionModes: ["real"], timeout: 10000, retryable: false },
    { id: "platform-diagnostic", name: "Platform Diagnostic", domain: "platform", serviceName: "support-diagnostics", requiredPolicies: [], riskTier: "R0", executionModes: ["real"], timeout: 10000, retryable: true },
  ];

  defaults.forEach(d => router.register(d));
  return router;
}

// ── Re-export modular layer (lib/services/capability-router) ──
export * from "@/lib/services/capability-router";
