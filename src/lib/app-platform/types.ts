// ═══════════════════════════════════════════════════════════════
// SITA OS — Application Platform Types
// Full runtime, packaging, trust, and lifecycle model
// ═══════════════════════════════════════════════════════════════

export type AppClass = "native" | "web-app" | "wrapped-app" | "internal" | "extension" | "external";
export type AppTrustLevel = "sita-verified" | "publisher-verified" | "enterprise-approved" | "community-reviewed" | "unknown-source" | "local-unverified";
export type AppInstallStatus = "not-installed" | "installing" | "installed" | "updating" | "update-available" | "uninstalling" | "blocked" | "requires-approval";
export type AppCategory = "browsers" | "communication" | "productivity" | "developer-tools" | "business" | "finance" | "media" | "utilities" | "household" | "security" | "education" | "entertainment" | "enterprise" | "extensions";

// RUX02 — Source Origin Model
export type AppSourceOrigin =
  | "sita-store"
  | "publisher-direct"
  | "web-install"
  | "private-catalog"
  | "external-file"
  | "external-url"
  | "local-sideload"
  | "system-preinstalled";

// RUX05 — Install Scope Model
export type AppInstallScope = "user" | "system" | "sandbox" | "enterprise-managed";

// RUX06 — Sandbox / Restriction Model
export type AppSandboxLevel =
  | "standard"
  | "restricted"
  | "limited-files"
  | "enterprise-managed"
  | "approval-required";

// RUX04 — User-facing package type (abstracts deb/rpm/flatpak etc.)
export type AppPackageType =
  | "native-application"
  | "web-app"
  | "wrapped-web-app"
  | "internal-tool"
  | "capability-pack"
  | "external-package";

// RUX08 — Update source model
export type AppUpdateMode = "store-managed" | "publisher-managed" | "enterprise-managed" | "web-runtime" | "manual";

export interface AppPermission {
  id: string;
  domain: string;
  label: string;
  description: string;
  granted: boolean;
  required: boolean;
  riskLevel: "low" | "medium" | "high";
}

export interface FileAssociation {
  extension: string;
  mimeType: string;
  label: string;
  isDefault: boolean;
}

export interface ProtocolAssociation {
  protocol: string;
  label: string;
  isDefault: boolean;
}

export interface AppLifecycleReceipt {
  receiptId: string;
  appId: string;
  actionType: "install" | "update" | "uninstall" | "permission-change" | "repair" | "trust-reclassification";
  timestamp: string;
  actor: string;
  version: string;
  sourceInfo: string;
  permissionSummary: string[];
  permissionDelta?: { added: string[]; removed: string[] };
  associationDelta?: { added: string[]; removed: string[] };
  approvalStatus: "auto" | "approved" | "pending";
  result: "success" | "failed" | "partial";
}

export interface AppDefinition {
  id: string;
  name: string;
  publisher: string;
  icon: string;
  iconBg: string;
  category: AppCategory;
  appClass: AppClass;
  trustLevel: AppTrustLevel;
  version: string;
  size: string;
  shortDescription: string;
  fullDescription: string;
  whySitaRecommends?: string;
  screenshots: string[];
  rating: number;
  downloads: number;
  lastUpdated: string;
  releaseNotes: string[];
  permissions: AppPermission[];
  fileAssociations: FileAssociation[];
  protocolAssociations: ProtocolAssociation[];
  worksWithSita: string[];
  updateSource: "store-managed" | "publisher-managed" | "enterprise-managed";
  startupBehavior: "none" | "background" | "visible";
  notificationPermission: boolean;
  installStatus: AppInstallStatus;
  installedAt?: string;
  pinnedToDock: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags: string[];
  receipts: AppLifecycleReceipt[];

  // RUX fields
  sourceOrigin?: AppSourceOrigin;
  installScope?: AppInstallScope;
  sandboxLevel?: AppSandboxLevel;
  packageType?: AppPackageType;
  updateMode?: AppUpdateMode;
  managedByPolicy?: boolean;
  supportUrl?: string;
  privacyUrl?: string;
  routePath?: string;
  externalUrl?: string;
}

export interface AppBundle {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  iconBg: string;
  appIds: string[];
  recommendedFor: string[];
  totalSize: string;
  featured?: boolean;
}
