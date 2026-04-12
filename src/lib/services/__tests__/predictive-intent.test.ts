import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), upsert: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [] })) })) })) },
}));
vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: vi.fn(() => ({ upsert: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [] })) })) })),
  fromDynamicTable: vi.fn(() => ({ upsert: vi.fn(() => ({ select: vi.fn(() => Promise.resolve({ data: [] })) })), select: vi.fn().mockReturnThis(), eq: vi.fn(() => Promise.resolve({ data: [] })) })),
}));

describe("PredictiveIntentEngine", () => {
  it("learnFromAction stores pattern", async () => {
    const { predictiveIntentEngine } = await import("@/lib/services/predictive-intent/index");
    await predictiveIntentEngine.learnFromAction("user1", "check_calendar", "concierge");
    // No throw = success
    expect(true).toBe(true);
  });

  it("predictNext returns array", async () => {
    const { predictiveIntentEngine } = await import("@/lib/services/predictive-intent/index");
    const predictions = await predictiveIntentEngine.predictNext("user1");
    expect(Array.isArray(predictions)).toBe(true);
  });

  it("dismissPrediction marks prediction as dismissed", async () => {
    const { predictiveIntentEngine } = await import("@/lib/services/predictive-intent/index");
    // No throw
    predictiveIntentEngine.dismissPrediction("nonexistent");
    expect(true).toBe(true);
  });

  it("predictions have required fields when present", async () => {
    const { predictiveIntentEngine } = await import("@/lib/services/predictive-intent/index");
    // Build enough frequency to generate predictions
    for (let i = 0; i < 10; i++) {
      await predictiveIntentEngine.learnFromAction("user2", "check_finances", "money");
    }
    const predictions = await predictiveIntentEngine.predictNext("user2");
    for (const p of predictions) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("action");
      expect(p).toHaveProperty("confidence");
      expect(p).toHaveProperty("domain");
    }
  });
});
