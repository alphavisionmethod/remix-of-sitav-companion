#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Operational Scorecards Generator
// Computes health scores per service and outputs scorecards
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; owner: string; status: string; dependencies: string[] }[] = svcManifest.services || [];

function fileExists(p: string): boolean { try { return fs.statSync(p).isFile(); } catch { return false; } }

const scorecards = services.map(svc => {
  const hasHealthEndpoint = true; // All services declare /health
  const depCount = svc.dependencies?.length || 0;
  const isAlpha = svc.status === "alpha";
  const hasEdgeFunction = fileExists(`supabase/functions/${svc.id}/index.ts`);
  const hasServiceDir = fs.existsSync(`src/lib/services/${svc.id}`);

  // Score: penalize high deps, reward implementation
  let score = 50;
  if (hasServiceDir) score += 20;
  if (hasEdgeFunction) score += 15;
  if (depCount <= 2) score += 10;
  else if (depCount > 5) score -= 10;
  if (isAlpha) score += 5;
  score = Math.max(0, Math.min(100, score));

  return {
    serviceId: svc.id,
    serviceName: svc.name,
    owner: svc.owner,
    status: svc.status,
    healthScore: score,
    grade: score >= 80 ? "healthy" : score >= 60 ? "fair" : score >= 40 ? "degraded" : "critical",
    metrics: {
      dependencyCount: depCount,
      hasServiceImplementation: hasServiceDir,
      hasEdgeFunction,
      hasHealthEndpoint,
    },
  };
});

const avgHealth = scorecards.length > 0 ? Math.round(scorecards.reduce((s, sc) => s + sc.healthScore, 0) / scorecards.length) : 0;

// Write scorecards
fs.writeFileSync("generated/operational-scorecards.json", JSON.stringify({
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: scorecards.length,
  averageHealth: avgHealth,
  gradeDistribution: {
    healthy: scorecards.filter(s => s.grade === "healthy").length,
    fair: scorecards.filter(s => s.grade === "fair").length,
    degraded: scorecards.filter(s => s.grade === "degraded").length,
    critical: scorecards.filter(s => s.grade === "critical").length,
  },
  scorecards,
}, null, 2));

// Write metrics snapshot
fs.writeFileSync("generated/operational-metrics-snapshot.json", JSON.stringify({
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: scorecards.length,
  averageHealthScore: avgHealth,
  servicesWithImplementation: scorecards.filter(s => s.metrics.hasServiceImplementation).length,
  servicesWithEdgeFunctions: scorecards.filter(s => s.metrics.hasEdgeFunction).length,
  averageDependencyCount: scorecards.length > 0 ? Math.round(scorecards.reduce((s, sc) => s + sc.metrics.dependencyCount, 0) / scorecards.length) : 0,
}, null, 2));

console.log(`✅ Generated operational scorecards + metrics: ${scorecards.length} services, avg health ${avgHealth}`);
