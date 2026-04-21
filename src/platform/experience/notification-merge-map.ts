// ═══════════════════════════════════════════════════════════════
// SITA OS — Notification Merge Map
// Shell-level vs app-level notification routing.
// ═══════════════════════════════════════════════════════════════

export interface NotificationMergeEntry {
  readonly surfaceId: string;
  readonly layer: "shell" | "app" | "shared";
  readonly componentRef: string;
  readonly scope: string;
  readonly routingRule: string;
}

export const NOTIFICATION_MERGE_MAP: readonly NotificationMergeEntry[] = [
  { surfaceId: "notification-center",   layer: "shell",  componentRef: "NotificationCenter",     scope: "All notifications aggregated",        routingRule: "All app and system notifications funnel here" },
  { surfaceId: "notification-dropdown", layer: "shell",  componentRef: "NotificationDropdown",   scope: "Recent notifications preview",        routingRule: "Shows latest N from notification center" },
  { surfaceId: "desktop-notifications", layer: "shell",  componentRef: "DesktopNotifications",   scope: "Desktop toast-style popups",          routingRule: "High-priority notifications surface as desktop toasts" },
  { surfaceId: "notification-panel",    layer: "shell",  componentRef: "NotificationPanel",      scope: "Full notification list panel",         routingRule: "Opened from notification dropdown for full view" },
  { surfaceId: "in-app-toast",          layer: "app",    componentRef: "Toaster (sonner)",        scope: "Transient in-app feedback",           routingRule: "App-local confirmation/error toasts; not persisted in notification center" },
  { surfaceId: "action-center",         layer: "shared", componentRef: "ActionCenter",            scope: "Pending actions requiring user input", routingRule: "Aggregates approval requests, escalations from all domains" },
] as const;