// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Memory Graph
// Visual knowledge graph of everything SITA learned about user
// ═══════════════════════════════════════════════════════════════

import { supabase } from '@/integrations/supabase/client';

export interface MemoryNode {
  id: string;
  label: string;
  category: string;
  value: string;
  confidence: number;
  source: 'explicit' | 'inferred' | 'imported';
  connections: string[];
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  editable: boolean;
}

export interface MemoryEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  strength: number;
}

export interface MemoryGraph {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  clusters: MemoryCluster[];
  stats: MemoryStats;
}

export interface MemoryCluster {
  id: string;
  label: string;
  nodeIds: string[];
  domain: string;
  coherence: number;
}

export interface MemoryStats {
  totalNodes: number;
  totalEdges: number;
  totalClusters: number;
  explicitCount: number;
  inferredCount: number;
  avgConfidence: number;
  oldestMemory: Date | null;
  newestMemory: Date | null;
}

class AIMemoryGraphService {
  async buildGraph(userId: string): Promise<MemoryGraph> {
    const { data: memories } = await supabase
      .from('user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const nodes: MemoryNode[] = (memories || []).map((m: any) => ({
      id: m.id,
      label: m.memory_key,
      category: m.category || 'general',
      value: typeof m.memory_value === 'string' ? m.memory_value : JSON.stringify(m.memory_value),
      confidence: m.confidence ?? 0.8,
      source: (m.category === 'behavioral' ? 'inferred' : 'explicit') as 'explicit' | 'inferred',
      connections: [],
      createdAt: new Date(m.created_at),
      lastAccessed: new Date(m.updated_at || m.created_at),
      accessCount: 1,
      editable: m.category !== 'system',
    }));

    const edges = this.inferEdges(nodes);
    const clusters = this.clusterNodes(nodes, edges);

    nodes.forEach((node) => {
      node.connections = edges
        .filter((e) => e.sourceId === node.id || e.targetId === node.id)
        .map((e) => (e.sourceId === node.id ? e.targetId : e.sourceId));
    });

    const explicitCount = nodes.filter((n) => n.source === 'explicit').length;
    const avgConfidence = nodes.length > 0 ? nodes.reduce((s, n) => s + n.confidence, 0) / nodes.length : 0;

    return {
      nodes,
      edges,
      clusters,
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        totalClusters: clusters.length,
        explicitCount,
        inferredCount: nodes.length - explicitCount,
        avgConfidence,
        oldestMemory: nodes.length > 0 ? nodes[nodes.length - 1].createdAt : null,
        newestMemory: nodes.length > 0 ? nodes[0].createdAt : null,
      },
    };
  }

  async deleteNode(userId: string, nodeId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_memory')
      .delete()
      .eq('user_id', userId)
      .eq('id', nodeId);
    return !error;
  }

  async updateNode(userId: string, nodeId: string, newValue: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_memory')
      .update({ memory_value: newValue })
      .eq('user_id', userId)
      .eq('id', nodeId);
    return !error;
  }

  private inferEdges(nodes: MemoryNode[]): MemoryEdge[] {
    const edges: MemoryEdge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].category === nodes[j].category) {
          edges.push({
            id: `edge_${nodes[i].id}_${nodes[j].id}`,
            sourceId: nodes[i].id,
            targetId: nodes[j].id,
            relationship: 'same_category',
            strength: 0.6,
          });
        }
        // Keyword overlap
        const wordsA = new Set(nodes[i].label.toLowerCase().split(/[_\-\s]+/));
        const wordsB = new Set(nodes[j].label.toLowerCase().split(/[_\-\s]+/));
        const overlap = [...wordsA].filter((w) => wordsB.has(w) && w.length > 2).length;
        if (overlap > 0) {
          edges.push({
            id: `edge_kw_${nodes[i].id}_${nodes[j].id}`,
            sourceId: nodes[i].id,
            targetId: nodes[j].id,
            relationship: 'keyword_overlap',
            strength: Math.min(1, overlap * 0.3),
          });
        }
      }
    }
    return edges;
  }

  private clusterNodes(nodes: MemoryNode[], _edges: MemoryEdge[]): MemoryCluster[] {
    const categoryGroups = new Map<string, MemoryNode[]>();
    nodes.forEach((n) => {
      const group = categoryGroups.get(n.category) || [];
      group.push(n);
      categoryGroups.set(n.category, group);
    });

    return Array.from(categoryGroups.entries()).map(([category, groupNodes]) => ({
      id: `cluster_${category}`,
      label: category.charAt(0).toUpperCase() + category.slice(1),
      nodeIds: groupNodes.map((n) => n.id),
      domain: category,
      coherence: 0.8,
    }));
  }
}

export const aiMemoryGraphService = new AIMemoryGraphService();
