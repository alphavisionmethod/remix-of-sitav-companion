import { describe, it, expect } from "vitest";

import {
  validateOwnerBoundary,
  classifyOwnerBoundary,
  OWNER_BOUNDARY_TYPES,
  OWNER_PREFERENCES,
  OWNER_REJECTION_RULES,
  ownerPreferenceRank,
  isSmallestCorrectOwner,
  getAllRejectionRules,
  type OwnerBoundaryDeclaration,
  type OwnerValidationContext,
} from "@/packages/feature-governance/ownership";

import {
  validateIntake,
  intakeCompleteness,
  CRITICALITY_CLASSES,
  ENVIRONMENT_PROGRESSIONS,
  type FeatureIntake,
} from "@/packages/feature-governance/intake";

import {
  validateSpec,
  specCompleteness,
  createEmptySpec,
  SPEC_SECTIONS,
  type FeatureSpec,
} from "@/packages/feature-governance/spec-template";

import {
  CAPABILITY_CLASSES,
  REPLAYABILITY_CLASSES,
  SANDBOX_SUPPORT_LEVELS,
  validateCapabilityRegistration,
  CapabilityRegistry,
  type CapabilityRegistration,
} from "@/packages/feature-governance/capability-protocol";

import {
  SCHEMA_FAMILIES,
  SCHEMA_FAMILIES_BY_RISK_TIER,
  CONTRACT_EVOLUTION_RULES,
  validateSchemaRegistry,
  schemaCompleteness,
  type FeatureSchemaRegistry,
} from "@/packages/feature-governance/contract-schema-protocol";

import {
  SAMPLE_SPECS,
} from "@/packages/feature-governance/sample-specs";

import type { FeatureRiskTier } from "@/packages/feature-governance/index";

// ── Helpers ─────────────────────────────────────────────────

const validDeclaration: OwnerBoundaryDeclaration = {
  featureId: "test-feature-1",
  primaryOwner: "finance-os",
  boundaryType: "domain-module",
  justification: "Financial projection belongs in finance domain",
  whyNotElsewhere: "Not a surface concern, not cross-domain",
  ownerPreference: "extend-existing",
  secondaryOwners: [],
  touchesTrustBearing: false,
  extendsExisting: true,
};

const defaultContext: OwnerValidationContext = {
  existingOwners: ["business-os", "finance-os", "concierge-os"],
  existingDomains: ["business", "finance", "concierge"],
  brainOwner: "brain-core",
  surfaceFiles: [],
};

function makeFullIntake(overrides?: Partial<FeatureIntake>): FeatureIntake {
  return {
    featureId: "test-intake-1",
    featureName: "Test Feature",
    riskTier: "R1",
    submittedAt: Date.now(),
    submittedBy: "test-user",
    outcome: {
      userOutcome: "User can see projections",
      problemSolved: "No visibility into future cash",
      criticalityClass: "retention-critical",
      breakIfNotBuilt: "Users churn without financial visibility",
    },
    architecture: {
      primaryOwner: "finance-os",
      extendsExistingService: true,
      existingServiceExtended: "projection-service",
      touchesTrustBearing: false,
      requiresNewContracts: false,
      requiresNewWorkflowStates: false,
      requiresConnectors: false,
      requiresGeneratedTruth: false,
    },
    governance: {
      policyApplied: "finance-read-policy",
      approvalBehavior: "none — read-only",
      simulationRequired: false,
      refusalSemanticsRequired: false,
      autonomyTierAtLaunch: "observe",
    },
    supportability: {
      diagnosisPath: "Check projection-service logs",
      correlationIds: ["projection-request-id"],
      replayable: false,
      rollbackPath: "Disable feature flag",
      partialFailureUX: "Show stale data with warning badge",
    },
    rollout: {
      environmentProgression: "local-staging-production",
      requiresFeatureFlags: false,
      requiresShadowMode: false,
      killSwitchId: "kill-projections",
      productionMonitorOwner: "finance-team",
    },
    ...overrides,
  };
}

