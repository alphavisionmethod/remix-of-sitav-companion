#!/usr/bin/env node
/* eslint-disable no-console */
// Independently re-verifies the App Store lifecycle on each release run.
// Asserts: 5 required edge functions present, type matrix complete (4×7),
// and >=8 consumers of installed_apps / AppPlatformContext.
import { existsSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const STATUS = "generated/final-proof-verification/app-store-reality-status.json";
const REQUIRED_FNS = ["app-install", "app-uninstall", "app-update-check", "app-manifest-sync", "app-launch-resolve"];
const FN_DIR = "supabase/functions";

const issues: GateIssue[] = [];

for (const fn of REQUIRED_FNS) {
  if (!existsSync(`${FN_DIR}/${fn}`)) {
    issues.push({ severity: "error", area: "edge-function", message: `${fn} missing` });
  }
}

let consumers = 0;
try {
  const out = execSync(
    `grep -rln "installed_apps\\|AppPlatformContext" src --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
    { encoding: "utf-8" },
  );
  consumers = out.split("\n").filter(Boolean).length;
} catch {}
if (consumers < 8) {
  issues.push({ severity: "error", area: "consumers", message: `only ${consumers} install-state consumers (need >=8)` });
}

if (!existsSync(STATUS)) {
  issues.push({ severity: "error", area: "status", message: `${STATUS} missing` });
} else {
  const s = JSON.parse(readFileSync(STATUS, "utf-8"));
  const types = s.appTypes ?? {};
  const expectedTypes = ["A_webSaaS", "B_pwa", "C_externalNative", "D_internalOS"];
  const expectedSteps = ["discovery", "install", "visibility", "update", "uninstall", "launcher", "entitlements"];
  for (const t of expectedTypes) {
    if (!types[t]) { issues.push({ severity: "error", area: "type-matrix", message: `type ${t} missing` }); continue; }
    for (const step of expectedSteps) {
      if (types[t][step] !== true) {
        issues.push({ severity: "error", area: "type-matrix", message: `${t}.${step} not real` });
      }
    }
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} app-store-lifecycle-reality: ${REQUIRED_FNS.length} fns, ${consumers} consumers`);
issues.forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: "app-store-lifecycle-reality",
  ok,
  issues,
  extra: { edgeFunctions: REQUIRED_FNS.length, consumers },
});
process.exit(ok ? 0 : 1);
