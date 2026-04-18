// ═══════════════════════════════════════════════════════════════
// SITA OS — App permission keys + helpers
// ═══════════════════════════════════════════════════════════════

export const APP_PERMISSION_KEYS = [
  "notifications",
  "files.read",
  "files.write",
  "external_links",
  "shell.embed",
  "account.link",
  "device.location",
  "device.camera",
  "device.microphone",
  "device.clipboard",
  "device.contacts",
  "device.calendar",
  "background.run",
  "network.fetch",
  "storage.persistent",
] as const;

export type AppPermissionKey = (typeof APP_PERMISSION_KEYS)[number];

export interface PermissionGrant {
  key: AppPermissionKey | string;
  granted: boolean;
  grantedAt?: string;
}

export function permissionRiskLevel(key: string): "low" | "medium" | "high" {
  if (
    key.startsWith("device.camera") ||
    key.startsWith("device.microphone") ||
    key.startsWith("device.location") ||
    key.startsWith("device.contacts")
  ) {
    return "high";
  }
  if (key.startsWith("files.write") || key.startsWith("background.run")) {
    return "medium";
  }
  return "low";
}

export function permissionLabel(key: string): string {
  const m: Record<string, string> = {
    notifications: "Notifications",
    "files.read": "Read files",
    "files.write": "Write files",
    external_links: "Open external links",
    "shell.embed": "Embed in shell",
    "account.link": "Link account",
    "device.location": "Location",
    "device.camera": "Camera",
    "device.microphone": "Microphone",
    "device.clipboard": "Clipboard",
    "device.contacts": "Contacts",
    "device.calendar": "Calendar",
    "background.run": "Run in background",
    "network.fetch": "Network access",
    "storage.persistent": "Persistent storage",
  };
  return m[key] ?? key;
}

export function isPermissionGranted(
  grants: PermissionGrant[] | Record<string, boolean> | undefined,
  key: string,
): boolean {
  if (!grants) return false;
  if (Array.isArray(grants)) {
    return grants.find((g) => g.key === key)?.granted ?? false;
  }
  return !!grants[key];
}
