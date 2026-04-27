// ═══════════════════════════════════════════════════════════════
// SITA OS — useGraphEngine Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback, useMemo } from "react";
import { getGraphEngine } from "@/domains/engines/graph-engine";
import type { GraphNode, GraphNodeType } from "@/packages/graph-contracts/node-types";
import type { GraphEdge, GraphEdgeType } from "@/packages/graph-contracts/edge-types";
import type { GraphTraversalQuery, EvidencePackRequest } from "@/packages/graph-contracts/retrieval-types";

export function useGraphEngine() {
  const engine = useMemo(() => getGraphEngine(), []);

  const addNode = useCallback(<T extends Record<string, unknown>>(node: GraphNode<T>) =>
    engine.addNode(node), [engine]);

  const getNode = useCallback((nodeId: string) => engine.getNode(nodeId), [engine]);

  const getNodesByType = useCallback((nodeType: GraphNodeType) =>
    engine.getNodesByType(nodeType), [engine]);

  const removeNode = useCallback((nodeId: string) => engine.removeNode(nodeId), [engine]);

  const addEdge = useCallback(<T extends Record<string, unknown>>(edge: GraphEdge<T>) =>
    engine.addEdge(edge), [engine]);

  const getEdgesFrom = useCallback((nodeId: string, edgeType?: GraphEdgeType) =>
    engine.getEdgesFrom(nodeId, edgeType), [engine]);

  const getEdgesTo = useCallback((nodeId: string, edgeType?: GraphEdgeType) =>
    engine.getEdgesTo(nodeId, edgeType), [engine]);

  const traverse = useCallback((query: GraphTraversalQuery) =>
    engine.traverse(query), [engine]);

  const getLineageChain = useCallback((chainId: string) =>
    engine.getLineageChain(chainId), [engine]);

  const buildEvidencePack = useCallback((request: EvidencePackRequest) =>
    engine.buildEvidencePack(request), [engine]);

  const detectDrift = useCallback((scope: string[]) =>
    engine.detectDrift(scope), [engine]);

  const getStats = useCallback(() => engine.getStats(), [engine]);

  return {
    addNode, getNode, getNodesByType, removeNode,
    addEdge, getEdgesFrom, getEdgesTo, traverse,
    getLineageChain, buildEvidencePack, detectDrift, getStats,
  };
}
