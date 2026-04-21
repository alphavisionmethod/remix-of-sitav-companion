// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Boundary Map
// Declares primary purpose, core objects, allowed/forbidden
// overlaps, and ownership for each major product domain.
// ═══════════════════════════════════════════════════════════════

import type { TaskDomain } from "./task-action-model";

export interface DomainBoundary {
  readonly domain: TaskDomain;
  readonly displayName: string;
  readonly purpose: string;
  readonly coreObjects: readonly string[];
  readonly allowedOverlaps: readonly TaskDomain[];
  readonly forbiddenOverlaps: readonly TaskDomain[];
  readonly navigationEntries: readonly string[];
  readonly ownerService: string;
}

export const DOMAIN_BOUNDARY_MAP: readonly DomainBoundary[] = [
  { domain: "business",     displayName: "Business",      purpose: "CRM, client management, proposals",            coreObjects: ["client", "contact", "proposal", "project"],           allowedOverlaps: ["finance", "concierge", "files"], forbiddenOverlaps: ["admin", "system"],   navigationEntries: ["/business"],          ownerService: "business-domain" },
  { domain: "finance",      displayName: "Finance",       purpose: "Invoicing, payments, accounting, tax",         coreObjects: ["invoice", "payment", "expense", "tax-record"],        allowedOverlaps: ["business", "integrations"],      forbiddenOverlaps: ["admin", "system"],   navigationEntries: ["/finance"],           ownerService: "finance-domain" },
  { domain: "concierge",    displayName: "Concierge",     purpose: "Scheduling, communications, task management",  coreObjects: ["appointment", "message", "reminder", "task"],         allowedOverlaps: ["business", "ai"],                forbiddenOverlaps: ["admin", "system"],   navigationEntries: ["/concierge"],         ownerService: "concierge-domain" },
  { domain: "files",        displayName: "Files",         purpose: "Document management, storage, AI analysis",    coreObjects: ["file", "folder", "document", "template"],             allowedOverlaps: ["business", "finance", "ai"],     forbiddenOverlaps: ["admin"],             navigationEntries: ["/files"],             ownerService: "files-domain" },
  { domain: "trust",        displayName: "Trust Center",  purpose: "Compliance, privacy, evidence, provenance",    coreObjects: ["trust-claim", "evidence", "consent", "audit-entry"],  allowedOverlaps: ["admin", "ai"],                   forbiddenOverlaps: [],                   navigationEntries: ["/trust"],             ownerService: "trust-domain" },
  { domain: "admin",        displayName: "Admin",         purpose: "Operator controls, fleet, diagnostics",        coreObjects: ["user", "role", "policy", "session", "release"],       allowedOverlaps: ["trust", "system"],                forbiddenOverlaps: ["business", "finance"], navigationEntries: ["/admin"],          ownerService: "admin-domain" },
  { domain: "integrations", displayName: "Integrations",  purpose: "External connectors, sync, webhooks",          coreObjects: ["connector", "sync-job", "webhook", "mapping"],        allowedOverlaps: ["business", "finance"],            forbiddenOverlaps: ["admin"],             navigationEntries: ["/integrations"],      ownerService: "integrations-domain" },
  { domain: "ai",           displayName: "AI / Advisors", purpose: "AI advisors, boardroom, recommendations",      coreObjects: ["advisor", "recommendation", "invocation", "memory"], allowedOverlaps: ["business", "finance", "concierge", "files", "trust"], forbiddenOverlaps: [], navigationEntries: ["/ai"], ownerService: "ai-domain" },
  { domain: "workflows",    displayName: "Workflows",     purpose: "Automation, approval chains, orchestration",   coreObjects: ["workflow", "run", "step", "trigger"],                 allowedOverlaps: ["business", "finance", "ai"],     forbiddenOverlaps: ["admin"],             navigationEntries: ["/workflows"],         ownerService: "workflows-domain" },
  { domain: "support",      displayName: "Support",       purpose: "Help, diagnostics, issue resolution",          coreObjects: ["ticket", "article", "diagnostic", "runbook"],         allowedOverlaps: ["admin", "trust"],                 forbiddenOverlaps: [],                   navigationEntries: ["/support"],           ownerService: "support-domain" },
  { domain: "settings",     displayName: "Settings",      purpose: "User/workspace preferences, configuration",    coreObjects: ["preference", "config-entry"],                         allowedOverlaps: ["admin"],                          forbiddenOverlaps: [],                   navigationEntries: ["/settings"],          ownerService: "settings-domain" },
  { domain: "system",       displayName: "System",        purpose: "OS runtime, boot, recovery, updates",          coreObjects: ["runtime-config", "health-check", "update"],           allowedOverlaps: ["admin"],                          forbiddenOverlaps: ["business", "finance"], navigationEntries: ["/system"],         ownerService: "system-domain" },
] as const;