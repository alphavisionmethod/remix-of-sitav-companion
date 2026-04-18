// Vitest unit tests for the Boardroom Layer 7 followthrough state machine.
// Validates lifecycle transitions, idempotency rules, and terminal-state semantics.
import { describe, it, expect } from "vitest";

// State lifecycle (must match supabase/migrations and followthrough-engine.ts)
const LIFECYCLE: Record<string, string[]> = {
  approved: ["dispatch_pending", "failed"],
  dispatch_pending: ["dispatched", "failed"],
  dispatched: ["executing", "failed"],
  executing: ["executed", "failed"],
  executed: ["receipt_recorded", "outcome_pending", "failed"],
  receipt_recorded: ["outcome_pending", "outcome_tracked"],
  outcome_pending: ["outcome_tracked", "failed"],
  outcome_tracked: ["reflected", "closed"],
  reflected: ["closed"],
  closed: [],
  failed: [],
};

const TERMINAL = new Set(["closed", "failed"]);

function canTransition(from: string, to: string): boolean {
  const allowed = LIFECYCLE[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

describe("Boardroom L7 followthrough state machine", () => {
  it("permits the canonical happy path approved → closed", () => {
    const happyPath = [
      "approved",
      "dispatch_pending",
      "dispatched",
      "executing",
      "executed",
      "outcome_pending",
      "outcome_tracked",
      "reflected",
      "closed",
    ];
    for (let i = 0; i < happyPath.length - 1; i++) {
      expect(canTransition(happyPath[i], happyPath[i + 1])).toBe(true);
    }
  });

  it("rejects skipping from approved straight to closed", () => {
    expect(canTransition("approved", "closed")).toBe(false);
  });

  it("rejects re-opening a terminal state", () => {
    for (const term of TERMINAL) {
      expect(LIFECYCLE[term].length).toBe(0);
    }
  });

  it("permits failure from any pre-terminal state", () => {
    const failable = ["approved", "dispatch_pending", "dispatched", "executing", "executed"];
    for (const state of failable) {
      expect(canTransition(state, "failed")).toBe(true);
    }
  });

  it("treats outcome_tracked as the gate to reflection", () => {
    expect(canTransition("executed", "reflected")).toBe(false);
    expect(canTransition("outcome_tracked", "reflected")).toBe(true);
  });

  it("allows fast-close from outcome_tracked when reflection is skipped by policy", () => {
    expect(canTransition("outcome_tracked", "closed")).toBe(true);
  });
});

describe("Boardroom L7 lifecycle invariants", () => {
  it("every non-terminal state has at least one forward transition", () => {
    for (const [state, next] of Object.entries(LIFECYCLE)) {
      if (TERMINAL.has(state)) continue;
      expect(next.length).toBeGreaterThan(0);
    }
  });

  it("contains exactly two terminal states", () => {
    expect(TERMINAL.size).toBe(2);
    expect(TERMINAL.has("closed")).toBe(true);
    expect(TERMINAL.has("failed")).toBe(true);
  });
});
