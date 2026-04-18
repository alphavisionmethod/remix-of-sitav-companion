// ═══════════════════════════════════════════════════════════════
// Nova SDK — System Services Barrel Export
// ═══════════════════════════════════════════════════════════════

export { ServiceManager } from "./service-manager";
export type { SystemService, ServiceDescriptor, ServiceLogEntry, ServiceStatus, RestartPolicy } from "./service-manager";

export { FileSystemService } from "./filesystem-service";
export type { FSNode, FSPermissions, MountPoint, FSWatchCallback } from "./filesystem-service";

export { WindowServer } from "./window-server";
export type { WindowState, WindowRule, SnapZone } from "./window-server";

export { InputService } from "./input-service";
export type { ModifierState, HotkeyBinding, GestureState, InputRecording, AccessibilityConfig } from "./input-service";

export { NotificationService } from "./notification-service";
export type { SystemNotification, NotificationAction, NotificationGroup, DNDConfig, NotificationUrgencyLevel, NotificationStyle } from "./notification-service";

export { SettingsService } from "./settings-service";
export type { SettingsSchema, SettingsLayer } from "./settings-service";

export { PermissionMonitor } from "./permission-monitor";
export type { PermissionAccessEntry, AppPermissionSnapshot } from "./permission-monitor";
