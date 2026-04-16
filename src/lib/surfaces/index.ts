// ═══════════════════════════════════════════════════════════════
// SITA OS — Surface/Window Runtime Layer Barrel
// Canonical import: @/lib/surfaces
// ═══════════════════════════════════════════════════════════════

export {
  SURFACE_RUNTIME_REGISTRY,
  getSurfaceRuntime,
  getSurfacesByType,
  getSurfacesByTarget,
  supportsOperation,
  getMaxWindows,
  getAllSurfaces,
  type SurfaceType,
  type RuntimeTarget,
  type CompositorMode,
  type WindowOperation,
  type ZLayerRange,
  type SurfaceRuntimeEntry,
} from "./surface-runtime-registry";

export {
  HOST_VS_SIMULATED_MAP,
  getWindowingMode,
  isHostNative,
  isSimulated,
  isHybrid,
  getIPCChannels,
  getSimulatedEquivalent,
  type WindowingMode,
  type WindowingClassification,
} from "./host-window-vs-simulated-map";

export {
  WINDOW_CAPABILITY_MATRIX,
  getWindowCapabilities,
  surfaceSupportsSnap,
  surfaceSupportsDrag,
  surfaceSupportsTiling,
  type WindowCapabilities,
  type SnapCapabilities,
  type ResizeCapabilities,
  type WindowCapabilityEntry,
} from "./window-capability-matrix";

export {
  WIDGET_CAPABILITY_MATRIX,
  getWidgetCapabilities,
  surfaceSupportsWidgetSize,
  getMaxWidgets,
  type WidgetSize,
  type WidgetCapabilityEntry,
} from "./widget-capability-matrix";

export {
  LAYOUT_PERSISTENCE_MAP,
  getPersistenceRules,
  isPersisted,
  getStorageBackend,
  type PersistableItem,
  type StorageBackend,
  type PersistenceRule,
  type LayoutPersistenceEntry,
} from "./layout-persistence-map";

export {
  SHELL_SURFACE_MAP,
  getShellElements,
  getVisibleElements,
  hasShellElement,
  getLayoutMode,
  type ShellElement,
  type ShellVisibility,
  type ShellPosition,
  type ShellElementConfig,
  type ShellSurfaceEntry,
} from "./shell-surface-map";

export {
  DRAG_SNAP_BEHAVIOR_MAP,
  getDragSnapBehavior,
  getAvailableSnapZones,
  isDragEnabled,
  isSnapEnabled,
  type SnapZoneId,
  type DragBehavior,
  type SnapBehavior,
  type DragSnapEntry,
} from "./drag-snap-behavior-map";
