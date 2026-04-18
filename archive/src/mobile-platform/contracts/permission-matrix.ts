// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Permission Matrix
// Per-permission rationale, denial fallback, retry policy, copy.
// ═══════════════════════════════════════════════════════════════

import type { MobileCapabilityId, MobileOS } from "./mobile-platform-contract";

export type PermissionRequirement = "required" | "optional" | "deferred";

export interface PermissionMatrixRow {
  permission: Extract<MobileCapabilityId,
    | "permissions.notifications"
    | "permissions.camera"
    | "permissions.photos"
    | "permissions.microphone"
    | "permissions.location"
    | "permissions.contacts"
    | "permissions.calendar"
    | "permissions.health"
  >;
  requirement: PermissionRequirement;
  /** Features that depend on this permission. */
  features: ReadonlyArray<string>;
  /** Per-OS rationale string shown to the user before the prompt. */
  rationale: Record<MobileOS, string>;
  /** What the app does when the user denies. */
  denialFallback: string;
  /** Whether the app may re-request after denial. */
  rerequestable: boolean;
  /** UX copy displayed when explaining why it's needed. */
  uiCopy: string;
}

export const MOBILE_PERMISSION_MATRIX: ReadonlyArray<PermissionMatrixRow> = [
  {
    permission: "permissions.notifications",
    requirement: "required",
    features: ["approvals", "boardroom-alerts", "sync-recovery", "emergency-actions"],
    rationale: {
      ios: "SITA needs to deliver approval requests and boardroom alerts when the app is closed.",
      android: "SITA needs to deliver approval requests and boardroom alerts when the app is closed.",
    },
    denialFallback: "Falls back to in-app inbox; user must open the app to see approvals.",
    rerequestable: true,
    uiCopy: "Allow notifications so you never miss an approval.",
  },
  {
    permission: "permissions.camera",
    requirement: "optional",
    features: ["quick-capture", "receipt-scan", "device-onboarding"],
    rationale: {
      ios: "Used to capture receipts and scan device-trust QR codes.",
      android: "Used to capture receipts and scan device-trust QR codes.",
    },
    denialFallback: "User can upload from photo library or files instead.",
    rerequestable: true,
    uiCopy: "Allow camera access to capture receipts and scan codes.",
  },
  {
    permission: "permissions.photos",
    requirement: "optional",
    features: ["quick-capture", "files"],
    rationale: {
      ios: "Used to attach images to records and proof receipts.",
      android: "Used to attach images to records and proof receipts.",
    },
    denialFallback: "User can use camera capture only or file picker.",
    rerequestable: true,
    uiCopy: "Allow access to your photos to attach images.",
  },
  {
    permission: "permissions.microphone",
    requirement: "optional",
    features: ["ai-chat-voice", "concierge-voice-note"],
    rationale: {
      ios: "Voice input for AI chat and concierge notes.",
      android: "Voice input for AI chat and concierge notes.",
    },
    denialFallback: "Voice features hidden; text input remains.",
    rerequestable: true,
    uiCopy: "Allow microphone for voice notes and AI chat.",
  },
  {
    permission: "permissions.location",
    requirement: "deferred",
    features: [],
    rationale: { ios: "Not currently requested.", android: "Not currently requested." },
    denialFallback: "n/a",
    rerequestable: false,
    uiCopy: "Not currently requested.",
  },
  {
    permission: "permissions.contacts",
    requirement: "deferred",
    features: [],
    rationale: { ios: "Not currently requested.", android: "Not currently requested." },
    denialFallback: "n/a",
    rerequestable: false,
    uiCopy: "Not currently requested.",
  },
  {
    permission: "permissions.calendar",
    requirement: "deferred",
    features: ["concierge-calendar"],
    rationale: {
      ios: "Concierge calendar integration is on the roadmap.",
      android: "Concierge calendar integration is on the roadmap.",
    },
    denialFallback: "Manual calendar entry.",
    rerequestable: true,
    uiCopy: "Allow calendar to coordinate concierge events.",
  },
  {
    permission: "permissions.health",
    requirement: "deferred",
    features: [],
    rationale: { ios: "HealthKit not enabled.", android: "Health Connect not enabled." },
    denialFallback: "n/a",
    rerequestable: false,
    uiCopy: "Not currently requested.",
  },
] as const;

export function getPermissionRow(id: PermissionMatrixRow["permission"]): PermissionMatrixRow | undefined {
  return MOBILE_PERMISSION_MATRIX.find((r) => r.permission === id);
}
