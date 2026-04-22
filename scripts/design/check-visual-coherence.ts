// ═══════════════════════════════════════════════════════════════
// SITA OS — Design Visual Coherence Checker
// Run: npx tsx scripts/design/check-visual-coherence.ts
// Scans for: raw colors, duplicate imports, missing PageShell,
//            non-canonical empty states, hardcoded HSL values
// ═══════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function globSync(pattern: string, opts: { cwd: string; ignore?: string[] }): string[] {
  const results: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(opts.cwd, full);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        if (opts.ignore?.some(ig => rel.startsWith(ig.replace("/**", "")))) continue;
        walk(full);
      } else if (entry.isFile()) {
        // Simple glob match: check if rel matches the pattern
        const patternParts = pattern.split("**/");
        const prefix = patternParts[0] || "";
        const suffix = patternParts[patternParts.length - 1]?.replace("*", "") || "";
        if (rel.startsWith(prefix.replace(/\/$/, "")) && rel.endsWith(suffix.replace("*", ""))) {
          if (opts.ignore?.some(ig => rel.startsWith(ig.replace("/**", "")))) continue;
          results.push(rel);
        }
      }
    }
  }
  walk(opts.cwd);
  return results;
}

interface Finding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: "error" | "warning" | "info";
}

const findings: Finding[] = [];
const SRC = path.resolve(__dirname, "../../src");

// ── Rule 1: Hardcoded HSL values in components ─────────────
function checkHardcodedColors() {
  const files = globSync("src/components/**/*.tsx", { cwd: path.resolve(__dirname, "../..") });
  const hslRegex = /hsl\(\s*\d+[\s_]+\d+%[\s_]+\d+%/g;
  const allowList = ["AppSurface.tsx", "SitaCard.tsx", "index.css"];

  for (const file of files) {
    if (allowList.some(a => file.endsWith(a))) continue;
    const content = fs.readFileSync(path.resolve(__dirname, "../..", file), "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (hslRegex.test(lines[i])) {
        findings.push({
          file, line: i + 1, rule: "no-hardcoded-hsl",
          message: "Hardcoded HSL value — use design token CSS variable instead",
          severity: "warning",
        });
      }
      hslRegex.lastIndex = 0;
    }
  }
}

// ── Rule 2: Pages without PageShell ────────────────────────
function checkPageShellCoverage() {
  const pages = globSync("src/pages/*.tsx", { cwd: path.resolve(__dirname, "../..") });
  const fullBleed = ["LandingPage", "NotFound", "MoneyOnboarding", "Boardroom", "DownloadPage", "LifeSimulator", "Index"];
  const shellPatterns = ["PageShell", "DomainAppShell", "redirect", "Navigate", "CenterPageShell",
    "AdminControlPlaneShell", "MissionControlLayout", "SetupExperience", "WindowManager"];

  for (const file of pages) {
    const basename = path.basename(file, ".tsx");
    if (fullBleed.includes(basename)) continue;
    const content = fs.readFileSync(path.resolve(__dirname, "../..", file), "utf-8");
    if (!shellPatterns.some(p => content.includes(p))) {
      findings.push({
        file, line: 1, rule: "page-shell-required",
        message: "Standalone page missing PageShell wrapper — violates page framing grammar",
        severity: "error",
      });
    }
  }
}

// ── Rule 3: Non-canonical empty state imports ──────────────
function checkEmptyStateImports() {
  const files = globSync("src/**/*.tsx", { cwd: path.resolve(__dirname, "../.."), ignore: ["src/components/primitives/**", "src/components/sita/EmptyState.tsx", "src/components/sita/PremiumEmptyState.tsx"] });
  const staleImports = [
    /from\s+["']@\/components\/sita\/ContextualEmptyState["']/,
    /from\s+["']@\/components\/sita\/EmptyStateCTA["']/,
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.resolve(__dirname, "../..", file), "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const re of staleImports) {
        if (re.test(lines[i])) {
          findings.push({
            file, line: i + 1, rule: "canonical-empty-state",
            message: "Import from non-canonical empty state — use @/components/sita/EmptyState instead",
            severity: "info",
          });
        }
      }
    }
  }
}

// ── Rule 4: Duplicate primitives imports ───────────────────
function checkDuplicatePrimitiveImports() {
  const files = globSync("src/**/*.tsx", { cwd: path.resolve(__dirname, "../.."), ignore: ["src/components/primitives/**"] });
  const deprecated = [
    /from\s+["']@\/components\/primitives\/feedback\/EmptyState["']/,
    /from\s+["']@\/components\/primitives\/status\/TrustBadge["']/,
  ];

  for (const file of files) {
    const content = fs.readFileSync(path.resolve(__dirname, "../..", file), "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      for (const re of deprecated) {
        if (re.test(lines[i])) {
          findings.push({
            file, line: i + 1, rule: "no-deprecated-primitive",
            message: "Importing deprecated primitive re-export — import directly from sita/ canonical",
            severity: "info",
          });
        }
      }
    }
  }
}

// ── Run all checks ────────────────────────────────────────
checkHardcodedColors();
checkPageShellCoverage();
checkEmptyStateImports();
checkDuplicatePrimitiveImports();

// ── Output ────────────────────────────────────────────────
const errors = findings.filter(f => f.severity === "error");
const warnings = findings.filter(f => f.severity === "warning");
const infos = findings.filter(f => f.severity === "info");

console.log(`\n🎨 SITA OS Visual Coherence Audit`);
console.log(`═══════════════════════════════════`);
console.log(`  Errors:   ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  Info:     ${infos.length}`);
console.log(`  Total:    ${findings.length}\n`);

for (const f of findings) {
  const icon = f.severity === "error" ? "❌" : f.severity === "warning" ? "⚠️" : "ℹ️";
  console.log(`${icon} [${f.rule}] ${f.file}:${f.line} — ${f.message}`);
}

// ── Write audit JSON ──────────────────────────────────────
const auditPath = path.resolve(__dirname, "../../generated/design-token-audit.json");
fs.mkdirSync(path.dirname(auditPath), { recursive: true });
fs.writeFileSync(auditPath, JSON.stringify({
  generated_at: new Date().toISOString(),
  summary: { errors: errors.length, warnings: warnings.length, info: infos.length, total: findings.length },
  findings,
}, null, 2));
console.log(`\n📄 Audit written to: generated/design-token-audit.json`);

process.exit(errors.length > 0 ? 1 : 0);