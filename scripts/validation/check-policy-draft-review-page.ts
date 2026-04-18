#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport } from "./_lib/emit-gate-report.js";

const issues: { severity: "error" | "warning"; area: string; message: string }[] = [];
const page = "src/pages/admin/ai-runtime/PolicyDraftReviewBoard.tsx";
const routes = "src/routes/AdminRoutes.tsx";

if (!existsSync(page)) {
  issues.push({ severity: "error", area: "page", message: "PolicyDraftReviewBoard.tsx missing" });
} else {
  const c = readFileSync(page, "utf-8");
  for (const k of [
    "internal_agent_policy_drafts",
    "record_policy_draft_decision",
    "summarize_policy_draft_health",
    "internal-agent-policy-architect",
  ]) {
    if (!c.includes(k)) issues.push({ severity: "error", area: "wiring", message: `page missing token: ${k}` });
  }
}

if (!existsSync(routes)) {
  issues.push({ severity: "error", area: "routes", message: "AdminRoutes.tsx missing" });
} else {
  const r = readFileSync(routes, "utf-8");
  if (!r.includes("PolicyDraftReviewBoard") || !r.includes("/admin/ai-runtime/policy-drafts")) {
    issues.push({ severity: "error", area: "routes", message: "PolicyDraftReviewBoard not registered at /admin/ai-runtime/policy-drafts" });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
const path = emitGateReport({ gate: "policy-draft-review-page", ok, issues });
console.log(`${ok ? "✅" : "❌"} policy-draft-review-page → ${path}`);
process.exit(ok ? 0 : 1);
