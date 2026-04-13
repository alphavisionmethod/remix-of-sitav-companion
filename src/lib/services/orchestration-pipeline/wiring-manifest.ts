// ═══════════════════════════════════════════════════════════════
// SITA OS — Wiring Manifest
// Declarative connection graph for the orchestration pipeline
// ═══════════════════════════════════════════════════════════════

import { getFullRegistry } from "./advisor-routing-registry";
import type { Domain } from "./types";

export interface WiringNode {
  id: string;
  type: "module" | "advisor" | "app-board" | "boardroom" | "output-sink";
  domain?: Domain;
  label: string;
}

export interface WiringEdge {
  from: string;
  to: string;
  type: "signal" | "advisor-output" | "synthesis" | "intake" | "follow-through";
}

export interface WiringManifest {
  nodes: WiringNode[];
  edges: WiringEdge[];
  generated_at: string;
}

/**
 * Build the full wiring manifest from the registry.
 */
export function getWiringManifest(): WiringManifest {
  const advisors = getFullRegistry();
  const nodes: WiringNode[] = [];
  const edges: WiringEdge[] = [];
  const seenModules = new Set<string>();

  // Add modules
  for (const advisor of advisors) {
    for (const mod of advisor.modules) {
      const moduleId = `module:${advisor.domain}:${mod}`;
      if (!seenModules.has(moduleId)) {
        seenModules.add(moduleId);
        nodes.push({ id: moduleId, type: "module", domain: advisor.domain, label: `${advisor.domain}/${mod}` });
      }
    }
  }

  // Add advisors and module→advisor edges
  for (const advisor of advisors) {
    const advisorId = `advisor:${advisor.advisor_id}`;
    nodes.push({ id: advisorId, type: "advisor", domain: advisor.domain, label: advisor.display_name });

    for (const mod of advisor.modules) {
      edges.push({ from: `module:${advisor.domain}:${mod}`, to: advisorId, type: "signal" });
    }
  }

  // Add app boards and advisor→board edges
  const domains: Domain[] = ["business", "finance", "concierge"];
  for (const domain of domains) {
    const boardId = `board:${domain}`;
    nodes.push({ id: boardId, type: "app-board", domain, label: `${domain} Board` });

    const domainAdvisors = advisors.filter((a) => a.domain === domain);
    for (const advisor of domainAdvisors) {
      edges.push({ from: `advisor:${advisor.advisor_id}`, to: boardId, type: "advisor-output" });
    }

    // Board → Boardroom
    edges.push({ from: boardId, to: "boardroom:main", type: "synthesis" });
  }

  // Boardroom node
  nodes.push({ id: "boardroom:main", type: "boardroom", label: "Boardroom" });

  // Boardroom → output sinks
  for (const domain of domains) {
    const sinkId = `sink:${domain}`;
    nodes.push({ id: sinkId, type: "output-sink", domain, label: `${domain} Action Queue` });
    edges.push({ from: "boardroom:main", to: sinkId, type: "follow-through" });
  }

  return { nodes, edges, generated_at: new Date().toISOString() };
}

/**
 * Validate that all wiring connections are properly declared.
 */
export function validateWiring(): { valid: boolean; issues: string[] } {
  const manifest = getWiringManifest();
  const issues: string[] = [];
  const nodeIds = new Set(manifest.nodes.map((n) => n.id));

  // Check all edges reference valid nodes
  for (const edge of manifest.edges) {
    if (!nodeIds.has(edge.from)) issues.push(`Edge references unknown source: ${edge.from}`);
    if (!nodeIds.has(edge.to)) issues.push(`Edge references unknown target: ${edge.to}`);
  }

  // Check every advisor has at least one module source
  const advisorNodes = manifest.nodes.filter((n) => n.type === "advisor");
  for (const advisor of advisorNodes) {
    const hasSource = manifest.edges.some((e) => e.to === advisor.id && e.type === "signal");
    if (!hasSource) issues.push(`Advisor ${advisor.label} has no signal source`);
  }

  // Check every board has at least one advisor input
  const boardNodes = manifest.nodes.filter((n) => n.type === "app-board");
  for (const board of boardNodes) {
    const hasInput = manifest.edges.some((e) => e.to === board.id && e.type === "advisor-output");
    if (!hasInput) issues.push(`Board ${board.label} has no advisor inputs`);
  }

  // Check boardroom has inputs
  const boardroomInputs = manifest.edges.filter((e) => e.to === "boardroom:main");
  if (boardroomInputs.length === 0) issues.push("Boardroom has no intake connections");

  return { valid: issues.length === 0, issues };
}
