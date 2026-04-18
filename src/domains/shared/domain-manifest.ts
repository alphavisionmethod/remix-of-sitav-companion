// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Manifest Contract
// Canonical type every domain declares against
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";

// ── Entity Definition ──
export interface DomainEntity {
  id: string;
  name: string;
  description: string;
  dbTable: string | null; // null = not yet persisted
  statusStates: string[];
  permissions: EntityPermissions;
  searchable: boolean;
  fileAttachable: boolean;
}

export interface EntityPermissions {
  create: string;
  read: string;
  update: string;
  delete: string;
  approve?: string;
}

// ── Workflow Definition ──
export interface DomainWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string; // event subject
  steps: WorkflowStep[];
  requiresApproval: boolean;
  emitsReceipt: boolean;
  notificationTriggers: string[];
  estimatedDurationMinutes?: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: "automated" | "human" | "approval" | "ai-assisted" | "verification";
  description: string;
  canFail: boolean;
  rollbackCapable: boolean;
}

// ── Shell Integration ──
export interface ShellHooks {
  launcher: LauncherConfig;
  commandPalette: CommandPaletteEntry[];
  searchProviders: SearchProvider[];
  notificationTriggers: NotificationTrigger[];
}

export interface LauncherConfig {
  appId: string;
  displayName: string;
  icon: string;
  category: string;
  badgeSource?: string; // query/event for badge count
  description: string;
  keywords: string[];
}

export interface CommandPaletteEntry {
  id: string;
  label: string;
  keywords: string[];
  action: string; // route or action key
  icon: string;
  shortcut?: string;
  requiresPermission?: string;
}

export interface SearchProvider {
  id: string;
  name: string;
  entityType: string;
  searchFields: string[];
  resultRoute: string; // route template with :id
  icon: string;
}

export interface NotificationTrigger {
  eventSubject: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  actionRoute?: string;
  groupKey?: string;
}

// ── Cross-Domain Events ──
export interface CrossDomainEvent {
  id: string;
  sourceEvent: string;
  sourceDomain: DomainId;
  targetDomain: DomainId;
  targetAction: string;
  description: string;
  direction: "emit" | "consume";
}

// ── Truth Model ──
export interface DomainTruthModel {
  freshnessThresholds: Record<string, number>; // entity → seconds
  simulatedSurfaces: string[]; // surfaces currently in demo/simulated mode
  dataSourceClassification: Record<string, DataSourceClass>;
  deterministic: string[]; // fields that must never be LLM-approximated
}

export type DataSourceClass = "live" | "synced" | "imported" | "derived" | "simulated" | "manual";

// ── AI Integration ──
export interface DomainAIConfig {
  advisorIds: string[];
  capabilityKeys: string[];
  allowedModels: string[];
  budgetClass: string;
}

// ── File Integration ──
export interface DomainFileConfig {
  acceptedTypes: string[];
  storageBucket: string;
  maxFileSizeMB: number;
  autoClassify: boolean;
}

// ── Boardroom Escalation ──
export interface EscalationConfig {
  autoEscalateRules: EscalationRule[];
  manualEscalationEnabled: boolean;
}

export interface EscalationRule {
  id: string;
  condition: string;
  description: string;
  severity: "info" | "warning" | "critical";
  minConfidence: number;
}

// ── Full Manifest ──
export interface DomainManifest {
  id: DomainId;
  name: string;
  description: string;
  owner: string;
  version: string;
  entities: DomainEntity[];
  workflows: DomainWorkflow[];
  shellIntegration: ShellHooks;
  crossDomainEvents: CrossDomainEvent[];
  truthModel: DomainTruthModel;
  aiIntegration: DomainAIConfig;
  fileIntegration: DomainFileConfig;
  boardroomEscalation: EscalationConfig;
}
