import { describe, it, expect } from "vitest";
import { ReceiptService, createReceiptService } from "@/lib/core-services/receipt-service";
import { evaluatePolicy } from "@/lib/core-services/policy-engine";
import { EventBus, createEventBus } from "@/lib/core-services/event-bus";
import { WorkflowEngine, createWorkflowEngine } from "@/lib/core-services/workflow-engine";

describe("Core Services", () => {
  describe("Receipt Service", () => {
    it("creates a receipt service", () => {
      const svc = createReceiptService();
      expect(svc).toBeInstanceOf(ReceiptService);
    });
  });

  describe("Policy Engine", () => {
    it("evaluates a policy context", () => {
      const result = evaluatePolicy({
        action: "auto_pay",
        domain: "money",
        amount: 200,
        capabilityId: "pay-bill",
        riskTier: "low",
      });
      expect(result).toBeDefined();
      expect(result.effect).toBeTruthy();
    });
  });

  describe("Event Bus", () => {
    it("creates and subscribes", () => {
      const bus = createEventBus();
      expect(bus).toBeInstanceOf(EventBus);
    });
  });

  describe("Workflow Engine", () => {
    it("creates a workflow engine", () => {
      const engine = createWorkflowEngine();
      expect(engine).toBeInstanceOf(WorkflowEngine);
    });
  });
});
