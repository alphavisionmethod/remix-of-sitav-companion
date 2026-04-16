#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Maturity Thresholds Generator
// Scans actual file existence to determine real maturity levels
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; domain: string; status: string; path: string }[] = svcManifest.services || [];

// Collect edge function names
const edgeFunctions = new Set<string>();
if (fs.existsSync("supabase/functions")) {
  for (const d of fs.readdirSync("supabase/functions", { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== "_shared") edgeFunctions.add(d.name);
  }
}

function pathExists(p: string): boolean { try { fs.statSync(p); return true; } catch { return false; } }

const maturityLevels = [
  { level: "scaffold", description: "Interface defined, no implementation", gates: { hasTypes: true, hasImplementation: false, hasTests: false, hasEdgeFunction: false, hasRLS: false }, exitCriteria: ["Define all contract types", "Create barrel export", "Add to service manifest"] },
  { level: "alpha", description: "Basic implementation, not production-ready", gates: { hasTypes: true, hasImplementation: true, hasTests: false, hasEdgeFunction: false, hasRLS: false }, exitCriteria: ["Implement core business logic", "Add factory function", "Wire into kernel context"] },
  { level: "beta", description: "Feature-complete, needs hardening", gates: { hasTypes: true, hasImplementation: true, hasTests: true, hasEdgeFunction: true, hasRLS: false }, exitCriteria: ["Add unit tests (>80% coverage)", "Deploy edge function", "Add error handling", "Add telemetry"] },
  { level: "ga", description: "Production-ready, fully hardened", gates: { hasTypes: true, hasImplementation: true, hasTests: true, hasEdgeFunction: true, hasRLS: true }, exitCriteria: ["Enable RLS policies", "Pass security review", "Add performance budgets", "Documentation complete"] },
];

const serviceMaturity = services.map(svc => {
  const kebabName = svc.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const hasImpl = (svc.path && pathExists(svc.path)) || pathExists(`src/lib/services/${svc.name}`) || pathExists(`src/lib/services/${svc.domain}`);
  const hasTests = pathExists(`src/lib/services/${svc.domain}/__tests__`) || pathExists(`src/lib/services/__tests__`);
  const hasEdge = edgeFunctions.has(svc.name) || edgeFunctions.has(kebabName);

  // Determine actual maturity level from real file checks
  let currentLevel: string;
  if (hasImpl && hasTests && hasEdge) currentLevel = "beta";
  else if (hasImpl && hasEdge) currentLevel = "alpha";
  else if (hasImpl) currentLevel = "alpha";
  else currentLevel = "scaffold";

  const currentIdx = maturityLevels.findIndex(m => m.level === currentLevel);
  const nextLevel = currentIdx < maturityLevels.length - 1 ? maturityLevels[currentIdx + 1]?.level : null;
  const blockers = nextLevel ? maturityLevels[currentIdx + 1]?.exitCriteria || [] : [];

  return {
    serviceId: svc.id || svc.name,
    serviceName: svc.name,
    currentLevel,
    hasImplementation: hasImpl,
    hasTests,
    hasEdgeFunction: hasEdge,
    nextLevel,
    blockers,
  };
});

const levelDistribution: Record<string, number> = {};
for (const sm of serviceMaturity) {
  levelDistribution[sm.currentLevel] = (levelDistribution[sm.currentLevel] || 0) + 1;
}

fs.writeFileSync("generated/maturity-thresholds.json", JSON.stringify({
  version: "1.1.0",
  generatedAt: new Date().toISOString(),
  totalServices: serviceMaturity.length,
  levelDistribution,
  maturityLevels,
  serviceMaturity,
}, null, 2));

console.log(`✅ Generated maturity thresholds: ${JSON.stringify(levelDistribution)}`);
