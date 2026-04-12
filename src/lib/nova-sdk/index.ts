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

// Services
export { ServiceManager, FileSystemService, WindowServer, InputService, NotificationService, SettingsService } from "./services";
export type { SystemService, ServiceDescriptor, ServiceLogEntry, ServiceStatus, RestartPolicy } from "./services";
export type { FSNode, FSPermissions, MountPoint, FSWatchCallback } from "./services";
export type { WindowState, WindowRule, SnapZone } from "./services";
export type { ModifierState, HotkeyBinding, GestureState, InputRecording, AccessibilityConfig } from "./services";
export type { SystemNotification, NotificationAction, NotificationGroup, DNDConfig, NotificationUrgencyLevel, NotificationStyle } from "./services";
export type { SettingsSchema, SettingsLayer } from "./services";

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
export { AppRuntime, AppEventLoop, AppMemoryGuard, AppResourceTracker, AppErrorBoundary } from "./runtime/managed-runtime";
export type { AppRuntimeConfig, MemoryLimits, EventPriority, RestartPolicy as RuntimeRestartPolicy } from "./runtime/managed-runtime";

// Hooks
export { useNovaApp } from "./hooks/useNovaApp";
export { useAppRuntime } from "./hooks/useAppRuntime";

// Design Contract
export { validateDesignCompliance, setDesignEnforcementMode, getDesignEnforcementMode, auditColor, auditMotion, auditShadow, auditComponent } from "./core/design-contract";
export type { DesignVersion, DesignEnforcementMode, DesignComplianceResult, MotionConfig } from "./core/design-contract";

// Theme Provider
export { NovaThemeProvider, useNovaTheme } from "./ui/NovaThemeProvider";
export type { NovaThemeTokens } from "./ui/NovaThemeProvider";

// Kernel
export { ProcessTable } from "./kernel/process-manager";
export type { Process, ProcessState, PriorityBand } from "./kernel/process-manager";
export { MemoryManager, PAGE_SIZE } from "./kernel/memory-manager";
export type { MemoryRegion, MemoryFlags, MemoryStats } from "./kernel/memory-manager";
export { Syscall, syscall, getSyscallLog, getSyscallStats, clearSyscallLog } from "./kernel/syscall";
export type { SyscallLogEntry, SyscallContext } from "./kernel/syscall";
export { Compositor } from "./kernel/compositor";
export type { CompositorSurface, SurfaceBounds } from "./kernel/compositor";
export { Scheduler } from "./kernel/scheduler";
export { NovaKernel } from "./kernel/boot";
export type { BootLogEntry } from "./kernel/boot";

// Privilege Enforcement
export { PrivilegeEnforcement, RING_KERNEL, RING_USER } from "./kernel/privilege";
export type { PrivilegeLevel, PrivilegeViolation, RingTransition, RingTransitionType, ViolationType } from "./kernel/privilege";

// Wayland Protocol
export { WaylandServer } from "./kernel/wayland";
export type { WaylandClient, WaylandSurface, WaylandGlobal, WaylandBufferFormat, WaylandShmPool, WaylandFrameEvent, WaylandStats } from "./kernel/wayland";
