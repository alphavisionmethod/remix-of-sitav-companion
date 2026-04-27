import { describe, it, expect } from "vitest";
import { computeStressRadar } from "@/lib/services/finance-os/stress-radar.service";
import { makeStressRadarInput } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("computeStressRadar", () => {
  it("emits cash-squeeze signal when runway < 30 days", () => {
    const out = computeStressRadar(
      makeStressRadarInput({ cashBalanceCents: 100_000, monthlyBurnCents: 600_000 }),
    );
    expect(out.signals.some((s) => s.category === "cash-squeeze")).toBe(true);
  });

  it("emits debt-inflection when DTI > 36%", () => {
    const out = computeStressRadar(
      makeStressRadarInput({
        monthlyIncomeCents: 500_000,
        monthlyDebtPaymentCents: 300_000, // 60% DTI
      }),
    );
    const sig = out.signals.find((s) => s.category === "debt-inflection");
    expect(sig).toBeDefined();
    expect(sig!.severity).toBe("critical");
  });

  it("emits reserve-weakness when funded < 50%", () => {
    const out = computeStressRadar(
      makeStressRadarInput({ reserveFundedPct: 20 }),
    );
    const sig = out.signals.find((s) => s.category === "reserve-weakness");
    expect(sig).toBeDefined();
    expect(sig!.severity).toBe("critical");
  });

  it("detects bill collisions on the same day", () => {
    const date = "2026-05-01T00:00:00Z";
    const out = computeStressRadar(
      makeStressRadarInput({
        cashBalanceCents: 100_000,
        monthlyIncomeCents: 800_000,
        monthlyBurnCents: 100_000,
        upcomingBills: [
          { name: "Rent", amountCents: 80_000, dueDate: date },
          { name: "Internet", amountCents: 20_000, dueDate: date },
        ],
      }),
    );
    expect(out.billCollisions.length).toBeGreaterThan(0);
  });

  it("returns zero signals for a healthy profile", () => {
    const out = computeStressRadar(
      makeStressRadarInput({
        cashBalanceCents: 10_000_000,
        monthlyIncomeCents: 1_000_000,
        monthlyBurnCents: 400_000,
        reserveFundedPct: 100,
        monthlyDebtPaymentCents: 0,
      }),
    );
    expect(out.signals.length).toBe(0);
  });
});