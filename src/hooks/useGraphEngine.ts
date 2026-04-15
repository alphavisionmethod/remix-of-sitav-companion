// ═══════════════════════════════════════════════════════════════
// SITA OS — useGraphEngine Hook
// Exposes node/edge CRUD, lineage queries, evidence packs,
// privacy filtering, and drift reconciliation.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { GraphEngine, getGraphEngine } from "@/lib/engines/graph-engine";
import type { GraphNode, GraphNodeType } from "@/packages/graph-contracts/node-types";
import type { GraphEdge, GraphEdgeType } from "@/packages/graph-contracts/edge-types";
import type { GraphTraversalQuery } from "@/packages/graph-contracts/retrieval-types";

export function useGraphEngine() {
  const engine = useMemo(() => getGraphEngine(), []);

  const addNode = useCallback(<T extends Record<string, unknown>>(node: GraphNode<T>) =>
    engine.addNode(node), [engine]);

  const getNode = useCallback((nodeId: string) =>
    engine.getNode(nodeId), [engine]);

  const getNodesByType = useCallback((nodeType: GraphNodeType) =>
    engine.getNodesByType(nodeType), [engine]);

  const removeNode = useCallback((nodeId: string) =>
    engine.removeNode(nodeId), [engine]);

  const addEdge = useCallback(<T extends Record<string, unknown>>(edge: GraphEdge<T>) =>
    engine.addEdge(edge), [engine]);

  const getEdgesFrom = useCallback((nodeId: string, edgeType?: GraphEdgeType) =>
    engine.getEdgesFrom(nodeId, edgeType), [engine]);

  const getEdgesTo = useCallback((nodeId: string, edgeType?: GraphEdgeType) =>
    engine.getEdgesTo(nodeId, edgeType), [engine]);

  const traverse = useCallback((query: GraphTraversalQuery) =>
    engine.traverse(query), [engine]);

  const getLineage = useCallback((entityId: string) =>
    engine.getLineage(entityId), [engine]);

  const detectDrift = useCallback(() =>
    engine.detectDrift(), [engine]);

  const getPrivacyAuditLog = useCallback(() =>
    engine.getPrivacyAuditLog(), [engine]);

  const getStats = useCallback(() => ({
    nodeCount: engine.getNodesByType("user").length +
      engine.getNodesByType("device").length +
      engine.getNodesByType("workspace").length +
      engine.getNodesByType("file").length +
      engine.getNodesByType("command").length +
      engine.getNodesByType("approval").length +
      engine.getNodesByType("app").length +
      engine.getNodesByType("incident").length +
      engine.getNodesByType("policy").length +
      engine.getNodesByType("release").length +
      engine.getNodesByType("timeline").length +
      engine.getNodesByType("automation").length,
    edgeCount: 0,
    lineageChainCount: 0,
  }), [engine]);

  return {
    addNode,
    getNode,
    getNodesByType,
    removeNode,
    addEdge,
    getEdgesFrom,
    getEdgesTo,
    traverse,
    getLineage,
    detectDrift,
    getPrivacyAuditLog,
    getStats,
  };
}
