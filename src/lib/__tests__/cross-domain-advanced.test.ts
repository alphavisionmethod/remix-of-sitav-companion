import { describe, it, expect } from "vitest";
import { evaluateCrossDomainIntelligence } from "@/lib/cross-domain";

describe("Cross-Domain Intelligence — evaluateCrossDomainIntelligence", () => {
  it("returns empty for no data", () => {
    const insights = evaluateCrossDomainIntelligence({});
    expect(insights.length).toBe(0);
  });

  it("detects overdue invoices impact on cash", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: [
        { id: "I-1", status: "overdue", amount: "$6,000", dueDate: "2025-01-01" },
      ],
    });
    expect(insights.some(i => i.title.includes("overdue invoices"))).toBe(true);
    expect(insights.find(i => i.title.includes("overdue"))?.severity).toBe("critical");
  });

  it("detects small overdue invoices as warning", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: [
        { id: "I-1", status: "overdue", amount: "$3,000", dueDate: "2025-01-01" },
      ],
    });
    expect(insights.find(i => i.title.includes("overdue"))?.severity).toBe("warning");
  });

  it("detects bills consuming safe-to-spend", () => {
    const insights = evaluateCrossDomainIntelligence({
      bills: [
        { id: "B-1", status: "upcoming", amount: "$900", dueDate: "2025-04-01" },
      ],
      cashFlow: { safeToSpend: "$1,000", available: "$5,000", outgoing: "$3,000" },
    });
    expect(insights.some(i => i.title.includes("bills consuming"))).toBe(true);
  });

  it("detects stale leads", () => {
    const insights = evaluateCrossDomainIntelligence({
      leads: [
        { id: "L-1", status: "cooling", lastTouch: "7d ago", value: "$5,000" },
        { id: "L-2", status: "cooling", lastTouch: "14d ago", value: "$3,000" },
      ],
    });
    expect(insights.some(i => i.title.includes("leads cooling"))).toBe(true);
  });

  it("detects subscription waste", () => {
    const insights = evaluateCrossDomainIntelligence({
      subscriptions: [
        { id: "S-1", usage: "low", status: "waste", totalCost: "$15" },
      ],
    });
    expect(insights.some(i => i.title.includes("underused subscriptions"))).toBe(true);
  });

  it("detects household task overload", () => {
    const insights = evaluateCrossDomainIntelligence({
      householdTasks: [
        { id: "H-1", status: "pending", priority: "high", due: "today" },
        { id: "H-2", status: "pending", priority: "high", due: "today" },
      ],
    });
    expect(insights.some(i => i.title.includes("household tasks"))).toBe(true);
  });

  it("detects receivables impact on personal cash", () => {
    const insights = evaluateCrossDomainIntelligence({
      invoices: [
        { id: "I-1", status: "pending", amount: "$10,000", dueDate: "2025-04-15" },
      ],
      cashFlow: { safeToSpend: "$5,000", available: "$20,000", outgoing: "$15,000" },
    });
    expect(insights.some(i => i.title.includes("receivables"))).toBe(true);
  });

  it("detects travel budget impact", () => {
    const insights = evaluateCrossDomainIntelligence({
      travel: [
        { id: "T-1", trip: "Paris", dates: "May 1-5", status: "booked", gaps: ["car rental"] },
      ],
      cashFlow: { safeToSpend: "$3,000", available: "$10,000", outgoing: "$7,000" },
    });
    expect(insights.some(i => i.title.includes("trip"))).toBe(true);
  });

  it("detects family vs business scheduling conflict", () => {
    const insights = evaluateCrossDomainIntelligence({
      familyEvents: [
        { id: "F-1", when: "today", title: "School play", who: "Child" },
        { id: "F-2", when: "today", title: "Soccer practice", who: "Child" },
      ],
      leads: [
        { id: "L-1", status: "new", lastTouch: "1d ago", value: "$5,000" },
      ],
    });
    expect(insights.some(i => i.title.includes("family schedule"))).toBe(true);
  });

  it("detects travel vs business conflict", () => {
    const insights = evaluateCrossDomainIntelligence({
      travel: [
        { id: "T-1", trip: "London", dates: "May 1-5", status: "booked" },
      ],
      leads: [
        { id: "L-1", status: "contacted", lastTouch: "2d ago", value: "$8,000" },
      ],
    });
    expect(insights.some(i => i.title.includes("travel may affect"))).toBe(true);
  });
});
