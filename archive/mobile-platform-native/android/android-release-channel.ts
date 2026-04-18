// ═══════════════════════════════════════════════════════════════
// SITA OS — Android Release Channel Map
// ═══════════════════════════════════════════════════════════════

import type { MobileReleaseChannel } from "../contracts/mobile-platform-contract";

export interface AndroidReleaseChannelSpec {
  channel: MobileReleaseChannel;
  applicationId: string;
  distribution: "internal-app-sharing" | "play-internal" | "play-closed" | "play-open" | "play-production";
  forcedUpdateBelowVersionCode: number | null;
  releaseNotesUrl: string | null;
}

export const ANDROID_RELEASE_CHANNELS: ReadonlyArray<AndroidReleaseChannelSpec> = [
  { channel: "internal",   applicationId: "com.sita.os.internal", distribution: "internal-app-sharing", forcedUpdateBelowVersionCode: null, releaseNotesUrl: null },
  { channel: "alpha",      applicationId: "com.sita.os.alpha",    distribution: "play-internal",        forcedUpdateBelowVersionCode: null, releaseNotesUrl: null },
  { channel: "beta",       applicationId: "com.sita.os.beta",     distribution: "play-closed",          forcedUpdateBelowVersionCode: null, releaseNotesUrl: null },
  { channel: "production", applicationId: "com.sita.os",          distribution: "play-production",      forcedUpdateBelowVersionCode: 1,    releaseNotesUrl: null },
] as const;
