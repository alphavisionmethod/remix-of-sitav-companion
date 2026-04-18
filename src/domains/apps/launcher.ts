// ═══════════════════════════════════════════════════════════════
// SITA OS — App Store Launcher Helper
// ═══════════════════════════════════════════════════════════════

export function openAppStoreModule(module: string = "store", params?: Record<string, string>) {
  (window as any).__appStoreInitialModule = module;
  window.dispatchEvent(
    new CustomEvent("sita-open-app-store", { detail: { module, ...params } })
  );
}

export function openAppDetail(appId: string) {
  openAppStoreModule("app-detail", { appId });
}

export function openAppStoreHome() {
  openAppStoreModule("store");
}
