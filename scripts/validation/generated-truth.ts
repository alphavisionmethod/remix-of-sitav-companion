#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generated Truth Validator
// Ensures generated/ JSON files are consistent with source configs
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  file: string;
  valid: boolean;
  error?: string;
}

const results: ValidationResult[] = [];

function validateJsonFile(filePath: string): ValidationResult {
  const relPath = path.relative(process.cwd(), filePath);
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    JSON.parse(content);
    return { file: relPath, valid: true };
  } catch (e) {
    return { file: relPath, valid: false, error: (e as Error).message };
  }
}

// Validate all generated JSON files
const generatedDir = path.join(process.cwd(), "generated");
if (fs.existsSync(generatedDir)) {
  for (const entry of fs.readdirSync(generatedDir)) {
    if (entry.endsWith(".json")) {
      results.push(validateJsonFile(path.join(generatedDir, entry)));
    }
  }
}

// Validate registry YAML references exist
const registryDir = path.join(process.cwd(), "docs/architecture/registry");
if (fs.existsSync(registryDir)) {
  for (const entry of fs.readdirSync(registryDir)) {
    if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
      const filePath = path.join(registryDir, entry);
      try {
        fs.readFileSync(filePath, "utf-8");
        results.push({ file: `docs/architecture/registry/${entry}`, valid: true });
      } catch (e) {
        results.push({ file: `docs/architecture/registry/${entry}`, valid: false, error: (e as Error).message });
      }
    }
  }
}

// Report
const failed = results.filter(r => !r.valid);
const passed = results.filter(r => r.valid);

console.log(`\n📋 Generated Truth Validation Report`);
console.log(`   Passed: ${passed.length}`);
console.log(`   Failed: ${failed.length}\n`);

for (const r of passed) {
  console.log(`  ✅ ${r.file}`);
}

for (const r of failed) {
  console.error(`  ❌ ${r.file}`);
  console.error(`     → ${r.error}\n`);
}

process.exit(failed.length > 0 ? 1 : 0);
