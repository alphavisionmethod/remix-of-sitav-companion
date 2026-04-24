// Unit tests for the failure classifier — runs under plain `node`.
import assert from "node:assert/strict";
import { classify, isRefusalPath, CLASSES } from "./failure-classifier.mjs";

let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.error(`  ✗ ${name}\n    ${e.message}`); }
}

console.log("failure-classifier tests");

t("classifies stale-vite-cache", () => {
  const r = classify("", "Failed to resolve import './x' from foo", 1, "src/foo.test.ts");
  assert.equal(r.cls, "stale-vite-cache");
  assert.equal(r.tier, "T2");
});

t("classifies expired-auth", () => {
  const r = classify("", "storageState 401 unauthorized", 1, "tests/e2e/foo.spec.ts");
  assert.equal(r.cls, "expired-auth");
});

t("classifies port-collision", () => {
  const r = classify("listen EADDRINUSE", "", 1, "x.test.ts");
  assert.equal(r.cls, "port-collision");
});

t("classifies oom-worker", () => {
  const r = classify("FATAL ERROR: allocation failed - JavaScript heap out of memory", "", 1, "x.test.ts");
  assert.equal(r.cls, "oom-worker");
});

t("classifies stale-snapshot", () => {
  const r = classify("Snapshot foo mismatched", "", 1, "x.test.ts");
  assert.equal(r.cls, "stale-snapshot");
});

t("classifies flake-network", () => {
  const r = classify("", "ECONNREFUSED 127.0.0.1:54321", 1, "x.test.ts");
  assert.equal(r.cls, "flake-network");
});

t("classifies missing-mock", () => {
  const r = classify("TypeError: supabase.from is not a function", "", 1, "x.test.ts");
  assert.equal(r.cls, "missing-mock");
});

t("classifies import-rename via TS code", () => {
  const r = classify("error TS2305: Module './x' has no exported member 'Y'", "", 1, "x.test.ts");
  assert.equal(r.cls, "import-rename");
});

t("classifies real-bug when no signal matches", () => {
  const r = classify("expected 1 to equal 2", "", 1, "x.test.ts");
  assert.equal(r.cls, "real-bug");
  assert.equal(r.tier, "T0");
});

t("refuses security paths regardless of stdout", () => {
  const r = classify("Failed to resolve import", "", 1, "src/__tests__/security/x.test.ts");
  assert.equal(r.tier, "REFUSAL");
  assert.ok(isRefusalPath("src/__tests__/security/x.test.ts"));
});

t("refuses RLS-named tests", () => {
  assert.ok(isRefusalPath("src/foo/rls-policy.test.ts"));
  assert.ok(isRefusalPath("src/__tests__/deployment/x.test.ts"));
});

t("refuses customer-journey advisor/boardroom/auth", () => {
  assert.ok(isRefusalPath("tests/e2e/customer-journey/advisor/x.spec.ts"));
  assert.ok(isRefusalPath("tests/e2e/customer-journey/boardroom/x.spec.ts"));
  assert.ok(isRefusalPath("tests/e2e/customer-journey/auth/x.spec.ts"));
});

t("CLASSES export is non-empty and includes real-bug", () => {
  assert.ok(CLASSES.length >= 10);
  assert.ok(CLASSES.includes("real-bug"));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
