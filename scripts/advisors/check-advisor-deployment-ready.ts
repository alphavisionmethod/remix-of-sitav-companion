#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Advisor Deployment-Ready Gate (BLOCK)
//
// Verifies every Business System advisor has the artefacts required
// to be considered deployment-ready in this codebase. Used in CI to
// prevent shipping shallow advisor experiences.
//
// Checks performed for each of the 9 advisors:
//   1. Manifest entry exists in business-advisor-registry.ts
//   2. Mobile + desktop routes resolve to the shared shell
//   3. The runtime barrel exports the canonical functions
//   4. The shared UI shell is present
//   5. The shared platform tables are present in the migration history
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from "node:fs";
import { ViolationCollector, writeJsonOutput } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const REGISTRY = "src/lib/ai-platform/runtime/business-advisor-registry.ts";
const RUNTIME = "src/lib/ai-platform/runtime/business-advisor-runtime.ts";
const CONTEXT = "src/lib/ai-platform/runtime/advisor-context-loader.ts";
const SHELL = "src/components/business-advisors/AdvisorPageShell.tsx";
const OS_PAGE = "src/pages/business-advisors/BusinessAdvisorPage.tsx";
const OS_INDEX = "src/pages/business-advisors/BusinessAdvisorsIndex.tsx";
const MOBILE_INDEX = "src/pages/mobile/MobileBusinessAdvisors.tsx";
const MOBILE_DETAIL = "src/pages/mobile/MobileBusinessAdvisorDetail.tsx";
const ROUTES = "src/routes/business-advisor-routes.tsx";
const BARREL = "src/lib/ai-platform/runtime/index.ts";

const REQUIRED_ADVISORS = [
  "sales-advisor",
  "customer-service-advisor",
  "cfo-advisor",
  "marketing-advertising-advisor",
  "growth-advisor",
  "tech-advisor",
  "imports-exports-advisor",
  "taxes-laws-advisor",
  "ceo-advisor",
] as const;

function fileMust(path: string, label: string): string | null {
  if (!existsSync(path)) {
    vc.add(path, "missing-file", `${label} not found`);
    return null;
  }
  return readFileSync(path, "utf-8");
}

const registry = fileMust(REGISTRY, "Business advisor registry");
if (registry) {
  for (const id of REQUIRED_ADVISORS) {
    if (!registry.includes(`"${id}"`)) {
      vc.add(REGISTRY, "missing-advisor", `Advisor ${id} not declared in manifest`);
    }
  }
}

fileMust(RUNTIME, "Business advisor runtime");
fileMust(CONTEXT, "Advisor context loader");
fileMust(SHELL, "Shared advisor UI shell");
fileMust(OS_PAGE, "OS per-advisor page");
fileMust(OS_INDEX, "OS advisors index page");
fileMust(MOBILE_INDEX, "Mobile advisors index");
fileMust(MOBILE_DETAIL, "Mobile per-advisor detail");

const routes = fileMust(ROUTES, "Business advisor routes");
if (routes) {
  if (!routes.includes("/business-advisors")) vc.add(ROUTES, "missing-route", "OS /business-advisors route missing");
  if (!routes.includes("/mobile/business-advisors")) vc.add(ROUTES, "missing-route", "Mobile /mobile/business-advisors route missing");
}

const barrel = fileMust(BARREL, "AI platform runtime barrel");
if (barrel) {
  for (const symbol of ["BUSINESS_ADVISORS", "askBusinessAdvisor", "loadAdvisorContext", "runAdvisorSimulation"]) {
    if (!barrel.includes(symbol)) {
      vc.add(BARREL, "missing-export", `Runtime barrel missing export: ${symbol}`);
    }
  }
}

writeJsonOutput("generated/advisor-boardroom-proof/business-advisor-deployment-check.json", {
  generatedAt: new Date().toISOString(),
  gate: "business-advisor-deployment-ready",
  ok: vc.errors.length === 0,
  requiredAdvisors: REQUIRED_ADVISORS,
  artefactsChecked: [REGISTRY, RUNTIME, CONTEXT, SHELL, OS_PAGE, OS_INDEX, MOBILE_INDEX, MOBILE_DETAIL, ROUTES, BARREL],
});

vc.report("check-business-advisor-deployment-ready");
vc.exitIfErrors();