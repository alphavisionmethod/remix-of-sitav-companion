/**
 * Validates all deploy service package.json files have required scripts.
 * Exit 1 if any service manifest is missing critical operational scripts.
 */
import * as fs from "fs";
import * as path from "path";

const REQUIRED_SCRIPTS = ["build", "start", "typecheck", "clean", "health-check", "ready-check", "test", "smoke"];
const DEPLOY_DIR = path.resolve("deploy");

interface ManifestResult {
  service: string;
  path: string;
  missing: string[];
  present: string[];
}

function checkManifest(manifestPath: string): ManifestResult | null {
  if (!fs.existsSync(manifestPath)) return null;
  const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const scripts = Object.keys(pkg.scripts || {});
  const missing = REQUIRED_SCRIPTS.filter((s) => !scripts.includes(s));
  return {
    service: pkg.name || path.dirname(manifestPath),
    path: manifestPath,
    missing,
    present: scripts,
  };
}

function main() {
  const violations: ManifestResult[] = [];

  // Find all package.json files under deploy/
  const entries = fs.readdirSync(DEPLOY_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(DEPLOY_DIR, entry.name, "package.json");
    const result = checkManifest(manifestPath);
    if (result && result.missing.length > 0) {
      violations.push(result);
    }
  }

  if (violations.length === 0) {
    console.log("✅ All service manifests have required scripts");
    process.exit(0);
  }

  console.error("❌ Service manifest completeness check failed:\n");
  for (const v of violations) {
    console.error(`  ${v.service} (${v.path})`);
    console.error(`    Missing: ${v.missing.join(", ")}`);
    console.error(`    Present: ${v.present.join(", ")}\n`);
  }
  process.exit(1);
}

main();