#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Route Drift Detector
// Finds duplicate route paths and orphaned page files
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

// Extract route paths from App.tsx
const appContent = readFileSync("src/App.tsx", "utf-8");
const routeMatches = [...appContent.matchAll(/path=["']([^"']+)["']/g)];
const paths = routeMatches.map(m => m[1]);

// Check for duplicates
const pathCounts = new Map<string, number>();
for (const p of paths) {
  pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
}

const duplicatePaths = [...pathCounts.entries()].filter(([, c]) => c > 1);

// Find page files not referenced in App.tsx
function walk(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else if (full.endsWith(".tsx")) results.push(full);
  }
  return results;
}

const pageFiles = walk("src/pages");
const orphaned: string[] = [];
for (const pf of pageFiles) {
  // Extract component name
  const content = readFileSync(pf, "utf-8");
  const defaultExport = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultExport) {
    const name = defaultExport[1];
    if (!appContent.includes(name)) {
      orphaned.push(`${pf} (export: ${name})`);
    }
  }
}

let issues = 0;

if (duplicatePaths.length > 0) {
  console.warn(`⚠️  ${duplicatePaths.length} duplicate route path(s):`);
  for (const [path, count] of duplicatePaths) {
    console.warn(`  "${path}" appears ${count} times`);
  }
  issues += duplicatePaths.length;
}

if (orphaned.length > 0) {
  console.warn(`\n⚠️  ${orphaned.length} page file(s) not referenced in App.tsx:`);
  for (const o of orphaned.slice(0, 10)) {
    console.warn(`  ${o}`);
  }
  if (orphaned.length > 10) console.warn(`  ... and ${orphaned.length - 10} more`);
}

if (issues === 0 && orphaned.length === 0) {
  console.log(`✅ Route integrity check passed — ${paths.length} routes, no drift`);
} else {
  console.log(`\n📊 ${paths.length} routes total, ${duplicatePaths.length} duplicates, ${orphaned.length} orphaned pages`);
}
