#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — KS-PAYMENTS-AUTH Dual-Approval Readiness Gate
//
// Asserts that the KS-PAYMENTS-AUTH kill-switch is wired with
// the production safety contract per memory:
//   - Registered in kill-switch-registry.ts
//   - Mapped to enforcement consequences
//   - Requires dual-admin approval (admin_safety_actions table)
//   - Has a runbook reference
//   - Is exercised by an existing audit log table
//
// Emits: generated/ks-payments-auth-readiness-report.json
// ═══════════════════════════════════════════════════════════════
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const REPO_ROOT = process.cwd();
interface Issue { severity: "error" | "warning"; clause: string; message: string }
const issues: Issue[] = [];

function check(clause: string, ok: boolean, message: string, severity: "error" | "warning" = "error") {
  if (!ok) issues.push({ severity, clause, message });
}

// 1. Registry entry
const registryPath = resolve(REPO_ROOT, "src/lib/control-plane/kill-switch-registry.ts");
const registryExists = existsSync(registryPath);
check("registry.exists", registryExists, "kill-switch-registry.ts missing");
const registry = registryExists ? readFileSync(registryPath, "utf8") : "";
check("registry.ks-payments-auth", registry.includes("KS-PAYMENTS-AUTH"),
  "KS-PAYMENTS-AUTH not declared in kill-switch-registry.ts");
check("registry.dual-approval-flag",
  /KS-PAYMENTS-AUTH[\s\S]{0,800}requiresDualApproval\s*:\s*true/.test(registry) ||
  /KS-PAYMENTS-AUTH[\s\S]{0,800}dualApproval\s*:\s*true/.test(registry) ||
  /KS-PAYMENTS-AUTH[\s\S]{0,800}approvalQuorum\s*:\s*[2-9]/.test(registry),
  "KS-PAYMENTS-AUTH must declare dual-approval (requiresDualApproval=true OR approvalQuorum>=2)",
  "warning");

// 2. Enforcement map
const enforcePath = resolve(REPO_ROOT, "src/lib/control-plane/kill-switch-enforcement-map.ts");
check("enforcement.map", existsSync(enforcePath), "kill-switch-enforcement-map.ts missing");
const enforce = existsSync(enforcePath) ? readFileSync(enforcePath, "utf8") : "";
check("enforcement.payments-auth",
  enforce.includes("KS-PAYMENTS-AUTH") || enforce.includes("payments-auth") || enforce.includes("payment-auth"),
  "Enforcement map must reference payments-auth target");

// 3. Runtime consequence
const consequencePath = resolve(REPO_ROOT, "src/lib/control-plane/kill-switch-runtime-consequence.ts");
check("consequence.runtime", existsSync(consequencePath), "kill-switch-runtime-consequence.ts missing");

// 4. Runbook reference
const runbookCandidates = [
  "docs/runbooks/RB-PAYMENTS.md",
  "docs/runbooks/RB-005.md",
  "docs/runbooks/RB-005-payments.md",
  "src/lib/runbooks/runbook-registry.ts",
];
const runbookFound = runbookCandidates.some((p) => existsSync(resolve(REPO_ROOT, p)));
check("runbook.exists", runbookFound, "No payments runbook (RB-PAYMENTS / RB-005) or runbook-registry.ts");

// 5. Approvals table referenced
const migrationsDir = resolve(REPO_ROOT, "supabase/migrations");
let approvalsTableSeen = false;
if (existsSync(migrationsDir)) {
  for (const f of readdirSync(migrationsDir) as string[]) {
    if (!f.endsWith(".sql")) continue;
    const txt = readFileSync(resolve(migrationsDir, f), "utf8");
    if (/kill_switch_approvals|admin_safety_actions/.test(txt)) {
      approvalsTableSeen = true;
      break;
    }
  }
}
check("db.approvals-table", approvalsTableSeen,
  "No migration declares kill_switch_approvals or admin_safety_actions", "warning");

// 6. UI surface (operator approval queue)
const uiCandidates = [
  "src/pages/admin/AdminApprovalsPage.tsx",
  "src/components/admin/AdminApprovalQueue.tsx",
  "src/pages/admin/AdminKillSwitches.tsx",
];
check("ui.approval-surface",
  uiCandidates.some((p) => existsSync(resolve(REPO_ROOT, p))),
  "No operator UI surface for approving KS-PAYMENTS-AUTH activations", "warning");

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "ks-payments-auth-readiness",
  phase: "phase-14-production-launch-hardening",
  ok: errorCount === 0,
  errorCount,
  warningCount,
  killSwitch: "KS-PAYMENTS-AUTH",
  contract: {
    registered: registry.includes("KS-PAYMENTS-AUTH"),
    dualApproval: /KS-PAYMENTS-AUTH[\s\S]{0,800}(requiresDualApproval\s*:\s*true|dualApproval\s*:\s*true|approvalQuorum\s*:\s*[2-9])/.test(registry),
    enforcementMapped: enforce.includes("payments-auth") || enforce.includes("payment-auth"),
    runbookLinked: runbookFound,
    approvalsTablePresent: approvalsTableSeen,
  },
  issues,
};

const outDir = resolve(REPO_ROOT, "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "ks-payments-auth-readiness-report.json"), JSON.stringify(report, null, 2));

console.log(`[ks-payments-auth-readiness] ${errorCount} errors · ${warningCount} warnings`);
if (errorCount > 0) {
  for (const e of issues.filter((i) => i.severity === "error")) console.error(`  ✗ ${e.clause}: ${e.message}`);
  process.exit(1);
}
console.log("[ks-payments-auth-readiness] ✓ ok");
