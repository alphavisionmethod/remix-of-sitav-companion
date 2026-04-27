#!/usr/bin/env -S node --loader tsx
// SITA OS — Trust Production-Truth Checker (Phase 6.2)
import { join } from "node:path";
import { runChecker, type GenericTruthEntry } from "./_truth-checker-core";
import { TRUST_TRUTH_MANIFEST } from "../../src/modules/trust/PRODUCTION_TRUTH_MANIFEST";

const code = runChecker({
  label: "Trust",
  pagesRoot: join(process.cwd(), "src/platform/trust/pages"),
  subdirs: [""],
  manifest: TRUST_TRUTH_MANIFEST as unknown as ReadonlyArray<GenericTruthEntry>,
});

const invokedDirectly =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]?.endsWith("check-trust-truth.ts");
if (invokedDirectly) process.exit(code);
export { code };