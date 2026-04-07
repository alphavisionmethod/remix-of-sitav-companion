// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Type Augmentations
// Declare ambient types for Electron, Capacitor, and Chrome-only APIs
// ═══════════════════════════════════════════════════════════════

export {};

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

declare global {
  interface Window {
    electron?: unknown;
    Capacitor?: CapacitorGlobal;
  }
}
