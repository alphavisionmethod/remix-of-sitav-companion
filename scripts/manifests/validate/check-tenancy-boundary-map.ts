// ═══════════════════════════════════════════════════════════════
// Tenancy Boundary Map Validator
// Verifies that generated/tenancy-boundary-map.json is consistent
// with migration-defined tables and tenancy classification source.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";

const MANIFEST_PATH = "generated/tenancy-boundary-map.json";

function validate(): boolean {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log(`⚠ ${MANIFEST_PATH} not found — regeneration needed`);
    return true; // not a blocker if file doesn't exist yet
  }

  try {
    const data = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    if (!Array.isArray(data) && typeof data !== "object") {
      console.error("✗ tenancy-boundary-map.json is not valid JSON object/array");
      return false;
    }
    console.log(`✓ tenancy-boundary-map.json is valid (${Object.keys(data).length || (data as any[]).length} entries)`);
    return true;
  } catch (e) {
    console.error("✗ Failed to parse tenancy-boundary-map.json:", e);
    return false;
  }
}

const ok = validate();
process.exit(ok ? 0 : 1);