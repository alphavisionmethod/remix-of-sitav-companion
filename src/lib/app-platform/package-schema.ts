// ═══════════════════════════════════════════════════════════════
// SITA App Package — manifest schema (Zod)
// Spec mirrors prompt §4: app_id, version, publisher, entry, runtime,
// permissions, icons, surfaces, signature
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

export const PackageRuntimeTarget = z.enum([
  "sita-web-runtime",
  "sita-internal",
  "pwa-link",
  "native-link",
  "web-link",
]);
export type PackageRuntimeTarget = z.infer<typeof PackageRuntimeTarget>;

export const PackageSurface = z.enum(["desktop", "tablet", "mobile", "tv"]);
export type PackageSurface = z.infer<typeof PackageSurface>;

export const PackagePermission = z.enum([
  "network",
  "files.read",
  "files.write",
  "notifications",
  "clipboard.read",
  "clipboard.write",
  "deep-links",
  "shell.window",
  "user.profile",
  "ai.invoke",
  "storage.persist",
]);
export type PackagePermission = z.infer<typeof PackagePermission>;

export const PackageSignature = z.object({
  algorithm: z.literal("ed25519"),
  key_id: z.string().min(1),
  signature: z.string().optional(),        // base64
  manifest_hash: z.string().optional(),    // sha-256 hex of canonicalized manifest
});
export type PackageSignature = z.infer<typeof PackageSignature>;

export const SemverString = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?(?:\+[A-Za-z0-9.-]+)?$/, "must be semver");

export const PackageManifest = z.object({
  app_id: z.string().min(3).max(128).regex(/^[a-z0-9][a-z0-9._-]+$/, "app_id must be lowercase reverse-DNS"),
  name: z.string().min(1).max(80),
  version: SemverString,
  publisher: z.string().min(1).max(120),
  publisher_id: z.string().uuid().optional(),
  entry: z.string().min(1).optional(),
  runtime: PackageRuntimeTarget,
  channel: z.enum(["stable", "beta", "dev"]).default("stable"),
  min_platform_version: SemverString.default("1.0.0"),
  permissions: z.array(PackagePermission).default([]),
  icons: z.record(z.string().regex(/^\d+$/), z.string()).default({}),
  surfaces: z.array(PackageSurface).min(1).default(["desktop"]),
  signature: PackageSignature.optional(),
  package_url: z.string().url().optional(),
  package_size_bytes: z.number().int().nonnegative().optional(),
  package_checksum: z.string().optional(),
  description: z.string().max(2000).optional(),
  homepage: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type PackageManifest = z.infer<typeof PackageManifest>;

export const SafePackageManifest = PackageManifest.strict();
