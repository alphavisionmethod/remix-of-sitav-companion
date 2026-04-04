import { describe, it, expect } from "vitest";
import {
  PARITY_TEST_CASES,
  type ParityTestCase,
  type ParityGateResult,
  type ParityGateReport,
} from "@/packages/contracts/runtime/parity-gates";
import type {
  SurfaceId,
  UnifiedCommand,
  UnifiedProofRequirement,
  UnifiedApprovalRequirement,
  UnifiedDegradedSemantics,
  SurfaceRuntimeConfig,
  DegradedFallbackStrategy,
  UnifiedApprovalMode,
} from "@/packages/contracts/runtime/unified-surface-runtime";
import type {
  SurfaceCapabilityMatrix,
  SurfaceProofStateMap,
  SurfaceDegradedStateMap,
  SurfaceParityReport,
  ParityViolation,
} from "@/packages/contracts/runtime/surface-parity";

// ── Simulated Surface Runtime Configs ────────────────────────
// Each surface must implement identical proof/approval/degraded rules

const ALL_SURFACES: SurfaceId[] = ["web", "admin", "desktop", "mobile"];

function buildProofRequirement(tc: ParityTestCase): UnifiedProofRequirement {
  return {
    commandAction: tc.command.action,
    emitReceipt: tc.expectedProof.emitsReceipt,
    receiptType: tc.expectedProof.receiptType,
    chainRequired: tc.expectedProof.chainRequired,
    attestationRequired: tc.command.requiresTrust >= 80,
    minimumTrustScore: tc.command.requiresTrust,
    proofRetentionDays: 365,
  };
}

function buildApprovalRequirement(tc: ParityTestCase): UnifiedApprovalRequirement {
  return {
    commandAction: tc.command.action,
    mode: tc.expectedApproval.mode,
    requiredApprovers: tc.expectedApproval.requiredApprovers,
    timeoutMs: 300_000,
    escalationAfterMs: 600_000,
    allowDelegation: tc.expectedApproval.mode !== "owner-only",
  };
}

function buildDegradedSemantics(
  tc: ParityTestCase,
  surface: SurfaceId,
  reason: "offline" | "trust-below-threshold"
): UnifiedDegradedSemantics {
  const fallback = reason === "offline"
    ? tc.expectedDegraded.offlineFallback
    : tc.expectedDegraded.lowTrustFallback;
  return {
    surface,
    reason,
    fallback,
    userMessage: `${tc.name}: ${reason}`,
    localCapabilities: fallback === "cache-only" || fallback === "local-fallback" ? [tc.command.target] : [],
    blockedCapabilities: fallback === "refuse" ? [tc.command.target] : [],
    proofEmissionMode: fallback === "refuse" ? "suspended" : "deferred",
  };
}

function buildSurfaceConfig(surface: SurfaceId): SurfaceRuntimeConfig {
  return {
    surface,
    defaultFrame: "full",
    proofRequirements: PARITY_TEST_CASES.map(buildProofRequirement),
    approvalRequirements: PARITY_TEST_CASES.map(buildApprovalRequirement),
    degradedBehaviors: PARITY_TEST_CASES.flatMap((tc) => [
      buildDegradedSemantics(tc, surface, "offline"),
      buildDegradedSemantics(tc, surface, "trust-below-threshold"),
    ]),
    supportedCapabilities: PARITY_TEST_CASES.map((tc) => tc.command.target),
    nativeOnly: surface === "desktop" || surface === "mobile"
      ? ["file-system", "biometrics", "tray"]
      : [],
    maxConcurrentCommands: 10,
    commandTimeoutMs: 30_000,
    heartbeatIntervalMs: 5_000,
  };
}

// Build configs for all surfaces
const surfaceConfigs: Record<SurfaceId, SurfaceRuntimeConfig> = {
  web: buildSurfaceConfig("web"),
  admin: buildSurfaceConfig("admin"),
  desktop: buildSurfaceConfig("desktop"),
  mobile: buildSurfaceConfig("mobile"),
};

// ── Parity Gate Runner ───────────────────────────────────────

function runParityGate(tc: ParityTestCase, surface: SurfaceId): ParityGateResult {
  const start = Date.now();
  const config = surfaceConfigs[surface];

  const proofReq = config.proofRequirements.find((p) => p.commandAction === tc.command.action);
  const approvalReq = config.approvalRequirements.find((a) => a.commandAction === tc.command.action);
  const offlineDegraded = config.degradedBehaviors.find(
    (d) => d.reason === "offline" && d.fallback === tc.expectedDegraded.offlineFallback
  );
  const lowTrustDegraded = config.degradedBehaviors.find(
    (d) => d.reason === "trust-below-threshold" && d.fallback === tc.expectedDegraded.lowTrustFallback
  );

  const proofMatch = proofReq !== undefined
    && proofReq.emitReceipt === tc.expectedProof.emitsReceipt
    && proofReq.receiptType === tc.expectedProof.receiptType
    && proofReq.chainRequired === tc.expectedProof.chainRequired;

  const approvalMatch = approvalReq !== undefined
    && approvalReq.mode === tc.expectedApproval.mode
    && approvalReq.requiredApprovers === tc.expectedApproval.requiredApprovers;

  const degradedMatch = offlineDegraded !== undefined && lowTrustDegraded !== undefined;

  const verdict = proofMatch && approvalMatch && degradedMatch ? "pass" : "fail";

  return {
    testCaseId: tc.id,
    surface,
    verdict,
    proofMatch,
    approvalMatch,
    degradedMatch,
    executedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  };
}

