// ═══════════════════════════════════════════════════════════════
// SITA OS — Mock Data: Owner Center Policy Simulation
// ═══════════════════════════════════════════════════════════════

export function buildMockSimResult(simInput: { amount: number; [key: string]: unknown }) {
  return {
    simulation: {
      input: simInput,
      final_effect: simInput.amount > 500 ? "deny" : "allow",
      evaluated_policies: 3,
      results: [
        {
          policy_name: "Auto-pay under $500",
          effect: simInput.amount > 500 ? "deny" : "allow",
          reasons: simInput.amount > 500
            ? [`Amount $${simInput.amount} exceeds max $500`]
            : ["Within auto-pay limit"],
        },
      ],
    },
  };
}
