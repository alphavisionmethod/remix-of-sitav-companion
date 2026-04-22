// ═══════════════════════════════════════════════════════════════
// SITA OS — Wave Route Inventory Pre-Check
//
// Confirms every route path referenced in CONSOLIDATION_WAVES
// actually exists in the app router before Playwright runs.
// Exit code 1 if any missing routes are found.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { CONSOLIDATION_WAVES } from "../../src/lib/admin/consolidation-wave-registry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");

// ── Extract all route paths from the router source files ──
function extractRouterPaths(): Set<string> {
  const routePaths = new Set<string>();

  // Scan App.tsx and all route files for path="..." patterns
  const routeFiles = [
    "src/App.tsx",
    ...fs.readdirSync(path.join(ROOT, "src/routes"))
      .filter(f => f.endsWith(".tsx") || f.endsWith(".ts"))
      .map(f => `src/routes/${f}`),
  ];

  const pathRegex = /path=["']([^"']+)["']/g;

  for (const file of routeFiles) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, "utf-8");
    let match: RegExpExecArray | null;
    while ((match = pathRegex.exec(content)) !== null) {
      routePaths.add(match[1]);
    }
  }

  return routePaths;
}

// ── Check wave routes against router ──
function checkWaveRoutes() {
  const routerPaths = extractRouterPaths();
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalChecked = 0;

  console.log(`\n🗺️  Route Inventory Pre-Check`);
  console.log(`   Router paths found: ${routerPaths.size}`);
  console.log(`   Waves to check: ${CONSOLIDATION_WAVES.length}\n`);

  for (const wave of CONSOLIDATION_WAVES) {
    const waveErrors: string[] = [];

    for (const route of wave.affectedRoutes) {
      totalChecked++;
      const routePath = route.path;

      // Exact match
      if (routerPaths.has(routePath)) continue;

      // Check if it's a sub-route of a wildcard (e.g. /admin/* catches /admin/foo)
      const wildcardMatch = [...routerPaths].some(rp => {
        if (rp.endsWith("/*") || rp.endsWith("*")) {
          const prefix = rp.replace(/\/?\*$/, "");
          return routePath === prefix || routePath.startsWith(prefix + "/");
        }
        return false;
      });

      if (wildcardMatch) continue;

      // Check if a parent route exists (nested routing)
      const segments = routePath.split("/").filter(Boolean);
      let parentFound = false;
      for (let i = segments.length - 1; i >= 1; i--) {
        const parent = "/" + segments.slice(0, i).join("/");
        if (routerPaths.has(parent) || routerPaths.has(parent + "/*")) {
          parentFound = true;
          break;
        }
      }

      if (parentFound) continue;

      // For post-wave "removed" routes, missing is expected
      if (route.postWave === "removed" && wave.status === "completed") {
        warnings.push(`  ⚠️  [${wave.id}] ${routePath} — removed (expected missing)`);
        continue;
      }

      waveErrors.push(`  ❌  [${wave.id}] ${routePath} (${route.label}) — NOT in router`);
    }

    // Also check workflow critical routes
    for (const wf of wave.affectedWorkflows) {
      for (const critRoute of wf.criticalRoutes) {
        totalChecked++;
        if (routerPaths.has(critRoute)) continue;

        const wildcardMatch = [...routerPaths].some(rp => {
          if (rp.endsWith("/*") || rp.endsWith("*")) {
            const prefix = rp.replace(/\/?\*$/, "");
            return critRoute === prefix || critRoute.startsWith(prefix + "/");
          }
          return false;
        });
        if (wildcardMatch) continue;

        waveErrors.push(`  ❌  [${wave.id}] workflow "${wf.name}" → ${critRoute} — NOT in router`);
      }
    }

    if (waveErrors.length === 0) {
      console.log(`  ✅  Wave ${wave.id} (${wave.name}): all routes found`);
    } else {
      errors.push(...waveErrors);
      console.log(`  ❌  Wave ${wave.id} (${wave.name}): ${waveErrors.length} missing`);
    }
  }

  console.log(`\n── Summary ──`);
  console.log(`   Total route references checked: ${totalChecked}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  if (warnings.length > 0) {
    console.log(`\n── Warnings ──`);
    warnings.forEach(w => console.log(w));
  }

  if (errors.length > 0) {
    console.log(`\n── Errors ──`);
    errors.forEach(e => console.log(e));
    console.log(`\n💥 Route inventory check FAILED — ${errors.length} wave routes missing from router.`);
    process.exit(1);
  }

  console.log(`\n✅ Route inventory check PASSED.\n`);
}

checkWaveRoutes();