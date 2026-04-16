#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Operational Scorecards Generator
// Computes health scores per service and outputs scorecards
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; domain: string; owner: string; status: string; dependencies: string[]; path: string }[] = svcManifest.services || [];

function pathExists(p: string): boolean { try { return fs.statSync(p).isFile() || fs.statSync(p).isDirectory(); } catch { return false; } }

// Collect edge function names for matching
const edgeFnDir = "supabase/functions";
const edgeFunctions = new Set<string>();
if (fs.existsSync(edgeFnDir)) {
  for (const d of fs.readdirSync(edgeFnDir, { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== "_shared") edgeFunctions.add(d.name);
  }
}

const scorecards = services.map(svc => {
  const depCount = svc.dependencies?.length || 0;

  // Check actual implementation: the service has a real file path from the manifest
  const hasServiceImpl = svc.path ? pathExists(svc.path) : false;
  // Check service directory by domain
  const hasServiceDir = pathExists(`src/lib/services/${svc.domain}`) || pathExists(`src/lib/services/${svc.name}`);
  // Check if a matching edge function exists (by name or kebab-case)
  const kebabName = svc.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  const hasEdgeFunction = edgeFunctions.has(svc.name) || edgeFunctions.has(kebabName) || edgeFunctions.has(svc.id || "");

  // Score: reward real implementation presence
  let score = 40;
  if (hasServiceImpl || hasServiceDir) score += 25;
  if (hasEdgeFunction) score += 20;
  if (depCount <= 2) score += 10;
  else if (depCount > 5) score -= 5;
  if (svc.status === "alpha" || svc.status === "beta") score += 5;
  score = Math.max(0, Math.min(100, score));

  return {
    serviceId: svc.id || svc.name,
    serviceName: svc.name,
    owner: svc.owner || svc.domain,
    status: svc.status || "active",
    healthScore: score,
    grade: score >= 80 ? "healthy" : score >= 60 ? "fair" : score >= 40 ? "degraded" : "critical",
    metrics: {
      dependencyCount: depCount,
      hasServiceImplementation: hasServiceImpl || hasServiceDir,
      hasEdgeFunction,
      hasHealthEndpoint: true,
    },
  };
});

const avgHealth = scorecards.length > 0 ? Math.round(scorecards.reduce((s, sc) => s + sc.healthScore, 0) / scorecards.length) : 0;

fs.writeFileSync("generated/operational-scorecards.json", JSON.stringify({
  version: "1.1.0",
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

fs.writeFileSync("generated/operational-metrics-snapshot.json", JSON.stringify({
  version: "1.1.0",
  generatedAt: new Date().toISOString(),
  totalServices: scorecards.length,
  averageHealthScore: avgHealth,
  servicesWithImplementation: scorecards.filter(s => s.metrics.hasServiceImplementation).length,
  servicesWithEdgeFunctions: scorecards.filter(s => s.metrics.hasEdgeFunction).length,
  averageDependencyCount: scorecards.length > 0 ? Math.round(scorecards.reduce((s, sc) => s + sc.metrics.dependencyCount, 0) / scorecards.length) : 0,
}, null, 2));

console.log(`✅ Generated operational scorecards + metrics: ${scorecards.length} services, avg health ${avgHealth}`);
