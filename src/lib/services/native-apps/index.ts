// Re-export the existing native-apps surface for app-platform consumers
export {
  NATIVE_APP_ALLOWLIST,
  getNativeAppEntry,
  isAllowlistedNativeApp,
  type NativeAppEntry,
} from "./registry";
export {
  checkNativeAppAvailability,
  isDesktopHost,
  type NativeAppAvailability,
} from "./detection";
export {
  launchNativeApp,
  type NativeLaunchOutcome,
} from "./launch";
