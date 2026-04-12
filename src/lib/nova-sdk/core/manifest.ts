// ═══════════════════════════════════════════════════════════════
// Nova SDK — App Manifest System
// Every app declares itself via a typed manifest
// ═══════════════════════════════════════════════════════════════

import type { ReactNode } from "react";

export type NovaPermissionId =
  | "files.read"
  | "files.write"
  | "network.access"
  | "system.notifications"
  | "clipboard.read"
  | "clipboard.write"
  | "camera"
  | "microphone"
  | "contacts"
  | "calendar"
  | "location";

export interface NovaWindowDefaults {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  transparent?: boolean;
}

export interface AppManifest {
  id: string;                      // e.g. "com.nova.notes"
  name: string;
  version: string;
  publisher: string;
  icon: string;
  iconBg: string;
  permissions: NovaPermissionId[];
  windowDefaults: NovaWindowDefaults;
  capabilities?: string[];
  category?: string;
  description?: string;
}

export interface ManifestValidationError {
  field: string;
  message: string;
}

const ID_REGEX = /^[a-z0-9.-]+$/;

export function validateManifest(manifest: Partial<AppManifest>): ManifestValidationError[] {
  const errors: ManifestValidationError[] = [];

  if (!manifest.id || !ID_REGEX.test(manifest.id)) {
    errors.push({ field: "id", message: "App ID must be lowercase alphanumeric with dots/hyphens (e.g. com.nova.notes)" });
  }
  if (!manifest.name || manifest.name.length < 1 || manifest.name.length > 64) {
    errors.push({ field: "name", message: "Name is required (1-64 chars)" });
  }
  if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push({ field: "version", message: "Version must be semver (e.g. 1.0.0)" });
  }
  if (!manifest.publisher) {
    errors.push({ field: "publisher", message: "Publisher is required" });
  }
  if (!manifest.windowDefaults) {
    errors.push({ field: "windowDefaults", message: "Window defaults are required" });
  } else {
    const wd = manifest.windowDefaults;
    if (wd.width < 200 || wd.width > 2000) errors.push({ field: "windowDefaults.width", message: "Width must be 200-2000" });
    if (wd.height < 150 || wd.height > 1500) errors.push({ field: "windowDefaults.height", message: "Height must be 150-1500" });
  }

  return errors;
}
