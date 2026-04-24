#!/usr/bin/env node
import { laneFor, isRefusalPath, decideRepair, limitsFor } from "../lib/policy-engine.mjs";
import { ALL_CLASSES } from "../lib/repo-failure-classifier.mjs";
import assert from "node:assert/strict";

let pass = 0, fail = 0;
function ok(name, cond, extra = "") {
  if (cond) { pass++; console.log(`✓ ${name}`); }
  else { fail++; console.log(`✗ ${name} ${extra}`); }
}

// Lane assignments
ok("auth → human-only", laneFor("auth-boundary-regression") === "human-only");
ok("release → human-only", laneFor("release-readiness-mismatch") === "human-only");
ok("external-dep → human-only", laneFor("external-dep-unavailable") === "human-only");
ok("real-bug → human-only", laneFor("real-bug") === "human-only");
ok("flaky → human-only", laneFor("flaky-test") === "human-only");
ok("stale-generated → safe-auto", laneFor("stale-generated") === "safe-auto");
ok("missing-symbol → safe-auto", laneFor("missing-symbol") === "safe-auto");
ok("import-drift → safe-auto", laneFor("import-drift") === "safe-auto");
ok("route-wiring → gated-pr", laneFor("route-wiring-drift") === "gated-pr");
ok("contract-drift → gated-pr", laneFor("contract-drift") === "gated-pr");
ok("semantic-ui → gated-pr", laneFor("semantic-ui-regression") === "gated-pr");

// Every class in classifier resolves to a lane
for (const cls of ALL_CLASSES) {
  const lane = laneFor(cls);
  ok(`class ${cls} resolves to lane`, ["safe-auto", "gated-pr", "human-only"].includes(lane));
}

// Refusal paths
ok("refuses security tests", isRefusalPath("src/__tests__/security/rls.test.ts"));
ok("refuses migrations", isRefusalPath("supabase/migrations/20260101_x.sql"));
ok("refuses payments", isRefusalPath("src/services/payments/StripeService.ts"));
ok("refuses kill-switch", isRefusalPath("src/lib/operations/kill-switch.ts"));
ok("refuses .env", isRefusalPath(".env"));
ok("refuses RLS by glob", isRefusalPath("src/lib/foo-rls-helper.ts"));
ok("refuses self-config", isRefusalPath("config/self-healing-policy.json"));
ok("ALLOWS regular page", !isRefusalPath("src/pages/Dashboard.tsx"));
ok("ALLOWS generated route manifest", !isRefusalPath("generated/routes-manifest.json"));

// decideRepair flow
const safeCluster = { class: "missing-symbol", impactedFiles: ["src/pages/A.tsx"], maxConfidence: 0.9 };
const d1 = decideRepair(safeCluster);
ok("safe missing-symbol → PROCEED", d1.decision === "PROCEED" && d1.lane === "safe-auto");

const refusalCluster = { class: "missing-symbol", impactedFiles: ["src/__tests__/security/x.test.ts"], maxConfidence: 0.9 };
const d2 = decideRepair(refusalCluster);
ok("refusal path → REFUSE", d2.decision === "REFUSE");

const lowConf = { class: "import-drift", impactedFiles: ["src/foo.ts"], maxConfidence: 0.5 };
const d3 = decideRepair(lowConf);
ok("low confidence → ESCALATE", d3.decision === "ESCALATE");

const huge = { class: "missing-symbol", impactedFiles: Array(20).fill("src/x.ts").map((s,i) => `src/x${i}.ts`), maxConfidence: 0.9 };
const d4 = decideRepair(huge);
ok("file cap exceeded → DOWNGRADE", d4.decision === "DOWNGRADE-TO-GATED");

const auth = { class: "auth-boundary-regression", impactedFiles: ["src/lib/auth/x.ts"], maxConfidence: 0.95 };
const d5 = decideRepair(auth);
ok("auth → REFUSE (refusal-path wins)", d5.decision === "REFUSE");

// Auto-merge default off
const automerge = { class: "stale-generated", impactedFiles: ["generated/x.json"], maxConfidence: 0.95 };
delete process.env.SITA_SAFE_AUTOMERGE;
const d6 = decideRepair(automerge);
ok("auto-merge off by default", d6.autoMergeAllowed === false);
process.env.SITA_SAFE_AUTOMERGE = "1";
const d7 = decideRepair(automerge);
ok("auto-merge on with flag", d7.autoMergeAllowed === true);

// Limits exist for safe + gated classes
ok("limits.missing-symbol", limitsFor("missing-symbol").maxFilesTouched === 3);
ok("limits.contract-drift requires semantic", limitsFor("contract-drift").requiredStages.includes("semantic"));

console.log(`\n[policy-test] ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);