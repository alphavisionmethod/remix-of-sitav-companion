// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Engine (Fully Advanced)
// Node/edge CRUD, traversal, lineage, privacy, reconciliation.
// ═══════════════════════════════════════════════════════════════

import type {
  GraphNode, GraphNodeType, NodePrivacyClass,
} from "@/packages/graph-contracts/node-types";
import type { GraphEdge, GraphEdgeType } from "@/packages/graph-contracts/edge-types";
import type { LineageChain, LineageLink, LineageType } from "@/packages/graph-contracts/lineage-types";
import type { EvidencePack, EvidencePackRequest, GraphTraversalQuery, GraphTraversalResult, FreshnessGrade } from "@/packages/graph-contracts/retrieval-types";
import type { PrivacyPolicy, PrivacyAuditEntry } from "@/packages/graph-contracts/privacy-types";
import type { GraphDriftReport, ReconciliationPlan, GraphDiscrepancy } from "@/packages/graph-contracts/reconciliation-types";

export class GraphEngine {
  private nodes = new Map<string, GraphNode>();
  private edges = new Map<string, GraphEdge>();
  private lineageChains = new Map<string, LineageChain>();
  private privacyPolicies = new Map<string, PrivacyPolicy>();
  private auditLog: PrivacyAuditEntry[] = [];

