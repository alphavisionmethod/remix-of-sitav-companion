#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Ingress Topology
// Produces generated/ingress-topology.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const registry = "src/lib/deployment/ingress-topology.ts";
const topology: Array<{ layer: string; role: string; status: string }> = [];

if (fs.existsSync(registry)) {
  const content = fs.readFileSync(registry, "utf-8");
  // Extract ingress entries
  if (content.includes("nginx")) topology.push({ layer: "edge", role: "nginx", status: "configured" });
  if (content.includes("traefik")) topology.push({ layer: "edge", role: "traefik", status: "configured" });
  if (content.includes("kong")) topology.push({ layer: "api-gateway", role: "kong", status: "configured" });
  if (content.includes("supabase")) topology.push({ layer: "backend", role: "supabase", status: "active" });
}

// Always include web app
topology.push({ layer: "frontend", role: "vite-spa", status: "active" });

writeJsonOutput("generated/ingress-topology.json", envelope("1.0.0", {
  totalLayers: topology.length,
  topology,
}));

console.log(`✅ generate-ingress-topology: ${topology.length} ingress layers mapped`);
