// ═══════════════════════════════════════════════════════════════
// Package validator — schema + checksum + size + runtime checks
// ═══════════════════════════════════════════════════════════════

import { PackageManifest, SafePackageManifest } from "./package-schema";
import { manifestHash } from "./package-format";

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  manifest?: PackageManifest;
  issues: ValidationIssue[];
}

const MAX_PACKAGE_BYTES = 200 * 1024 * 1024; // 200MB hard cap
const PLATFORM_VERSION = "1.0.0";

export async function validatePackage(
  rawManifest: unknown,
  opts: { expectedChecksum?: string; bytes?: ArrayBuffer | null } = {},
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  const parsed = SafePackageManifest.safeParse(rawManifest);
  if (!parsed.success) {
    for (const e of parsed.error.errors) {
      issues.push({ field: e.path.join(".") || "(root)", code: e.code, message: e.message });
    }
    return { ok: false, issues };
  }
  const manifest = parsed.data;

  // Runtime target compatibility
  if (manifest.runtime === "native-link" && manifest.surfaces.every((s) => s !== "desktop")) {
    issues.push({ field: "surfaces", code: "incompatible_runtime", message: "native-link requires desktop surface" });
  }

  // Min platform version
  if (compareSemver(manifest.min_platform_version, PLATFORM_VERSION) > 0) {
    issues.push({
      field: "min_platform_version",
      code: "platform_too_old",
      message: `Requires platform >= ${manifest.min_platform_version} (have ${PLATFORM_VERSION})`,
    });
  }

  // Permission sanity for runtime
  if (manifest.runtime === "pwa-link" && manifest.permissions.includes("files.write")) {
    issues.push({
      field: "permissions",
      code: "permission_not_supported",
      message: "files.write is not available to pwa-link runtime",
    });
  }

  // Icons sanity
  const iconKeys = Object.keys(manifest.icons);
  if (iconKeys.length === 0) {
    issues.push({ field: "icons", code: "no_icons", message: "At least one icon size required" });
  }

  // Size cap
  if (opts.bytes && opts.bytes.byteLength > MAX_PACKAGE_BYTES) {
    issues.push({
      field: "package_size_bytes",
      code: "too_large",
      message: `Package exceeds ${MAX_PACKAGE_BYTES} bytes`,
    });
  }
  if (manifest.package_size_bytes && manifest.package_size_bytes > MAX_PACKAGE_BYTES) {
    issues.push({ field: "package_size_bytes", code: "declared_too_large", message: "Declared size exceeds cap" });
  }

  // Checksum (if both bytes + expected provided)
  if (opts.bytes && opts.expectedChecksum) {
    const buf = await crypto.subtle.digest("SHA-256", opts.bytes);
    const hex = Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
    if (hex !== opts.expectedChecksum.toLowerCase()) {
      issues.push({ field: "package_checksum", code: "checksum_mismatch", message: "Bytes do not match expected sha-256" });
    }
  }

  // Manifest-hash echo (for signature pipelines)
  if (manifest.signature?.manifest_hash) {
    const computed = await manifestHash(manifest);
    if (computed !== manifest.signature.manifest_hash) {
      issues.push({
        field: "signature.manifest_hash",
        code: "manifest_hash_mismatch",
        message: "Embedded manifest_hash does not match canonical hash",
      });
    }
  }

  return { ok: issues.length === 0, manifest, issues };
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(/[.+-]/).slice(0, 3).map((n) => parseInt(n, 10) || 0);
  const pb = b.split(/[.+-]/).slice(0, 3).map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}
