#!/usr/bin/env node
/* eslint-disable no-console */
// Phase 12 — Onboarding 29-screen branch telemetry validator.
// Strengthened: also enforces resume/re-entry persistence substrate.
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";

const issues: Array<{ severity: string; area: string; message: string }> = [];
const migDir = "supabase/migrations";
const sqlBlob = existsSync(migDir)
  ? readdirSync(migDir).filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`${migDir}/${f}`, "utf8")).join("\n")
  : "";

// --- Existing branch-telemetry assertions ---
if (!sqlBlob.includes("onboarding_branch_events")) {
  issues.push({ severity: "error", area: "schema", message: "onboarding_branch_events table not declared" });
}
if (!sqlBlob.includes("users_insert_own_onboarding_events")) {
  issues.push({ severity: "error", area: "rls", message: "owner-insert policy missing on onboarding events" });
}
if (!existsSync("supabase/functions/onboarding-branch-tracker/index.ts")) {
  issues.push({ severity: "error", area: "edge-function", message: "onboarding-branch-tracker edge function missing" });
}

// --- New: resume/re-entry persistence assertions ---
const resumeTablePresent = sqlBlob.includes("onboarding_resume_checkpoints");
if (!resumeTablePresent) {
  issues.push({ severity: "error", area: "schema", message: "onboarding_resume_checkpoints table not declared" });
}

const requiredResumePolicies = [
  "users_select_own_resume_checkpoint",
  "users_insert_own_resume_checkpoint",
  "users_update_own_resume_checkpoint",
];
const missingPolicies = requiredResumePolicies.filter((p) => !sqlBlob.includes(p));
const rlsComplete = missingPolicies.length === 0;
if (!rlsComplete) {
  for (const p of missingPolicies) {
    issues.push({ severity: "error", area: "rls", message: `resume-checkpoint RLS policy missing: ${p}` });
  }
}

const edgeFunctionPresent = existsSync("supabase/functions/onboarding-resume-checkpoint/index.ts");
if (!edgeFunctionPresent) {
  issues.push({ severity: "error", area: "edge-function", message: "onboarding-resume-checkpoint edge function missing" });
}

// --- Client-wiring assertion: the hook exists AND is imported by Onboarding.tsx ---
const hookPath = "src/hooks/useOnboardingResume.ts";
const onboardingPagePath = "src/pages/Onboarding.tsx";
const hookPresent = existsSync(hookPath);
const onboardingPageContents = existsSync(onboardingPagePath) ? readFileSync(onboardingPagePath, "utf8") : "";
const hookImportedByPage = /from\s+["']@\/hooks\/useOnboardingResume["']/.test(onboardingPageContents)
  || /from\s+["']\.\.\/hooks\/useOnboardingResume["']/.test(onboardingPageContents);
const clientWired = hookPresent && hookImportedByPage;
if (!hookPresent) {
  issues.push({ severity: "error", area: "client", message: "useOnboardingResume hook missing at src/hooks/useOnboardingResume.ts" });
}
if (!hookImportedByPage) {
  issues.push({ severity: "error", area: "client", message: "src/pages/Onboarding.tsx does not import useOnboardingResume — resume loop not wired" });
}

const errorCount = issues.filter((i) => i.severity === "error").length;
const warningCount = issues.filter((i) => i.severity === "warning").length;
const ok = errorCount === 0;
mkdirSync("generated", { recursive: true });
writeFileSync("generated/onboarding-branch-telemetry-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  gate: "onboarding-branch-telemetry",
  ok,
  errorCount,
  warningCount,
  expectedScreens: 29,
  validBranches: ["quick","balanced","deep"],
  resumePersistence: {
    tablePresent: resumeTablePresent,
    rlsComplete,
    edgeFunctionPresent,
    clientWired,
  },
  issues,
}, null, 2));
console.log(`${ok ? "✅" : "❌"} onboarding-branch-telemetry: ${errorCount} errors, ${warningCount} warnings`);
console.log(`  resume persistence — table:${resumeTablePresent} rls:${rlsComplete} fn:${edgeFunctionPresent} client:${clientWired}`);
process.exit(ok ? 0 : 1);
