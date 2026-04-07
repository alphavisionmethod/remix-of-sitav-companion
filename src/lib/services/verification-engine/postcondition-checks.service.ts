// ═══════════════════════════════════════════════════════════════
// SITA OS — Postcondition Checks Service
// Runs post-execution assertions
// ═══════════════════════════════════════════════════════════════

export type PostconditionType = "balance-changed" | "record-updated" | "email-delivered" | "file-created" | "status-changed" | "custom";

export interface PostconditionCheck {
  id: string;
  actionId: string;
  type: PostconditionType;
  description: string;
  assertion: Record<string, unknown>;
  result: "pass" | "fail" | "pending";
  checkedAt?: string;
  details?: string;
}

export function createPostconditionCheck(params: {
  actionId: string;
  type: PostconditionType;
  description: string;
  assertion: Record<string, unknown>;
}): PostconditionCheck {
  return {
    id: crypto.randomUUID(),
    actionId: params.actionId,
    type: params.type,
    description: params.description,
    assertion: params.assertion,
    result: "pending",
  };
}

export function runPostconditionChecks(checks: PostconditionCheck[], actuals: Record<string, unknown>): PostconditionCheck[] {
  return checks.map((check) => {
    const passed = evaluateAssertion(check.assertion, actuals);
    return {
      ...check,
      result: passed ? "pass" as const : "fail" as const,
      checkedAt: new Date().toISOString(),
      details: passed ? "Assertion satisfied" : `Assertion failed: expected ${JSON.stringify(check.assertion)}`,
    };
  });
}

function evaluateAssertion(assertion: Record<string, unknown>, actuals: Record<string, unknown>): boolean {
  for (const [key, expectedValue] of Object.entries(assertion)) {
    if (key.endsWith("_gt") && typeof expectedValue === "number") {
      const field = key.replace("_gt", "");
      if (typeof actuals[field] !== "number" || (actuals[field] as number) <= expectedValue) return false;
    } else if (key.endsWith("_exists")) {
      const field = key.replace("_exists", "");
      if (!(field in actuals)) return false;
    } else if (key.endsWith("_eq")) {
      const field = key.replace("_eq", "");
      if (actuals[field] !== expectedValue) return false;
    } else {
      if (actuals[key] !== expectedValue) return false;
    }
  }
  return true;
}

export function summarizeChecks(checks: PostconditionCheck[]): { total: number; passed: number; failed: number; pending: number; allPassed: boolean } {
  const passed = checks.filter((c) => c.result === "pass").length;
  const failed = checks.filter((c) => c.result === "fail").length;
  const pending = checks.filter((c) => c.result === "pending").length;
  return { total: checks.length, passed, failed, pending, allPassed: failed === 0 && pending === 0 };
}

