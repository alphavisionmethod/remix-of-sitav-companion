#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Tier Deployment Map Generator
// Maps deployment artifacts to their canonical runtime tier owner.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface DeploymentTierEntry {
  artifact: string;
  pathGlob: string;
  tier: "WEB_APP" | "DESKTOP_HOST" | "APPLIANCE_RUNTIME" | "SIMULATED_OS_EXPERIENCE" | "CROSS_TIER";
  buildTarget: string;
  runtime: string;
  deploymentTarget: string;
  notes: string;
}

const ENTRIES: DeploymentTierEntry[] = [
  {
    artifact: "Product Web SPA",
    pathGlob: "dist/**",
    tier: "WEB_APP",
    buildTarget: "vite build",
    runtime: "Browser (Chromium/Safari/Firefox)",
    deploymentTarget: "CDN / Lovable hosting",
    notes: "Browser-sandbox-bound. May render simulated OS UX (Tier 4) but never claims host authority.",
  },
  {
    artifact: "Electron Desktop Host",
    pathGlob: "electron/**",
    tier: "DESKTOP_HOST",
    buildTarget: "@electron/packager",
    runtime: "Electron (Chromium + Node)",
    deploymentTarget: "GitHub Releases / DMG / EXE / AppImage",
    notes: "Wraps WEB_APP with desktop-host bridge (FS, native notifications, tray, auto-update).",
  },
  {
    artifact: "Bootable ISO Appliance",
    pathGlob: "scripts/release/appliance/build-iso.sh",
    tier: "APPLIANCE_RUNTIME",
    buildTarget: "build-iso.sh (Ubuntu 24.04 + cloud-init)",
    runtime: "Bare metal / VM / VMware ESXi",
    deploymentTarget: "ISO image (xorriso)",
    notes: "First-boot ceremony, OTA agent, recovery scripts. Only tier with honest 'managed runtime authority'.",
  },
  {
    artifact: "Edge Functions",
    pathGlob: "supabase/functions/**",
    tier: "CROSS_TIER",
    buildTarget: "Deno deploy (auto via Lovable Cloud)",
    runtime: "Deno",
    deploymentTarget: "Supabase Edge Functions",
    notes: "Backend authority — consumed by all tiers via HTTPS.",
  },
  {
    artifact: "Database Schema",
    pathGlob: "supabase/migrations/**",
    tier: "CROSS_TIER",
    buildTarget: "supabase migration",
    runtime: "PostgreSQL 15",
    deploymentTarget: "Lovable Cloud Postgres",
    notes: "Single source of persisted truth across all tiers.",
  },
  {
    artifact: "Simulated OS Shell",
    pathGlob: "src/components/sita/shell/**",
    tier: "SIMULATED_OS_EXPERIENCE",
    buildTarget: "vite build (bundled with WEB_APP)",
    runtime: "Browser",
    deploymentTarget: "Bundled with Product Web SPA",
    notes: "Pure UX layer. Dock, lock screen, mission control. Never claims host privilege.",
  },
];

const summary = {
  generatedAt: new Date().toISOString(),
  tierCount: 4,
  entryCount: ENTRIES.length,
  byTier: {
    WEB_APP: ENTRIES.filter((e) => e.tier === "WEB_APP").length,
    DESKTOP_HOST: ENTRIES.filter((e) => e.tier === "DESKTOP_HOST").length,
    APPLIANCE_RUNTIME: ENTRIES.filter((e) => e.tier === "APPLIANCE_RUNTIME").length,
    SIMULATED_OS_EXPERIENCE: ENTRIES.filter((e) => e.tier === "SIMULATED_OS_EXPERIENCE").length,
    CROSS_TIER: ENTRIES.filter((e) => e.tier === "CROSS_TIER").length,
  },
  entries: ENTRIES,
};

const outDir = "generated";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "runtime-tier-deployment-map.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

console.log(`📦 Runtime Tier Deployment Map: ${ENTRIES.length} entries`);
console.log(`   - generated/runtime-tier-deployment-map.json`);
