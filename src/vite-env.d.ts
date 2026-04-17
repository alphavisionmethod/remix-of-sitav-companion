/// <reference types="vite/client" />

// Navigator.deviceMemory (Device Memory API — experimental)
interface Navigator {
  readonly deviceMemory?: number;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

interface SitaNativeAppLaunchResult {
  ok: boolean;
  appId: string;
  reason?: string;
  fallbackUrl?: string;
}

interface SitaAppsBridge {
  launchNativeApp?: (appId: string) => Promise<SitaNativeAppLaunchResult>;
  checkNativeAppAvailability?: (
    appId: string,
  ) => Promise<{ available: boolean; appId: string; reason?: string }>;
  openExternalUrl?: (url: string) => Promise<{ ok: boolean; reason?: string }>;
  getHostCapabilities?: () => Promise<{
    platform: string;
    canLaunchNative: boolean;
    allowlistedAppIds: string[];
  }>;
}

interface Window {
  electron?: {
    platform?: string;
    sendNotification?: (title: string, body: string) => void;
  };
  sitaApps?: SitaAppsBridge;
  Capacitor?: CapacitorGlobal;
}
