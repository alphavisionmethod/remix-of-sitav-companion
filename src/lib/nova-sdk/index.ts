// ═══════════════════════════════════════════════════════════════
// Nova SDK — Barrel Export
// Complete App SDK for SITA OS
// ═══════════════════════════════════════════════════════════════

// Core
export { validateManifest } from "./core/manifest";
export type { AppManifest, NovaPermissionId, NovaWindowDefaults, ManifestValidationError } from "./core/manifest";
export { AppRegistry } from "./core/registry";
export type { RegisteredApp, AppRuntimeState } from "./core/registry";
export { NovaEnforcement, auditSpacing, auditFontSize, auditBorderRadius } from "./core/enforcement";
export type { DesignViolation } from "./core/enforcement";

// UI
export { NovaText, NovaButton, NovaInput, NovaCard, NovaList, NovaModal, NovaSidebar, NovaSectionLabel, NovaToggle, NovaSlider, NovaTextArea, NovaToolbar, NovaBadge, NovaAvatar } from "./ui/components";
export { VStack, HStack, Spacer, Divider, SplitView, AppLayout, NovaScrollArea } from "./ui/layout";

// System
export { createWindowAPI } from "./system/window-api";
export type { NovaWindowOptions, NovaWindowHandle } from "./system/window-api";
export { NovaBridge, PermissionDeniedError as BridgePermissionDenied } from "./system/bridge";
export type { BridgeChannel } from "./system/bridge";
export { NovaFS, PermissionDeniedError as FSPermissionDenied } from "./system/filesystem";
export { NovaNotify } from "./system/notifications";
export type { NovaNotification, NotificationUrgency } from "./system/notifications";

// Input
export { NovaEvents } from "./input/events";
export type { NovaEvent, NovaEventType } from "./input/events";

// Graphics
export { NovaContext } from "./graphics/context";
export type { NovaColor } from "./graphics/context";

// Runtime
export { lifecycleManager } from "./runtime/lifecycle";
export type { NovaAppLifecycle } from "./runtime/lifecycle";
export { AppLoader } from "./runtime/loader";
export type { AppBundle, LoadResult } from "./runtime/loader";

// Hooks
export { useNovaApp } from "./hooks/useNovaApp";
