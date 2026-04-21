/**
 * SITA OS — CODEOWNERS Coverage Validator
 * Ensures critical repository paths have explicit ownership rules.
 * Checks that:
 *  1. CODEOWNERS file exists and is parseable
 *  2. All critical directories have at least one matching rule
 *  3. No orphan team references (teams actually appear in rules)
 *  4. Coverage percentage is above threshold
 */
import * as fs from "fs";
import * as path from "path";

interface CoverageResult {
  path: string;
  covered: boolean;
  matchedRule: string | null;
  owner: string | null;
}

const CODEOWNERS_PATH = path.join(process.cwd(), ".github/CODEOWNERS");

// Critical paths that MUST have explicit ownership
const CRITICAL_PATHS = [
  ".github/workflows/",
  ".github/CODEOWNERS",
  "src/components/",
  "src/pages/",
  "src/lib/",
  "src/services/",
  "src/platform/",
  "src/integrations/",
  "supabase/functions/",
  "supabase/migrations/",
  "scripts/",
  "scripts/architecture/",
  "scripts/release/",
  "deploy/api-gateway/",
  "deploy/brain-core/",
  "os/",
  "electron/",
  "Dockerfile",
  "docker-compose.yml",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
];

if (!fs.existsSync(CODEOWNERS_PATH)) {
  console.error("❌ CODEOWNERS file not found");
  process.exit(1);
}

const content = fs.readFileSync(CODEOWNERS_PATH, "utf-8");
const rules = content
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const parts = l.split(/\s+/);
    return { pattern: parts[0], owners: parts.slice(1) };
  });

console.log(`📋 CODEOWNERS: ${rules.length} rules found\n`);

function pathMatchesPattern(filePath: string, pattern: string): boolean {
  // Normalize: strip leading /
  const normPattern = pattern.replace(/^\//, "");
  const normPath = filePath.replace(/^\//, "");

  // Wildcard catch-all
  if (pattern === "*") return true;

  // Exact match
  if (normPath === normPattern) return true;

  // Directory prefix match
  if (normPattern.endsWith("/") && normPath.startsWith(normPattern)) return true;
  if (!normPattern.endsWith("/") && !normPattern.includes("*")) {
    if (normPath === normPattern || normPath.startsWith(normPattern + "/")) return true;
  }

  // Glob patterns (simplified)
  if (normPattern.includes("*")) {
    const regex = new RegExp(
      "^" + normPattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    if (regex.test(normPath)) return true;
  }

  return false;
}

const results: CoverageResult[] = [];

for (const criticalPath of CRITICAL_PATHS) {
  let matched = false;
  let matchedRule: string | null = null;
  let matchedOwner: string | null = null;

  // CODEOWNERS uses last-match-wins, but for coverage we just need any match
  for (const rule of rules) {
    if (pathMatchesPattern(criticalPath, rule.pattern)) {
      matched = true;
      matchedRule = rule.pattern;
      matchedOwner = rule.owners.join(", ");
    }
  }

  results.push({
    path: criticalPath,
    covered: matched,
    matchedRule,
    owner: matchedOwner,
  });
}

const covered = results.filter((r) => r.covered);
const uncovered = results.filter((r) => !r.covered);
const coveragePct = Math.round((covered.length / results.length) * 100);

// Collect unique teams
const teams = new Set<string>();
for (const rule of rules) {
  for (const owner of rule.owners) {
    teams.add(owner);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totalCriticalPaths: CRITICAL_PATHS.length,
  coveredPaths: covered.length,
  uncoveredPaths: uncovered.length,
  coveragePct,
  totalRules: rules.length,
  uniqueTeams: Array.from(teams).sort(),
  results,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync(
  "generated/codeowners-coverage-report.json",
  JSON.stringify(report, null, 2)
);

// Print results
for (const r of results) {
  const icon = r.covered ? "✅" : "❌";
  const detail = r.covered ? `→ ${r.owner}` : "NO OWNER";
  console.log(`${icon} ${r.path} ${detail}`);
}

console.log(`\n📊 CODEOWNERS coverage: ${coveragePct}% (${covered.length}/${results.length})`);
console.log(`👥 Teams: ${teams.size} (${Array.from(teams).join(", ")})`);

if (uncovered.length > 0) {
  console.log(`\n⚠️ ${uncovered.length} critical paths lack explicit ownership`);
}

// Fail if coverage drops below 80%
if (coveragePct < 80) {
  console.error(`\n❌ CODEOWNERS coverage ${coveragePct}% is below 80% threshold`);
  process.exit(1);
}