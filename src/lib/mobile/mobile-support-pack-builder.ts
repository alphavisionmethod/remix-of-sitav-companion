// SITA OS — Mobile Support Pack Builder
export interface MobileSupportScenario { readonly scenarioId: string; readonly label: string; readonly category: string; readonly diagnosticAvailable: boolean; readonly diagnosticSource: string; readonly runbookRef: string; readonly customerSafeExport: boolean; }
export const MOBILE_SUPPORT_SCENARIOS: readonly MobileSupportScenario[] = [
  { scenarioId: "mob-launch-fail", label: "App fails to launch on mobile browser", category: "launch", diagnosticAvailable: true, diagnosticSource: "Browser console + SW status", runbookRef: "docs/runbooks/runtime-probe-failure.md", customerSafeExport: true },
  { scenarioId: "mob-push-fail", label: "Push notifications not received", category: "push", diagnosticAvailable: true, diagnosticSource: "Web Push subscription status", runbookRef: "docs/runbooks/push-failure.md", customerSafeExport: true },
  { scenarioId: "mob-offline-stuck", label: "Stuck in offline mode", category: "offline", diagnosticAvailable: true, diagnosticSource: "SW cache status + navigator.onLine", runbookRef: "docs/runbooks/sync-lag.md", customerSafeExport: true },
  { scenarioId: "mob-auth-loop", label: "Auth redirect loop on mobile", category: "auth", diagnosticAvailable: true, diagnosticSource: "Auth session + cookie inspection", runbookRef: "docs/runbooks/auth-outage.md", customerSafeExport: true },
  { scenarioId: "mob-pwa-install", label: "PWA install prompt not appearing", category: "install", diagnosticAvailable: true, diagnosticSource: "beforeinstallprompt + manifest validity", runbookRef: "docs/runbooks/runtime-probe-failure.md", customerSafeExport: true },
  { scenarioId: "mob-perf", label: "Performance degraded on mobile", category: "performance", diagnosticAvailable: true, diagnosticSource: "Performance API metrics", runbookRef: "docs/runbooks/runtime-probe-failure.md", customerSafeExport: false },
  { scenarioId: "mob-native-ask", label: "User asks about native app", category: "distribution", diagnosticAvailable: false, diagnosticSource: "N/A", runbookRef: "docs/MOBILE_HONESTY.md", customerSafeExport: false },
];
export function getMobileSupportByCategory(cat: string): MobileSupportScenario[] { return MOBILE_SUPPORT_SCENARIOS.filter(s => s.category === cat); }
