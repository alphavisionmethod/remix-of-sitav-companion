// ═══════════════════════════════════════════════════════════════
// Host API contracts — typed surface for in-shell apps
// (concrete implementation is provided by sdk.ts using the Sandbox)
// ═══════════════════════════════════════════════════════════════

import type { PackagePermission } from "./package-schema";

export interface HostUser {
  id: string;
  email?: string;
  display_name?: string;
}

export interface HostCapabilities {
  isElectron: boolean;
  platform: "darwin" | "win32" | "linux" | "web" | "ios" | "android";
  canLaunchNative: boolean;
  canPersistFiles: boolean;
  canEmitNotifications: boolean;
}

export interface OpenWindowArgs {
  appId: string;
  route?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface NotificationArgs {
  title: string;
  body: string;
  icon?: string;
}

/** SDK surface available to in-shell apps. All methods enforce sandbox checks. */
export interface AppHostApi {
  openWindow(args: OpenWindowArgs): Promise<{ ok: boolean; windowId?: string; reason?: string }>;
  openRoute(route: string): Promise<void>;
  requestPermission(p: PackagePermission): Promise<boolean>;
  readFile(path: string): Promise<{ ok: boolean; content?: string; reason?: string }>;
  writeFile(path: string, content: string): Promise<{ ok: boolean; reason?: string }>;
  emitNotification(args: NotificationArgs): Promise<{ ok: boolean; reason?: string }>;
  getCurrentUser(): Promise<HostUser | null>;
  getHostCapabilities(): HostCapabilities;
  registerDeepLink(scheme: string): Promise<{ ok: boolean; reason?: string }>;
  persistAppState<T>(key: string, value: T): Promise<{ ok: boolean }>;
  loadAppState<T>(key: string): Promise<T | null>;
}
