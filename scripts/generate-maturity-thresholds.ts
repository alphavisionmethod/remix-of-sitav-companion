#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Maturity Thresholds Generator
// Defines maturity levels and maps services to them
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; status: string }[] = svcManifest.services || [];

const maturityLevels = [
  {
    level: "scaffold",
    description: "Interface defined, no implementation",
    gates: { hasTypes: true, hasImplementation: false, hasTests: false, hasEdgeFunction: false, hasRLS: false },
    exitCriteria: ["Define all contract types", "Create barrel export", "Add to service manifest"],
  },
  {
    level: "alpha",
    description: "Basic implementation, not production-ready",
    gates: { hasTypes: true, hasImplementation: true, hasTests: false, hasEdgeFunction: false, hasRLS: false },
    exitCriteria: ["Implement core business logic", "Add factory function", "Wire into kernel context"],
  },
  {
    level: "beta",
    description: "Feature-complete, needs hardening",
    gates: { hasTypes: true, hasImplementation: true, hasTests: true, hasEdgeFunction: true, hasRLS: false },
    exitCriteria: ["Add unit tests (>80% coverage)", "Deploy edge function", "Add error handling", "Add telemetry"],
  },
  {
    level: "ga",
    description: "Production-ready, fully hardened",
    gates: { hasTypes: true, hasImplementation: true, hasTests: true, hasEdgeFunction: true, hasRLS: true },
    exitCriteria: ["Enable RLS policies", "Pass security review", "Add performance budgets", "Documentation complete"],
  },
];

const statusToLevel: Record<string, string> = { skeleton: "scaffold", alpha: "alpha", beta: "beta", ga: "ga", stable: "ga" };

const serviceMaturity = services.map(svc => ({
  serviceId: svc.id,
  serviceName: svc.name,
  currentLevel: statusToLevel[svc.status] || "scaffold",
  nextLevel: svc.status === "ga" ? null : maturityLevels[maturityLevels.findIndex(m => m.level === (statusToLevel[svc.status] || "scaffold")) + 1]?.level || null,
  blockers: svc.status === "ga" ? [] : maturityLevels[maturityLevels.findIndex(m => m.level === (statusToLevel[svc.status] || "scaffold")) + 1]?.exitCriteria || [],
}));

const levelDistribution: Record<string, number> = {};
for (const sm of serviceMaturity) {
  levelDistribution[sm.currentLevel] = (levelDistribution[sm.currentLevel] || 0) + 1;
}

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: serviceMaturity.length,
  levelDistribution,
  maturityLevels,
  serviceMaturity,
};

fs.writeFileSync("generated/maturity-thresholds.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated maturity thresholds: ${serviceMaturity.length} services mapped`);
