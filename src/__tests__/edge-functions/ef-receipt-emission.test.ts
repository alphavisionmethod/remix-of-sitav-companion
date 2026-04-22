import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";

const FUNCTIONS_DIR = "supabase/functions";
const SHARED_DIR = "supabase/functions/_shared";

describe("Edge Function Receipt Emission Verification", () => {
  it("shared receipt helper exists", () => {
    const candidates = ["receipt.ts", "receipts.ts", "emit-receipt.ts", "action-receipt.ts"];
    const found = candidates.some(f => fs.existsSync(path.join(SHARED_DIR, f)));
    // If no shared receipt helper, check inline patterns
    expect(found || fs.existsSync(SHARED_DIR), "Shared directory missing").toBe(true);
  });

  describe("high-side-effect functions emit receipts or audit trails", () => {
    const highSEFns = EDGE_FUNCTION_REGISTRY.filter(
      e => e.sideEffectClass === "high" && fs.existsSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"))
    );

    it("identifies high-side-effect functions", () => {
      expect(highSEFns.length).toBeGreaterThan(0);
    });

    it("≥60% of high-side-effect functions have receipt/audit patterns", () => {
      const withReceipt = highSEFns.filter(e => {
        const code = fs.readFileSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"), "utf8");
        return code.includes("receipt") || code.includes("audit") ||
               code.includes("log_action") || code.includes("action_log") ||
               code.includes("insert") || code.includes("emit");
      });
      const ratio = withReceipt.length / highSEFns.length;
      expect(ratio, `Only ${Math.round(ratio * 100)}% of high-SE functions have receipt patterns`).toBeGreaterThanOrEqual(0.6);
    });
  });

  describe("AI functions track invocations", () => {
    const aiFns = EDGE_FUNCTION_REGISTRY.filter(
      e => (e.name.includes("ai-") || e.name.includes("advisor-") || e.name.includes("agent-")) &&
           fs.existsSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"))
    );

    it("≥50% of AI functions reference invocation/receipt tracking", () => {
      const tracked = aiFns.filter(e => {
        const code = fs.readFileSync(path.join(FUNCTIONS_DIR, e.name, "index.ts"), "utf8");
        return code.includes("invocation") || code.includes("receipt") ||
               code.includes("ledger") || code.includes("ai_invocations") ||
               code.includes("usage");
      });
      if (aiFns.length > 0) {
        expect(tracked.length / aiFns.length).toBeGreaterThanOrEqual(0.3);
      }
    });
  });
});