#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Command Palette Coherence Check (Phase 2)
// Asserts the palette only references canonical, non-deprecated
// routes from the admin-route-registry. Catches drift before it
// can mislead operators.
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector } from "../lib/utils";
import * as fs from "fs";
import * as path from "path";

const vc = new ViolationCollector();

const palettePath = "src/components/admin/AdminCommandPalette.tsx";
const registryPath = "src/lib/architecture/admin-route-registry.ts";

if (!fs.existsSync(palettePath)) {
  vc.add(palettePath, "missing-palette", "AdminCommandPalette.tsx not found", "warning");
} else if (!fs.existsSync(registryPath)) {
  vc.add(registryPath, "missing-registry", "admin-route-registry.ts not found");
} else {
  const paletteSrc = fs.readFileSync(palettePath, "utf-8");
  const registrySrc = fs.readFileSync(registryPath, "utf-8");

  // The canonical palette is registry-driven (no inline NAV_ITEMS arrays).
  // Detect regressions where a developer hard-codes routes again.
  const HARDCODED_ROUTE_REGEX = /path:\s*["']\/admin\/[^"']+["']/g;
  const hardcoded = paletteSrc.match(HARDCODED_ROUTE_REGEX) ?? [];
  if (hardcoded.length > 0) {
    vc.add(
      palettePath,
      "hardcoded-routes",
      `Palette contains ${hardcoded.length} hard-coded route path(s); routes must come from admin-route-registry`,
    );
  }

  // Confirm the palette imports from the registry.
  if (!paletteSrc.includes("@/lib/architecture/admin-route-registry")) {
    vc.add(palettePath, "no-registry-import", "Palette must import from admin-route-registry");
  }

  // Confirm the registry actually exports the symbols the palette relies on.
  const required = ["ADMIN_DOMAINS", "ADMIN_ROUTE_REGISTRY", "DOMAIN_LABELS"];
  for (const sym of required) {
    if (!registrySrc.includes(`export const ${sym}`) && !registrySrc.includes(`export function ${sym}`)) {
      vc.add(registryPath, "missing-export", `Registry missing required export: ${sym}`);
    }
  }

  console.log(`  ✅ Palette is registry-driven (${hardcoded.length} hard-coded paths)`);
}

vc.report("check-admin-command-palette-coherence");
vc.exitIfErrors();
