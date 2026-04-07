// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Type Augmentations
// Declare ambient types for Electron, Capacitor, and Chrome-only APIs
// ═══════════════════════════════════════════════════════════════

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

interface Window {
  electron?: unknown;
  Capacitor?: CapacitorGlobal;
}
