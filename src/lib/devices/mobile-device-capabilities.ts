// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Device Capabilities
// Mobile-specific capability declarations
// ═══════════════════════════════════════════════════════════════

export interface MobileCapability {
  id: string;
  name: string;
  available: boolean;
  detectionApi: string;
  fallback: string;
  iosSupport: boolean;
  androidSupport: boolean;
  requiresPermission: boolean;
  permissionPrompt: string;
}

export const MOBILE_DEVICE_CAPABILITIES: MobileCapability[] = [
  { id: "touch", name: "Touch Input", available: true, detectionApi: "ontouchstart in window", fallback: "mouse events", iosSupport: true, androidSupport: true, requiresPermission: false, permissionPrompt: "" },
  { id: "gyroscope", name: "Gyroscope", available: true, detectionApi: "DeviceOrientationEvent", fallback: "disabled", iosSupport: true, androidSupport: true, requiresPermission: true, permissionPrompt: "Allow motion sensing?" },
  { id: "camera", name: "Camera", available: true, detectionApi: "navigator.mediaDevices.getUserMedia", fallback: "file upload", iosSupport: true, androidSupport: true, requiresPermission: true, permissionPrompt: "Allow camera access?" },
  { id: "push-notifications", name: "Push Notifications", available: true, detectionApi: "PushManager", fallback: "in-app notifications", iosSupport: true, androidSupport: true, requiresPermission: true, permissionPrompt: "Allow notifications?" },
  { id: "biometric-faceid", name: "Face ID", available: true, detectionApi: "WebAuthn API", fallback: "PIN/password", iosSupport: true, androidSupport: false, requiresPermission: true, permissionPrompt: "Use Face ID?" },
  { id: "biometric-touchid", name: "Touch ID / Fingerprint", available: true, detectionApi: "WebAuthn API", fallback: "PIN/password", iosSupport: true, androidSupport: true, requiresPermission: true, permissionPrompt: "Use fingerprint?" },
  { id: "nfc", name: "NFC", available: true, detectionApi: "NDEFReader", fallback: "disabled", iosSupport: false, androidSupport: true, requiresPermission: true, permissionPrompt: "Allow NFC access?" },
  { id: "haptic", name: "Haptic Feedback", available: true, detectionApi: "navigator.vibrate", fallback: "visual feedback", iosSupport: true, androidSupport: true, requiresPermission: false, permissionPrompt: "" },
  { id: "background-fetch", name: "Background Fetch", available: true, detectionApi: "BackgroundFetchManager", fallback: "foreground sync", iosSupport: false, androidSupport: true, requiresPermission: false, permissionPrompt: "" },
  { id: "offline-storage", name: "Offline Storage", available: true, detectionApi: "navigator.storage.estimate", fallback: "reduced cache", iosSupport: true, androidSupport: true, requiresPermission: false, permissionPrompt: "" },
  { id: "geolocation", name: "GPS / Geolocation", available: true, detectionApi: "navigator.geolocation", fallback: "manual location entry", iosSupport: true, androidSupport: true, requiresPermission: true, permissionPrompt: "Allow location access?" },
  { id: "share-api", name: "Native Share", available: true, detectionApi: "navigator.share", fallback: "copy to clipboard", iosSupport: true, androidSupport: true, requiresPermission: false, permissionPrompt: "" },
];

// ── Queries ──────────────────────────────────────────────────

export function getMobileCapability(id: string): MobileCapability | undefined {
  return MOBILE_DEVICE_CAPABILITIES.find(c => c.id === id);
}

export function getIOSCapabilities(): MobileCapability[] {
  return MOBILE_DEVICE_CAPABILITIES.filter(c => c.iosSupport);
}

export function getAndroidCapabilities(): MobileCapability[] {
  return MOBILE_DEVICE_CAPABILITIES.filter(c => c.androidSupport);
}

export function getPermissionRequiredCapabilities(): MobileCapability[] {
  return MOBILE_DEVICE_CAPABILITIES.filter(c => c.requiresPermission);
}