function makeFullSpec(): FeatureSpec {
  return {
    header: {
      featureId: "f-1",
      title: "Cash Projection",
      status: "development",
      owner: "finance-os",
      productOwner: "product-lead",
      engineeringOwner: "eng-lead",
      supportOwner: "support-lead",
      rolloutStage: "canary",
      wedgePriority: 2,
    },
    outcome: {
      userProblem: "No future cash visibility",
      expectedValue: "See 90-day cash projection",
      whyNow: "Top churn reason",
      nonGoals: ["Real-time trading"],
    },
    capabilityMap: {
      readOnly: ["projection-read"],
      sideEffecting: [],
      supporting: ["memory-recall"],
      advisorInvolvement: "recommend",
    },
    ownerMap: {
      primary: "finance-os",
      secondary: ["brain-core"],
      integrations: ["bank-connector"],
      packages: ["finance-contracts"],
      generatedTruth: ["service-manifest"],
    },
    surfaceMap: {
      web: ["/money/cash-timing"],
      mobile: [],
      admin: [],
      notifications: ["cash-low-alert"],
      boardroomVisibility: true,
    },
    contracts: {
      requestSchemas: ["ProjectionRequest"],
      responseSchemas: ["ProjectionResponse"],
      eventSchemas: ["projection.generated"],
      receiptSchemas: ["ProjectionReceipt"],
      diagnosticSchemas: ["ProjectionDiagnostic"],
      featureFlagSchemas: [],
    },
    workflowModel: {
      family: "projection",
      states: ["pending", "computing", "complete", "failed"],
      transitions: [{ from: "pending", to: "computing", trigger: "start" }],
      timeoutRules: [{ state: "computing", maxDurationMs: 30000, escalation: "alert-ops" }],
      retryRules: [{ state: "computing", maxRetries: 3, backoffMs: 1000 }],
      compensation: [{ step: "computing", rollbackAction: "cancel-projection" }],
      replayBehavior: "full",
    },
    policyModel: {
      riskTier: "R1",
      autonomyTier: "recommend",
      policyRules: ["finance-read-policy"],
      approvalRequirements: [],
      refusalConditions: ["stale-data > 24h"],
      downgradeConditions: ["low-confidence"],
      simulationRequirements: [],
    },
    executionModel: {
      canonicalPath: ["validate-input", "compute-projection", "emit-receipt"],
      connectors: ["bank-connector"],
      idempotencyStrategy: "natural-key",
      postconditionVerification: ["projection-exists"],
      receiptEmission: ["ProjectionReceipt"],
      eventEmission: ["projection.generated"],
    },
    memoryGraphEffects: {
      memoryWrites: ["projection-timestamp"],
      memoryReads: ["account-balances"],
      graphMutations: [],
      visibilityBoundaries: ["user-scope"],
      correctionPaths: ["re-run"],
      forgetPaths: [],
    },
    observabilityModel: {
      logs: ["projection.compute"],
      metrics: ["projection.duration_ms"],
      traces: ["projection-trace"],
      replayPath: "Re-run via projection-run-id",
      incidentSummaryBehavior: "Show projection age and connector status",
      operatorRunbookLinks: ["runbooks/projection-stale"],
    },
    testingModel: {
      unitTests: ["projection-engine.test.ts"],
      contractTests: ["ProjectionRequest-schema.test.ts"],
      integrationTests: ["projection-integration.test.ts"],
      replayTests: [],
      degradedModeTests: ["projection-stale.test.ts"],
      securityTests: [],
      goldenTraceTests: [],
    },
    rolloutRecoveryModel: {
      featureFlags: ["finance.cash-projection.enabled"],
      rolloutRings: ["internal", "beta", "ga"],
      shadowSimProgression: [],
      rollbackSteps: ["disable-flag"],
      killSwitch: "finance.cash-projection.kill",
      launchCriteria: ["accuracy-within-5-percent"],
    },
    generatedTruthUpdates: {
      capabilityIndex: true,
      routeManifest: true,
      serviceManifest: true,
      eventSubjectManifest: true,
      connectorCatalog: true,
      boardroomTemplateIndex: false,
      featureIntegrationIndex: true,
      formulaRegistry: false,
      promptRegistry: false,
    },
  };
}

