// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface Adapter Registry
// Canonical registry of all 7 surface adapters with full grammars
// ═══════════════════════════════════════════════════════════════

import type {
  NavigationGrammar,
  InteractionGrammar,
  NotificationGrammar,
  TrustPresentation,
  ReceiptPresentation,
} from "@/packages/contracts/msa/adapter-contract";

export interface FullSurfaceAdapter {
  adapterKey: string;
  displayName: string;
  surfaceClass: "web" | "native" | "glance" | "api";
  status: "active" | "planned" | "deprecated";
  shellType: string;
  navigation: NavigationGrammar;
  interaction: InteractionGrammar;
  notification: NotificationGrammar;
  trust: TrustPresentation;
  receipt: ReceiptPresentation;
  offlineSupport: boolean;
  performanceBudget: { maxLCP: number; maxCLS: number; maxINP: number };
  capabilitySupport: "full" | "partial" | "glance_only";
}

/** All 7 canonical surface adapters with full grammar definitions */
export const SURFACE_ADAPTER_REGISTRY: FullSurfaceAdapter[] = [
  {
    adapterKey: "web_desktop",
    displayName: "Web Desktop Shell",
    surfaceClass: "web",
    status: "active",
    shellType: "SidebarShell",
    navigation: { type: "route_based", pattern: "sidebar + breadcrumbs + command_palette", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 6 },
    interaction: { primary: "mouse", secondary: "keyboard", tertiary: "touch", supportsDrag: true, supportsHaptic: false, supportsMultiWindow: true, gestureLibrary: ["click", "double_click", "right_click", "drag_drop", "keyboard_shortcuts"] },
    notification: { channel: "push", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["toast", "badge", "push", "sound"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "DemoModeBadge", renderingStrategy: "header_persistent", componentPattern: "badge + tooltip", verified: true },
    receipt: { receiptType: "full_detail", renderingStrategy: "card_expandable", componentPattern: "ProofReceipt", supportsPrint: true, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 2500, maxCLS: 0.1, maxINP: 200 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "web_mobile",
    displayName: "Web Mobile Shell",
    surfaceClass: "web",
    status: "active",
    shellType: "BottomTabShell",
    navigation: { type: "stack_based", pattern: "bottom_tabs + stack_nav + swipe_back", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 4 },
    interaction: { primary: "touch", secondary: "voice", supportsDrag: false, supportsHaptic: true, supportsMultiWindow: false, gestureLibrary: ["tap", "swipe", "pull_to_refresh", "long_press", "pinch_zoom"] },
    notification: { channel: "push", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["toast", "push", "haptic", "badge"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "DemoModeBadge", renderingStrategy: "compact_header", componentPattern: "compact badge", verified: true },
    receipt: { receiptType: "summary", renderingStrategy: "card_swipeable", componentPattern: "MobileReceipt", supportsPrint: false, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 3000, maxCLS: 0.15, maxINP: 300 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "web_tablet",
    displayName: "Web Tablet Shell",
    surfaceClass: "web",
    status: "active",
    shellType: "CollapsibleSidebarShell",
    navigation: { type: "route_based", pattern: "collapsible_sidebar + split_view + breadcrumbs", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 5 },
    interaction: { primary: "touch", secondary: "keyboard", tertiary: "stylus", supportsDrag: true, supportsHaptic: false, supportsMultiWindow: true, gestureLibrary: ["tap", "swipe", "drag_drop", "split_view", "keyboard_shortcuts"] },
    notification: { channel: "push", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["toast", "badge", "push"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "DemoModeBadge", renderingStrategy: "sidebar_persistent", componentPattern: "inline badge", verified: true },
    receipt: { receiptType: "full_detail", renderingStrategy: "split_view_detail", componentPattern: "ProofReceipt", supportsPrint: true, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 2500, maxCLS: 0.1, maxINP: 200 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "native_ios",
    displayName: "Native iOS Shell",
    surfaceClass: "native",
    status: "planned",
    shellType: "UITabBarShell",
    navigation: { type: "tab_panel", pattern: "tab_bar + navigation_controller + haptic_feedback", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 5 },
    interaction: { primary: "touch", secondary: "voice", tertiary: "face_id", supportsDrag: true, supportsHaptic: true, supportsMultiWindow: true, gestureLibrary: ["tap", "swipe", "3d_touch", "haptic_feedback", "face_id", "long_press"] },
    notification: { channel: "apns", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["push", "rich_notification", "badge", "sound", "haptic"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "NativeModeBadge", renderingStrategy: "status_bar", componentPattern: "native indicator + biometric gate", verified: true },
    receipt: { receiptType: "full_detail", renderingStrategy: "native_card", componentPattern: "NativeReceipt", supportsPrint: false, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 1500, maxCLS: 0, maxINP: 100 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "native_android",
    displayName: "Native Android Shell",
    surfaceClass: "native",
    status: "planned",
    shellType: "BottomNavShell",
    navigation: { type: "tab_panel", pattern: "bottom_nav + material_transitions + deep_links", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 5 },
    interaction: { primary: "touch", secondary: "voice", tertiary: "fingerprint", supportsDrag: true, supportsHaptic: true, supportsMultiWindow: true, gestureLibrary: ["tap", "swipe", "long_press", "fingerprint", "material_ripple"] },
    notification: { channel: "fcm", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["push", "notification_channel", "badge", "sound", "haptic"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "NativeModeBadge", renderingStrategy: "app_bar", componentPattern: "native indicator + fingerprint gate", verified: true },
    receipt: { receiptType: "full_detail", renderingStrategy: "material_card", componentPattern: "MaterialReceipt", supportsPrint: false, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 2000, maxCLS: 0, maxINP: 150 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "desktop_electron",
    displayName: "Desktop Electron Shell",
    surfaceClass: "web",
    status: "planned",
    shellType: "ElectronShell",
    navigation: { type: "route_based", pattern: "menu_bar + sidebar + multi_window + system_tray", supportsDeepLinks: true, supportsBackNavigation: true, maxDepth: 6 },
    interaction: { primary: "mouse", secondary: "keyboard", tertiary: "trackpad", supportsDrag: true, supportsHaptic: false, supportsMultiWindow: true, gestureLibrary: ["click", "drag_drop", "keyboard_shortcuts", "system_tray", "global_hotkeys", "file_drop"] },
    notification: { channel: "system", urgencyLevels: ["low", "normal", "high", "critical"], deliveryMethods: ["system_notification", "tray_badge", "sound", "toast"], supportsGrouping: true, supportsActions: true },
    trust: { trustElement: "TitleBarModeIndicator", renderingStrategy: "title_bar_persistent", componentPattern: "title bar badge + tray icon", verified: true },
    receipt: { receiptType: "full_detail", renderingStrategy: "window_detail", componentPattern: "ProofReceipt", supportsPrint: true, supportsExport: true },
    offlineSupport: true,
    performanceBudget: { maxLCP: 1500, maxCLS: 0.05, maxINP: 100 },
    capabilitySupport: "full",
  },
  {
    adapterKey: "watch_os",
    displayName: "WatchOS Glance Shell",
    surfaceClass: "glance",
    status: "planned",
    shellType: "GlanceShell",
    navigation: { type: "spatial_anchored", pattern: "crown_scroll + complications + short_look + long_look", supportsDeepLinks: false, supportsBackNavigation: true, maxDepth: 2 },
    interaction: { primary: "crown", secondary: "tap", tertiary: "voice", supportsDrag: false, supportsHaptic: true, supportsMultiWindow: false, gestureLibrary: ["tap", "crown_scroll", "force_press", "raise_to_wake", "voice_command"] },
    notification: { channel: "haptic", urgencyLevels: ["normal", "high", "critical"], deliveryMethods: ["haptic", "short_look", "complication_update"], supportsGrouping: false, supportsActions: true },
    trust: { trustElement: "CompactTrustBadge", renderingStrategy: "complication", componentPattern: "compact icon only", verified: true },
    receipt: { receiptType: "summary", renderingStrategy: "glance_card", componentPattern: "GlanceReceipt", supportsPrint: false, supportsExport: false },
    offlineSupport: false,
    performanceBudget: { maxLCP: 500, maxCLS: 0, maxINP: 50 },
    capabilitySupport: "glance_only",
  },
];

/** Get all registered adapters */
export function getRegisteredAdapters(): FullSurfaceAdapter[] {
  return SURFACE_ADAPTER_REGISTRY;
}

/** Get adapter by key */
export function getAdapterByKey(key: string): FullSurfaceAdapter | undefined {
  return SURFACE_ADAPTER_REGISTRY.find(a => a.adapterKey === key);
}

/** Get active adapters only */
export function getActiveAdapters(): FullSurfaceAdapter[] {
  return SURFACE_ADAPTER_REGISTRY.filter(a => a.status === "active");
}

/** Get adapter count summary */
export function getAdapterCountSummary() {
  return {
    total: SURFACE_ADAPTER_REGISTRY.length,
    active: SURFACE_ADAPTER_REGISTRY.filter(a => a.status === "active").length,
    planned: SURFACE_ADAPTER_REGISTRY.filter(a => a.status === "planned").length,
    surfaceClasses: [...new Set(SURFACE_ADAPTER_REGISTRY.map(a => a.surfaceClass))],
    fullSupport: SURFACE_ADAPTER_REGISTRY.filter(a => a.capabilitySupport === "full").length,
    glanceOnly: SURFACE_ADAPTER_REGISTRY.filter(a => a.capabilitySupport === "glance_only").length,
  };
}

