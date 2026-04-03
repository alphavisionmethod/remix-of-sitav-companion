import { describe, it, expect } from "vitest";
import { hasScope, isOwnerOrAdmin, DEFAULT_AUTH_POLICY, validateSession, isPermissionActive, type AuthSession, type PermissionGrant } from "@/packages/auth";
import { track, flush, resetSession, getSessionId } from "@/packages/telemetry";
import { registerFlag, isEnabled, getCurrentRolloutPercentage, type FeatureFlag, type GradualRollout } from "@/packages/feature-flags";
import { checkEntitlement, tierIncludes, checkMeteredEntitlement, type Entitlement, type UsageMeter } from "@/packages/entitlements";
import { validateManifest, type PackManifest } from "@/packages/pack-manifests";
import { filterEntries, type StoreEntry } from "@/packages/store-metadata";
import { registerTemplate, getTemplate, instantiateTemplate, type Template } from "@/packages/template-registry";
import { createWorkflowContext, createRollbackPlan, type CompensationStep } from "@/packages/workflow-primitives";
import { shouldAllowRequest, isRateLimited, calculateBackoff, DEFAULT_RETRY_CONFIG, type CircuitBreaker, type RateLimiter } from "@/packages/client-sdk";
import {
  RISK_TIERS, AUTONOMY_TIERS, FEATURE_TYPES, KILL_SWITCH_CLASSES,
  validateFeatureMetadata, checkCompliance, registerFeature,
  riskTierLevel, isHighRisk, autonomyLevel, requiresApproval,
  type FeatureMetadata,
} from "@/packages/feature-governance";

// ── Auth Package ────────────────────────────────────────────

describe("Auth Package", () => {
  const session: AuthSession = { userId: "u1", email: "test@test.com", role: "owner", scopes: ["full"], deviceId: "d1", trustedDevice: true, expiresAt: Date.now() + 3600000 };

  it("checks scope correctly", () => {
    expect(hasScope(session, "read-only")).toBe(true);
    expect(hasScope({ ...session, scopes: ["read-only"] }, "domain")).toBe(false);
  });

  it("identifies owner/admin", () => {
    expect(isOwnerOrAdmin(session)).toBe(true);
    expect(isOwnerOrAdmin({ ...session, role: "viewer" })).toBe(false);
  });

  it("validates session expiry", () => {
    const expired = { ...session, expiresAt: Date.now() - 1000 };
    expect(validateSession(expired).valid).toBe(false);
    expect(validateSession(expired).reason).toBe("expired");
  });

  it("validates session device trust", () => {
    const untrusted = { ...session, trustedDevice: false };
    expect(validateSession(untrusted).valid).toBe(false);
    expect(validateSession(untrusted).reason).toBe("device-untrusted");
  });

  it("validates session scope", () => {
    const limited = { ...session, scopes: ["read-only" as const] };
    expect(validateSession(limited, "domain").valid).toBe(false);
    expect(validateSession(limited, "domain").reason).toBe("scope-insufficient");
  });

  it("checks permission grant active", () => {
    const active: PermissionGrant = { grantId: "g1", userId: "u1", scope: "full", grantedBy: "admin", grantedAt: Date.now(), reason: "test" };
    const expired: PermissionGrant = { ...active, expiresAt: Date.now() - 1000 };
    expect(isPermissionActive(active)).toBe(true);
    expect(isPermissionActive(expired)).toBe(false);
  });
});

// ── Telemetry Package ───────────────────────────────────────

describe("Telemetry Package", () => {
  it("tracks and flushes events", () => {
    resetSession();
    track("page_view", "test_page", { path: "/test" });
    track("action", "button_click");
    const events = flush();
    expect(events.length).toBe(2);
    expect(events[0].name).toBe("test_page");
    expect(flush().length).toBe(0);
  });
});

// ── Feature Flags Package ───────────────────────────────────

describe("Feature Flags Package", () => {
  it("registers and checks flags", () => {
    const flag: FeatureFlag = { id: "f1", key: "test_feature", name: "Test", description: "Test flag", type: "boolean", enabled: true, value: true, createdAt: Date.now(), updatedAt: Date.now() };
    registerFlag(flag);
    expect(isEnabled("test_feature")).toBe(true);
    expect(isEnabled("nonexistent")).toBe(false);
  });

  it("calculates gradual rollout percentage", () => {
    const rollout: GradualRollout = {
      flagKey: "test",
      stages: [
        { percentage: 10, startAt: Date.now() - 10000, durationMs: 5000 },
        { percentage: 50, startAt: Date.now() - 5000, durationMs: 5000 },
      ],
      currentStage: 1,
      cohortSeed: "abc",
      targetSegments: [],
    };
    expect(getCurrentRolloutPercentage(rollout)).toBe(50);
  });
});

// ── Entitlements Package ────────────────────────────────────

