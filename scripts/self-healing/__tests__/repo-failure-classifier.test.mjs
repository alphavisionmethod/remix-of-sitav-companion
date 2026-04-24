#!/usr/bin/env node
// Self-test for repo-failure-classifier — fixtures cover all 18 classes
import { classifyFailure, ALL_CLASSES } from "../lib/repo-failure-classifier.mjs";
import assert from "node:assert/strict";

const FIXTURES = [
  { name: "missing-symbol", out: "src/foo.ts(10,5): error TS2304: Cannot find name 'fooBar'.", expect: "missing-symbol" },
  { name: "import-drift", out: "src/foo.ts: error TS2307: Cannot find module '@/lost'.", expect: "import-drift" },
  { name: "barrel-broken", out: "Module '@/services/index' has no exported member 'Foo'.", expect: "barrel-export-broken" },
  { name: "stale-generated", out: "generated/routes-manifest.json is stale; run `npm run generate:manifests`.", expect: "stale-generated" },
  { name: "manifest-drift", out: "❌ manifest-drift: artifact-ownership-missing for 5 files.", expect: "manifest-drift" },
  { name: "contract-drift", out: "contract-integrity check failed: duplicate-export `XService`.", expect: "contract-drift" },
  { name: "route-wiring", out: "❌ route-drift: orphan-page src/pages/Foo.tsx (no <Route>).", expect: "route-wiring-drift" },
  { name: "cta-wiring", out: "missing-cta on /dashboard surface (surface-ownership).", expect: "cta-wiring-drift" },
  { name: "feature-ownership", out: "feature-integration FAIL: missing-owner for capability cap.foo", expect: "feature-ownership-drift" },
  { name: "service-dup", out: "service-sprawl: duplicate-service AccountService at 3 paths.", expect: "service-duplication-fallout" },
  { name: "demo-fallout", out: "no-page-mocks violation: MOCK_USERS imported in src/pages/A.tsx", expect: "demo-removal-fallout" },
  { name: "dependency", out: "npm error code ERESOLVE could not resolve peer dep react@19", expect: "dependency-drift" },
  { name: "auth-regress", out: "FAIL src/__tests__/security/rls-audit.test.ts > policy-bypass detected", expect: "auth-boundary-regression" },
  { name: "release-mismatch", out: "deployment-readiness FAIL: freshness-gate not satisfied", expect: "release-readiness-mismatch" },
  { name: "semantic-ui", out: "snapshot mismatch: visual-regression Boardroom.spec.ts", expect: "semantic-ui-regression" },
  { name: "external-dep", out: "fetch failed: ECONNREFUSED supabase.co:443", expect: "external-dep-unavailable" },
  { name: "flake", out: "TimeoutError: Element not visible after timeout 30000ms exceeded", expect: "flaky-test" },
  { name: "real-bug", out: "AssertionError: expected 5 to equal 7 (no recognizable signal)", expect: "real-bug" },
];

let pass = 0, fail = 0;
for (const fx of FIXTURES) {
  const r = classifyFailure({ stdout: fx.out, stderr: "", checkId: "test", subsystem: "tests" });
  if (r.class === fx.expect) {
    pass++;
    console.log(`✓ ${fx.name} → ${r.class} (conf=${r.confidence.toFixed(2)})`);
  } else {
    fail++;
    console.log(`✗ ${fx.name}: expected ${fx.expect}, got ${r.class}`);
  }
}

assert.equal(ALL_CLASSES.length, 18, "must have 18 classes");
console.log(`\n[classifier-test] ${pass}/${FIXTURES.length} passed`);
process.exit(fail > 0 ? 1 : 0);