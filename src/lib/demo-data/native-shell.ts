// ═══════════════════════════════════════════════════════════════
// SITA OS — Native Shell Strategy Demo Data
// Extracted from NSS01-04 hardcoded constants
// ═══════════════════════════════════════════════════════════════

export const DEMO_PLATFORMS = [
  { platform: "iOS (iPhone)", tech: ["Swift/SwiftUI", "WebView hybrid"], stage: "alpha", readiness: 25, approach: "Hybrid shell — native chrome, WebView content", blockers: ["Core navigation shell", "Push integration"], strengths: ["Fastest to market", "Shared web logic"] },
  { platform: "Android", tech: ["Kotlin/Compose", "WebView hybrid"], stage: "planned", readiness: 10, approach: "Hybrid shell — Material Design chrome, WebView content", blockers: ["Architecture design", "Material Design shell"], strengths: ["Native feel", "Play Store distribution"] },
  { platform: "iOS Tablet (iPad)", tech: ["SwiftUI", "Sidebar layout"], stage: "planned", readiness: 5, approach: "Extended phone shell with sidebar navigation", blockers: ["Awaiting iPhone shell", "Tablet layouts"], strengths: ["Multitasking", "Pencil support"] },
  { platform: "Android Tablet", tech: ["Compose", "Rail navigation"], stage: "planned", readiness: 5, approach: "Extended phone shell with rail navigation", blockers: ["Awaiting Android shell"], strengths: ["Foldable support", "Multi-window"] },
];

export const DEMO_STRATEGY_PRINCIPLES = [
  { principle: "One sovereign runtime", desc: "Core business logic lives in the web layer — native shells wrap it", priority: "P0" },
  { principle: "Native where it matters", desc: "Push, biometric, camera, haptics — these MUST be native", priority: "P0" },
  { principle: "WebView for content", desc: "Domain pages rendered in WebView — single source of truth", priority: "P0" },
  { principle: "Platform-native chrome", desc: "Navigation, tabs, status bar — all platform-native", priority: "P1" },
  { principle: "Progressive capability", desc: "Features degrade gracefully on less-capable surfaces", priority: "P1" },
  { principle: "Shared design tokens", desc: "Colors, spacing, typography sync across web and native", priority: "P1" },
];

