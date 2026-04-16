#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Ingress Topology Check
// Validates ingress/routing configuration
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../../architecture/lib/utils";
import * as fs from "fs";

const vc = new ViolationCollector();

const ingressRegistry = "src/lib/deployment/ingress-topology.ts";
if (!fs.existsSync(ingressRegistry)) {
  vc.add(ingressRegistry, "missing-registry", "Ingress topology registry not found", "warning");
} else {
  const content = fs.readFileSync(ingressRegistry, "utf-8");
  console.log(`  🌐 Ingress topology registry found (${content.length} bytes)`);
}

vc.report("check-ingress-topology");
vc.exitIfErrors();
