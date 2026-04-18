import { describe, it, expect } from "vitest";
import {
  registerCompensation,
  dispatchCompensation,
  hasCompensation,
  listRegisteredTargets,
} from "../compensation-handler-registry";

describe("compensation-handler-registry", () => {
  it("dispatches a registered handler", async () => {
    registerCompensation("test.target", async (effect) => ({
      success: true,
      receiptId: `test-${effect.effectId}`,
      rolledBackAt: new Date().toISOString(),
    }));
    const outcome = await dispatchCompensation({
      target: "test.target",
      effectId: "abc",
    });
    expect(outcome.success).toBe(true);
    expect(outcome.receiptId).toBe("test-abc");
  });

  it("returns unrollable for unknown target", async () => {
    const outcome = await dispatchCompensation({
      target: "unknown.target.xyz",
      effectId: "x",
    });
    expect(outcome.success).toBe(false);
    expect(outcome.error).toContain("unrollable");
  });

  it("registers default handlers for canonical targets", () => {
    const targets = listRegisteredTargets();
    expect(targets).toContain("money.transaction");
    expect(targets).toContain("files.upload");
    expect(targets).toContain("integrations.write");
    expect(hasCompensation("boardroom.action")).toBe(true);
  });

  it("captures handler errors as failed outcomes", async () => {
    registerCompensation("test.throws", async () => {
      throw new Error("boom");
    });
    const outcome = await dispatchCompensation({
      target: "test.throws",
      effectId: "y",
    });
    expect(outcome.success).toBe(false);
    expect(outcome.error).toBe("boom");
  });
});
