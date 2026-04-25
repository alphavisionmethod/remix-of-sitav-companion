import { describe, it, expect } from "vitest";
import { decideBudget, type BudgetState } from "../budgets";

const baseState: BudgetState = {
  advisorId: "cfo-advisor",
  dailyTokenBudget: 100_000,
  tokensUsedToday: 50_000,
  tokenPctUsed: 0.5,
  hourlyInvocationCap: 10,
  invocationsToday: 50,
  financialSpentTodayCents: 100_00,
  financialActionCapCents: 200_00,
};

describe("decideBudget", () => {
  it("passes within all caps", () => {
    const r = decideBudget(baseState, 1_000, 50_00);
    expect(r.ok).toBe(true);
  });
  it("trips on daily token budget exceeded", () => {
    const r = decideBudget(baseState, 60_000, 0);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("daily_token_budget_exceeded");
  });
  it("trips on per-action financial cap exceeded", () => {
    const r = decideBudget(baseState, 0, 250_00);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("per_action_financial_cap_exceeded");
  });
  it("trips on daily financial spend ceiling", () => {
    const r = decideBudget(
      { ...baseState, financialSpentTodayCents: 480_00 },
      0,
      30_00,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("daily_financial_spend_exceeded");
  });
  it("trips on hourly invocation saturation", () => {
    const r = decideBudget(
      { ...baseState, invocationsToday: 240 },
      0,
      0,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("hourly_invocation_cap_exceeded");
  });
  it("ignores token budget when not configured (=0)", () => {
    const r = decideBudget({ ...baseState, dailyTokenBudget: 0 }, 999_999, 0);
    expect(r.ok).toBe(true);
  });
});