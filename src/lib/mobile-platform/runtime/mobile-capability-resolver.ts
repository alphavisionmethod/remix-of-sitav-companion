// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Capability Resolver
// Single entry point for "can mobile do X right now?"
// ═══════════════════════════════════════════════════════════════

import type {
  MobileCapabilityId,
  MobileCapabilityStatus,
  MobileOS,
} from "../contracts/mobile-platform-contract";
import { getIOSCapability } from "../contracts/ios-capability-matrix";
import { getAndroidCapability } from "../contracts/android-capability-matrix";
import { MOBILE_PLATFORM_FLAGS } from "./mobile-platform-flags";

export interface CapabilityResolution {
  capability: MobileCapabilityId;
  status: MobileCapabilityStatus;
  os: MobileOS | null;
  fallback: string | null;
  note: string;
}

export function resolveMobileCapability(
  capability: MobileCapabilityId,
  os: MobileOS | null,
): CapabilityResolution {
  if (!os) {
    return {
      capability,
      status: "unsupported",
      os: null,
      fallback: "web fallback",
      note: "No mobile OS detected — running web fallback.",
    };
  }

  const row = os === "ios" ? getIOSCapability(capability) : getAndroidCapability(capability);
  if (!row) {
    return { capability, status: "unsupported", os, fallback: null, note: "Capability not declared." };
  }

  // Apply runtime flags (kill-switches)
  let status = row.status;
  if (capability === "push.apns" && MOBILE_PLATFORM_FLAGS.apnsDisabled) status = "roadmap";
  if (capability === "push.fcm"  && MOBILE_PLATFORM_FLAGS.fcmDisabled)  status = "roadmap";

  return { capability, status, os, fallback: row.fallback, note: row.note };
}
