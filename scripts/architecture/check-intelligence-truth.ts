#!/usr/bin/env -S node --loader tsx
// SITA OS — Intelligence Production-Truth Checker (Phase 6.4a)
import { join } from "node:path";
import { runChecker, type GenericTruthEntry } from "./_truth-checker-core";
import { INTELLIGENCE_TRUTH_MANIFEST } from "../../src/modules/intelligence/PRODUCTION_TRUTH_MANIFEST";

const code = runChecker({
  label: "Intelligence",
  pagesRoot: join(process.cwd(), "src/platform/intelligence/pages"),
  subdirs: [""],
  manifest: INTELLIGENCE_TRUTH_MANIFEST as unknown as ReadonlyArray<GenericTruthEntry>,
});

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-intelligence-truth.ts");
if (invokedDirectly) process.exit(code);
export { code };