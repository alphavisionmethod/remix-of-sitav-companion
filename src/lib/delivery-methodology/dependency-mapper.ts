// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Automatic Dependency Mapper
// Maps contracts, services, policies, probes needed per feature
// ═══════════════════════════════════════════════════════════════

import type { FeatureBlueprint } from "./feature-factory";

export interface DependencyMap {
  featureId: string;
  requiredContracts: string[];
  requiredServices: string[];
  requiredPolicies: string[];
  requiredProofs: string[];
  requiredEvents: string[];
  requiredProjections: string[];
  requiredJourneyTests: string[];
  requiredProbes: string[];
  launchGates: string[];
  resolvedCount: number;
  totalCount: number;
}

export function mapDependencies(blueprint: FeatureBlueprint): DependencyMap {
  const contracts: string[] = [`${blueprint.featureId}-entity-contract`];
  const services: string[] = [`${blueprint.featureId}-service`];
  const policies: string[] = [];
  const proofs: string[] = [];
  const events: string[] = [`${blueprint.featureId}.created`, `${blueprint.featureId}.updated`];
  const projections: string[] = [];
  const journeyTests: string[] = [];
  const probes: string[] = [];
  const launchGates: string[] = ["route-registered", "no-mock-imports"];

  // Persistence dependencies
  if (blueprint.persistenceClass !== "ephemeral") {
    services.push("persistence-adapter");
    contracts.push(`${blueprint.featureId}-persistence-contract`);
    launchGates.push("persistence-verified");
  }
  if (blueprint.persistenceClass === "durable" || blueprint.persistenceClass === "compliance-sensitive") {
    events.push(`${blueprint.featureId}.persisted`);
    probes.push(`probe-${blueprint.featureId}-persistence-health`);
  }

  // Trust dependencies
  if (blueprint.trustNeeds !== "none") {
    proofs.push(`${blueprint.featureId}-action-receipt`);
    contracts.push(`${blueprint.featureId}-proof-contract`);
    launchGates.push("proof-lineage-linked");
  }
  if (blueprint.trustNeeds === "high" || blueprint.trustNeeds === "critical") {
    policies.push(`${blueprint.featureId}-approval-policy`);
    services.push("approval-service");
  }

  // Interaction dependencies
  if (blueprint.interactionCriticality !== "low") {
    journeyTests.push(`${blueprint.featureId}-interaction-test`);
    launchGates.push("interaction-manifest-registered");
  }
  if (blueprint.interactionCriticality === "critical") {
    journeyTests.push(`${blueprint.featureId}-critical-path-test`);
    probes.push(`probe-${blueprint.featureId}-interaction-health`);
  }

  // Journey dependencies
  if (blueprint.journeyCriticality !== "low") {
    journeyTests.push(`${blueprint.featureId}-journey-test`);
    launchGates.push("journey-verification-pass");
  }

  // AI/compute dependencies
  if (blueprint.aiComputeClass !== "none") {
    services.push("compute-budget-service");
    contracts.push(`${blueprint.featureId}-compute-contract`);
    policies.push(`${blueprint.featureId}-compute-budget-policy`);
    events.push(`${blueprint.featureId}.compute-used`);
  }

  // Launch criticality
  if (blueprint.launchCriticality === "critical" || blueprint.launchCriticality === "important") {
    probes.push(`probe-${blueprint.featureId}-health`);
    launchGates.push("runtime-evidence-exists", "owner-signoff");
  }

  // Projections
  if (blueprint.persistenceClass !== "ephemeral") {
    projections.push(`${blueprint.featureId}-read-model`);
  }

  const allItems = [...contracts, ...services, ...policies, ...proofs, ...events, ...projections, ...journeyTests, ...probes, ...launchGates];

  return {
    featureId: blueprint.featureId,
    requiredContracts: contracts,
    requiredServices: services,
    requiredPolicies: policies,
    requiredProofs: proofs,
    requiredEvents: events,
    requiredProjections: projections,
    requiredJourneyTests: journeyTests,
    requiredProbes: probes,
    launchGates,
    resolvedCount: 0,
    totalCount: allItems.length,
  };
}

export function computeDependencyResolution(map: DependencyMap, resolved: Set<string>): { resolvedCount: number; totalCount: number; percentage: number; unresolved: string[] } {
  const allItems = [
    ...map.requiredContracts, ...map.requiredServices, ...map.requiredPolicies,
    ...map.requiredProofs, ...map.requiredEvents, ...map.requiredProjections,
    ...map.requiredJourneyTests, ...map.requiredProbes, ...map.launchGates,
  ];
  const resolvedCount = allItems.filter(i => resolved.has(i)).length;
  return {
    resolvedCount,
    totalCount: allItems.length,
    percentage: allItems.length > 0 ? Math.round((resolvedCount / allItems.length) * 100) : 100,
    unresolved: allItems.filter(i => !resolved.has(i)),
  };
}
