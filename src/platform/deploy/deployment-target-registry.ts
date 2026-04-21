// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Target Registry
// Canonical registry for all deployment surfaces
// ═══════════════════════════════════════════════════════════════

export enum DeploymentTarget {
  WEB = "web",
  PWA = "pwa",
  CAPACITOR_IOS = "capacitor-ios",
  CAPACITOR_ANDROID = "capacitor-android",
  ELECTRON_MACOS = "electron-macos",
  ELECTRON_WINDOWS = "electron-windows",
  ELECTRON_LINUX = "electron-linux",
  VMWARE_OVA = "vmware-ova",
  ISO = "iso",
  RAW_IMG = "raw-img",
  SUPABASE_EDGE = "supabase-edge",
}

export interface DeploymentTargetDefinition {
  target: DeploymentTarget;
  displayName: string;
  buildSteps: string[];
  requiredSecrets: string[];
  requiredCIGates: string[];
  readinessStatus: "ready" | "partial" | "planned" | "n/a";
  notes: string;
}

export const DEPLOYMENT_TARGETS: Record<DeploymentTarget, DeploymentTargetDefinition> = {
  [DeploymentTarget.WEB]: {
    target: DeploymentTarget.WEB,
    displayName: "Web (Lovable Hosting)",
    buildSteps: ["vite build", "deploy to Lovable"],
    requiredSecrets: ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"],
    requiredCIGates: ["build", "type-check", "route-truth", "plane-boundaries"],
    readinessStatus: "ready",
    notes: "Primary deployment target — always ready via Lovable publish.",
  },
  [DeploymentTarget.PWA]: {
    target: DeploymentTarget.PWA,
    displayName: "Progressive Web App",
    buildSteps: ["vite build with vite-plugin-pwa", "service-worker registration"],
    requiredSecrets: ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"],
    requiredCIGates: ["pwa-manifest-check", "service-worker-check"],
    readinessStatus: "partial",
    notes: "PWA manifest exists. Service worker excludes /~oauth.",
  },
  [DeploymentTarget.CAPACITOR_IOS]: {
    target: DeploymentTarget.CAPACITOR_IOS,
    displayName: "iOS (Capacitor)",
    buildSteps: ["vite build", "npx cap sync ios", "xcodebuild archive", "app store upload"],
    requiredSecrets: ["APPLE_TEAM_ID", "APPLE_SIGNING_CERT"],
    requiredCIGates: ["mobile-build-pipeline", "capacitor-mobile-truth"],
    readinessStatus: "partial",
    notes: "Capacitor config present. Requires Xcode + Apple Developer account.",
  },
  [DeploymentTarget.CAPACITOR_ANDROID]: {
    target: DeploymentTarget.CAPACITOR_ANDROID,
    displayName: "Android (Capacitor)",
    buildSteps: ["vite build", "npx cap sync android", "gradle assembleRelease", "play store upload"],
    requiredSecrets: ["ANDROID_KEYSTORE", "ANDROID_KEY_ALIAS"],
    requiredCIGates: ["mobile-build-pipeline", "capacitor-mobile-truth"],
    readinessStatus: "partial",
    notes: "Capacitor config present. Requires Android Studio + signing keys.",
  },
  [DeploymentTarget.ELECTRON_MACOS]: {
    target: DeploymentTarget.ELECTRON_MACOS,
    displayName: "Desktop — macOS (Electron)",
    buildSteps: ["vite build", "electron-builder --mac"],
    requiredSecrets: ["APPLE_NOTARIZE_ID", "APPLE_NOTARIZE_PASS"],
    requiredCIGates: ["desktop-deployability", "electron-signing-readiness"],
    readinessStatus: "planned",
    notes: "Electron contracts defined. Builder not yet wired.",
  },
  [DeploymentTarget.ELECTRON_WINDOWS]: {
    target: DeploymentTarget.ELECTRON_WINDOWS,
    displayName: "Desktop — Windows (Electron)",
    buildSteps: ["vite build", "electron-builder --win"],
    requiredSecrets: ["WIN_SIGNING_CERT"],
    requiredCIGates: ["desktop-deployability", "electron-signing-readiness"],
    readinessStatus: "planned",
    notes: "Electron contracts defined. Builder not yet wired.",
  },
  [DeploymentTarget.ELECTRON_LINUX]: {
    target: DeploymentTarget.ELECTRON_LINUX,
    displayName: "Desktop — Linux (Electron)",
    buildSteps: ["vite build", "electron-builder --linux"],
    requiredSecrets: [],
    requiredCIGates: ["desktop-deployability"],
    readinessStatus: "planned",
    notes: "Electron contracts defined. Builder not yet wired.",
  },
  [DeploymentTarget.VMWARE_OVA]: {
    target: DeploymentTarget.VMWARE_OVA,
    displayName: "VMware OVA Appliance",
    buildSteps: ["packer build", "ovftool export", "checksum + sign"],
    requiredSecrets: ["ATTESTATION_SIGNING_KEY"],
    requiredCIGates: ["ova-artifact-presence", "appliance-runtime-truth"],
    readinessStatus: "ready",
    notes: "OVA pipeline graduated to Phase 2 unattended install.",
  },
  [DeploymentTarget.ISO]: {
    target: DeploymentTarget.ISO,
    displayName: "Sovereign ISO Image",
    buildSteps: ["debootstrap", "kernel + initramfs", "grub install", "squashfs", "mkisofs"],
    requiredSecrets: ["ATTESTATION_SIGNING_KEY"],
    requiredCIGates: ["iso-artifact-presence", "appliance-runtime-truth"],
    readinessStatus: "ready",
    notes: "ISO pipeline GA. Autoinstall seeds present.",
  },
  [DeploymentTarget.RAW_IMG]: {
    target: DeploymentTarget.RAW_IMG,
    displayName: "Raw Disk Image",
    buildSteps: ["qemu-img create", "debootstrap", "grub-install", "checksum"],
    requiredSecrets: ["ATTESTATION_SIGNING_KEY"],
    requiredCIGates: ["raw-img-artifact-presence"],
    readinessStatus: "ready",
    notes: "Raw image pipeline GA. QEMU smoke tests wired.",
  },
  [DeploymentTarget.SUPABASE_EDGE]: {
    target: DeploymentTarget.SUPABASE_EDGE,
    displayName: "Backend (Edge Functions)",
    buildSteps: ["supabase functions deploy"],
    requiredSecrets: [],
    requiredCIGates: ["edge-function-contract-coverage"],
    readinessStatus: "ready",
    notes: "Auto-deployed by Lovable Cloud on push.",
  },
};

export function getTargetsForSurface(surfaceId: string): DeploymentTargetDefinition[] {
  const map: Record<string, DeploymentTarget[]> = {
    "sita-os-desktop": [DeploymentTarget.WEB, DeploymentTarget.ELECTRON_MACOS, DeploymentTarget.ELECTRON_WINDOWS, DeploymentTarget.ELECTRON_LINUX, DeploymentTarget.VMWARE_OVA, DeploymentTarget.ISO, DeploymentTarget.RAW_IMG],
    "sita-mobile-app": [DeploymentTarget.PWA, DeploymentTarget.CAPACITOR_IOS, DeploymentTarget.CAPACITOR_ANDROID],
    "sita-admin-backend": [DeploymentTarget.WEB],
    "sita-core-api": [DeploymentTarget.SUPABASE_EDGE],
  };
  return (map[surfaceId] || []).map(t => DEPLOYMENT_TARGETS[t]);
}