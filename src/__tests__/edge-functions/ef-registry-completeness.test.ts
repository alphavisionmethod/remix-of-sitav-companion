import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_AUTH_MAP } from "@/lib/backend-topology/edge-function-auth-map";
import { EDGE_FUNCTION_BACKEND_CATEGORY, EDGE_FUNCTION_CATEGORIES } from "@/lib/backend-topology/edge-function-categories";
import { EDGE_FUNCTION_BOUNDED_CONTEXTS } from "@/lib/backend-topology/edge-function-bounded-contexts";
import { EDGE_FUNCTION_CONTRACT_MAP } from "@/lib/backend-topology/edge-function-contract-map";
import { EDGE_FUNCTION_MIGRATION_MAP } from "@/lib/backend-topology/edge-function-migration-map";
import { EDGE_FUNCTION_AUTHORITY } from "@/lib/migration/edge-function-authority-map";

const FUNCTIONS_DIR = "supabase/functions";

function getOnDiskFunctions(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) return [];
  return fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
    .map(d => d.name)
    .filter(name => fs.existsSync(path.join(FUNCTIONS_DIR, name, "index.ts")));
}

describe("Edge Function Registry Completeness", () => {
  const onDisk = getOnDiskFunctions();
  const registryNames = new Set(EDGE_FUNCTION_REGISTRY.map(e => e.name));
  const authorityNames = new Set(EDGE_FUNCTION_AUTHORITY.map(e => e.name));

  it("registry count >= 200", () => {
    expect(EDGE_FUNCTION_REGISTRY.length).toBeGreaterThanOrEqual(200);
  });

  it("authority map count >= 200", () => {
    expect(EDGE_FUNCTION_AUTHORITY.length).toBeGreaterThanOrEqual(200);
  });

  it("zero orphans — every on-disk function is in EDGE_FUNCTION_REGISTRY", () => {
    const orphans = onDisk.filter(n => !registryNames.has(n));
    expect(orphans, `Orphans: ${orphans.join(", ")}`).toHaveLength(0);
  });

  it("zero phantoms — every registry entry has on-disk index.ts", () => {
    const phantoms = EDGE_FUNCTION_REGISTRY
      .map(e => e.name)
      .filter(n => !fs.existsSync(path.join(FUNCTIONS_DIR, n, "index.ts")));
    expect(phantoms, `Phantoms: ${phantoms.join(", ")}`).toHaveLength(0);
  });

  it("zero orphans in authority map", () => {
    const orphans = onDisk.filter(n => !authorityNames.has(n));
    expect(orphans, `Authority orphans: ${orphans.join(", ")}`).toHaveLength(0);
  });

  it("auth map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_AUTH_MAP[n]);
    expect(missing, `Missing from auth map: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("backend category map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_BACKEND_CATEGORY[n]);
    expect(missing, `Missing from backend category: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("legacy category map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_CATEGORIES[n]);
    expect(missing, `Missing from legacy categories: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("bounded context map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_BOUNDED_CONTEXTS[n]);
    expect(missing, `Missing from bounded contexts: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("contract map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_CONTRACT_MAP[n]);
    expect(missing, `Missing from contract map: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("migration map covers every registry entry", () => {
    const missing = EDGE_FUNCTION_REGISTRY.map(e => e.name).filter(n => !EDGE_FUNCTION_MIGRATION_MAP[n]);
    expect(missing, `Missing from migration map: ${missing.join(", ")}`).toHaveLength(0);
  });

  it("registry has unique names", () => {
    const names = EDGE_FUNCTION_REGISTRY.map(e => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});