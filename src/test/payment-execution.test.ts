import { describe, it, expect } from "vitest";
import { simulatePayment, type PaymentIntent } from "@/lib/core-services/payment-execution";

describe("Payment Execution Service", () => {
  it("simulates a payment and returns projection", () => {
    const intent: PaymentIntent = {
      id: "pi-1", amount: 1500, currency: "USD", fromAccountId: "acct-checking",
      recipientName: "Vendor Corp", method: "ach", description: "Monthly service payment",
    };
    const sim = simulatePayment(intent, 10000, 2000);
    expect(sim).toBeDefined();
    expect(sim.projectedBalance).toBe(8500);
    expect(sim.safeToSpend).toBe(true);
    expect(typeof sim.recommendation).toBe("string");
  });
});
