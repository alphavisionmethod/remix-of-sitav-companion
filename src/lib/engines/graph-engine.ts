// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Engine
// Wraps EntityGraphService with lineage, privacy, reconciliation.
// ═══════════════════════════════════════════════════════════════

import type {
  GraphNode, GraphNodeType, NodePrivacyClass,
} from "@/packages/graph-contracts/node-types";
import type { GraphEdge, GraphEdgeType } from "@/packages/graph-contracts/edge-types";
import type { LineageChain, LineageLink } from "@/packages/graph-contracts/lineage-types";
import type { EvidencePack, EvidencePackRequest, GraphTraversalQuery, GraphTraversalResult } from "@/packages/graph-contracts/retrieval-types";
import type { PrivacyPolicy, PrivacyAuditEntry } from "@/packages/graph-contracts/privacy-types";
import type { GraphDriftReport, ReconciliationPlan, GraphDiscrepancy } from "@/packages/graph-contracts/reconciliation-types";

// ── Core Graph Store ──

export class GraphEngine {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private lineageChains = new Map<string, LineageChain>();
  private privacyPolicies = new Map<string, PrivacyPolicy>();
  private auditLog: PrivacyAuditEntry[] = [];

  // ── Node Operations ──

  addNode<T extends Record<string, unknown>>(node: GraphNode<T>): void {
    this.nodes.set(node.node_id, node as GraphNode);
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  getNodesByType(nodeType: GraphNodeType): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.node_type === nodeType);
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    // Remove associated edges
    for (const [edgeId, edge] of this.edges) {
      if (edge.source_node_id === nodeId || edge.target_node_id === nodeId) {
        this.edges.delete(edgeId);
      }
    }
  }

  // ── Edge Operations ──

  addEdge<T extends Record<string, unknown>>(edge: GraphEdge<T>): void {
    this.edges.set(edge.edge_id, edge as GraphEdge);
  }

  getEdgesFrom(nodeId: string, edgeType?: GraphEdgeType): GraphEdge[] {
    return Array.from(this.edges.values()).filter(
      e => e.source_node_id === nodeId && (!edgeType || e.edge_type === edgeType)
    );
  }

  getEdgesTo(nodeId: string, edgeType?: GraphEdgeType): GraphEdge[] {
    return Array.from(this.edges.values()).filter(
      e => e.target_node_id === nodeId && (!edgeType || e.edge_type === edgeType)
    );
  }

  // ── Traversal ──

  traverse(query: GraphTraversalQuery): GraphTraversalResult {
    const visited = new Set<string>();
    const resultNodes: GraphTraversalResult["nodes"] = [];
    const resultEdges: GraphTraversalResult["edges"] = [];

    const walk = (nodeId: string, depth: number) => {
      if (depth > query.max_depth || visited.has(nodeId) || resultNodes.length >= query.limit) return;
      visited.add(nodeId);
      const node = this.nodes.get(nodeId);
      if (!node) return;
      if (query.filter_node_types && !query.filter_node_types.includes(node.node_type)) return;
      resultNodes.push({ node_id: node.node_id, node_type: node.node_type, label: node.label, depth });

      const edges = query.direction === "inbound" ? this.getEdgesTo(nodeId) :
                     query.direction === "outbound" ? this.getEdgesFrom(nodeId) :
                     [...this.getEdgesFrom(nodeId), ...this.getEdgesTo(nodeId)];

      for (const edge of edges) {
        if (query.edge_types && !query.edge_types.includes(edge.edge_type)) continue;
        resultEdges.push({ edge_id: edge.edge_id, edge_type: edge.edge_type, source: edge.source_node_id, target: edge.target_node_id });
        const nextId = edge.source_node_id === nodeId ? edge.target_node_id : edge.source_node_id;
        walk(nextId, depth + 1);
      }
    };

    walk(query.start_node_id, 0);
    return { nodes: resultNodes, edges: resultEdges, truncated: resultNodes.length >= query.limit };
  }

  // ── Lineage ──

  addLineageLink(chainId: string, link: LineageLink): void {
    const chain = this.lineageChains.get(chainId);
    if (chain) {
      chain.links.push(link);
      chain.depth = chain.links.length;
      chain.current_node_id = link.to_node_id;
      chain.last_extended_at = new Date().toISOString();
    }
  }

  createLineageChain(type: LineageChain["lineage_type"], rootNodeId: string): LineageChain {
    const chain: LineageChain = {
      chain_id: crypto.randomUUID(),
      lineage_type: type,
      root_node_id: rootNodeId,
      current_node_id: rootNodeId,
      depth: 0,
      links: [],
      created_at: new Date().toISOString(),
      last_extended_at: new Date().toISOString(),
    };
    this.lineageChains.set(chain.chain_id, chain);
    return chain;
  }

  getLineageChain(chainId: string): LineageChain | undefined {
    return this.lineageChains.get(chainId);
  }

  // ── Privacy ──

  setPrivacyPolicy(policy: PrivacyPolicy): void {
    this.privacyPolicies.set(policy.node_type, policy);
  }

  filterByPrivacy(nodes: GraphNode[], accessorPrivacyCeiling: NodePrivacyClass): GraphNode[] {
    const levels: NodePrivacyClass[] = ["public", "workspace", "private", "sensitive", "restricted"];
    const ceilingIdx = levels.indexOf(accessorPrivacyCeiling);
    return nodes.filter(n => levels.indexOf(n.privacy) <= ceilingIdx);
  }

  auditAccess(accessorId: string, nodeId: string, accessType: PrivacyAuditEntry["access_type"]): void {
    this.auditLog.push({
      audit_id: crypto.randomUUID(),
      accessor_id: accessorId,
      node_id: nodeId,
      access_type: accessType,
      fields_accessed: [],
      privacy_checks_passed: true,
      masking_applied: [],
      timestamp: new Date().toISOString(),
    });
  }

  // ── Evidence Pack Builder ──

  buildEvidencePack(request: EvidencePackRequest): EvidencePack {
    const node = this.nodes.get(request.subject_id);
    const sources = node ? [{
      source_id: node.node_id,
      source_type: node.node_type,
      content: node.attributes,
      confidence: node.confidence === "verified" ? 1 : 0.7,
      freshness_ms: Date.now() - new Date(node.updated_at).getTime(),
      node_id: node.node_id,
    }] : [];

    return {
      pack_id: crypto.randomUUID(),
      query_id: request.query_id,
      sources,
      lineage_chains: [],
      confidence: sources.length > 0 ? 0.8 : 0,
      freshness_grade: "fresh",
      completeness: sources.length > 0 ? 0.7 : 0,
      assembled_at: new Date().toISOString(),
    };
  }

  // ── Reconciliation ──

  detectDrift(scope: string[]): GraphDriftReport {
    const discrepancies: GraphDiscrepancy[] = [];
    // Check for orphaned edges
    for (const edge of this.edges.values()) {
      if (!this.nodes.has(edge.source_node_id)) {
        discrepancies.push({
          discrepancy_id: crypto.randomUUID(),
          discrepancy_type: "orphaned_edge",
          severity: "high",
          edge_id: edge.edge_id,
          source_a: "graph_store",
          detected_at: new Date().toISOString(),
        });
      }
    }
    return {
      report_id: crypto.randomUUID(),
      scan_scope: scope,
      discrepancies,
      total_nodes_scanned: this.nodes.size,
      total_edges_scanned: this.edges.size,
      drift_score: discrepancies.length / Math.max(this.edges.size, 1),
      scanned_at: new Date().toISOString(),
    };
  }

  createReconciliationPlan(report: GraphDriftReport): ReconciliationPlan {
    return {
      plan_id: crypto.randomUUID(),
      drift_report_id: report.report_id,
      strategy: "canonical_wins",
      corrections: report.discrepancies.map(d => ({
        correction_id: crypto.randomUUID(),
        correction_type: d.discrepancy_type === "orphaned_edge" ? "delete" as const : "update" as const,
        target_type: d.edge_id ? "edge" as const : "node" as const,
        target_id: d.edge_id ?? d.node_id ?? "",
        reason: `Auto-correct: ${d.discrepancy_type}`,
        reversible: true,
      })),
      estimated_duration_ms: report.discrepancies.length * 10,
      requires_approval: report.discrepancies.some(d => d.severity === "critical"),
      created_at: new Date().toISOString(),
    };
  }

  // ── Stats ──

  getStats(): { nodes: number; edges: number; lineageChains: number } {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size,
      lineageChains: this.lineageChains.size,
    };
  }
}

let _instance: GraphEngine | null = null;
export function getGraphEngine(): GraphEngine {
  if (!_instance) _instance = new GraphEngine();
  return _instance;
}
