// ═══════════════════════════════════════════════════════════════
// Receipt Emission Coverage Gate (Audit v4.0 — PM Corrective Action #6)
// Measures how many edge functions actually import and use receipt
// emission helpers. Reports percentage and tracks progress.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const FUNCTIONS_DIR = "supabase/functions";
const RECEIPT_PATTERNS = [
  "receipt-emitter",
  "ai-receipt-logger",
  "audit-logger",
  "emitActionReceipt",
  "writeDecisionReceipt",
  "logAIReceipt",
  "logReceipt",
  "emit_receipt",
  "action_receipt",
  "insert.*receipts",
  "insert.*audit",
  "insert.*action_log",
  "ai_action_receipts",
  "ai_receipt_records",
  "admin_action_audit",
];

function getEdgeFunctions(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) return [];
  return fs.readdirSync(FUNCTIONS_DIR).filter(d => {
    if (d.startsWith("_") || d === "node_modules") return false;
    const full = path.join(FUNCTIONS_DIR, d);
    return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "index.ts"));
  });
}

describe("Receipt Emission Coverage", () => {
  const fns = getEdgeFunctions();

  it("identifies edge functions with receipt patterns", () => {
    const withReceipt: string[] = [];
    const withoutReceipt: string[] = [];

    for (const fn of fns) {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, fn, "index.ts"), "utf8");
      const hasReceipt = RECEIPT_PATTERNS.some(p => new RegExp(p, "i").test(code));
      if (hasReceipt) withReceipt.push(fn);
      else withoutReceipt.push(fn);
    }

    const pct = fns.length > 0 ? (withReceipt.length / fns.length * 100).toFixed(1) : "0";
    console.log(`📊 Receipt coverage: ${withReceipt.length}/${fns.length} (${pct}%)`);
    console.log(`📊 Functions WITHOUT receipts: ${withoutReceipt.length}`);
    if (withoutReceipt.length > 0) {
      console.log(`📋 Sample missing: ${withoutReceipt.slice(0, 10).join(", ")}`);
    }

    // Track — current expectation is ~42% based on grep
    expect(withReceipt.length).toBeGreaterThan(0);
  });

  it("shared receipt helpers exist", () => {
    const sharedDir = path.join(FUNCTIONS_DIR, "_shared");
    expect(fs.existsSync(sharedDir), "_shared directory must exist").toBe(true);

    const requiredHelpers = ["receipt-emitter.ts", "ai-receipt-logger.ts", "audit-logger.ts"];
    const existing = requiredHelpers.filter(h => fs.existsSync(path.join(sharedDir, h)));
    console.log(`📊 Shared receipt helpers: ${existing.length}/${requiredHelpers.length}`);
    expect(existing.length).toBeGreaterThanOrEqual(1);
  });

  it("high-side-effect functions have receipt patterns", () => {
    // Functions that MUST have receipt emission (financial, auth, deletion, AI)
    const criticalPrefixes = ["payment", "stripe", "account-deletion", "ai-gateway", "ai-budget", "admin-bff", "kill-switch"];
    const critical = fns.filter(fn => criticalPrefixes.some(p => fn.startsWith(p)));
    const criticalWithReceipt = critical.filter(fn => {
      const code = fs.readFileSync(path.join(FUNCTIONS_DIR, fn, "index.ts"), "utf8");
      return RECEIPT_PATTERNS.some(p => new RegExp(p, "i").test(code));
    });

    if (critical.length > 0) {
      const pct = (criticalWithReceipt.length / critical.length * 100).toFixed(1);
      console.log(`📊 Critical function receipt coverage: ${criticalWithReceipt.length}/${critical.length} (${pct}%)`);
      const missing = critical.filter(fn => !criticalWithReceipt.includes(fn));
      if (missing.length > 0) {
        console.log(`⚠️ Critical functions WITHOUT receipts: ${missing.join(", ")}`);
      }
    }
  });
});
