/**
 * Docker Hardening Validator — checks that all Dockerfiles follow
 * production security best practices:
 *   1. HEALTHCHECK instruction present
 *   2. Non-root USER directive present
 *   3. Multi-stage build (reduces attack surface)
 *   4. No secrets in build args
 *   5. .dockerignore exists
 */
import * as fs from "fs";
import * as path from "path";
import * as glob from "fs";

interface DockerfileAudit {
  file: string;
  hasHealthcheck: boolean;
  hasNonRootUser: boolean;
  isMultiStage: boolean;
  hasSecretInArgs: boolean;
}

const DOCKERFILE_PATHS = [
  "Dockerfile",
  "deploy/Dockerfile.api",
  "deploy/Dockerfile.brain",
];

function auditDockerfile(filePath: string): DockerfileAudit | null {
  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) return null;
  const content = fs.readFileSync(absPath, "utf-8");
  const lines = content.split("\n").map((l) => l.trim().toUpperCase());

  return {
    file: filePath,
    hasHealthcheck: lines.some((l) => l.startsWith("HEALTHCHECK")),
    hasNonRootUser: lines.some((l) => l.startsWith("USER") && !l.includes("ROOT")),
    isMultiStage: (content.match(/^FROM\s/gim) || []).length >= 2,
    hasSecretInArgs: lines.some(
      (l) => l.startsWith("ARG") && /(SECRET|PASSWORD|TOKEN|PRIVATE)/i.test(l)
    ),
  };
}

function main() {
  const violations: string[] = [];
  const results: DockerfileAudit[] = [];

  // Check .dockerignore
  if (!fs.existsSync(path.resolve(".dockerignore"))) {
    violations.push("Missing .dockerignore — build context may leak secrets/bloat");
  }

  for (const fp of DOCKERFILE_PATHS) {
    const audit = auditDockerfile(fp);
    if (!audit) continue;
    results.push(audit);

    if (!audit.hasHealthcheck) violations.push(`${fp}: Missing HEALTHCHECK instruction`);
    if (!audit.hasNonRootUser) violations.push(`${fp}: No non-root USER directive (container runs as root)`);
    if (!audit.isMultiStage) violations.push(`${fp}: Not a multi-stage build (larger attack surface)`);
    if (audit.hasSecretInArgs) violations.push(`${fp}: Build ARG contains secret-like name (leak risk)`);
  }

  if (violations.length === 0) {
    console.log("✅ All Dockerfiles pass hardening checks");
    console.log(`   Audited: ${results.map((r) => r.file).join(", ")}`);
    process.exit(0);
  }

  console.error("❌ Docker hardening violations:\n");
  for (const v of violations) console.error(`  ⚠ ${v}`);
  process.exit(1);
}

main();