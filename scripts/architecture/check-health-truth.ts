#!/usr/bin/env -S node --loader tsx
// SITA OS — Health Production-Truth Checker (Phase 6.1)
import { join } from "node:path";
import { runChecker, type GenericTruthEntry } from "./_truth-checker-core";
import { HEALTH_TRUTH_MANIFEST } from "../../src/modules/health/PRODUCTION_TRUTH_MANIFEST";

const code = runChecker({
  label: "Health",
  pagesRoot: join(process.cwd(), "src/modules/health/pages"),
  subdirs: [""],
  manifest: HEALTH_TRUTH_MANIFEST as unknown as ReadonlyArray<GenericTruthEntry>,
});

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-health-truth.ts");
if (invokedDirectly) process.exit(code);
export { code };