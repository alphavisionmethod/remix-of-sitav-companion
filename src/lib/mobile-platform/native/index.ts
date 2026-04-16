// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Bridge Barrel (Phase 3)
// ═══════════════════════════════════════════════════════════════

export {
  isCapacitorAvailable,
  getCapacitorPlatform,
  invokeCapacitorPlugin,
  CAPACITOR_PLUGIN_MISSING,
} from "./capacitor-bridge";
export { nativeSecureStorage } from "./native-secure-storage";
export { nativeBiometric } from "./native-biometric";
export { nativeAppLifecycle } from "./native-app-lifecycle";
export { nativePush } from "./native-push";
