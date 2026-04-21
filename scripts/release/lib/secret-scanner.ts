/* eslint-disable no-console */
/**
 * SITA OS — Deep Secret Scanner
 * Shared utility used by all release-readiness gates to detect
 * hardcoded secrets, credential files, and sensitive env files
 * anywhere in the platform tree.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

// ── Dangerous file paths (relative to project root) ──────────
const DANGEROUS_FILE_GLOBS = [
  // Android signing
  "android/**/*.keystore",
  "android/**/*.jks",
  "android/**/*.pepk",
  // iOS signing
  "ios/**/*.p12",
  "ios/**/*.mobileprovision",
  "ios/**/*.provisionprofile",
  "ios/**/*.cer",
  // Generic secret/env files
  ".env.local",
  ".env.production",
  ".env.staging",
  ".env.development",
  ".env.*.local",
  "*.pem",
  "*.key",
  "id_rsa",
  "id_ed25519",
  // Firebase / GCP
  "google-services.json",
  "GoogleService-Info.plist",
  "service-account*.json",
  // Generic
  "credentials.json",
  "secrets.json",
  "secrets.yaml",
  "secrets.yml",
];

// ── Content patterns that indicate hardcoded secrets ─────────
const SECRET_CONTENT_PATTERNS = [
  /sk_live_[a-zA-Z0-9]{20,}/,                    // Stripe live secret key
  /sk_test_[a-zA-Z0-9]{20,}/,                    // Stripe test secret key
  /AKIA[0-9A-Z]{16}/,                            // AWS access key
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, // Private keys
  /ghp_[a-zA-Z0-9]{36}/,                         // GitHub personal token
  /gho_[a-zA-Z0-9]{36}/,                         // GitHub OAuth token
  /glpat-[a-zA-Z0-9\-_]{20,}/,                   // GitLab PAT
  /xox[bpras]-[a-zA-Z0-9\-]{10,}/,               // Slack tokens
  /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}/, // JWT (non-publishable)
  /secret_key\s*[:=]\s*["'][^"']{8,}/i,           // Generic secret_key assignment
  /api_secret\s*[:=]\s*["'][^"']{8,}/i,           // Generic api_secret assignment
  /PRIVATE_KEY\s*[:=]\s*["'][^"']{8,}/i,          // Generic PRIVATE_KEY assignment
  /password\s*[:=]\s*["'][^"'\s]{6,}/i,           // Hardcoded password assignment
  /storePassword\s*=\s*["'](?!System)[^"']+/i,    // Android keystore password
];

// ── Directories to skip ─────────────────────────────────────
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next",
  ".turbo", ".cache", "coverage", "generated",
  "bun.lock", "bun.lockb",
]);

// ── File extensions to scan for content secrets ─────────────
const SCANNABLE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml",
  ".toml", ".env", ".sh", ".bash", ".gradle", ".xml",
  ".plist", ".properties", ".cfg", ".conf", ".ini",
  ".tf", ".hcl", "",
]);

export interface SecretFinding {
  severity: "error" | "warning";
  area: "config-separation";
  file: string;
  message: string;
}

/**
 * Walk a directory tree collecting files, skipping excluded dirs.
 */
function walkDir(dir: string, root: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  try {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...walkDir(full, root));
        } else if (stat.isFile() && stat.size < 512 * 1024) {
          results.push(relative(root, full));
        }
      } catch { /* permission errors, broken symlinks */ }
    }
  } catch { /* unreadable dir */ }
  return results;
}

/**
 * Check if a file path matches any dangerous file pattern.
 */
function isDangerousFile(relPath: string): boolean {
  const lower = relPath.toLowerCase();
  for (const pattern of DANGEROUS_FILE_GLOBS) {
    // Simple glob matching: ** = any depth, * = any segment
    const regex = new RegExp(
      "^" +
      pattern
        .replace(/\./g, "\\.")
        .replace(/\*\*/g, "{{GLOBSTAR}}")
        .replace(/\*/g, "[^/]*")
        .replace(/\{\{GLOBSTAR\}\}/g, ".*") +
      "$"
    );
    if (regex.test(lower)) return true;
  }
  return false;
}

/**
 * Scan all platform folders for dangerous files and hardcoded secrets.
 * @param root Project root directory
 * @param platformDirs Additional dirs to scan beyond root-level files
 */
export function scanForSecrets(
  root: string,
  platformDirs: string[] = ["android", "ios", "os", "infra", "src", "supabase/functions", "scripts"]
): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const allFiles: string[] = [];

  // Collect files from specified platform dirs
  for (const dir of platformDirs) {
    allFiles.push(...walkDir(join(root, dir), root));
  }

  // Also check root-level config files
  try {
    for (const entry of readdirSync(root)) {
      const full = join(root, entry);
      try {
        const stat = statSync(full);
        if (stat.isFile() && stat.size < 512 * 1024) {
          allFiles.push(entry);
        }
      } catch {}
    }
  } catch {}

  // ── Pass 1: Dangerous file detection ─────────────────────
  for (const file of allFiles) {
    if (isDangerousFile(file)) {
      findings.push({
        severity: "error",
        area: "config-separation",
        file,
        message: `Credential/secret file detected in source tree: ${file} — must not be committed`,
      });
    }
  }

  // ── Pass 2: Content scanning for hardcoded secrets ───────
  for (const file of allFiles) {
    const ext = extname(file).toLowerCase();
    // Only scan text-like files
    if (!SCANNABLE_EXTENSIONS.has(ext)) continue;
    // Skip known safe files
    if (file === ".env" || file === "package.json" || file === "bun.lockb") continue;
    // Skip type definition files (they contain "password" in type names)
    if (file.endsWith(".d.ts") || file.includes("types.ts")) continue;

    try {
      const content = readFileSync(join(root, file), "utf-8");
      for (const pattern of SECRET_CONTENT_PATTERNS) {
        if (pattern.test(content)) {
          findings.push({
            severity: "error",
            area: "config-separation",
            file,
            message: `Potential hardcoded secret matching ${pattern.source.slice(0, 30)}… in ${file} — use CI env vars or secret manager`,
          });
          break; // One finding per file is enough
        }
      }
    } catch { /* unreadable */ }
  }

  return findings;
}