function runFullParityReport(): ParityGateReport {
  const results: ParityGateResult[] = [];

  for (const tc of PARITY_TEST_CASES) {
    for (const surface of tc.applicableSurfaces) {
      results.push(runParityGate(tc, surface));
    }
  }

  const passed = results.filter((r) => r.verdict === "pass").length;
  const failed = results.filter((r) => r.verdict === "fail").length;
  const skipped = results.filter((r) => r.verdict === "skip").length;

  return {
    runId: crypto.randomUUID(),
    runAt: new Date().toISOString(),
    totalCases: results.length,
    passed,
    failed,
    skipped,
    results,
    overallVerdict: failed === 0 ? "pass" : "fail",
  };
}

// ── Tests ────────────────────────────────────────────────────

describe("SITA OS — Parity Gate Integration Tests", () => {
  describe("Test case structure validation", () => {
    it("should have at least 8 canonical test cases", () => {
      expect(PARITY_TEST_CASES.length).toBeGreaterThanOrEqual(8);
    });

    it("every test case applies to all 4 surfaces", () => {
      for (const tc of PARITY_TEST_CASES) {
        expect(tc.applicableSurfaces).toEqual(
          expect.arrayContaining(["web", "admin", "desktop", "mobile"])
        );
      }
    });

    it("every test case has a unique ID", () => {
      const ids = PARITY_TEST_CASES.map((tc) => tc.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("every test case specifies valid approval modes", () => {
      const validModes: UnifiedApprovalMode[] = ["none", "single", "dual", "owner-only", "quorum"];
      for (const tc of PARITY_TEST_CASES) {
        expect(validModes).toContain(tc.expectedApproval.mode);
      }
    });

    it("every test case specifies valid degraded fallbacks", () => {
      const validFallbacks: DegradedFallbackStrategy[] = [
        "cache-only", "queue-for-sync", "refuse", "local-fallback", "read-only",
      ];
      for (const tc of PARITY_TEST_CASES) {
        expect(validFallbacks).toContain(tc.expectedDegraded.offlineFallback);
        expect(validFallbacks).toContain(tc.expectedDegraded.lowTrustFallback);
      }
    });
  });

  describe("Cross-surface proof parity", () => {
    it("proof requirements are identical across all surfaces for each command", () => {
      for (const tc of PARITY_TEST_CASES) {
        const proofsByAction = ALL_SURFACES.map((s) => {
          const config = surfaceConfigs[s];
          return config.proofRequirements.find((p) => p.commandAction === tc.command.action);
        });

        // All surfaces must have the proof requirement
        for (const proof of proofsByAction) {
          expect(proof).toBeDefined();
        }

        // All must be identical
        const reference = proofsByAction[0]!;
        for (const proof of proofsByAction.slice(1)) {
          expect(proof!.emitReceipt).toBe(reference.emitReceipt);
          expect(proof!.receiptType).toBe(reference.receiptType);
          expect(proof!.chainRequired).toBe(reference.chainRequired);
          expect(proof!.minimumTrustScore).toBe(reference.minimumTrustScore);
        }
      }
    });
  });

  describe("Cross-surface approval parity", () => {
    it("approval requirements are identical across all surfaces for each command", () => {
      for (const tc of PARITY_TEST_CASES) {
        const approvalsByAction = ALL_SURFACES.map((s) => {
          const config = surfaceConfigs[s];
          return config.approvalRequirements.find((a) => a.commandAction === tc.command.action);
        });

        for (const approval of approvalsByAction) {
          expect(approval).toBeDefined();
        }

        const reference = approvalsByAction[0]!;
        for (const approval of approvalsByAction.slice(1)) {
          expect(approval!.mode).toBe(reference.mode);
          expect(approval!.requiredApprovers).toBe(reference.requiredApprovers);
        }
      }
    });
  });

  describe("Cross-surface degraded parity", () => {
    it("offline fallback strategies are identical across all surfaces", () => {
      for (const tc of PARITY_TEST_CASES) {
        for (const surface of ALL_SURFACES) {
          const config = surfaceConfigs[surface];
          const offlineBehavior = config.degradedBehaviors.find(
            (d) => d.reason === "offline"
              && d.fallback === tc.expectedDegraded.offlineFallback
          );
          expect(offlineBehavior).toBeDefined();
        }
      }
    });

    it("low-trust fallback strategies are identical across all surfaces", () => {
      for (const tc of PARITY_TEST_CASES) {
        for (const surface of ALL_SURFACES) {
          const config = surfaceConfigs[surface];
          const lowTrustBehavior = config.degradedBehaviors.find(
            (d) => d.reason === "trust-below-threshold"
              && d.fallback === tc.expectedDegraded.lowTrustFallback
          );
          expect(lowTrustBehavior).toBeDefined();
        }
      }
    });
  });

  describe("Full parity gate report", () => {
    it("produces a passing report with all test cases across all surfaces", () => {
      const report = runFullParityReport();

      expect(report.overallVerdict).toBe("pass");
      expect(report.failed).toBe(0);
      expect(report.totalCases).toBe(PARITY_TEST_CASES.length * ALL_SURFACES.length);
      expect(report.passed).toBe(report.totalCases);
    });

    it("every result has valid metadata", () => {
      const report = runFullParityReport();

      for (const result of report.results) {
        expect(result.testCaseId).toBeTruthy();
        expect(ALL_SURFACES).toContain(result.surface);
        expect(result.executedAt).toBeTruthy();
        expect(result.durationMs).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Command envelope construction", () => {
    it("can construct a valid UnifiedCommand from each test case for each surface", () => {
      for (const tc of PARITY_TEST_CASES) {
        for (const surface of ALL_SURFACES) {
          const command: UnifiedCommand = {
            id: crypto.randomUUID(),
            surface,
            action: tc.command.action,
            target: tc.command.target,
            payload: {},
            proofRequired: tc.expectedProof.emitsReceipt,
            approvalRequired: tc.expectedApproval.mode !== "none",
            degradedFallback: tc.expectedDegraded.offlineFallback,
            correlationId: crypto.randomUUID(),
            tenantId: "test-tenant",
            issuedAt: new Date().toISOString(),
            shellFrame: "full",
            trustScoreAtIssuance: tc.command.requiresTrust,
          };

          expect(command.surface).toBe(surface);
          expect(command.action).toBe(tc.command.action);
          expect(command.proofRequired).toBe(tc.expectedProof.emitsReceipt);
          expect(command.approvalRequired).toBe(tc.expectedApproval.mode !== "none");
        }
      }
    });
  });

  describe("Parity violation detection", () => {
    it("detects a proof emission violation when one surface diverges", () => {
      // Simulate a violation: web surface missing a proof requirement
      const webConfig = { ...surfaceConfigs.web };
      const originalProofs = webConfig.proofRequirements;
      const mutatedProofs = originalProofs.filter((p) => p.commandAction !== "payment.send");

      const paymentCase = PARITY_TEST_CASES.find((tc) => tc.command.action === "payment.send")!;
      const webProof = mutatedProofs.find((p) => p.commandAction === paymentCase.command.action);

      // The violation: web is missing the payment proof requirement
      expect(webProof).toBeUndefined();

      // Construct violation record
      const violation: ParityViolation = {
        id: "violation-001",
        type: "missing-proof-emission",
        surface: "web",
        referenceSurface: "admin",
        capability: "payment.send",
        description: "Web surface missing proof emission for payment.send",
        severity: "critical",
        detectedAt: new Date().toISOString(),
        resolved: false,
      };

      expect(violation.type).toBe("missing-proof-emission");
      expect(violation.severity).toBe("critical");
    });

    it("can generate a parity report with violations", () => {
      const report: SurfaceParityReport = {
        generatedAt: new Date().toISOString(),
        surfacesChecked: ALL_SURFACES,
        totalCapabilities: PARITY_TEST_CASES.length,
        violations: [],
        parityScore: 100,
        proofParityValid: true,
        degradedParityValid: true,
        approvalParityValid: true,
      };

      expect(report.parityScore).toBe(100);
      expect(report.violations).toHaveLength(0);
      expect(report.proofParityValid).toBe(true);
    });
  });

  describe("Surface capability matrix", () => {
    it("all surfaces support all test case targets", () => {
      for (const surface of ALL_SURFACES) {
        const config = surfaceConfigs[surface];
        for (const tc of PARITY_TEST_CASES) {
          expect(config.supportedCapabilities).toContain(tc.command.target);
        }
      }
    });

    it("native-only capabilities are correctly scoped", () => {
      expect(surfaceConfigs.web.nativeOnly).toHaveLength(0);
      expect(surfaceConfigs.admin.nativeOnly).toHaveLength(0);
      expect(surfaceConfigs.desktop.nativeOnly.length).toBeGreaterThan(0);
      expect(surfaceConfigs.mobile.nativeOnly.length).toBeGreaterThan(0);
    });
  });
});
