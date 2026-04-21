#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Service Boundary & Dependency Lint
//
// Enforces:
//   1. No new service dir without a matching SERVICE_OWNERSHIP_REGISTRY entry
//   2. No cross-domain imports that violate ownership boundaries
//   3. No shadow service creation (duplicate capabilities)
//   4. Every domain service declares a justification (notes field)
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ViolationCollector, writeJsonOutput, scanDir } from "../lib/utils";
import { SERVICE_OWNERSHIP_REGISTRY } from "../../../src/lib/services/service-registry/service-ownership-registry";

const vc = new ViolationCollector();
const OUT_PATH = "generated/service-boundary-lint.json";

// ── 1. Registered domains vs actual directories ────────────────

const DOMAIN_DIRS = [
  "src/lib/core-services",
  "src/lib/services",
  "src/lib/data-services",
];

const registeredDomains = new Set(SERVICE_OWNERSHIP_REGISTRY.map(e => e.domain));
const registeredServices = new Set(SERVICE_OWNERSHIP_REGISTRY.map(e => e.primaryService));
const allCapabilities = SERVICE_OWNERSHIP_REGISTRY.flatMap(e => e.capabilities);

interface ServiceDirEntry {
  dir: string;
  path: string;
  hasRegistryEntry: boolean;
}

const discoveredDirs: ServiceDirEntry[] = [];

for (const base of DOMAIN_DIRS) {
  if (!existsSync(base)) continue;
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    
    const dirName = entry.name;
    const fullPath = join(base, dirName);
    
    // Check if this service dir maps to any registered domain or service
    const matchesDomain = registeredDomains.has(dirName);
    const matchesService = SERVICE_OWNERSHIP_REGISTRY.some(e =>
      e.primaryService.includes(dirName) ||
      e.dependentServices.some(d => d.includes(dirName))
    );
    
    const hasEntry = matchesDomain || matchesService;
    discoveredDirs.push({ dir: dirName, path: fullPath, hasRegistryEntry: hasEntry });
    
    if (!hasEntry) {
      vc.add(fullPath, "unregistered-service", `Service dir '${dirName}' has no SERVICE_OWNERSHIP_REGISTRY entry — add domain justification`);
    }
  }
}

// ── 2. Cross-domain import violations ──────────────────────────

interface ImportViolation {
  file: string;
  importPath: string;
  sourceDomain: string;
  targetDomain: string;
}

const importViolations: ImportViolation[] = [];

// Build domain → paths mapping
const domainPaths: Record<string, string[]> = {};
for (const entry of SERVICE_OWNERSHIP_REGISTRY) {
  domainPaths[entry.domain] = [
    ...(domainPaths[entry.domain] ?? []),
    entry.primaryService,
    ...entry.dependentServices,
  ];
}

// Scan service files for cross-boundary imports
for (const base of DOMAIN_DIRS) {
  const files = scanDir(base, [".ts", ".tsx"]);
  for (const file of files) {
    if (file.includes("__tests__") || file.includes(".test.") || file.includes(".spec.")) continue;
    
    const content = readFileSync(file, "utf-8");
    const sourceDomain = SERVICE_OWNERSHIP_REGISTRY.find(e =>
      file.includes(e.primaryService) || e.dependentServices.some(d => file.includes(d))
    )?.domain;
    
    if (!sourceDomain) continue;
    
    // Find imports to other domain services
    const importPattern = /from\s+["'](@\/lib\/(?:core-services|services|data-services)\/([^/"']+))/g;
    let match: RegExpExecArray | null;
    while ((match = importPattern.exec(content)) !== null) {
      const importedServiceDir = match[2];
      const targetDomain = SERVICE_OWNERSHIP_REGISTRY.find(e =>
        e.primaryService.includes(importedServiceDir) || e.dependentServices.some(d => d.includes(importedServiceDir))
      )?.domain;
      
      if (targetDomain && targetDomain !== sourceDomain) {
        // Cross-domain import — check if it's declared as a dependency
        const sourceEntry = SERVICE_OWNERSHIP_REGISTRY.find(e => e.domain === sourceDomain);
        const isDeclaredDep = sourceEntry?.dependentServices.some(d => d.includes(importedServiceDir));
        
        if (!isDeclaredDep) {
          importViolations.push({
            file,
            importPath: match[1],
            sourceDomain,
            targetDomain,
          });
          vc.add(file, "cross-domain-import", `Undeclared cross-domain import: ${sourceDomain} → ${targetDomain} via '${importedServiceDir}'`, "warning");
        }
      }
    }
  }
}

// ── 3. Duplicate capability detection ──────────────────────────

const capCounts: Record<string, string[]> = {};
for (const entry of SERVICE_OWNERSHIP_REGISTRY) {
  for (const cap of entry.capabilities) {
    capCounts[cap] = [...(capCounts[cap] ?? []), entry.domain];
  }
}

const duplicateCaps = Object.entries(capCounts)
  .filter(([, domains]) => domains.length > 1)
  .map(([cap, domains]) => ({ capability: cap, claimedBy: domains }));

for (const dup of duplicateCaps) {
  vc.add("SERVICE_OWNERSHIP_REGISTRY", "duplicate-capability", `Capability '${dup.capability}' claimed by multiple domains: ${dup.claimedBy.join(", ")}`, "warning");
}

// ── 4. Missing justification ───────────────────────────────────

const missingJustification = SERVICE_OWNERSHIP_REGISTRY.filter(e => !e.notes || e.notes.trim().length < 10);
for (const entry of missingJustification) {
  vc.add(`domain:${entry.domain}`, "missing-justification", `Domain '${entry.domain}' lacks meaningful justification in notes field`, "warning");
}

// ── 5. Shadow service risk ─────────────────────────────────────

const highShadowRisk = SERVICE_OWNERSHIP_REGISTRY.filter(e => e.shadowServiceRisk === "high");
for (const entry of highShadowRisk) {
  vc.add(`domain:${entry.domain}`, "high-shadow-risk", `Domain '${entry.domain}' has HIGH shadow service risk — consolidation recommended`, "warning");
}

// ── Output ─────────────────────────────────────────────────────

const report = {
  generatedAt: new Date().toISOString(),
  gate: "service-boundary-lint",
  ok: vc.errors.length === 0,
  totalRegisteredDomains: registeredDomains.size,
  totalDiscoveredServiceDirs: discoveredDirs.length,
  unregisteredDirs: discoveredDirs.filter(d => !d.hasRegistryEntry).length,
  crossDomainViolations: importViolations.length,
  duplicateCapabilities: duplicateCaps.length,
  highShadowRiskDomains: highShadowRisk.length,
  errorCount: vc.errors.length,
  warningCount: vc.warnings.length,
  unregisteredServices: discoveredDirs.filter(d => !d.hasRegistryEntry).map(d => d.dir),
  duplicateCaps,
  importViolations: importViolations.slice(0, 50),
};

writeJsonOutput(OUT_PATH, report);
vc.report("check-service-boundary-lint");

console.log(`\n📊 Service Boundary Lint: ${registeredDomains.size} domains, ${discoveredDirs.length} dirs`);
console.log(`   Unregistered: ${report.unregisteredDirs} | Cross-domain: ${importViolations.length} | Dup caps: ${duplicateCaps.length}`);

if (vc.errors.length > 0) {
  console.log(`\n❌ ${vc.errors.length} service boundary violations`);
  process.exit(1);
} else {
  console.log(`\n✅ Service boundaries pass (${vc.warnings.length} warnings)`);
}