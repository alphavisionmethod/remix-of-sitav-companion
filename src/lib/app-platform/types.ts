// ═══════════════════════════════════════════════════════════════
// SITA OS — Application Platform Types
// ═══════════════════════════════════════════════════════════════

export type AppClass = "native" | "web-app" | "wrapped-app" | "internal" | "extension" | "external";
export type AppTrustLevel = "sita-verified" | "publisher-verified" | "enterprise-approved" | "community-reviewed" | "unknown-source" | "local-unverified";
export type AppInstallStatus = "not-installed" | "installing" | "installed" | "updating" | "update-available" | "uninstalling" | "blocked" | "requires-approval";
export type AppCategory = "browsers" | "communication" | "productivity" | "developer-tools" | "business" | "finance" | "media" | "utilities" | "household" | "security" | "education" | "entertainment" | "enterprise" | "extensions";

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
  actionType: "install" | "update" | "uninstall" | "permission-change" | "repair";
  timestamp: string;
  actor: string;
  version: string;
  sourceInfo: string;
  permissionSummary: string[];
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
