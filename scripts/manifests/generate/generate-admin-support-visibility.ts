#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Support Visibility Manifest Generator
// Scans admin contracts and determines which endpoints
// are visible to support roles
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface VisibilityEntry {
  endpointId: string;
  name: string;
  domain: string;
  supportVisible: boolean;
  requiresElevation: boolean;
  auditRequired: boolean;
  visibleFields: string[];
  redactedFields: string[];
}

const entries: VisibilityEntry[] = [];

// Scan admin contracts for exported interfaces
const adminDir = "src/packages/contracts/admin";
if (fs.existsSync(adminDir)) {
  for (const file of fs.readdirSync(adminDir).filter(f => f.endsWith(".ts"))) {
    const content = fs.readFileSync(path.join(adminDir, file), "utf-8");
    const interfaces = [...content.matchAll(/export\s+interface\s+(\w+)/g)].map(m => m[1]);
    for (const iface of interfaces) {
      const isSession = iface.toLowerCase().includes("session");
      const isAudit = iface.toLowerCase().includes("audit");
      const isPolicy = iface.toLowerCase().includes("policy");

      entries.push({
        endpointId: iface.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1),
        name: iface,
        domain: "admin",
        supportVisible: isAudit || isSession,
        requiresElevation: isPolicy || isSession,
        auditRequired: true,
        visibleFields: isAudit ? ["id", "action", "timestamp", "result"] : isSession ? ["sessionId", "role", "startedAt"] : [],
        redactedFields: isSession ? ["deviceId", "ipAddress"] : isAudit ? ["ipAddress", "details"] : [],
      });
    }
  }
}

// Add diagnostic bundle visibility
entries.push({
  endpointId: "diagnostic-bundle",
  name: "DiagnosticBundle",
  domain: "support",
  supportVisible: true,
  requiresElevation: false,
  auditRequired: true,
  visibleFields: ["bundleId", "createdAt", "serviceHealth", "errorSummary"],
  redactedFields: ["userIdentity", "financialData", "personalInfo"],
});

// Add observability visibility
entries.push({
  endpointId: "observability-metrics",
  name: "ObservabilityMetrics",
  domain: "platform",
  supportVisible: true,
  requiresElevation: false,
  auditRequired: false,
  visibleFields: ["serviceId", "latencyP50", "latencyP99", "errorRate", "uptime"],
  redactedFields: [],
});

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalEndpoints: entries.length,
  supportVisible: entries.filter(e => e.supportVisible).length,
  requiresElevation: entries.filter(e => e.requiresElevation).length,
  entries,
};

fs.writeFileSync("generated/admin-support-visibility-manifest.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated admin support visibility: ${entries.length} endpoints, ${entries.filter(e => e.supportVisible).length} support-visible`);