describe("Entitlements Package", () => {
  it("checks entitlements with limits", () => {
    const ents: Entitlement[] = [
      { id: "e1", feature: "ai_requests", tier: "professional", limit: 100, used: 50, unlimited: false },
      { id: "e2", feature: "storage", tier: "professional", unlimited: true },
    ];
    expect(checkEntitlement(ents, "ai_requests")).toEqual({ allowed: true, remaining: 50 });
    expect(checkEntitlement(ents, "storage")).toEqual({ allowed: true });
    expect(checkEntitlement(ents, "nonexistent")).toEqual({ allowed: false });
  });

  it("compares tiers", () => {
    expect(tierIncludes("enterprise", "starter")).toBe(true);
    expect(tierIncludes("free", "professional")).toBe(false);
  });

  it("checks metered entitlements", () => {
    const meter: UsageMeter = { featureId: "ai", userId: "u1", current: 80, limit: 100, resetAt: Date.now() + 86400000, period: "daily" };
    const result = checkMeteredEntitlement(meter, "block");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(20);
    expect(result.usagePercent).toBe(80);

    const exceeded: UsageMeter = { ...meter, current: 100 };
    expect(checkMeteredEntitlement(exceeded, "block").allowed).toBe(false);
    expect(checkMeteredEntitlement(exceeded, "warn").allowed).toBe(true);
  });
});

// ── Workflow Primitives Package ─────────────────────────────

describe("Workflow Primitives Package", () => {
  it("creates workflow context", () => {
    const ctx = createWorkflowContext("wf-1", "u1");
    expect(ctx.workflowId).toBe("wf-1");
    expect(ctx.userId).toBe("u1");
    expect(ctx.currentStepIndex).toBe(0);
  });

  it("creates rollback plans", () => {
    const steps: CompensationStep[] = [
      { stepId: "s1", compensationAction: "revert-payment", config: {}, timeout: 5000, retryPolicy: { maxRetries: 2, backoffMs: 500, backoffMultiplier: 2, retryableErrors: [] } },
    ];
    const plan = createRollbackPlan("wf-1", "run-1", steps, "payment failed");
    expect(plan.steps.length).toBe(1);
    expect(plan.reason).toBe("payment failed");
    expect(plan.initiatedBy).toBe("system");
  });
});

// ── Client SDK Package ──────────────────────────────────────

describe("Client SDK Package", () => {
  it("circuit breaker allows/blocks requests", () => {
    const closed: CircuitBreaker = { serviceId: "s1", state: "closed", failureCount: 0, failureThreshold: 5, resetTimeoutMs: 30000 };
    expect(shouldAllowRequest(closed)).toBe(true);

    const open: CircuitBreaker = { ...closed, state: "open", failureCount: 5, lastFailureAt: Date.now() };
    expect(shouldAllowRequest(open)).toBe(false);

    const recovering: CircuitBreaker = { ...open, lastFailureAt: Date.now() - 60000 };
    expect(shouldAllowRequest(recovering)).toBe(true);
  });

  it("rate limiter detects limits", () => {
    const limited: RateLimiter = { serviceId: "s1", maxRequests: 100, windowMs: 60000, currentCount: 100, windowStart: Date.now() };
    expect(isRateLimited(limited)).toBe(true);

    const ok: RateLimiter = { ...limited, currentCount: 50 };
    expect(isRateLimited(ok)).toBe(false);
  });

  it("calculates exponential backoff", () => {
    expect(calculateBackoff(0)).toBe(500);
    expect(calculateBackoff(1)).toBe(1000);
    expect(calculateBackoff(2)).toBe(2000);
    expect(calculateBackoff(10)).toBe(DEFAULT_RETRY_CONFIG.maxDelayMs);
  });
});

// ── Pack Manifests Package ──────────────────────────────────

describe("Pack Manifests Package", () => {
  it("validates manifest", () => {
    const valid: PackManifest = {
      id: "pack-1", name: "Test Pack", version: "1.0.0", description: "Test", category: "founders",
      author: "SITA", icon: "📦", capabilities: ["cap1"], dependencies: [], requiredTier: "starter",
      installConfig: { autoActivate: true, requiredConnectors: [], requiredPermissions: [], setupSteps: [] },
      surfaces: [],
    };
    expect(validateManifest(valid)).toEqual([]);

    const invalid = { ...valid, id: "", version: "bad", capabilities: [] };
    const errors = validateManifest(invalid as PackManifest);
    expect(errors.length).toBeGreaterThan(0);
  });
});

// ── Store Metadata Package ──────────────────────────────────

describe("Store Metadata Package", () => {
  const entries: StoreEntry[] = [
    { id: "s1", packId: "p1", name: "Alpha Pack", tagline: "Best pack", description: "", category: "founders", tags: [], rating: 4.5, installCount: 100, price: 0, featured: true, screenshots: [], changelog: [], reviews: [], publishedAt: Date.now(), updatedAt: Date.now() },
    { id: "s2", packId: "p2", name: "Beta Pack", tagline: "Good pack", description: "", category: "families", tags: [], rating: 3.8, installCount: 50, price: 29, featured: false, screenshots: [], changelog: [], reviews: [], publishedAt: Date.now() - 86400000, updatedAt: Date.now() },
  ];

  it("filters by category", () => {
    expect(filterEntries(entries, { category: "founders" }).length).toBe(1);
  });

  it("sorts by rating", () => {
    const sorted = filterEntries(entries, { sortBy: "rating" });
    expect(sorted[0].name).toBe("Alpha Pack");
  });
});

