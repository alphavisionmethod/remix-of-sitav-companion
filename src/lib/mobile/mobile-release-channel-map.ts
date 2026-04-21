// SITA OS — Mobile Release Channel Map
export type MobileChannelStatus = "active" | "blocked" | "deferred";
export interface MobileReleaseChannel { readonly channelId: string; readonly platform: "ios" | "android" | "pwa"; readonly label: string; readonly status: MobileChannelStatus; readonly mechanism: string; readonly prerequisites: string[]; readonly rollbackSupported: boolean; }
export const MOBILE_RELEASE_CHANNELS: readonly MobileReleaseChannel[] = [
  { channelId: "pwa-web", platform: "pwa", label: "PWA (Web Deploy)", status: "active", mechanism: "CDN deploy; SW auto-updates", prerequisites: [], rollbackSupported: true },
  { channelId: "ios-testflight", platform: "ios", label: "iOS TestFlight", status: "blocked", mechanism: "Upload IPA via App Store Connect", prerequisites: ["Apple Developer Program", "Signing certs", "TestFlight config"], rollbackSupported: false },
  { channelId: "ios-appstore", platform: "ios", label: "iOS App Store", status: "blocked", mechanism: "App Store Connect submission", prerequisites: ["TestFlight tested", "Review passed"], rollbackSupported: false },
  { channelId: "android-internal", platform: "android", label: "Android Internal Track", status: "blocked", mechanism: "Upload AAB to Play Console", prerequisites: ["Play Console enrolled", "Keystore provisioned"], rollbackSupported: true },
  { channelId: "android-production", platform: "android", label: "Google Play Store", status: "blocked", mechanism: "Promote from internal track", prerequisites: ["Internal testing done", "Review passed"], rollbackSupported: true },
];
export function getActiveChannels(): MobileReleaseChannel[] { return MOBILE_RELEASE_CHANNELS.filter(c => c.status === "active"); }
export function getBlockedChannels(): MobileReleaseChannel[] { return MOBILE_RELEASE_CHANNELS.filter(c => c.status === "blocked"); }
