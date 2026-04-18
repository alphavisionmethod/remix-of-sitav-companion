// ═══════════════════════════════════════════════════════════════
// SITA OS — iOS Release Channel Map
// ═══════════════════════════════════════════════════════════════

import type { MobileReleaseChannel } from "../contracts/mobile-platform-contract";

export interface IOSReleaseChannelSpec {
  channel: MobileReleaseChannel;
  bundleId: string;
  distribution: "testflight-internal" | "testflight-external" | "appstore";
  forcedUpdateBelowVersion: string | null;
  releaseNotesUrl: string | null;
}

export const IOS_RELEASE_CHANNELS: ReadonlyArray<IOSReleaseChannelSpec> = [
  { channel: "internal",   bundleId: "com.sita.os.internal", distribution: "testflight-internal", forcedUpdateBelowVersion: null,    releaseNotesUrl: null },
  { channel: "alpha",      bundleId: "com.sita.os.alpha",    distribution: "testflight-internal", forcedUpdateBelowVersion: null,    releaseNotesUrl: null },
  { channel: "beta",       bundleId: "com.sita.os.beta",     distribution: "testflight-external", forcedUpdateBelowVersion: null,    releaseNotesUrl: null },
  { channel: "production", bundleId: "com.sita.os",          distribution: "appstore",            forcedUpdateBelowVersion: "1.0.0", releaseNotesUrl: null },
] as const;
