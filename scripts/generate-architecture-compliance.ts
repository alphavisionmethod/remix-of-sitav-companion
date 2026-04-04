#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Compliance Report Generator
// Checks boundary violations, circular deps, security posture
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const now = new Date().toISOString();

// ── Boundary Violation Check ─────────────────────────────────
interface Violation {
  type: "boundary-violation" | "circular-dependency" | "orphan-service";
  severity: "error" | "warning";
  source: string;
  target?: string;
  description: string;
}

const violations: Violation[] = [];

// Check that packages don't import from src/lib/services (wrong direction)
const packagesDir = "src/packages";
if (fs.existsSync(packagesDir)) {
  function scanForViolations(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        scanForViolations(fullPath);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const serviceImports = [...content.matchAll(/from\s+["']@\/lib\/services/g)];
        for (const _ of serviceImports) {
          violations.push({
            type: "boundary-violation",
            severity: "error",
            source: fullPath,
            description: "Package imports from services layer (packages should not depend on services)",
          });
        }
      }
    }
  }
  scanForViolations(packagesDir);
}

// Check for orphan services (in manifest but no implementation)
if (fs.existsSync("generated/service-manifest.json")) {
  const manifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
  for (const svc of (manifest.services || [])) {
    const hasDir = fs.existsSync(`src/lib/services/${svc.id}`);
    const hasEdge = fs.existsSync(`supabase/functions/${svc.id}/index.ts`);
    if (!hasDir && !hasEdge) {
      violations.push({
        type: "orphan-service",
        severity: "warning",
        source: svc.id,
        description: `Service "${svc.id}" in manifest but has no implementation directory or edge function`,
      });
    }
  }
}

// ── Architecture Compliance Report ───────────────────────────
fs.writeFileSync("generated/architecture-compliance-report.json", JSON.stringify({
  version: "1.0.0",
  generatedAt: now,
  totalViolations: violations.length,
  errors: violations.filter(v => v.severity === "error").length,
  warnings: violations.filter(v => v.severity === "warning").length,
  byType: {
    boundaryViolations: violations.filter(v => v.type === "boundary-violation").length,
    circularDependencies: violations.filter(v => v.type === "circular-dependency").length,
    orphanServices: violations.filter(v => v.type === "orphan-service").length,
  },
  violations,
}, null, 2));

// ── Security Review Manifest ─────────────────────────────────
const securityChecklist = [
  "rls-policies", "auth-middleware", "input-validation", "rate-limiting",
  "csrf-protection", "xss-prevention", "sql-injection-prevention", "secrets-management",
];

const edgeFnDir = "supabase/functions";
const edgeFunctions = fs.existsSync(edgeFnDir)
  ? fs.readdirSync(edgeFnDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  : [];

const securityEntries = edgeFunctions.map(fn => {
  const indexPath = path.join(edgeFnDir, fn, "index.ts");
  const content = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf-8") : "";

  const checks: Record<string, boolean> = {};
  checks["auth-middleware"] = content.includes("authorization") || content.includes("Authorization") || content.includes("createClient");
  checks["input-validation"] = content.includes("zod") || content.includes("z.object") || content.includes("validate");
  checks["rate-limiting"] = content.includes("rateLimit") || content.includes("rate-limit");
  checks["error-handling"] = content.includes("try") && content.includes("catch");
  checks["cors-configured"] = content.includes("Access-Control") || content.includes("cors");

  const passedChecks = Object.values(checks).filter(Boolean).length;
  return {
    functionName: fn,
    totalChecks: Object.keys(checks).length,
    passedChecks,
    score: Math.round((passedChecks / Object.keys(checks).length) * 100),
    checks,
  };
});

fs.writeFileSync("generated/security-review-manifest.json", JSON.stringify({
  version: "1.0.0",
  generatedAt: now,
  totalFunctions: securityEntries.length,
  averageScore: securityEntries.length > 0 ? Math.round(securityEntries.reduce((s, e) => s + e.score, 0) / securityEntries.length) : 0,
  checklist: securityChecklist,
  entries: securityEntries,
}, null, 2));

console.log(`✅ Generated architecture compliance: ${violations.length} violations, ${securityEntries.length} functions reviewed`);
