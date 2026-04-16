// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Manifest Registry
// Unified queryable registry for all domain manifests
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";
import type { DomainManifest, DomainEntity, DomainWorkflow, CommandPaletteEntry, SearchProvider, DomainTruthModel } from "./domain-manifest";
import { businessManifest } from "./manifests/business-manifest";
import { financeManifest } from "./manifests/finance-manifest";
import { conciergeManifest } from "./manifests/concierge-manifest";
import { platformManifest } from "./manifests/platform-manifest";
import { crossDomainEventFlows, type CrossDomainEventFlow } from "./manifests/cross-domain-manifest";
import { scoreDomainCompleteness, type DomainCompletenessScore } from "./domain-completeness";

const manifests: Record<string, DomainManifest> = {
  business: businessManifest,
  finance: financeManifest,
  concierge: conciergeManifest,
  platform: platformManifest,
};

export function getDomainManifest(id: DomainId): DomainManifest | undefined {
  return manifests[id];
}

export function getAllDomains(): DomainManifest[] {
  return Object.values(manifests);
}

export function getDomainEntities(id: DomainId): DomainEntity[] {
  return manifests[id]?.entities ?? [];
}

export function getDomainWorkflows(id: DomainId): DomainWorkflow[] {
  return manifests[id]?.workflows ?? [];
}

export function getShellCommands(id?: DomainId): CommandPaletteEntry[] {
  if (id) return manifests[id]?.shellIntegration.commandPalette ?? [];
  return getAllDomains().flatMap((d) => d.shellIntegration.commandPalette);
}

export function getSearchProviders(id?: DomainId): SearchProvider[] {
  if (id) return manifests[id]?.shellIntegration.searchProviders ?? [];
  return getAllDomains().flatMap((d) => d.shellIntegration.searchProviders);
}

export function getCrossDomainEvents(): CrossDomainEventFlow[] {
  return crossDomainEventFlows;
}

export function getDomainTruthModel(id: DomainId): DomainTruthModel | undefined {
  return manifests[id]?.truthModel;
}

export function getDomainCompleteness(id: DomainId): DomainCompletenessScore | undefined {
  const manifest = manifests[id];
  if (!manifest) return undefined;
  return scoreDomainCompleteness(manifest);
}

export function getAllDomainCompleteness(): DomainCompletenessScore[] {
  return getAllDomains().map(scoreDomainCompleteness);
}
