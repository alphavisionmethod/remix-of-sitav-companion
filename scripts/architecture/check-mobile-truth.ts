#!/usr/bin/env -S node --loader tsx
// SITA OS — Mobile Production-Truth Checker (Phase 6.3)
import { join } from "node:path";
import { runChecker, type GenericTruthEntry } from "./_truth-checker-core";
import { MOBILE_TRUTH_MANIFEST } from "../../src/modules/mobile/PRODUCTION_TRUTH_MANIFEST";

const code = runChecker({
  label: "Mobile",
  pagesRoot: join(process.cwd(), "src/platform/experience/pages/mobile"),
  subdirs: [""],
  manifest: MOBILE_TRUTH_MANIFEST as unknown as ReadonlyArray<GenericTruthEntry>,
});

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-mobile-truth.ts");
if (invokedDirectly) process.exit(code);
export { code };