function makeValidCapability(overrides?: Partial<CapabilityRegistration>): CapabilityRegistration {
  return {
    capabilityId: "finance.projections.compute",
    ownerService: "finance-os",
    featureId: "finance.cash-projection",
    riskTier: "R0",
    autonomyTier: "observe",
    capabilityClass: "projection-build",
    requiredScopes: ["finance.read"],
    requiredPolicyFamilies: ["finance-read-policy"],
    requiredApprovalType: "none",
    receiptRequirement: "on-side-effect",
    eventSubjectsEmitted: ["projection.computed.v1"],
    replayabilityClass: "full",
    sandboxSupport: ["fake", "sandbox", "live"],
    entitlementDependency: null,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════
// OWNERSHIP TESTS
// ═══════════════════════════════════════════════════════════════

describe("Owner Boundary Protocol", () => {
  describe("boundary types", () => {
    it("defines exactly 8 canonical boundary types", () => {
      expect(Object.keys(OWNER_BOUNDARY_TYPES)).toHaveLength(8);
    });
  });

  describe("owner preferences", () => {
    it("has 5 preference levels in correct order", () => {
      expect(OWNER_PREFERENCES).toHaveLength(5);
      expect(ownerPreferenceRank("extend-existing")).toBeLessThan(ownerPreferenceRank("new-owner"));
      expect(ownerPreferenceRank("shared-package")).toBeLessThan(ownerPreferenceRank("projection"));
    });

    it("isSmallestCorrectOwner returns true for extend-existing", () => {
      expect(isSmallestCorrectOwner("extend-existing")).toBe(true);
      expect(isSmallestCorrectOwner("new-owner")).toBe(false);
    });
  });

  describe("rejection rules", () => {
    it("defines 7 canonical rejection rules", () => {
      expect(getAllRejectionRules()).toHaveLength(7);
    });

    it("rejects fat-surface — trust logic in surface", () => {
      const decl: OwnerBoundaryDeclaration = {
        ...validDeclaration,
        boundaryType: "surface",
        touchesTrustBearing: true,
      };
      const { rejections } = validateOwnerBoundary(decl, defaultContext);
      expect(rejections).toContain("fat-surface");
    });

    it("rejects second-brain — new execution organ not extending brain-core", () => {
      const decl: OwnerBoundaryDeclaration = {
        ...validDeclaration,
        primaryOwner: "new-orchestrator",
        boundaryType: "execution-organ",
        extendsExisting: false,
      };
      const { rejections } = validateOwnerBoundary(decl, defaultContext);
      expect(rejections).toContain("second-brain");
    });

    it("rejects fourth-domain — domain module outside canonical 3", () => {
      const decl: OwnerBoundaryDeclaration = {
        ...validDeclaration,
        primaryOwner: "health-os",
        boundaryType: "domain-module",
      };
      const { rejections } = validateOwnerBoundary(decl, defaultContext);
      expect(rejections).toContain("fourth-domain");
    });

    it("rejects provider-in-domain — connector logic in domain module", () => {
      const decl: OwnerBoundaryDeclaration = {
        ...validDeclaration,
        primaryOwner: "finance-connector",
        boundaryType: "domain-module",
      };
      const { rejections } = validateOwnerBoundary(decl, defaultContext);
      expect(rejections).toContain("provider-in-domain");
    });

    it("accepts valid declaration with no rejections", () => {
      const { errors, rejections } = validateOwnerBoundary(validDeclaration, defaultContext);
      expect(rejections).toHaveLength(0);
      expect(errors).toHaveLength(0);
    });
  });

  describe("boundary classification", () => {
    it("classifies page files as surface", () => {
      expect(classifyOwnerBoundary("src/pages/MoneyCenter.tsx")).toBe("surface");
    });

    it("classifies packages as shared-package", () => {
      expect(classifyOwnerBoundary("src/packages/contracts/index.ts")).toBe("shared-package");
    });

    it("classifies generated files as generated-truth", () => {
      expect(classifyOwnerBoundary("generated/route-manifest.json")).toBe("generated-truth");
    });

    it("classifies edge functions as worker-workflow", () => {
      expect(classifyOwnerBoundary("supabase/functions/brain-core/index.ts")).toBe("worker-workflow");
    });

    it("classifies policy engine as governance-organ", () => {
      expect(classifyOwnerBoundary("src/lib/core-services/policy-engine.ts")).toBe("governance-organ");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// INTAKE TESTS
// ═══════════════════════════════════════════════════════════════

describe("Feature Design Intake Protocol", () => {
  describe("criticality classes", () => {
    it("defines 5 canonical criticality classes", () => {
      expect(CRITICALITY_CLASSES).toHaveLength(5);
      expect(CRITICALITY_CLASSES).toContain("wedge-critical");
      expect(CRITICALITY_CLASSES).toContain("option-value");
    });
  });

  describe("intake validation", () => {
    it("accepts a fully valid intake", () => {
      const errors = validateIntake(makeFullIntake());
      expect(errors).toHaveLength(0);
    });

    it("catches missing featureId", () => {
      const errors = validateIntake(makeFullIntake({ featureId: "" } as never));
      expect(errors).toContain("Missing featureId");
    });

    it("catches missing outcome section", () => {
      const intake = { ...makeFullIntake() };
      const partial = { ...intake, outcome: undefined } as unknown;
      const errors = validateIntake(partial);
      expect(errors.some(e => e.includes("outcome"))).toBe(true);
    });

    it("catches missing governance section", () => {
      const partial = { ...makeFullIntake(), governance: undefined } as unknown;
      const errors = validateIntake(partial);
      expect(errors.some(e => e.includes("governance"))).toBe(true);
    });

    it("enforces simulation for high-risk features (R3+)", () => {
      const intake = makeFullIntake({
        riskTier: "R4",
        governance: {
          policyApplied: "high-value-policy",
          approvalBehavior: "dual-approval",
          simulationRequired: false,
          refusalSemanticsRequired: false,
          autonomyTierAtLaunch: "observe",
        },
        supportability: {
          diagnosisPath: "logs",
          correlationIds: ["id"],
          replayable: false,
          rollbackPath: "rollback",
          partialFailureUX: "error",
        },
      });
      const errors = validateIntake(intake);
      expect(errors.some(e => e.includes("simulation"))).toBe(true);
      expect(errors.some(e => e.includes("replayable"))).toBe(true);
    });

    it("rejects local-only progression for R3+ features", () => {
      const intake = makeFullIntake({
        riskTier: "R3",
        governance: {
          policyApplied: "policy",
          approvalBehavior: "approval",
          simulationRequired: true,
          simulationDescription: "sim",
          refusalSemanticsRequired: false,
          autonomyTierAtLaunch: "observe",
        },
        rollout: {
          environmentProgression: "local-only",
          requiresFeatureFlags: false,
          requiresShadowMode: false,
          killSwitchId: "kill",
          productionMonitorOwner: "owner",
        },
        supportability: {
          diagnosisPath: "logs",
          correlationIds: ["id"],
          replayable: true,
          replayMechanism: "event-replay",
          rollbackPath: "rollback",
          partialFailureUX: "error",
        },
      });
      const errors = validateIntake(intake);
      expect(errors.some(e => e.includes("local-only"))).toBe(true);
    });
  });

  describe("intake completeness", () => {
    it("returns 100% for fully complete intake", () => {
      const result = intakeCompleteness(makeFullIntake());
      expect(result.percentage).toBeGreaterThanOrEqual(100);
      expect(result.missingSections).toHaveLength(0);
    });

    it("returns lower score for partial intake", () => {
      const result = intakeCompleteness({ featureId: "x" });
      expect(result.percentage).toBeLessThan(50);
      expect(result.missingSections.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SPEC TEMPLATE TESTS
// ═══════════════════════════════════════════════════════════════

describe("Canonical Feature Spec Template", () => {
  describe("spec sections", () => {
    it("defines exactly 14 sections", () => {
      expect(SPEC_SECTIONS).toHaveLength(14);
    });
  });

  describe("createEmptySpec", () => {
    it("creates a spec with all 14 sections", () => {
      const spec = createEmptySpec("f-1", "Test", "owner");
      const { percentage, presentSections } = specCompleteness(spec);
      expect(percentage).toBe(100);
      expect(presentSections).toHaveLength(14);
    });

    it("populates header fields from arguments", () => {
      const spec = createEmptySpec("f-1", "Test Feature", "finance-os");
      expect(spec.header.featureId).toBe("f-1");
      expect(spec.header.title).toBe("Test Feature");
      expect(spec.header.owner).toBe("finance-os");
      expect(spec.ownerMap.primary).toBe("finance-os");
    });
  });

  describe("validateSpec", () => {
    it("catches missing sections", () => {
      const errors = validateSpec({});
      expect(errors.length).toBeGreaterThanOrEqual(14);
    });

    it("validates a complete empty spec has field-level errors", () => {
      const spec = createEmptySpec("f-1", "Test", "owner");
      const errors = validateSpec(spec);
      expect(errors.some(e => e.includes("WorkflowModel"))).toBe(true);
      expect(errors.some(e => e.includes("ExecutionModel"))).toBe(true);
      expect(errors.some(e => e.includes("ObservabilityModel"))).toBe(true);
      expect(errors.some(e => e.includes("TestingModel"))).toBe(true);
      expect(errors.some(e => e.includes("RolloutRecoveryModel"))).toBe(true);
    });

    it("accepts a fully populated spec", () => {
      const errors = validateSpec(makeFullSpec());
      expect(errors).toHaveLength(0);
    });
  });

  describe("specCompleteness", () => {
    it("returns 0% for empty object", () => {
      const result = specCompleteness({});
      expect(result.percentage).toBe(0);
      expect(result.missingSections).toHaveLength(14);
    });

    it("calculates partial completeness", () => {
      const spec = createEmptySpec("f-1", "Test", "owner");
      const partial = { header: spec.header, outcome: spec.outcome };
      const result = specCompleteness(partial);
      expect(result.percentage).toBe(14); // 2/14 ≈ 14%
      expect(result.presentSections).toHaveLength(2);
    });
  });

  describe("sample specs pass full 14-section validation", () => {
    for (const spec of SAMPLE_SPECS) {
      it(`${spec.header.featureId} passes validation`, () => {
        const errors = validateSpec(spec);
        expect(errors).toHaveLength(0);
      });

      it(`${spec.header.featureId} has 100% completeness`, () => {
        const result = specCompleteness(spec);
        expect(result.percentage).toBe(100);
        expect(result.presentSections).toHaveLength(14);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// CAPABILITY PROTOCOL TESTS (Section 7)
// ═══════════════════════════════════════════════════════════════

describe("Capability Protocol", () => {
  describe("capability class taxonomy", () => {
    it("defines exactly 15 canonical capability classes", () => {
      expect(CAPABILITY_CLASSES).toHaveLength(15);
    });

    it("includes all required classes", () => {
      const required = [
        "observe", "classify", "summarize", "recommend", "draft",
        "simulate", "approve", "execute", "verify", "notify",
        "boardroom-compose", "projection-build", "support-diagnose",
        "billing-gate", "pack-install",
      ];
      for (const cls of required) {
        expect(CAPABILITY_CLASSES).toContain(cls);
      }
    });
  });

  describe("replayability and sandbox", () => {
    it("defines 3 replayability classes", () => {
      expect(REPLAYABILITY_CLASSES).toHaveLength(3);
    });

    it("defines 4 sandbox support levels", () => {
      expect(SANDBOX_SUPPORT_LEVELS).toHaveLength(4);
    });
  });

  describe("capability registration validation", () => {
    it("accepts a valid registration with all 14 fields", () => {
      const errors = validateCapabilityRegistration(makeValidCapability());
      expect(errors).toHaveLength(0);
    });

    it("catches all missing fields", () => {
      const errors = validateCapabilityRegistration({});
      expect(errors.length).toBeGreaterThanOrEqual(12);
    });

    it("rejects execute capability with receipt never", () => {
      const errors = validateCapabilityRegistration(makeValidCapability({
        capabilityClass: "execute",
        receiptRequirement: "never",
      }));
      expect(errors.some(e => e.includes("execute") && e.includes("never"))).toBe(true);
    });

    it("rejects approve capability with receipt never", () => {
      const errors = validateCapabilityRegistration(makeValidCapability({
        capabilityClass: "approve",
        receiptRequirement: "never",
      }));
      expect(errors.some(e => e.includes("approve") && e.includes("never"))).toBe(true);
    });

    it("rejects invalid capability class", () => {
      const errors = validateCapabilityRegistration(makeValidCapability({
        capabilityClass: "invalid-class" as unknown,
      }));
      expect(errors.some(e => e.includes("Invalid capabilityClass"))).toBe(true);
    });
  });

  describe("capability registry", () => {
    it("registers and retrieves capabilities", () => {
      const registry = new CapabilityRegistry();
      const errors = registry.register(makeValidCapability());
      expect(errors).toHaveLength(0);
      expect(registry.count()).toBe(1);
      expect(registry.get("finance.projections.compute")).toBeDefined();
    });

    it("looks up by feature", () => {
      const registry = new CapabilityRegistry();
      registry.register(makeValidCapability());
      registry.register(makeValidCapability({
        capabilityId: "finance.projections.cache",
        capabilityClass: "observe",
      }));
      const results = registry.getByFeature("finance.cash-projection");
      expect(results).toHaveLength(2);
    });

    it("looks up by class", () => {
      const registry = new CapabilityRegistry();
      registry.register(makeValidCapability());
      registry.register(makeValidCapability({
        capabilityId: "business.leads.observe",
        featureId: "business.lead-scoring",
        ownerService: "business-os",
        capabilityClass: "observe",
      }));
      expect(registry.getByClass("projection-build")).toHaveLength(1);
      expect(registry.getByClass("observe")).toHaveLength(1);
    });

    it("looks up by owner", () => {
      const registry = new CapabilityRegistry();
      registry.register(makeValidCapability());
      expect(registry.getByOwner("finance-os")).toHaveLength(1);
      expect(registry.getByOwner("business-os")).toHaveLength(0);
    });

    it("rejects invalid registration", () => {
      const registry = new CapabilityRegistry();
      const errors = registry.register({} as never);
      expect(errors.length).toBeGreaterThan(0);
      expect(registry.count()).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// CONTRACT / SCHEMA PROTOCOL TESTS (Section 8)
// ═══════════════════════════════════════════════════════════════

describe("Contract and Schema Protocol", () => {
  describe("schema family taxonomy", () => {
    it("defines exactly 10 schema families", () => {
      expect(SCHEMA_FAMILIES).toHaveLength(10);
    });

    it("includes all required families", () => {
      const required = [
        "input", "output", "command", "event", "receipt",
        "diagnostic", "boardroom-packet", "preference-config",
        "memory-write", "feature-flag",
      ];
      for (const f of required) {
        expect(SCHEMA_FAMILIES).toContain(f);
      }
    });
  });

  describe("contract evolution rules", () => {
    it("defines 6 evolution rules", () => {
      expect(CONTRACT_EVOLUTION_RULES).toHaveLength(6);
    });
  });

  describe("schema families by risk tier", () => {
    it("R0 requires only input and output", () => {
      expect(SCHEMA_FAMILIES_BY_RISK_TIER.R0).toEqual(["input", "output"]);
    });

    it("higher risk tiers require more families", () => {
      expect(SCHEMA_FAMILIES_BY_RISK_TIER.R1.length).toBeGreaterThan(SCHEMA_FAMILIES_BY_RISK_TIER.R0.length);
      expect(SCHEMA_FAMILIES_BY_RISK_TIER.R3.length).toBeGreaterThan(SCHEMA_FAMILIES_BY_RISK_TIER.R2.length);
      expect(SCHEMA_FAMILIES_BY_RISK_TIER.R5.length).toBeGreaterThan(SCHEMA_FAMILIES_BY_RISK_TIER.R4.length);
    });

    it("R5 requires all 10 families", () => {
      expect(SCHEMA_FAMILIES_BY_RISK_TIER.R5).toHaveLength(10);
    });
  });

  describe("schema registry validation", () => {
    it("accepts a valid R0 registry", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test.feature",
        schemas: [
          { family: "input", schemaId: "TestInput", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "output", schemaId: "TestOutput", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
        ],
      };
      const errors = validateSchemaRegistry(registry, "R0");
      expect(errors).toHaveLength(0);
    });

    it("catches missing required families for R3", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test.feature",
        schemas: [
          { family: "input", schemaId: "TestInput", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
        ],
      };
      const errors = validateSchemaRegistry(registry, "R3");
      expect(errors.some(e => e.includes("output"))).toBe(true);
      expect(errors.some(e => e.includes("receipt"))).toBe(true);
      expect(errors.some(e => e.includes("event"))).toBe(true);
    });

    it("requires migration window for breaking changes", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test.feature",
        schemas: [
          { family: "input", schemaId: "TestInput", versions: [{ version: "2.0", compatibility: "breaking", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "output", schemaId: "TestOutput", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
        ],
      };
      const errors = validateSchemaRegistry(registry, "R0");
      expect(errors.some(e => e.includes("migrationWindow"))).toBe(true);
      expect(errors.some(e => e.includes("deprecationWarning"))).toBe(true);
    });

    it("requires replay compatibility for high-risk breaking changes", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test.feature",
        schemas: [
          { family: "input", schemaId: "TestInput", versions: [{ version: "2.0", compatibility: "breaking", migrationWindow: "30 days", deprecationWarning: "v1 sunset", replayCompatible: false, projectionRebuildCompatible: true }] },
          { family: "output", schemaId: "TestOutput", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "command", schemaId: "TestCmd", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "event", schemaId: "TestEvent", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "receipt", schemaId: "TestReceipt", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "diagnostic", schemaId: "TestDiag", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
          { family: "feature-flag", schemaId: "TestFlag", versions: [{ version: "1.0", compatibility: "additive", migrationWindow: null, deprecationWarning: null, replayCompatible: true, projectionRebuildCompatible: true }] },
        ],
      };
      const errors = validateSchemaRegistry(registry, "R3");
      expect(errors.some(e => e.includes("replay compatible"))).toBe(true);
    });
  });

  describe("schema completeness", () => {
    it("returns 100% when all required families present", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test",
        schemas: [
          { family: "input", schemaId: "i", versions: [] },
          { family: "output", schemaId: "o", versions: [] },
        ],
      };
      const result = schemaCompleteness(registry, "R0");
      expect(result.percentage).toBe(100);
      expect(result.missingFamilies).toHaveLength(0);
    });

    it("returns partial percentage when families missing", () => {
      const registry: FeatureSchemaRegistry = {
        featureId: "test",
        schemas: [
          { family: "input", schemaId: "i", versions: [] },
        ],
      };
      const result = schemaCompleteness(registry, "R0");
      expect(result.percentage).toBe(50);
      expect(result.missingFamilies).toContain("output");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// Sample Capability Registrations & Schema Registries
// ═══════════════════════════════════════════════════════════════

import {
  SAMPLE_CAPABILITIES,
  SAMPLE_SCHEMA_REGISTRIES,
  CASH_PROJECTION_CAPABILITIES,
  LEAD_SCORING_CAPABILITIES,
  HOUSEHOLD_TASKS_CAPABILITIES,
  CASH_PROJECTION_SCHEMA_REGISTRY,
  LEAD_SCORING_SCHEMA_REGISTRY,
  HOUSEHOLD_TASKS_SCHEMA_REGISTRY,
} from "@/packages/feature-governance/sample-specs";

describe("Sample Capability Registrations", () => {
  it("has 16 total capabilities across 3 features", () => {
    expect(SAMPLE_CAPABILITIES.length).toBe(16);
  });

  it("cash projection has 5 capabilities", () => {
    expect(CASH_PROJECTION_CAPABILITIES.length).toBe(5);
  });

  it("lead scoring has 5 capabilities", () => {
    expect(LEAD_SCORING_CAPABILITIES.length).toBe(5);
  });

  it("household tasks has 6 capabilities", () => {
    expect(HOUSEHOLD_TASKS_CAPABILITIES.length).toBe(6);
  });

  it("all capabilities have unique IDs", () => {
    const ids = SAMPLE_CAPABILITIES.map(c => c.capabilityId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all capabilities pass validation", () => {
    for (const cap of SAMPLE_CAPABILITIES) {
      const errors = validateCapabilityRegistration(cap);
      expect(errors, `Capability ${cap.capabilityId} has errors: ${errors.join(", ")}`).toHaveLength(0);
    }
  });

  it("execute capabilities require receipts", () => {
    const executeCaps = SAMPLE_CAPABILITIES.filter(c => c.capabilityClass === "execute");
    for (const cap of executeCaps) {
      expect(cap.receiptRequirement).not.toBe("never");
    }
  });

  it("each feature has at least observe and diagnose capabilities", () => {
    for (const featureId of ["finance.cash-projection", "business.lead-scoring", "concierge.household-tasks"]) {
      const caps = SAMPLE_CAPABILITIES.filter(c => c.featureId === featureId);
      expect(caps.some(c => c.capabilityClass === "observe")).toBe(true);
      expect(caps.some(c => c.capabilityClass === "support-diagnose")).toBe(true);
    }
  });
});

describe("Sample Schema Registries", () => {
  it("has 3 schema registries", () => {
    expect(SAMPLE_SCHEMA_REGISTRIES.length).toBe(3);
  });

  it("cash projection schema registry passes R0 validation", () => {
    const errors = validateSchemaRegistry(CASH_PROJECTION_SCHEMA_REGISTRY, "R0");
    expect(errors).toHaveLength(0);
  });

  it("lead scoring schema registry passes R1 validation", () => {
    const errors = validateSchemaRegistry(LEAD_SCORING_SCHEMA_REGISTRY, "R1");
    expect(errors).toHaveLength(0);
  });

  it("household tasks schema registry passes R1 validation", () => {
    const errors = validateSchemaRegistry(HOUSEHOLD_TASKS_SCHEMA_REGISTRY, "R1");
    expect(errors).toHaveLength(0);
  });

  it("cash projection has versioned time series schema with migration window", () => {
    const ts = CASH_PROJECTION_SCHEMA_REGISTRY.schemas.find(s => s.schemaId === "CashProjectionTimeSeries");
    expect(ts).toBeDefined();
    expect(ts!.versions.length).toBeGreaterThanOrEqual(2);
    const v2 = ts!.versions.find(v => v.version === "2.0.0");
    expect(v2).toBeDefined();
    expect(v2!.compatibility).toBe("breaking");
    expect(v2!.migrationWindow).toBe("30 days");
    expect(v2!.deprecationWarning).toBeTruthy();
  });

  it("all schema registries have required families for their risk tier", () => {
    const pairs: [typeof CASH_PROJECTION_SCHEMA_REGISTRY, FeatureRiskTier][] = [
      [CASH_PROJECTION_SCHEMA_REGISTRY, "R0"],
      [LEAD_SCORING_SCHEMA_REGISTRY, "R1"],
      [HOUSEHOLD_TASKS_SCHEMA_REGISTRY, "R1"],
    ];
    for (const [reg, tier] of pairs) {
      const result = schemaCompleteness(reg, tier);
      expect(result.percentage, `${reg.featureId} missing families: ${result.missingFamilies.join(", ")}`).toBe(100);
    }
  });

  it("every schema entry has at least one version", () => {
    for (const reg of SAMPLE_SCHEMA_REGISTRIES) {
      for (const schema of reg.schemas) {
        expect(schema.versions.length, `${reg.featureId}/${schema.schemaId} has no versions`).toBeGreaterThan(0);
      }
    }
  });
});
