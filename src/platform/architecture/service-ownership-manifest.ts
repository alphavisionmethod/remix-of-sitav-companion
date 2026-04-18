// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Ownership Manifest
// Declares canonical ownership for each service directory,
// flags duplicates, and tracks layer assignment.
// ═══════════════════════════════════════════════════════════════

import { LAYERS, type Layer } from "./layer-manifest";

export interface ServiceOwnership {
  id: string;
  layer: Layer;
  location: "services" | "core-services" | "both";
  canonical: boolean;
  duplicateOf?: string;
  status: "active" | "shim" | "deprecated" | "anti-sprawl-stub";
  description: string;
}

// ── Known Duplicates Between services/ and core-services/ ───────

export const DUPLICATE_SERVICES: { serviceId: string; inServices: boolean; inCoreServices: boolean; canonicalLocation: "services" | "core-services" }[] = [
  // ── Original 9 ──
  { serviceId: "brain-core", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "conscience-gate", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "ai-gateway", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "canonical-pipeline", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "capability-router", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "executor-service", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "approval-engine", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "biometric-auth", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "ai-workforce", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  // ── Additional 30 discovered duplicates ──
  { serviceId: "epistemic-firewall", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "event-bus", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "finance-os", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "flagship-loops", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "frontend", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "google-provider-family", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "handoff", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "identity-auth", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "inference-gateway", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "integration-hub", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "launch-readiness", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "life-simulation", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "memory-service", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "mnemosyne", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "model-router", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "policy-engine", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "projection-service", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "receipt-service", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "recommendation-execution", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "security", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "self-healing", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "service-registry", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "system-updates", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "trust-governor", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "truth-indices", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "verification-engine", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "workflow-engine", inServices: true, inCoreServices: true, canonicalLocation: "core-services" },
  { serviceId: "architecture", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "governance-simulator", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "search-fabric", inServices: true, inCoreServices: true, canonicalLocation: "services" },
  { serviceId: "fraud-sentinel", inServices: true, inCoreServices: true, canonicalLocation: "services" },
];

// ── Kernel-Layer Services (must live in core-services/) ─────────

export const KERNEL_SERVICES: string[] = [
  "brain-core",
  "conscience-gate",
  "canonical-pipeline",
  "capability-router",
  "executor-service",
  "receipt-service",
  "event-bus",
  "approval-engine",
  "trust-state-service",
  "constitution-compiler",
  "policy-engine",
  "model-router",
];

// ── OS-Layer Services (orchestration, in services/) ─────────────

export const OS_SERVICES_LIST: string[] = [
  "intent-orchestrator",
  "attention-os",
  "continuity-engine",
  "chief-of-staff",
  "timing-intelligence",
  "digest-engine",
  "sita-modes",
  "adaptive-interface",
  "opportunity-engine",
  "memory-governance",
  "boundary-engine",
  "experience-signature",
  "personal-graph",
  "trust-actions",
  "relationship-intelligence",
  "ai-gateway",
];

// ── Domain Capability Services ──────────────────────────────────

export const DOMAIN_SERVICES: string[] = [
  "business-os",
  "finance-os",
  "concierge-os",
];

// ── Service Count Budget ────────────────────────────────────────

export const SERVICE_BUDGET = {
  maxCanonical: 45,
  currentKernel: KERNEL_SERVICES.length,
  currentOS: OS_SERVICES_LIST.length,
  currentDomain: DOMAIN_SERVICES.length,
  get total() { return this.currentKernel + this.currentOS + this.currentDomain; },
  get withinBudget() { return this.total <= this.maxCanonical; },
  get overage() { return Math.max(0, this.total - this.maxCanonical); },
};

// ── Summary ─────────────────────────────────────────────────────

export function getServiceOwnershipSummary() {
  return {
    budget: SERVICE_BUDGET,
    duplicates: DUPLICATE_SERVICES.length,
    duplicateIds: DUPLICATE_SERVICES.map(d => d.serviceId),
    layerBreakdown: {
      kernel: KERNEL_SERVICES.length,
      osServices: OS_SERVICES_LIST.length,
      domain: DOMAIN_SERVICES.length,
    },
  };
}
