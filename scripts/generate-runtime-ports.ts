#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Ports Generator
// Canonical port assignment per service (3000-3099 range)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; port?: number }[] = svcManifest.services || [];

// Assign canonical ports from service-manifest or derive sequentially
const portAssignments = services.map((svc, i) => ({
  serviceId: svc.id,
  serviceName: svc.name,
  port: svc.port || 3000 + i,
  protocol: "http",
  healthEndpoint: "/health",
  metricsEndpoint: "/metrics",
}));

// Check for port collisions
const portMap = new Map<number, string[]>();
for (const pa of portAssignments) {
  if (!portMap.has(pa.port)) portMap.set(pa.port, []);
  portMap.get(pa.port)!.push(pa.serviceId);
}
const collisions = [...portMap.entries()].filter(([, ids]) => ids.length > 1).map(([port, ids]) => ({ port, services: ids }));

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalPorts: portAssignments.length,
  portRange: { min: 3000, max: 3099 },
  collisions,
  assignments: portAssignments,
};

fs.writeFileSync("generated/runtime-ports.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated runtime ports: ${portAssignments.length} assignments, ${collisions.length} collisions`);