// ── Template Registry Package ───────────────────────────────

describe("Template Registry Package", () => {
  it("registers and instantiates templates", () => {
    const template: Template = {
      id: "tpl-1", name: "Invoice", type: "invoice", description: "Standard invoice",
      domain: "business", schema: [], defaultValues: { currency: "USD" }, version: "1.0.0", createdAt: Date.now(),
    };
    registerTemplate(template);
    expect(getTemplate("tpl-1")).toBeDefined();

    const instance = instantiateTemplate("tpl-1", { amount: 1000 });
    expect(instance).toBeDefined();
    expect(instance!.values.currency).toBe("USD");
    expect(instance!.values.amount).toBe(1000);
    expect(instance!.status).toBe("draft");
  });
});

// ── Feature Governance Package ──────────────────────────────

describe("Feature Governance Package", () => {
  it("has 6 risk tiers R0-R5 in order", () => {
    expect(riskTierLevel("R0")).toBe(0);
    expect(riskTierLevel("R5")).toBe(5);
    expect(riskTierLevel("R0")).toBeLessThan(riskTierLevel("R5"));
  });

  it("identifies high-risk tiers", () => {
    expect(isHighRisk("R0")).toBe(false);
    expect(isHighRisk("R2")).toBe(false);
    expect(isHighRisk("R3")).toBe(true);
    expect(isHighRisk("R5")).toBe(true);
  });

  it("has 7 autonomy tiers in order", () => {
    expect(Object.keys(AUTONOMY_TIERS).length).toBe(7);
    expect(autonomyLevel("observe")).toBe(0);
    expect(autonomyLevel("delegated-recurring")).toBe(6);
  });

  it("detects approval requirement", () => {
    expect(requiresApproval("observe")).toBe(false);
    expect(requiresApproval("draft")).toBe(false);
    expect(requiresApproval("approval-ready")).toBe(true);
    expect(requiresApproval("delegated-recurring")).toBe(true);
  });

  it("has exactly 16 feature types", () => {
    expect(FEATURE_TYPES.length).toBe(16);
  });

  it("has 3 kill-switch classes", () => {
    expect(KILL_SWITCH_CLASSES.length).toBe(3);
    expect(KILL_SWITCH_CLASSES).toContain("instant");
    expect(KILL_SWITCH_CLASSES).toContain("graceful");
    expect(KILL_SWITCH_CLASSES).toContain("scheduled");
  });

  it("validates complete feature metadata", () => {
    const complete: FeatureMetadata = {
      featureId: "feat-1", name: "Test Feature", type: ["ui-interaction"],
      primaryOwner: "business-os", secondaryOwners: [], capabilityIds: ["cap-1"],
      surfaceIds: ["page-1"], domainAlignment: "business", riskTier: "R1",
      autonomyTier: "recommend", dataSensitivityTier: "internal",
      launchStatus: "development", implementationStatus: "in-progress",
      rolloutStatus: "not-started", killSwitchClass: "graceful",
      supportOwner: "team-a", productOwner: "pm-1", engineeringOwner: "eng-1",
    };
    expect(validateFeatureMetadata(complete)).toEqual([]);
  });

  it("catches missing fields", () => {
    const errors = validateFeatureMetadata({});
    expect(errors.length).toBeGreaterThan(10);
    expect(errors).toContain("Missing featureId");
    expect(errors).toContain("Missing riskTier");
  });

  it("generates compliance report with warnings", () => {
    const highRisk: FeatureMetadata = {
      featureId: "feat-2", name: "Risky Feature", type: ["governed-workflow"],
      primaryOwner: "finance-os", secondaryOwners: [], capabilityIds: ["cap-2"],
      surfaceIds: [], domainAlignment: "finance", riskTier: "R4",
      autonomyTier: "constrained-auto", dataSensitivityTier: "restricted",
      launchStatus: "beta", implementationStatus: "architecture-complete",
      rolloutStatus: "canary", killSwitchClass: "graceful",
      supportOwner: "team-b", productOwner: "pm-2", engineeringOwner: "eng-2",
    };
    const report = checkCompliance(highRisk);
    expect(report.compliant).toBe(true);
    expect(report.warnings).toContain("High-risk features should use instant kill-switch");
  });

  it("registers and retrieves features", () => {
    const meta: FeatureMetadata = {
      featureId: "feat-reg-1", name: "Registered", type: ["analytics-reporting"],
      primaryOwner: "system", secondaryOwners: [], capabilityIds: ["cap-3"],
      surfaceIds: ["dash-1"], domainAlignment: "system", riskTier: "R0",
      autonomyTier: "observe", dataSensitivityTier: "public",
      launchStatus: "ga", implementationStatus: "production-complete",
      rolloutStatus: "full", killSwitchClass: "scheduled",
      supportOwner: "team-c", productOwner: "pm-3", engineeringOwner: "eng-3",
    };
    const errors = registerFeature(meta);
    expect(errors).toEqual([]);
  });
});
