#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Check: System Stack Registry Integrity
// Fails the build if validateSystemStack() reports missing entries
// or if any declared registry/doc file is absent on disk.
// ═══════════════════════════════════════════════════════════════

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SYSTEM_LAYER_REGISTRY,
  validateSystemStack,
} from "../../../src/lib/architecture/system-layer-registry";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..", "..", "..");

function main(): void {
  const validation = validateSystemStack();
  const missingFiles: string[] = [];

  for (const entry of SYSTEM_LAYER_REGISTRY) {
    for (const filePath of [entry.registryFile, entry.docFile]) {
      if (!filePath) continue;
      const abs = resolve(REPO_ROOT, filePath);
      if (!existsSync(abs)) missingFiles.push(`${entry.key} → ${filePath}`);
    }
  }

  console.log("[check-system-stack] Validation result:", JSON.stringify(validation));
  console.log(`[check-system-stack] Entries: ${SYSTEM_LAYER_REGISTRY.length}`);
  console.log(`[check-system-stack] On-disk files checked: ${SYSTEM_LAYER_REGISTRY.length * 2}`);

  if (!validation.ok) {
    console.error(
      `[check-system-stack] ❌ Registry missing entries: ${validation.missing.join(", ")}`,
    );
  }

  if (missingFiles.length > 0) {
    console.error(`[check-system-stack] ❌ Missing on-disk files (${missingFiles.length}):`);
    for (const m of missingFiles) console.error(`  - ${m}`);
  }

  if (!validation.ok || missingFiles.length > 0) {
    console.error("[check-system-stack] FAILED — system stack integrity violated.");
    process.exit(1);
  }

  console.log("[check-system-stack] ✅ All registry entries present and all files exist on disk.");
}

main();
