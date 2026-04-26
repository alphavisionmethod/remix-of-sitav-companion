// ═══════════════════════════════════════════════════════
// SITA OS — Playwright Global Teardown
// Cleans up auth state and temporary evidence files
// ═══════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ESM-safe __dirname.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_STATE_PATH = path.join(__dirname, "../../test-results/.auth/state.json");

async function globalTeardown() {
  // Clean up auth state file
  try {
    if (fs.existsSync(AUTH_STATE_PATH)) {
      fs.unlinkSync(AUTH_STATE_PATH);
      console.log("🧹 Auth state cleaned up");
    }
  } catch {
    // Non-critical — ignore
  }
}

export default globalTeardown;
