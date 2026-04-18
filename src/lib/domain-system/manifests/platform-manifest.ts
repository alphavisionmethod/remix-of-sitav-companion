// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Domain Manifest
// ═══════════════════════════════════════════════════════════════

import type { DomainManifest } from "../domain-manifest";

export const platformManifest: DomainManifest = {
  id: "platform",
  name: "Platform Services",
  description: "Core infrastructure: auth, approvals, workflows, notifications, connectors, AI gateway, files, and storage",
  owner: "platform-service",
  version: "1.0.0",

  entities: [
    { id: "user", name: "User", description: "Authenticated user account", dbTable: "profiles", statusStates: ["active", "suspended", "deactivated"], permissions: { create: "platform.user.create", read: "platform.user.read", update: "platform.user.update", delete: "platform.user.delete" }, searchable: true, fileAttachable: false },
    { id: "approval", name: "Approval", description: "Pending approval request", dbTable: "admin_action_confirmations", statusStates: ["pending", "approved", "rejected", "expired", "escalated"], permissions: { create: "platform.approval.create", read: "platform.approval.read", update: "platform.approval.update", delete: "platform.approval.delete", approve: "platform.approval.decide" }, searchable: true, fileAttachable: false },
    { id: "workflow-instance", name: "Workflow Instance", description: "Running workflow execution", dbTable: null, statusStates: ["pending", "running", "waiting-approval", "completed", "failed", "stuck", "rolled-back"], permissions: { create: "platform.workflow.create", read: "platform.workflow.read", update: "platform.workflow.update", delete: "platform.workflow.delete" }, searchable: true, fileAttachable: false },
    { id: "notification", name: "Notification", description: "User notification", dbTable: "notifications", statusStates: ["unread", "read", "dismissed", "actioned"], permissions: { create: "platform.notification.create", read: "platform.notification.read", update: "platform.notification.update", delete: "platform.notification.delete" }, searchable: false, fileAttachable: false },
    { id: "connector", name: "Connector", description: "External service integration", dbTable: "connectors", statusStates: ["connected", "disconnected", "error", "syncing", "expired"], permissions: { create: "platform.connector.create", read: "platform.connector.read", update: "platform.connector.update", delete: "platform.connector.delete" }, searchable: true, fileAttachable: false },
    { id: "file", name: "File", description: "Uploaded or generated file", dbTable: "files", statusStates: ["uploading", "processing", "classified", "indexed", "error"], permissions: { create: "platform.file.create", read: "platform.file.read", update: "platform.file.update", delete: "platform.file.delete" }, searchable: true, fileAttachable: false },
    { id: "receipt", name: "Receipt", description: "Proof of action or decision", dbTable: "receipts", statusStates: ["created", "verified", "disputed"], permissions: { create: "platform.receipt.create", read: "platform.receipt.read", update: "platform.receipt.update", delete: "platform.receipt.delete" }, searchable: true, fileAttachable: false },
    { id: "session", name: "Session", description: "User login session", dbTable: "admin_sessions", statusStates: ["active", "expired", "revoked"], permissions: { create: "platform.session.create", read: "platform.session.read", update: "platform.session.update", delete: "platform.session.delete" }, searchable: false, fileAttachable: false },
  ],

  workflows: [
    {
      id: "file-ingestion", name: "File Ingestion", description: "Process uploaded files through classification and indexing",
      trigger: "file.uploaded", requiresApproval: false, emitsReceipt: true,
      notificationTriggers: ["file.classified"],
      steps: [
        { id: "classify", name: "Classify", type: "ai-assisted", description: "AI classifies file type and domain", canFail: true, rollbackCapable: false },
        { id: "extract", name: "Extract", type: "automated", description: "Extract text and metadata", canFail: true, rollbackCapable: false },
        { id: "enrich", name: "Enrich", type: "ai-assisted", description: "AI enriches with tags and summaries", canFail: true, rollbackCapable: false },
        { id: "index", name: "Index", type: "automated", description: "Add to search index", canFail: true, rollbackCapable: true },
        { id: "route", name: "Route", type: "automated", description: "Route to appropriate domain", canFail: false, rollbackCapable: false },
        { id: "notify", name: "Notify", type: "automated", description: "Notify owner of processing result", canFail: true, rollbackCapable: false },
      ],
    },
    {
      id: "pack-install", name: "Pack Install", description: "Install a capability pack with verification",
      trigger: "pack.install-requested", requiresApproval: true, emitsReceipt: true,
      notificationTriggers: ["pack.installed"],
      steps: [
        { id: "verify", name: "Verify Compatibility", type: "automated", description: "Check system compatibility", canFail: true, rollbackCapable: false },
        { id: "check-permissions", name: "Check Permissions", type: "automated", description: "Verify user has install permission", canFail: true, rollbackCapable: false },
        { id: "install", name: "Install", type: "automated", description: "Install pack components", canFail: true, rollbackCapable: true },
        { id: "onboard", name: "Run Onboarding", type: "automated", description: "Execute pack onboarding flow", canFail: true, rollbackCapable: true },
        { id: "configure", name: "Configure", type: "human", description: "User configures pack settings", canFail: false, rollbackCapable: true },
        { id: "activate", name: "Activate", type: "automated", description: "Activate pack for use", canFail: false, rollbackCapable: true },
      ],
    },
  ],

  shellIntegration: {
    launcher: {
      appId: "platform", displayName: "System", icon: "Settings", category: "System",
      description: "Platform settings, connectors, and system management",
      keywords: ["settings", "system", "platform", "admin", "config"],
    },
    commandPalette: [
      { id: "plat-settings", label: "Settings", keywords: ["settings", "preferences", "config"], action: "/settings", icon: "Settings" },
      { id: "plat-connectors", label: "Connectors", keywords: ["connector", "integration", "sync"], action: "/settings/connectors", icon: "Plug" },
      { id: "plat-files", label: "All Files", keywords: ["files", "documents", "uploads"], action: "/files", icon: "FolderOpen" },
      { id: "plat-approvals", label: "Pending Approvals", keywords: ["approval", "pending", "review"], action: "/approvals", icon: "CheckCircle" },
    ],
    searchProviders: [
      { id: "search-files", name: "Files", entityType: "file", searchFields: ["name", "tags", "content"], resultRoute: "/files/:id", icon: "File" },
      { id: "search-notifications", name: "Notifications", entityType: "notification", searchFields: ["title", "body"], resultRoute: "/notifications", icon: "Bell" },
    ],
    notificationTriggers: [
      { eventSubject: "approval.requested", title: "Approval needed", priority: "high", actionRoute: "/approvals/:id", groupKey: "platform-approvals" },
      { eventSubject: "connector.error", title: "Connector error", priority: "critical", actionRoute: "/settings/connectors", groupKey: "platform-connectors" },
      { eventSubject: "file.classified", title: "File processed", priority: "low", actionRoute: "/files/:id", groupKey: "platform-files" },
    ],
  },

  crossDomainEvents: [
    { id: "plat-all-approval", sourceEvent: "approval.approved", sourceDomain: "platform", targetDomain: "cross-domain", targetAction: "workflow.resume", description: "Resume blocked workflow on approval", direction: "emit" },
    { id: "plat-all-file", sourceEvent: "file.classified", sourceDomain: "platform", targetDomain: "cross-domain", targetAction: "domain.file-routed", description: "Route classified file to owning domain", direction: "emit" },
  ],

  truthModel: {
    freshnessThresholds: { user: 86400, approval: 300, connector: 300, file: 3600, notification: 60 },
    simulatedSurfaces: [],
    dataSourceClassification: { user: "live", approval: "live", connector: "synced", file: "live", notification: "live" },
    deterministic: [],
  },

  aiIntegration: {
    advisorIds: [],
    capabilityKeys: ["file-classification", "content-extraction"],
    allowedModels: ["google/gemini-2.5-flash-lite"],
    budgetClass: "economy",
  },

  fileIntegration: {
    acceptedTypes: ["*/*"],
    storageBucket: "platform-files",
    maxFileSizeMB: 100,
    autoClassify: true,
  },

  boardroomEscalation: {
    manualEscalationEnabled: false,
    autoEscalateRules: [],
  },
};
