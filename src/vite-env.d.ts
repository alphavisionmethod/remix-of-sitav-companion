/// <reference types="vite/client" />

// Navigator.deviceMemory (Device Memory API — experimental)
interface Navigator {
  readonly deviceMemory?: number;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

interface Window {
  electron?: unknown;
  Capacitor?: CapacitorGlobal;
}
