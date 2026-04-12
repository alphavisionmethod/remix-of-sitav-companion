#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Layer Boundary Check (CI-ready)
// Scans imports across layer boundaries and reports violations.
// Rules 1-9 covering all 6 architectural layers.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  rule: string;
  severity: "error" | "warning";
  detail: string;
}

const violations: Violation[] = [];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...scanDir(full));
    else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

function getImports(content: string): string[] {
  const matches = content.matchAll(/from\s+["']([^"']+)["']/g);
  return [...matches].map(m => m[1]);
}

// ── Rule 1: Public/auth pages must not import OS/kernel/admin ───

const authPages = scanDir("src/pages/auth");
for (const f of authPages) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (imp.includes("core-services") || imp.includes("sita-kernel") || imp.includes("nova-sdk/kernel")) {
      violations.push({ file: rel, rule: "WEB_IMPORTS_KERNEL", severity: "error", detail: `Auth page imports kernel: ${imp}` });
    }
    if (imp.includes("/admin/") || imp.includes("AdminShell")) {
      violations.push({ file: rel, rule: "WEB_IMPORTS_ADMIN", severity: "error", detail: `Auth page imports admin: ${imp}` });
    }
  }
}

// ── Rule 2: Admin pages must not import user-app page components ─

const adminPages = scanDir("src/pages/admin");
for (const f of adminPages) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (/^@\/pages\/(business|money|concierge|files|boardroom)/.test(imp)) {
      violations.push({ file: rel, rule: "ADMIN_IMPORTS_APP_PAGE", severity: "error", detail: `Admin page imports user app page: ${imp}` });
    }
  }
}

// ── Rule 3: Services must not import from pages or components ────

const serviceFiles = [...scanDir("src/lib/services"), ...scanDir("src/lib/core-services")];
for (const f of serviceFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (imp.startsWith("@/pages/") || imp.startsWith("@/components/")) {
      violations.push({ file: rel, rule: "SERVICE_IMPORTS_UI", severity: "error", detail: `Service imports UI component: ${imp}` });
    }
  }
}

// ── Rule 4: Contracts must not import runtime ───────────────────

const contractFiles = scanDir("src/packages/contracts");
for (const f of contractFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (imp.includes("core-services") || imp.includes("lib/services")) {
      violations.push({ file: rel, rule: "CONTRACT_IMPORTS_RUNTIME", severity: "error", detail: `Contract imports runtime service: ${imp}` });
    }
  }
}

// ── Rule 5: Domain services must not cross-import ───────────────

const domains = ["business-os", "finance-os", "concierge-os"];
for (const domain of domains) {
  const domainDir = `src/lib/services/${domain}`;
  const domainFiles = scanDir(domainDir);
  const otherDomains = domains.filter(d => d !== domain);
  for (const f of domainFiles) {
    const content = fs.readFileSync(f, "utf-8");
    const rel = path.relative(process.cwd(), f);
    for (const other of otherDomains) {
      if (content.includes(`/${other}/`) || content.includes(`/${other}'`) || content.includes(`/${other}"`)) {
        violations.push({ file: rel, rule: "CROSS_DOMAIN_IMPORT", severity: "error", detail: `${domain} imports from ${other}` });
      }
    }
  }
}

// ── Rule 6: App pages must not import from core-services (kernel) ──

const appPages = scanDir("src/pages").filter(f =>
  !f.includes("src/pages/admin/") &&
  !f.includes("src/pages/owner/") &&
  !f.includes("src/pages/mission/") &&
  !f.includes("src/pages/auth/")
);
for (const f of appPages) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (imp.includes("core-services")) {
      violations.push({ file: rel, rule: "APP_IMPORTS_KERNEL", severity: "warning", detail: `App page imports kernel: ${imp}` });
    }
  }
}

// ── Rule 7: Hooks must not import from core-services (kernel) ───

const hookFiles = scanDir("src/hooks");
for (const f of hookFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (imp.includes("core-services")) {
      violations.push({ file: rel, rule: "HOOK_IMPORTS_KERNEL", severity: "warning", detail: `Hook imports kernel directly: ${imp}` });
    }
  }
}

// ── Rule 8: Owner/Mission pages must not import user app pages ──

const ownerPages = [...scanDir("src/pages/owner"), ...scanDir("src/pages/mission")];
for (const f of ownerPages) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (/^@\/pages\/(business|money|concierge|files|boardroom)/.test(imp)) {
      violations.push({ file: rel, rule: "OPERATOR_IMPORTS_APP_PAGE", severity: "error", detail: `Operator page imports user app page: ${imp}` });
    }
  }
}

// ── Rule 9: Services must not use relative imports to pages ─────

for (const f of serviceFiles) {
  const content = fs.readFileSync(f, "utf-8");
  const rel = path.relative(process.cwd(), f);
  const imports = getImports(content);
  for (const imp of imports) {
    if (/\.\.\/.*pages\//.test(imp) || /\.\.\/.*components\//.test(imp)) {
      violations.push({ file: rel, rule: "SERVICE_RELATIVE_UI_IMPORT", severity: "error", detail: `Service uses relative import to UI: ${imp}` });
    }
  }
}

// ── Report ──────────────────────────────────────────────────────

const errors = violations.filter(v => v.severity === "error");
const warnings = violations.filter(v => v.severity === "warning");

if (violations.length === 0) {
  console.log("✅ Layer boundary check passed — 9 rules, no violations found");
  process.exit(0);
} else {
  console.log(`\n📊 Layer Boundary Check Results (9 rules)`);
  console.log(`   ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  for (const v of violations) {
    const icon = v.severity === "error" ? "❌" : "⚠️";
    console.log(`  ${icon} [${v.rule}] ${v.file}`);
    console.log(`     → ${v.detail}\n`);
  }
  if (errors.length > 0) process.exit(1);
}
