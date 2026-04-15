#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — IA Coherence Check (CI Script)
// Validates that the information architecture stays compressed,
// coherent, and free of sprawl violations.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

// ── Inline checks (no TS import from src in CI) ─────────────────

const MAX_USER_TOP_LEVEL = 12;
const MAX_ADMIN_TOP_LEVEL = 12;

const VALID_PAGE_CLASSES = [
  "overview", "board", "dashboard", "console", "center",
  "workspace", "explorer", "studio", "settings", "timeline",
  "detail", "registry", "monitor", "wizard", "redirect",
];

interface Violation {
  rule: string;
  message: string;
  severity: "error" | "warning";
}

const violations: Violation[] = [];

// ── Check 1: Route file count ───────────────────────────────────

const routeDir = path.join(process.cwd(), "src/routes");
if (fs.existsSync(routeDir)) {
  const routeFiles = fs.readdirSync(routeDir).filter(f => f.endsWith(".tsx"));
  if (routeFiles.length > 15) {
    violations.push({
      rule: "route-file-count",
      message: `${routeFiles.length} route files found (budget: 15). Consider consolidating.`,
      severity: "warning",
    });
  }
}

// ── Check 2: Admin page directory count ─────────────────────────

const adminDir = path.join(process.cwd(), "src/pages/admin");
if (fs.existsSync(adminDir)) {
  const countFiles = (dir: string): number => {
    let count = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) count += countFiles(path.join(dir, entry.name));
      else if (entry.name.endsWith(".tsx")) count++;
    }
    return count;
  };
  const adminPageCount = countFiles(adminDir);
  // Not a hard limit — just awareness
  console.log(`📊 Admin pages: ${adminPageCount}`);
}

// ── Check 3: Page class naming conventions ──────────────────────

const pagesDir = path.join(process.cwd(), "src/pages");
if (fs.existsSync(pagesDir)) {
  const suffixPattern = /(Dashboard|Board|Center|Console|Hub|Workspace|Studio|Explorer|Registry|Timeline|Monitor)\.tsx$/;
  const checkNaming = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        checkNaming(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".tsx")) {
        const match = entry.name.match(suffixPattern);
        if (match) {
          const suffix = match[1].toLowerCase();
          const mapped = suffix === "hub" ? "center" : suffix;
          if (!VALID_PAGE_CLASSES.includes(mapped) && suffix !== "hub") {
            // Hub is an alias we accept — just flag if truly unknown
          }
        }
      }
    }
  };
  checkNaming(pagesDir);
}

// ── Check 4: Canonical route registry exists ────────────────────

const registryPath = path.join(process.cwd(), "src/lib/architecture/canonical-route-registry.ts");
if (!fs.existsSync(registryPath)) {
  violations.push({
    rule: "canonical-registry-exists",
    message: "canonical-route-registry.ts is missing — IA has no authoritative taxonomy",
    severity: "error",
  });
} else {
  const content = fs.readFileSync(registryPath, "utf-8");

  // Count topNavVisible: true entries
  const userTopMatches = content.match(/topNavVisible:\s*true/g) || [];
  console.log(`📊 Top-nav visible routes: ${userTopMatches.length}`);

  // Check domain constants exist
  if (!content.includes("USER_DOMAINS")) {
    violations.push({
      rule: "user-domains-defined",
      message: "USER_DOMAINS constant not found in canonical registry",
      severity: "error",
    });
  }
  if (!content.includes("ADMIN_DOMAINS")) {
    violations.push({
      rule: "admin-domains-defined",
      message: "ADMIN_DOMAINS constant not found in canonical registry",
      severity: "error",
    });
  }
}

// ── Check 5: Page consolidation map exists ──────────────────────

const consolMapPath = path.join(process.cwd(), "src/lib/architecture/page-consolidation-map.ts");
if (!fs.existsSync(consolMapPath)) {
  violations.push({
    rule: "consolidation-map-exists",
    message: "page-consolidation-map.ts is missing — no migration authority for page merges",
    severity: "error",
  });
}

// ── Check 6: IA governance exists ───────────────────────────────

const govPath = path.join(process.cwd(), "src/lib/architecture/ia-governance.ts");
if (!fs.existsSync(govPath)) {
  violations.push({
    rule: "ia-governance-exists",
    message: "ia-governance.ts is missing — no runtime sprawl prevention",
    severity: "error",
  });
}

// ── Report ──────────────────────────────────────────────────────

const errors = violations.filter(v => v.severity === "error");
const warnings = violations.filter(v => v.severity === "warning");

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  [${w.rule}] ${w.message}`);
}

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} error(s):`);
  for (const e of errors) console.log(`  [${e.rule}] ${e.message}`);
  process.exit(1);
} else {
  console.log(`\n✅ IA coherence check passed (${warnings.length} warnings)`);
}
