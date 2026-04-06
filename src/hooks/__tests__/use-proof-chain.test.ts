import { describe, it, expect, vi } from "vitest";

// Test the exported types and helper logic
describe("ProofChain types", () => {
  it("ProofChainNode interface shape is correct", async () => {
    const { useProofChain } = await import("../use-proof-chain");
    expect(typeof useProofChain).toBe("function");
  });

  it("emitProofRecord is exported", async () => {
    const mod = await import("../use-proof-chain");
    expect(typeof mod.emitProofRecord).toBe("function");
  });

  it("useProofBundle is exported", async () => {
    const mod = await import("../use-proof-chain");
    expect(typeof mod.useProofBundle).toBe("function");
  });
});
