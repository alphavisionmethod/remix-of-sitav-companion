// ═══════════════════════════════════════════════════════════════
// SITA OS — Capability Protocol (Section 7)
// Every feature must map to capability IDs. Capabilities are the
// canonical bridge between product intent, architecture, policy,
// approvals, execution, receipts, observability, entitlements,
// and support diagnostics.
// ═══════════════════════════════════════════════════════════════

import type { FeatureRiskTier, AutonomyTier } from "./index";

// ── 7.2 Capability Classes (15 canonical) ───────────────────

export const CAPABILITY_CLASSES = [
  "observe",
  "classify",
  "summarize",
  "recommend",
  "draft",
  "simulate",
  "approve",
  "execute",
  "verify",
  "notify",
  "boardroom-compose",
  "projection-build",
  "support-diagnose",
  "billing-gate",
  "pack-install",
] as const;

export type CapabilityClass = typeof CAPABILITY_CLASSES[number];

// ── Replayability & Sandbox Support ─────────────────────────

export const REPLAYABILITY_CLASSES = ["full", "partial", "none"] as const;
export type ReplayabilityClass = typeof REPLAYABILITY_CLASSES[number];

export const SANDBOX_SUPPORT_LEVELS = ["fake", "sandbox", "sim", "live"] as const;
export type SandboxSupport = typeof SANDBOX_SUPPORT_LEVELS[number];

// ── 7.3 Capability Registration (14 required fields) ────────

export interface CapabilityRegistration {
  readonly capabilityId: string;
  readonly ownerService: string;
  readonly featureId: string;
  readonly riskTier: FeatureRiskTier;
  readonly autonomyTier: AutonomyTier;
  readonly capabilityClass: CapabilityClass;
  readonly requiredScopes: readonly string[];
  readonly requiredPolicyFamilies: readonly string[];
  readonly requiredApprovalType: "none" | "single" | "dual" | "council";
  readonly receiptRequirement: "always" | "on-side-effect" | "never";
  readonly eventSubjectsEmitted: readonly string[];
  readonly replayabilityClass: ReplayabilityClass;
  readonly sandboxSupport: readonly SandboxSupport[];
  readonly entitlementDependency: string | null;
}

// ── Capability Validation ───────────────────────────────────

export function validateCapabilityRegistration(reg: Partial<CapabilityRegistration>): string[] {
  const errors: string[] = [];

  if (!reg.capabilityId) errors.push("Missing capabilityId");
  if (!reg.ownerService) errors.push("Missing ownerService");
  if (!reg.featureId) errors.push("Missing featureId");
  if (!reg.riskTier) errors.push("Missing riskTier");
  if (!reg.autonomyTier) errors.push("Missing autonomyTier");

  if (!reg.capabilityClass) {
    errors.push("Missing capabilityClass");
  } else if (!(CAPABILITY_CLASSES as readonly string[]).includes(reg.capabilityClass)) {
    errors.push(`Invalid capabilityClass: ${reg.capabilityClass}`);
  }

  if (!reg.requiredScopes) errors.push("Missing requiredScopes");
  if (!reg.requiredPolicyFamilies) errors.push("Missing requiredPolicyFamilies");

  if (!reg.requiredApprovalType) {
    errors.push("Missing requiredApprovalType");
  } else if (!["none", "single", "dual", "council"].includes(reg.requiredApprovalType)) {
    errors.push(`Invalid requiredApprovalType: ${reg.requiredApprovalType}`);
  }

  if (!reg.receiptRequirement) {
    errors.push("Missing receiptRequirement");
  } else if (!["always", "on-side-effect", "never"].includes(reg.receiptRequirement)) {
    errors.push(`Invalid receiptRequirement: ${reg.receiptRequirement}`);
  }

  if (!reg.eventSubjectsEmitted) errors.push("Missing eventSubjectsEmitted");

  if (!reg.replayabilityClass) {
    errors.push("Missing replayabilityClass");
  } else if (!(REPLAYABILITY_CLASSES as readonly string[]).includes(reg.replayabilityClass)) {
    errors.push(`Invalid replayabilityClass: ${reg.replayabilityClass}`);
  }

  if (!reg.sandboxSupport || reg.sandboxSupport.length === 0) {
    errors.push("Missing or empty sandboxSupport");
  } else {
    for (const s of reg.sandboxSupport) {
      if (!(SANDBOX_SUPPORT_LEVELS as readonly string[]).includes(s)) {
        errors.push(`Invalid sandboxSupport level: ${s}`);
      }
    }
  }

  if (reg.entitlementDependency === undefined) errors.push("Missing entitlementDependency (use null if none)");

  // Cross-field: side-effecting capabilities must emit receipts
  if (reg.capabilityClass && ["execute", "approve"].includes(reg.capabilityClass)) {
    if (reg.receiptRequirement === "never") {
      errors.push(`Capability class '${reg.capabilityClass}' must not have receiptRequirement 'never'`);
    }
  }

  return errors;
}

// ── Capability Registry ─────────────────────────────────────

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityRegistration>();

  register(reg: CapabilityRegistration): string[] {
    const errors = validateCapabilityRegistration(reg);
    if (errors.length === 0) {
      this.capabilities.set(reg.capabilityId, reg);
    }
    return errors;
  }

  get(capabilityId: string): CapabilityRegistration | undefined {
    return this.capabilities.get(capabilityId);
  }

  getAll(): CapabilityRegistration[] {
    return Array.from(this.capabilities.values());
  }

  getByFeature(featureId: string): CapabilityRegistration[] {
    return this.getAll().filter(c => c.featureId === featureId);
  }

  getByClass(cls: CapabilityClass): CapabilityRegistration[] {
    return this.getAll().filter(c => c.capabilityClass === cls);
  }

  getByOwner(ownerService: string): CapabilityRegistration[] {
    return this.getAll().filter(c => c.ownerService === ownerService);
  }

  getByRiskTier(tier: FeatureRiskTier): CapabilityRegistration[] {
    return this.getAll().filter(c => c.riskTier === tier);
  }

  count(): number {
    return this.capabilities.size;
  }
}
