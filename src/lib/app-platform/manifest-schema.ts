// ═══════════════════════════════════════════════════════════════
// SITA OS — App Manifest Schema (Zod)
// Canonical validation for all 4 app types + 7 launch strategies
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

export const AppTypeSchema = z.enum([
  "internal",
  "web",
  "pwa",
  "external_desktop",
  "pack",
]);

export const LaunchStrategySchema = z.enum([
  "internal_route",
  "embedded_webview",
  "external_browser",
  "pwa_window",
  "native_binary",
  "deep_link",
  "electron_child_process",
]);

export const SupportedSurfaceSchema = z.enum([
  "desktop",
  "mobile",
  "pwa",
  "electron",
]);

export const InstallabilitySchema = z.enum([
  "installable",
  "preinstalled",
  "unavailable",
  "desktop_only",
]);

export const VerificationStatusSchema = z.enum([
  "verified",
  "publisher_verified",
  "unverified",
  "community",
]);

export const TrustLevelSchema = z.enum([
  "first_party",
  "trusted",
  "standard",
  "restricted",
]);

export const OfflineSupportSchema = z.enum(["none", "partial", "full"]);

export const PermissionSchema = z.object({
  key: z.string().min(1),
  label: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  risk: z.enum(["low", "medium", "high"]).default("low"),
});

export const WindowDefaultsSchema = z.object({
  width: z.number().int().min(320).max(3840).optional(),
  height: z.number().int().min(240).max(2160).optional(),
  resizable: z.boolean().optional(),
  fullscreen: z.boolean().optional(),
});

export const LaunchTargetSchema = z
  .object({
    route: z.string().optional(),
    url: z.string().url().optional(),
    manifest: z.string().url().optional(),
    fallback: LaunchStrategySchema.optional(),
    fallback_url: z.string().url().optional(),
    darwin: z.string().optional(),
    win32: z.string().optional(),
    linux: z.string().optional(),
    protocol: z.string().optional(),
    args: z.array(z.string()).optional(),
  })
  .passthrough();

export const AppManifestSchema = z.object({
  app_id: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  name: z.string().min(1).max(200),
  short_name: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  publisher: z.string().max(200).optional(),
  app_type: AppTypeSchema,
  launch_strategy: LaunchStrategySchema,
  launch_target: LaunchTargetSchema,
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  icon_url: z.string().optional(),
  banner_url: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
  permissions_required: z.array(PermissionSchema).default([]),
  supported_surfaces: z.array(SupportedSurfaceSchema).default(["desktop"]),
  installability: InstallabilitySchema.default("installable"),
  verification_status: VerificationStatusSchema.default("unverified"),
  trust_level: TrustLevelSchema.default("standard"),
  version: z.string().default("1.0.0"),
  latest_version: z.string().default("1.0.0"),
  update_channel: z.string().default("stable"),
  enabled: z.boolean().default(true),
  featured: z.boolean().default(false),
  pinned_default: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  requires_auth: z.boolean().default(true),
  requires_shell: z.boolean().default(true),
  offline_support: OfflineSupportSchema.default("none"),
  window_defaults: WindowDefaultsSchema.default({}),
  manifest_json: z.record(z.unknown()).default({}),
});

export type AppManifest = z.infer<typeof AppManifestSchema>;
export type AppType = z.infer<typeof AppTypeSchema>;
export type LaunchStrategy = z.infer<typeof LaunchStrategySchema>;
export type SupportedSurface = z.infer<typeof SupportedSurfaceSchema>;
export type Installability = z.infer<typeof InstallabilitySchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type TrustLevel = z.infer<typeof TrustLevelSchema>;
export type OfflineSupport = z.infer<typeof OfflineSupportSchema>;
export type AppPermissionRequirement = z.infer<typeof PermissionSchema>;
export type LaunchTarget = z.infer<typeof LaunchTargetSchema>;

export function validateManifest(input: unknown): AppManifest {
  return AppManifestSchema.parse(input);
}

export function safeValidateManifest(input: unknown) {
  return AppManifestSchema.safeParse(input);
}