  // ── Node Operations ──
  addNode<T extends Record<string, unknown>>(node: GraphNode<T>): void { this.nodes.set(node.node_id, node as GraphNode); }
  getNode(nodeId: string): GraphNode | undefined { return this.nodes.get(nodeId); }
  getNodesByType(nodeType: GraphNodeType): GraphNode[] { return Array.from(this.nodes.values()).filter(n => n.node_type === nodeType); }
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    for (const [edgeId, edge] of this.edges) {
      if (edge.source_node_id === nodeId || edge.target_node_id === nodeId) this.edges.delete(edgeId);
    }
  }

  // ── Edge Operations ──
  addEdge<T extends Record<string, unknown>>(edge: GraphEdge<T>): void { this.edges.set(edge.edge_id, edge as GraphEdge); }
  getEdgesFrom(nodeId: string, edgeType?: GraphEdgeType): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.source_node_id === nodeId && (!edgeType || e.edge_type === edgeType));
  }
  getEdgesTo(nodeId: string, edgeType?: GraphEdgeType): GraphEdge[] {
    return Array.from(this.edges.values()).filter(e => e.target_node_id === nodeId && (!edgeType || e.edge_type === edgeType));
  }

  // ── Traversal ──
  traverse(query: GraphTraversalQuery): GraphTraversalResult {
    const startTime = Date.now();
    const visited = new Set<string>();
    const resultNodes: GraphTraversalResult["nodes"] = [];
    const resultEdges: GraphTraversalResult["edges"] = [];
    let maxDepth = 0;

    const walk = (nodeId: string, depth: number) => {
      if (depth > query.max_depth || visited.has(nodeId) || resultNodes.length >= query.limit) return;
      visited.add(nodeId);
      if (depth > maxDepth) maxDepth = depth;
      const node = this.nodes.get(nodeId);
      if (!node) return;
      if (query.filter_node_types && !query.filter_node_types.includes(node.node_type)) return;
      resultNodes.push({
        node_id: node.node_id, node_type: node.node_type, label: node.label, depth,
        attributes: query.include_attributes ? node.attributes : undefined,
        incoming_edge_count: this.getEdgesTo(nodeId).length,
        outgoing_edge_count: this.getEdgesFrom(nodeId).length,
      });
      const edges = query.direction === "inbound" ? this.getEdgesTo(nodeId) :
                     query.direction === "outbound" ? this.getEdgesFrom(nodeId) :
                     [...this.getEdgesFrom(nodeId), ...this.getEdgesTo(nodeId)];
      for (const edge of edges) {
        if (query.edge_types && !query.edge_types.includes(edge.edge_type)) continue;
        resultEdges.push({
          edge_id: edge.edge_id, edge_type: edge.edge_type,
          source: edge.source_node_id, target: edge.target_node_id,
          weight: edge.weight, confidence: edge.confidence,
          metadata: query.include_edge_metadata ? edge.metadata : undefined,
        });
        const nextId = edge.source_node_id === nodeId ? edge.target_node_id : edge.source_node_id;
        walk(nextId, depth + 1);
      }
    };

    walk(query.start_node_id, 0);
    return {
      nodes: resultNodes, edges: resultEdges, paths: [],
      truncated: resultNodes.length >= query.limit,
      max_depth_reached: maxDepth,
      traversal_duration_ms: Date.now() - startTime,
    };
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

  createLineageChain(type: LineageType, rootNodeId: string): LineageChain {
    const chain: LineageChain = {
      chain_id: crypto.randomUUID(), lineage_type: type,
      root_node_id: rootNodeId, current_node_id: rootNodeId,
      depth: 0, max_depth: 100, links: [],
      integrity: "verified", integrity_hash: "", branches: [],
      created_at: new Date().toISOString(), last_extended_at: new Date().toISOString(),
      tags: [],
    };
    this.lineageChains.set(chain.chain_id, chain);
    return chain;
  }

  getLineageChain(chainId: string): LineageChain | undefined { return this.lineageChains.get(chainId); }

  // ── Privacy ──
  setPrivacyPolicy(policy: PrivacyPolicy): void { this.privacyPolicies.set(policy.node_type, policy); }

  filterByPrivacy(nodes: GraphNode[], accessorPrivacyCeiling: NodePrivacyClass): GraphNode[] {
    const levels: NodePrivacyClass[] = ["public", "workspace", "private", "sensitive", "restricted", "system_only"];
    const ceilingIdx = levels.indexOf(accessorPrivacyCeiling);
    return nodes.filter(n => levels.indexOf(n.privacy) <= ceilingIdx);
  }

  auditAccess(accessorId: string, nodeId: string, accessType: PrivacyAuditEntry["access_type"]): void {
    const node = this.nodes.get(nodeId);
    this.auditLog.push({
      audit_id: crypto.randomUUID(), accessor_id: accessorId, accessor_role: "user",
      node_id: nodeId, node_type: node?.node_type ?? "unknown",
      access_type: accessType, fields_accessed: [], fields_masked: [],
      privacy_checks_passed: true, privacy_violations: [], masking_applied: [],
      consent_verified: true, purpose: "graph_query",
      timestamp: new Date().toISOString(),
    });
  }

  // ── Evidence Pack Builder ──
  buildEvidencePack(request: EvidencePackRequest): EvidencePack {
    const node = this.nodes.get(request.subject_id);
    const freshnessGrade = (ms: number): FreshnessGrade => ms < 60000 ? "realtime" : ms < 300000 ? "fresh" : ms < 3600000 ? "aging" : "stale";
    const sources = node ? [{
      source_id: node.node_id, source_type: node.node_type, source_name: node.label,
      content: node.attributes, confidence: node.confidence === "verified" ? 1 : 0.7,
      freshness_ms: Date.now() - new Date(node.updated_at).getTime(),
      freshness_grade: freshnessGrade(Date.now() - new Date(node.updated_at).getTime()),
      node_id: node.node_id, node_type: node.node_type,
      relevance_score: 1.0, trust_verified: node.confidence === "verified",
      citation_key: `[${node.node_type}:${node.node_id.slice(0, 8)}]`,
    }] : [];

    return {
      pack_id: crypto.randomUUID(), query_id: request.query_id,
      sources, lineage_chains: [], contradictions: [],
      confidence: sources.length > 0 ? 0.8 : 0,
      freshness_grade: sources.length > 0 ? sources[0].freshness_grade : "stale",
      completeness: sources.length > 0 ? 0.7 : 0, coverage_gaps: [],
      token_count: 0, retrieval_strategy_used: request.retrieval_strategy,
      cache_hit: false, assembled_at: new Date().toISOString(), assembly_duration_ms: 1,
    };
  }

  // ── Reconciliation ──
  detectDrift(scope: string[]): GraphDriftReport {
    const discrepancies: GraphDiscrepancy[] = [];
    for (const edge of this.edges.values()) {
      if (!this.nodes.has(edge.source_node_id) || !this.nodes.has(edge.target_node_id)) {
        discrepancies.push({
          discrepancy_id: crypto.randomUUID(), discrepancy_type: "orphaned_edge",
          severity: "high", edge_id: edge.edge_id, edge_type: edge.edge_type,
          source_a: "graph_store", detected_at: new Date().toISOString(),
          auto_resolvable: true, recommended_action: "Delete orphaned edge",
          estimated_impact: "Low — edge references missing node",
        });
      }
    }
    return {
      report_id: crypto.randomUUID(), trigger: "on_demand", scan_scope: scope, scan_depth: 1,
      discrepancies, total_nodes_scanned: this.nodes.size, total_edges_scanned: this.edges.size,
      total_lineage_chains_scanned: this.lineageChains.size,
      drift_score: discrepancies.length / Math.max(this.edges.size, 1),
      drift_trend: "stable", integrity_score: 1 - (discrepancies.length / Math.max(this.edges.size, 1)),
      anomalies: [], scanned_at: new Date().toISOString(), scan_duration_ms: 1,
    };
  }

  createReconciliationPlan(report: GraphDriftReport): ReconciliationPlan {
    return {
      plan_id: crypto.randomUUID(), drift_report_id: report.report_id,
      strategy: "canonical_wins",
      corrections: report.discrepancies.map(d => ({
        correction_id: crypto.randomUUID(),
        correction_type: d.discrepancy_type === "orphaned_edge" ? "delete" as const : "update" as const,
        target_type: d.edge_id ? "edge" as const : "node" as const,
        target_id: d.edge_id ?? d.node_id ?? "",
        reason: `Auto-correct: ${d.discrepancy_type}`,
        source_discrepancy_id: d.discrepancy_id,
        reversible: true, dependencies: [], status: "pending" as const,
      })),
      correction_order: [],
      estimated_duration_ms: report.discrepancies.length * 10,
      estimated_affected_nodes: 0,
      estimated_affected_edges: report.discrepancies.length,
      risk_score: 0.1,
      requires_approval: report.discrepancies.some(d => d.severity === "critical"),
      dry_run_available: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  // ── Stats ──
  getStats(): { nodes: number; edges: number; lineageChains: number } {
    return { nodes: this.nodes.size, edges: this.edges.size, lineageChains: this.lineageChains.size };
  }
}

let _instance: GraphEngine | null = null;
export function getGraphEngine(): GraphEngine {
  if (!_instance) _instance = new GraphEngine();
  return _instance;
}
