import { describe, it, expect } from "vitest";
import { buildHouseholdBoardroomPacket } from "@/lib/services/concierge-os/household-boardroom-inputs.service";

describe("buildHouseholdBoardroomPacket", () => {
  it("emits a packet with required boardroom fields", () => {
    const p = buildHouseholdBoardroomPacket();
    expect(typeof p.activeTasks).toBe("number");
    expect(typeof p.overdueTasks).toBe("number");
    expect(typeof p.loadBalanceScore).toBe("number");
    expect(Array.isArray(p.upcomingEvents)).toBe(true);
    expect(Array.isArray(p.actionItems)).toBe(true);
    expect(Array.isArray(p.travelPrep)).toBe(true);
    expect(p.actionItems.length).toBeGreaterThan(0);
    expect(new Date(p.generatedAt).toString()).not.toBe("Invalid Date");
  });
});