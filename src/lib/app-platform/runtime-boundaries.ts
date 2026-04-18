// ═══════════════════════════════════════════════════════════════
// Runtime boundaries — which APIs are allowed per app type
// ═══════════════════════════════════════════════════════════════

import type { PackagePermission, PackageRuntimeTarget } from "./package-schema";

const POLICY: Record<PackageRuntimeTarget, PackagePermission[]> = {
  "sita-internal": [
    "network","files.read","files.write","notifications","clipboard.read","clipboard.write",
    "deep-links","shell.window","user.profile","ai.invoke","storage.persist",
  ],
  "sita-web-runtime": [
    "network","files.read","notifications","clipboard.read","ai.invoke","storage.persist","user.profile",
  ],
  "pwa-link": [
    "network","notifications","clipboard.read",
  ],
  "web-link": [
    "network",
  ],
  "native-link": [
    "network","deep-links","shell.window",
  ],
};

export function allowedPermissions(target: PackageRuntimeTarget): PackagePermission[] {
  return POLICY[target] ?? [];
}

export function isPermitted(target: PackageRuntimeTarget, p: PackagePermission): boolean {
  return allowedPermissions(target).includes(p);
}

export function filterToAllowed(
  target: PackageRuntimeTarget,
  requested: PackagePermission[],
): { allowed: PackagePermission[]; rejected: PackagePermission[] } {
  const allow = new Set(allowedPermissions(target));
  const allowed: PackagePermission[] = [];
  const rejected: PackagePermission[] = [];
  for (const p of requested) {
    if (allow.has(p)) allowed.push(p);
    else rejected.push(p);
  }
  return { allowed, rejected };
}
