/// <reference types="vite/client" />

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

interface Window {
  electron?: unknown;
  Capacitor?: CapacitorGlobal;
}
