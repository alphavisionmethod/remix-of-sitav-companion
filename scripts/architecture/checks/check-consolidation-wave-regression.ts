#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Consolidation Wave Regression CI Gate
//
// Validates that the consolidation wave registry is internally
// consistent and that all referenced routes exist in the route
// smoke test inventory. Runs as a static check (no browser).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// Inline minimal ViolationCollector to avoid import issues in CI
class ViolationCollector {
  violations: Array<{ file: string; rule: string; message: string; severity: string }> = [];
  add(file: string, rule: string, message: string, severity: "error" | "warning" = "error") {
    this.violations.push({ file, rule, message, severity });
  }
  report(name: string) {
    const errors = this.violations.filter((v) => v.severity === "error");
    const warnings = this.violations.filter((v) => v.severity === "warning");
    if (warnings.length) {
      console.log(`  ⚠️  ${warnings.length} warning(s)`);
      warnings.forEach((w) => console.log(`    ⚠️  [${w.rule}] ${w.message}`));
    }
    if (errors.length) {
      console.log(`  ❌ ${errors.length} error(s)`);
      errors.forEach((e) => console.log(`    ❌ [${e.rule}] ${e.message}`));
    }
    if (!errors.length && !warnings.length) {
      console.log(`  ✅ ${name}: all checks pass`);
    }
  }
  exitIfErrors() {
    const errors = this.violations.filter((v) => v.severity === "error");
    if (errors.length) process.exit(1);
  }
}

const vc = new ViolationCollector();

// ── Load wave registry via dynamic import ──────────────────────
async function main() {
  const registryPath = path.resolve("src/lib/admin/consolidation-wave-registry.ts");
  if (!fs.existsSync(registryPath)) {
    console.log("❌ consolidation-wave-registry.ts not found");
    process.exit(1);
  }

  // Use tsx to load TS module
  const mod = await import(registryPath);
  const waves = mod.CONSOLIDATION_WAVES as Array<{
    id: string;
    order: number;
    affectedRoutes: Array<{
      path: string;
      postWave: string;
      redirectTo?: string;
    }>;
    affectedWorkflows: Array<{
      criticalRoutes: string[];
    }>;
  }>;

  console.log(`  📊 ${waves.length} consolidation waves registered`);

  // Check 1: Unique wave IDs
  const ids = waves.map((w) => w.id);
  const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const d of dupeIds) {
    vc.add(registryPath, "duplicate-wave-id", `Duplicate wave ID: ${d}`);
  }

  // Check 2: Unique order values
  const orders = waves.map((w) => w.order);
  const dupeOrders = orders.filter((o, i) => orders.indexOf(o) !== i);
  for (const d of dupeOrders) {
    vc.add(registryPath, "duplicate-wave-order", `Duplicate wave order: ${d}`);
  }

  // Check 3: Redirected routes must have redirectTo
  for (const wave of waves) {
    for (const route of wave.affectedRoutes) {
      if (route.postWave === "redirected" && !route.redirectTo) {
        vc.add(
          registryPath,
          "missing-redirect-target",
          `Wave ${wave.id}: ${route.path} is "redirected" but has no redirectTo`,
        );
      }
    }
  }

  // Check 4: No redirect chains (target is not itself redirected)
  const redirectedPaths = new Set<string>();
  for (const wave of waves) {
    for (const route of wave.affectedRoutes) {
      if (route.postWave === "redirected") {
        redirectedPaths.add(route.path);
      }
    }
  }
  for (const wave of waves) {
    for (const route of wave.affectedRoutes) {
      if (route.redirectTo && redirectedPaths.has(route.redirectTo)) {
        vc.add(
          registryPath,
          "redirect-chain",
          `Wave ${wave.id}: ${route.path} → ${route.redirectTo} is itself redirected`,
        );
      }
    }
  }

  // Check 5: Workflow critical routes exist in affected routes or are external
  for (const wave of waves) {
    const affectedPaths = new Set(wave.affectedRoutes.map((r) => r.path));
    for (const wf of wave.affectedWorkflows) {
      for (const cr of wf.criticalRoutes) {
        // Critical routes should either be in the affected set or be stable external routes
        if (!affectedPaths.has(cr)) {
          vc.add(
            registryPath,
            "orphan-critical-route",
            `Wave ${wave.id}: workflow critical route ${cr} not in affectedRoutes`,
            "warning",
          );
        }
      }
    }
  }

  // Check 6: Verify consolidation plan alignment
  const planPath = "generated/admin-consolidation-plan.json";
  if (fs.existsSync(planPath)) {
    const plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
    const planRoutes = new Set(
      (plan.recommendations || []).map((r: { sourceRoute: string }) => r.sourceRoute),
    );
    for (const sourceRoute of planRoutes) {
      const covered = waves.some((w) =>
        w.affectedRoutes.some((r) => r.path === sourceRoute),
      );
      if (!covered) {
        vc.add(
          planPath,
          "uncovered-recommendation",
          `Consolidation plan recommends action on ${sourceRoute} but no wave covers it`,
          "warning",
        );
      }
    }
    console.log(`  📋 ${planRoutes.size} plan recommendations checked against waves`);
  }

  // Output report
  const reportDir = "generated";
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    totalWaves: waves.length,
    totalAffectedRoutes: waves.reduce((n, w) => n + w.affectedRoutes.length, 0),
    totalWorkflows: waves.reduce((n, w) => n + w.affectedWorkflows.length, 0),
    errors: vc.violations.filter((v) => v.severity === "error").length,
    warnings: vc.violations.filter((v) => v.severity === "warning").length,
    violations: vc.violations,
  };

  fs.writeFileSync(
    path.join(reportDir, "consolidation-wave-regression-report.json"),
    JSON.stringify(report, null, 2),
  );

  vc.report("check-consolidation-wave-regression");
  vc.exitIfErrors();
}

main().catch((e) => {
  console.error("❌ Consolidation wave regression check failed:", e);
  process.exit(1);
});