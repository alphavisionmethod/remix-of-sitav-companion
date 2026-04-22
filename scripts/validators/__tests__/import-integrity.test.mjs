#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Integrity Validator — Test Suite
// Creates temp fixtures, runs the validator, asserts outcomes.
// ═══════════════════════════════════════════════════════════════
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

const PASS = "\x1b[32m✅ PASS\x1b[0m";
const FAIL = "\x1b[31m❌ FAIL\x1b[0m";
let passed = 0, failed = 0;

function assert(label, condition) {
  if (condition) { console.log(`  ${PASS} ${label}`); passed++; }
  else { console.log(`  ${FAIL} ${label}`); failed++; }
}

// ── Fixture: well-formed imports ──────────────────────────────
const GOOD = `
import { useState } from "react";
import {
  Card,
  CardContent, // trailing comment
} from "@/components/ui/card";
import type { FC } from "react";
import {
  AlertTriangle,
  Check,
} from "lucide-react";

export default function Page() { return null; }
`;

// ── Fixture: malformed import (injected mid-block) ───────────
const BAD = `
import { useState } from "react";
import {
  Card,
import { Typography } from "@/components/sita/Typography";
  CardContent,
} from "@/components/ui/card";

export default function Page() { return null; }
`;

// ── Fixture: import type multi-line (should NOT flag) ────────
const IMPORT_TYPE = `
import type {
  FC,
  ReactNode,
} from "react";
import { useState } from "react";

export default function Page() { return null; }
`;

// ── Fixture: comment inside multi-line (should NOT flag) ─────
const COMMENTED = `
import {
  // import { useState } from "react";
  Card,
} from "@/components/ui/card";

export default function Page() { return null; }
`;

// Create temp directory structure
const root = mkdtempSync(join(tmpdir(), "import-test-"));
const pagesDir = join(root, "src", "pages");
mkdirSync(pagesDir, { recursive: true });

const validatorPath = join(process.cwd(), "scripts/validators/check-import-integrity.mjs");

// We need to patch the validator to scan our temp dir. Use env var override.
// Instead, create a wrapper that changes cwd.
function runValidator(fixtureName, content, fix = false) {
  const filePath = join(pagesDir, `${fixtureName}.tsx`);
  writeFileSync(filePath, content);
  try {
    // Run the validator from the temp root so it finds src/pages/
    const cmd = `node ${validatorPath}${fix ? " --fix" : ""}`;
    execSync(cmd, { cwd: root, stdio: "pipe" });
    return { exitCode: 0 };
  } catch (e) {
    return { exitCode: e.status || 1 };
  }
}

console.log("\n📋 Import Integrity Validator Tests\n");

// Test 1: well-formed imports pass
const r1 = runValidator("good", GOOD);
assert("Well-formed imports pass (exit 0)", r1.exitCode === 0);

// Test 2: malformed imports fail
// Clean dir first
rmSync(join(pagesDir, "good.tsx"), { force: true });
const r2 = runValidator("bad", BAD);
assert("Malformed mid-block import fails (exit 1)", r2.exitCode === 1);

// Test 3: --fix repairs the malformed import
const r3 = runValidator("bad", BAD, true);
assert("--fix exits 0 after repair", r3.exitCode === 0);
// Verify the fixed file is now valid
const r3b = runValidator("bad-verify", readFileSync(join(pagesDir, "bad.tsx"), "utf-8"));
assert("Fixed file passes validation", r3b.exitCode === 0);

// Test 4: import type multi-line is not flagged
rmSync(pagesDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });
const r4 = runValidator("importtype", IMPORT_TYPE);
assert("import type multi-line not flagged", r4.exitCode === 0);

// Test 5: comment containing import keyword not flagged
rmSync(pagesDir, { recursive: true, force: true });
mkdirSync(pagesDir, { recursive: true });
const r5 = runValidator("commented", COMMENTED);
assert("Comment with import keyword not flagged", r5.exitCode === 0);

// Cleanup
rmSync(root, { recursive: true, force: true });

console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);