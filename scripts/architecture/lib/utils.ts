#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Validation Shared Utilities
// Common functions used by all architecture and validation scripts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// ── Directory scanning ─────────────────────────────────────────

export function scanDir(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.startsWith(".")) {
      files.push(...scanDir(full, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

export function scanDirShallow(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

// ── JSON helpers ───────────────────────────────────────────────

export function readJsonSafe<T = any>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function writeJsonOutput(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

// ── Source analysis ────────────────────────────────────────────

export function extractExports(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const exports: string[] = [];
    const patterns = [
      /export\s+(?:interface|type|class|enum|function|const|let|var)\s+(\w+)/g,
      /export\s+\{\s*([^}]+)\s*\}/g,
      /export\s+default\s+(?:class|function)?\s*(\w+)?/g,
    ];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          match[1].split(",").forEach(e => {
            const name = e.trim().split(/\s+as\s+/).pop()?.trim();
            if (name) exports.push(name);
          });
        }
      }
    }
    return exports;
  } catch {
    return [];
  }
}

export function extractImports(filePath: string): Array<{ source: string; specifiers: string[] }> {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const imports: Array<{ source: string; specifiers: string[] }> = [];
    const pattern = /import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+["']([^"']+)["']/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const specifiers = match[1]
        ? match[1].split(",").map(s => s.trim().split(/\s+as\s+/).pop()?.trim() || "")
        : match[2] ? [match[2]] : [];
      imports.push({ source: match[3], specifiers: specifiers.filter(Boolean) });
    }
    return imports;
  } catch {
    return [];
  }
}

export function matchImports(content: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  const importRegex = /import\s+.*?from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    if (pattern.test(match[1])) {
      matches.push(match[1]);
    }
  }
  return matches;
}

export function fileContains(filePath: string, pattern: RegExp): boolean {
  try {
    return pattern.test(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return false;
  }
}

export function readFileContent(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

// ── Domain classifiers ─────────────────────────────────────────

export const DOMAIN_MODULES = ["business-os", "finance-os", "concierge-os"] as const;
export const PLATFORM_DOMAINS = ["platform", "brain-core", "shared", "contracts"] as const;

export function classifyServiceDomain(serviceName: string): string {
  if (serviceName.includes("business") || serviceName.includes("crm") || serviceName.includes("customer")) return "business-os";
  if (serviceName.includes("finance") || serviceName.includes("billing") || serviceName.includes("capital")) return "finance-os";
  if (serviceName.includes("concierge") || serviceName.includes("household") || serviceName.includes("family")) return "concierge-os";
  return "platform";
}

export function classifyServiceOwner(serviceName: string): string {
  const domain = classifyServiceDomain(serviceName);
  const ownerMap: Record<string, string> = {
    "business-os": "business-team",
    "finance-os": "finance-team",
    "concierge-os": "concierge-team",
    "platform": "platform-team",
  };
  return ownerMap[domain] || "platform-team";
}

// ── Service discovery ──────────────────────────────────────────

export function discoverServiceDirs(): string[] {
  const servicesRoot = "src/lib/services";
  if (!fs.existsSync(servicesRoot)) return [];
  return fs.readdirSync(servicesRoot, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

export function discoverPackageDirs(): string[] {
  const packagesRoot = "src/packages";
  if (!fs.existsSync(packagesRoot)) return [];
  return fs.readdirSync(packagesRoot, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);
}

// ── Violation tracking ─────────────────────────────────────────

export interface Violation {
  file: string;
  rule: string;
  detail: string;
  severity?: "error" | "warning";
}

export class ViolationCollector {
  violations: Violation[] = [];

  add(file: string, rule: string, detail: string, severity: "error" | "warning" = "error") {
    this.violations.push({ file, rule, detail, severity });
  }

  get errors() {
    return this.violations.filter(v => v.severity === "error");
  }

  get warnings() {
    return this.violations.filter(v => v.severity === "warning");
  }

  report(scriptName: string): void {
    if (this.violations.length === 0) {
      console.log(`✅ ${scriptName}: All checks passed`);
      return;
    }
    const errors = this.errors;
    const warnings = this.warnings;
    if (errors.length > 0) {
      console.error(`❌ ${scriptName}: ${errors.length} error(s), ${warnings.length} warning(s)`);
    } else {
      console.warn(`⚠️ ${scriptName}: ${warnings.length} warning(s)`);
    }
    for (const v of this.violations) {
      const icon = v.severity === "error" ? "  ❌" : "  ⚠️";
      console.log(`${icon} [${v.rule}] ${v.file}: ${v.detail}`);
    }
  }

  exitIfErrors(): void {
    if (this.errors.length > 0) process.exit(1);
  }
}

// ── Manifest helpers ───────────────────────────────────────────

export function loadServiceManifest(): any {
  return readJsonSafe("generated/service-manifest.json");
}

export function loadRouteManifest(): any {
  return readJsonSafe("generated/route-manifest.json");
}

export function loadCapabilityIndex(): any {
  return readJsonSafe("generated/capability-index.json");
}

export function loadConnectorCatalog(): any {
  return readJsonSafe("generated/connector-catalog.json");
}

export function loadAdvisorRegistry(): any {
  return readJsonSafe("generated/advisor-registry.json");
}

export function getServiceList(): string[] {
  const manifest = loadServiceManifest();
  if (!manifest?.services) return discoverServiceDirs();
  return manifest.services.map((s: any) => s.id || s.name);
}

export function envelope(version: string, data: Record<string, any>): Record<string, any> {
  return { version, generatedAt: new Date().toISOString(), ...data };
}