export const DEMO_CAPABILITIES = [
  { cap: "Approvals", mobile: "full", desktop: "full", watch: "micro_action", tablet: "full", fit: "mobile_primary", nativeRequired: false },
  { cap: "Alerts", mobile: "full", desktop: "adapted", watch: "glance", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Advisor Chat", mobile: "full", desktop: "full", watch: "n/a", tablet: "full", fit: "mobile_supported", nativeRequired: false },
  { cap: "Daily Pulse", mobile: "full", desktop: "full", watch: "glance", tablet: "full", fit: "cross_surface", nativeRequired: false },
  { cap: "Quick Capture", mobile: "full", desktop: "minimal", watch: "n/a", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Boardroom", mobile: "adapted", desktop: "full", watch: "glance", tablet: "full", fit: "desktop_primary", nativeRequired: false },
  { cap: "Workflow Builder", mobile: "minimal", desktop: "full", watch: "n/a", tablet: "adapted", fit: "desktop_primary", nativeRequired: false },
  { cap: "AI Engineering", mobile: "n/a", desktop: "full", watch: "n/a", tablet: "adapted", fit: "not_mobile", nativeRequired: false },
  { cap: "Finance Workspace", mobile: "adapted", desktop: "full", watch: "n/a", tablet: "full", fit: "desktop_primary", nativeRequired: false },
  { cap: "Micro Approvals", mobile: "full", desktop: "n/a", watch: "micro_action", tablet: "n/a", fit: "wearable_micro", nativeRequired: true },
  { cap: "Camera Capture", mobile: "full", desktop: "n/a", watch: "n/a", tablet: "full", fit: "mobile_only", nativeRequired: true },
  { cap: "Biometric Actions", mobile: "full", desktop: "limited", watch: "wrist", tablet: "full", fit: "mobile_primary", nativeRequired: true },
  { cap: "Push Notifications", mobile: "full", desktop: "browser", watch: "full", tablet: "full", fit: "cross_surface", nativeRequired: true },
];

export const DEMO_SECURE_ACTIONS = [
  { risk: "Low", device: "Any trusted device", bio: "None required", session: "Standard", examples: ["View dashboard", "Read notifications", "Browse content"] },
  { risk: "Medium", device: "Phone/tablet with biometric", bio: "Fingerprint/Face", session: "Standard", examples: ["Approve low-risk action", "Edit profile", "Change preferences"] },
  { risk: "High", device: "Phone with biometric + session elevation", bio: "Required + elevated", session: "Elevated (15 min)", examples: ["Financial transaction", "Settings change", "Export data"] },
  { risk: "Critical", device: "Web/desktop with full auth", bio: "Required + MFA", session: "Elevated + MFA", examples: ["Delete account", "Revoke device", "Change auth provider"] },
];

export const DEMO_CONTINUITY_FLOWS = [
  { from: "Web", to: "App", context: ["Navigation state", "Assistant thread", "Form progress"], method: "Deep link + URL state", latency: "<2s", statePreserved: true },
  { from: "App", to: "Web", context: ["Document view", "Workflow step", "Boardroom card"], method: "Share URL", latency: "Immediate", statePreserved: true },
  { from: "Watch", to: "App", context: ["Approval context", "Alert detail", "Full thread"], method: "Deep link via push", latency: "<3s", statePreserved: true },
  { from: "App", to: "Desktop", context: ["Full context resume", "Complex workflows"], method: "Continuity / URL", latency: "<5s", statePreserved: true },
  { from: "Desktop", to: "App", context: ["Continue on mobile", "Quick approve"], method: "Push + deep link", latency: "<3s", statePreserved: false },
];

export const DEMO_TRUST_CONTINUITY = [
  { aspect: "Session portability", desc: "Auth sessions transfer across surfaces via secure token exchange", status: "planned" },
  { aspect: "Trust receipt chain", desc: "Each device approval creates a verifiable trust receipt", status: "planned" },
  { aspect: "Escalation tracking", desc: "Cross-device escalations logged with full audit trail", status: "planned" },
  { aspect: "Biometric downgrade prevention", desc: "Cannot approve high-risk action on lower-trust device", status: "designed" },
  { aspect: "Offline trust cache", desc: "Cached trust receipts allow offline approvals for low risk", status: "planned" },
  { aspect: "Device revocation propagation", desc: "Revoking trust on one device propagates to all linked surfaces", status: "designed" },
];

export const DEMO_NSS_TARGETS = [
  { target: "iPhone Shell", key: "nss_iphone", stage: "alpha", readiness: 25, webAlt: true, native: false, blockers: ["Core shell build", "Push integration"], critical: true },
  { target: "Android Shell", key: "nss_android", stage: "planned", readiness: 10, webAlt: true, native: false, blockers: ["Architecture design", "Material Design implementation"], critical: true },
  { target: "Tablet Shell", key: "nss_tablet", stage: "planned", readiness: 5, webAlt: true, native: false, blockers: ["Phone shells first", "Tablet layouts"], critical: false },
  { target: "App-Only Features", key: "nss_app_only", stage: "planned", readiness: 0, webAlt: false, native: true, blockers: ["Camera capture", "Biometric actions", "NFC"], critical: false },
  { target: "Web-Only Features", key: "nss_web_only", stage: "production", readiness: 100, webAlt: true, native: false, blockers: [] as string[], critical: false },
  { target: "Native-Only Features", key: "nss_native_only", stage: "planned", readiness: 0, webAlt: false, native: true, blockers: ["Push integration", "Background sync", "Widgets"], critical: true },
];

export const DEMO_ARCHITECTURE_LAYERS = [
  { layer: "Native Shell", items: ["Navigation chrome", "Push handling", "Biometric bridge", "Camera/NFC", "Haptic engine"], color: "bg-blue-500/10" },
  { layer: "Bridge Layer", items: ["JS ↔ Native messaging", "Auth token sync", "Deep link handler", "Capability detection"], color: "bg-amber-500/10" },
  { layer: "WebView Content", items: ["Domain pages (React)", "Business logic", "Design system", "State management"], color: "bg-green-500/10" },
];
