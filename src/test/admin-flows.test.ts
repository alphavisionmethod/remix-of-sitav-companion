import { describe, it, expect } from "vitest";
import { calculateEmotionalLoad, detectRhythms, generateSuggestions, getContinuitySnapshot } from "@/lib/continuity-engine";

describe("Continuity Engine", () => {
  describe("Emotional Load Scoring", () => {
    it("calculates low load for minimal tasks", () => {
      const result = calculateEmotionalLoad(1, 0, 0, 0);
      expect(result.level).toBe("low");
      expect(result.overall).toBeLessThanOrEqual(25);
    });

    it("calculates high/critical load for overdue + conflicts", () => {
      const result = calculateEmotionalLoad(5, 3, 2, 4);
      expect(["high", "critical"]).toContain(result.level);
      expect(result.overall).toBeGreaterThan(50);
    });

    it("caps at 100", () => {
      const result = calculateEmotionalLoad(20, 10, 10, 10);
      expect(result.overall).toBeLessThanOrEqual(100);
    });
  });

  describe("Rhythm Detection", () => {
    it("returns detected patterns", () => {
      const rhythms = detectRhythms();
      expect(rhythms.length).toBeGreaterThan(0);
      expect(rhythms[0]).toHaveProperty("confidence");
    });
  });

  describe("Proactive Suggestions", () => {
    it("adds triage for critical load", () => {
      const load = calculateEmotionalLoad(10, 5, 5, 5);
      const suggestions = generateSuggestions(load);
      expect(suggestions[0].category).toBe("triage");
    });
  });

  describe("Full Snapshot", () => {
    it("returns complete continuity data", () => {
      const snapshot = getContinuitySnapshot();
      expect(snapshot.loadScore).toBeDefined();
      expect(snapshot.rhythms.length).toBeGreaterThan(0);
      expect(snapshot.suggestions.length).toBeGreaterThan(0);
      expect(snapshot.weeklyTrend).toHaveLength(7);
    });
  });
});

describe("Admin Incident Lifecycle (mock)", () => {
  it("simulates create → acknowledge → resolve", () => {
    const incident = { id: "INC-TEST", status: "open" as const, timeline: [{ action: "created", actor: "system", timestamp: new Date().toISOString() }] };
    const acknowledged = { ...incident, status: "acknowledged" as const, timeline: [...incident.timeline, { action: "acknowledged", actor: "admin", timestamp: new Date().toISOString() }] };
    expect(acknowledged.status).toBe("acknowledged");
    const resolved = { ...acknowledged, status: "resolved" as const, rootCause: "Config drift", timeline: [...acknowledged.timeline, { action: "resolved", actor: "admin", timestamp: new Date().toISOString() }] };
    expect(resolved.status).toBe("resolved");
    expect(resolved.timeline).toHaveLength(3);
  });
});

describe("Policy Simulation (mock)", () => {
  it("evaluates allow/deny", () => {
    const simulate = (amount: number) => amount <= 500 ? { effect: "allow" } : { effect: "deny" };
    expect(simulate(200).effect).toBe("allow");
    expect(simulate(600).effect).toBe("deny");
  });
});

describe("Audit Log Export (mock)", () => {
  it("generates CSV", () => {
    const logs = [{ actor: "admin", action: "incident.ack", resource: "INC-001", result: "success" }];
    const csv = [Object.keys(logs[0]).join(","), ...logs.map(l => Object.values(l).join(","))].join("\n");
    expect(csv).toContain("actor,action");
    expect(csv.split("\n")).toHaveLength(2);
  });
});
