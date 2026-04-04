import { describe, it, expect } from "vitest";
import { SchemaRegistry } from "@/packages/contracts/schema-registry";
import "@/packages/contracts/zod-schemas"; // triggers registration

describe("Contract Schema Registry", () => {
  it("has all core truth schemas registered", () => {
    const requiredSchemas = [
      "TenantContext",
      "EventEnvelope",
      "PolicyDecision",
      "PolicySnapshot",
      "WorkflowState",
      "TrustState",
      "TrustTransition",
      "ExecutionEnvelope",
      "ExecutionPlan",
      "ExecutionReceipt",
      "Receipt",
      "ProofBundle",
      "VerificationRecord",
      "ApprovalRequest",
      "DiagnosticBundle",
    ];

    for (const name of requiredSchemas) {
      expect(SchemaRegistry.has(name), `Schema "${name}" should be registered`).toBe(true);
    }
  });

  it("validates TenantContext correctly", () => {
    const valid = {
      tenantId: "t1",
      userId: "u1",
      role: "owner",
      permissions: ["read", "write"],
    };
    expect(SchemaRegistry.validate("TenantContext", valid).success).toBe(true);

    const invalid = { tenantId: "t1" }; // missing required fields
    expect(SchemaRegistry.validate("TenantContext", invalid).success).toBe(false);
  });

  it("validates ExecutionEnvelope correctly", () => {
    const valid = {
      id: "e1",
      idempotencyKey: "ik1",
      capabilityId: "c1",
      mode: "live",
      input: {},
      policyDecision: {
        allowed: true,
        reason: "ok",
        requiredApprovals: 0,
        approvalType: "none",
        constraints: [],
        trustScore: 85,
      },
      status: "pending",
      startedAt: "2026-01-01T00:00:00Z",
    };
    expect(SchemaRegistry.validate("ExecutionEnvelope", valid).success).toBe(true);
  });

  it("rejects invalid trust score range", () => {
    const invalid = {
      entityId: "e1",
      entityType: "user",
      score: 150, // out of range
      flags: [],
      lastVerified: "2026-01-01",
      history: [],
    };
    expect(SchemaRegistry.validate("TrustState", invalid).success).toBe(false);
  });

  it("lists schemas by layer", () => {
    const truthSchemas = SchemaRegistry.listByLayer("truth");
    expect(truthSchemas.length).toBeGreaterThanOrEqual(10);
  });

  it("lists schemas by family", () => {
    const coreSchemas = SchemaRegistry.listByFamily("core");
    expect(coreSchemas.length).toBeGreaterThanOrEqual(5);
  });

  it("returns error for unregistered schema", () => {
    const result = SchemaRegistry.validate("NonExistentSchema", {});
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Schema "NonExistentSchema" not registered');
  });
});

describe("Contract Family Structure", () => {
  it("exports all families from root barrel", async () => {
    const contracts = await import("@/packages/contracts");

    // Scaffold primitives
    expect(contracts).toHaveProperty("SchemaRegistry");

    // Verify key types exist as type exports (we check via runtime presence of interfaces)
    // Since interfaces are erased at runtime, we verify the module loads without error
    expect(contracts).toBeDefined();
  });

  it("loads core family", async () => {
    const core = await import("@/packages/contracts/core");
    expect(core).toBeDefined();
  });

  it("loads capability family", async () => {
    const cap = await import("@/packages/contracts/capability");
    expect(cap).toBeDefined();
  });

  it("loads proof family", async () => {
    const proof = await import("@/packages/contracts/proof");
    expect(proof).toBeDefined();
  });

  it("loads advisor family", async () => {
    const advisor = await import("@/packages/contracts/advisor");
    expect(advisor).toBeDefined();
  });

  it("loads runtime family", async () => {
    const runtime = await import("@/packages/contracts/runtime");
    expect(runtime).toBeDefined();
  });

  it("loads memory family", async () => {
    const memory = await import("@/packages/contracts/memory");
    expect(memory).toBeDefined();
  });

  it("loads graph family", async () => {
    const graph = await import("@/packages/contracts/graph");
    expect(graph).toBeDefined();
  });

  it("loads read-models family", async () => {
    const readModels = await import("@/packages/contracts/read-models");
    expect(readModels).toBeDefined();
  });

  it("loads specialized family", async () => {
    const specialized = await import("@/packages/contracts/specialized");
    expect(specialized).toBeDefined();
  });

  it("loads admin family", async () => {
    const admin = await import("@/packages/contracts/admin");
    expect(admin).toBeDefined();
  });
});
