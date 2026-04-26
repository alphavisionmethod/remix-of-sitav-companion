// truth-allow: ia-config
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, Search, Filter, ZoomIn, ZoomOut, Maximize2, X, ArrowRight, Sparkles, Eye } from "lucide-react";
import { INSTRUMENTS, INVESTMENT_ADVISORS, SAMPLE_THESES } from "@/hooks/useInvestmentOfficeData";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

// ── Graph Data Model ──
type NodeType = "instrument" | "thesis" | "catalyst" | "sector" | "advisor" | "theme";

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  icon: string;
  x: number;
  y: number;
  size: number;
  color: string;
  detail?: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength: number;
}

const TYPE_COLORS: Record<NodeType, string> = {
  instrument: "hsl(var(--primary))",
  thesis: "hsl(var(--trust-safe))",
  catalyst: "hsl(var(--trust-warn))",
  sector: "hsl(var(--sita-gold))",
  advisor: "hsl(var(--sita-purple))",
  theme: "hsl(var(--trust-verified))",
};

const TYPE_LABELS: Record<NodeType, string> = {
  instrument: "Instruments",
  thesis: "Theses",
  catalyst: "Catalysts",
  sector: "Sectors",
  advisor: "Advisors",
  theme: "Themes",
};

function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const sectors = new Set<string>();
  const themes = new Set<string>();

  // Instruments
  INSTRUMENTS.forEach((inst, i) => {
    const angle = (i / INSTRUMENTS.length) * Math.PI * 2;
    const radius = 280;
    nodes.push({
      id: inst.id, label: inst.symbol, type: "instrument", icon: inst.logoIcon,
      x: 500 + Math.cos(angle) * radius, y: 400 + Math.sin(angle) * radius,
      size: 40, color: TYPE_COLORS.instrument,
      detail: `${inst.name} · $${inst.price.toLocaleString()}`,
    });
    if (inst.sector) sectors.add(inst.sector);
    inst.theme?.forEach(t => themes.add(t));

    // Catalyst edges
    inst.catalysts.forEach(cat => {
      const catId = `cat-${cat.id}`;
      if (!nodes.find(n => n.id === catId)) {
        const ca = angle + (Math.random() - 0.5) * 0.8;
        nodes.push({
          id: catId, label: cat.title, type: "catalyst", icon: "⚡",
          x: 500 + Math.cos(ca) * (radius + 120), y: 400 + Math.sin(ca) * (radius + 120),
          size: 28, color: TYPE_COLORS.catalyst,
          detail: `${cat.date} · Impact: ${cat.impact}`,
        });
      }
      edges.push({ id: `e-${inst.id}-${catId}`, source: inst.id, target: catId, label: "catalyst", strength: 0.7 });
    });
  });

  // Sectors
  [...sectors].forEach((sec, i) => {
    const angle = (i / sectors.size) * Math.PI * 2 + 0.3;
    const sId = `sec-${sec}`;
    nodes.push({
      id: sId, label: sec, type: "sector", icon: "📂",
      x: 500 + Math.cos(angle) * 160, y: 400 + Math.sin(angle) * 160,
      size: 36, color: TYPE_COLORS.sector,
    });
    INSTRUMENTS.filter(inst => inst.sector === sec).forEach(inst => {
      edges.push({ id: `e-${inst.id}-${sId}`, source: inst.id, target: sId, label: "sector", strength: 0.5 });
    });
  });

  // Themes
  [...themes].forEach((theme, i) => {
    const angle = (i / themes.size) * Math.PI * 2 + 1.2;
    const tId = `theme-${theme}`;
    nodes.push({
      id: tId, label: theme, type: "theme", icon: "🏷️",
      x: 500 + Math.cos(angle) * 440, y: 400 + Math.sin(angle) * 440,
      size: 30, color: TYPE_COLORS.theme,
    });
    INSTRUMENTS.filter(inst => inst.theme?.includes(theme)).forEach(inst => {
      edges.push({ id: `e-${inst.id}-${tId}`, source: inst.id, target: tId, label: "theme", strength: 0.4 });
    });
  });

  // Advisors
  INVESTMENT_ADVISORS.slice(0, 6).forEach((adv, i) => {
    const angle = (i / 6) * Math.PI * 2 + 2.0;
    const aId = `adv-${adv.id}`;
    nodes.push({
      id: aId, label: adv.name, type: "advisor", icon: adv.icon,
      x: 500 + Math.cos(angle) * 500, y: 400 + Math.sin(angle) * 500,
      size: 34, color: TYPE_COLORS.advisor,
      detail: `${adv.title} · ${adv.confidence}% confidence`,
    });
    // Connect advisors to related instruments
    INSTRUMENTS.forEach(inst => {
      if (
        (adv.domain === "equity" && inst.assetClass === "stocks") ||
        (adv.domain === "crypto" && inst.assetClass === "crypto") ||
        (adv.domain === "commodities" && inst.assetClass === "commodities") ||
        (adv.domain === "events" && inst.assetClass === "events") ||
        (adv.domain === "macro")
      ) {
        if (adv.domain !== "macro" || Math.random() > 0.5) {
          edges.push({ id: `e-${aId}-${inst.id}`, source: aId, target: inst.id, label: "watches", strength: 0.3 });
        }
      }
    });
  });

  // Theses
  SAMPLE_THESES.forEach((th, i) => {
    const angle = (i / SAMPLE_THESES.length) * Math.PI * 2 + 0.7;
    const thId = `th-${th.id}`;
    nodes.push({
      id: thId, label: th.title.slice(0, 20), type: "thesis", icon: "📝",
      x: 500 + Math.cos(angle) * 350, y: 400 + Math.sin(angle) * 350,
      size: 30, color: TYPE_COLORS.thesis,
      detail: `Conviction: ${th.conviction} · ${th.timeHorizon}`,
    });
    edges.push({ id: `e-${thId}-${th.instrumentId}`, source: thId, target: th.instrumentId, label: "thesis-for", strength: 0.8 });
  });

  return { nodes, edges };
}

export default function KnowledgeGraph() {
  const navigate = useNavigate();
  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<NodeType | "all">("all");
  const [query, setQuery] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const filteredNodes = useMemo(() =>
    nodes.filter(n =>
      (filterType === "all" || n.type === filterType) &&
      (!query || n.label.toLowerCase().includes(query.toLowerCase()))
    ), [nodes, filterType, query]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() =>
    edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [edges, filteredNodeIds]);

  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    edges.forEach(e => {
      if (e.source === hoveredNode) connected.add(e.target);
      if (e.target === hoveredNode) connected.add(e.source);
    });
    connected.add(hoveredNode);
    return connected;
  }, [hoveredNode, edges]);

  const selectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [selectedNode, edges]);

  const selectedConnections = useMemo(() => {
    if (!selectedNode) return [];
    return selectedEdges.map(e => {
      const otherId = e.source === selectedNode.id ? e.target : e.source;
      return { edge: e, node: nodes.find(n => n.id === otherId)! };
    }).filter(c => c.node);
  }, [selectedNode, selectedEdges, nodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element)?.tagName === "rect") {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.2, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
{/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Knowledge Graph
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive entity-relationship map across your investment universe
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/investments/boardroom")}
            className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Boardroom
          </button>
          <button onClick={() => navigate("/investments/markets")}
            className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Markets
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search entities..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFilterType("all")}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${filterType === "all" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {(Object.keys(TYPE_LABELS) as NodeType[]).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${filterType === t ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setZoom(z => Math.max(0.2, z - 0.15))} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => { setZoom(0.65); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {(Object.entries(TYPE_LABELS) as [NodeType, string][]).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[type] }} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground ml-auto">{filteredNodes.length} nodes · {filteredEdges.length} edges</span>
      </div>

      {/* Graph Canvas + Detail Panel */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden relative" style={{ height: 600 }}>
          <svg ref={svgRef} width="100%" height="100%"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="cursor-grab active:cursor-grabbing select-none">
            <rect width="100%" height="100%" fill="transparent" />
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {filteredEdges.map(edge => {
                const src = filteredNodes.find(n => n.id === edge.source);
                const tgt = filteredNodes.find(n => n.id === edge.target);
                if (!src || !tgt) return null;
                const isHighlighted = hoveredNode ? connectedToHovered.has(edge.source) && connectedToHovered.has(edge.target) : true;
                return (
                  <line key={edge.id}
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isHighlighted ? edge.strength * 2 : 0.5}
                    opacity={hoveredNode ? (isHighlighted ? 0.6 : 0.08) : 0.15}
                    strokeDasharray={edge.strength < 0.5 ? "4 4" : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map(node => {
                const isHighlighted = !hoveredNode || connectedToHovered.has(node.id);
                const isSelected = selectedNode?.id === node.id;
                return (
                  <g key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    opacity={hoveredNode ? (isHighlighted ? 1 : 0.15) : 1}
                  >
                    {/* Glow ring for selected/hovered */}
                    {(isSelected || hoveredNode === node.id) && (
                      <circle cx={node.x} cy={node.y} r={node.size / 2 + 6}
                        fill="none" stroke={node.color} strokeWidth={2} opacity={0.4}>
                        <animate attributeName="r" values={`${node.size / 2 + 4};${node.size / 2 + 8};${node.size / 2 + 4}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={node.x} cy={node.y} r={node.size / 2}
                      fill={`${node.color}22`} stroke={node.color} strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
                      fontSize={node.size * 0.45} className="select-none pointer-events-none">
                      {node.icon}
                    </text>
                    <text x={node.x} y={node.y + node.size / 2 + 12} textAnchor="middle"
                      fill="hsl(var(--foreground))" fontSize={9} fontWeight={500}
                      className="select-none pointer-events-none">
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* SITA Intelligence overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-xl bg-card/90 backdrop-blur-md border border-border/50 px-4 py-2.5 flex items-center gap-3">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                <span className="text-foreground font-medium">SITA Intelligence:</span>{" "}
                {filteredNodes.filter(n => n.type === "instrument").length} instruments tracked across{" "}
                {filteredNodes.filter(n => n.type === "theme").length} themes.{" "}
                AI theme detected: majority concentration in AI & Technology.
              </p>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden shrink-0"
              style={{ height: 600 }}
            >
      <PageTruthBanner truthState="partial" />
              <div className="p-5 h-full overflow-y-auto space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${selectedNode.color}22` }}>
                      {selectedNode.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedNode.label}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{selectedNode.type}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNode(null)} aria-label="Close" className="p-1 rounded-lg hover:bg-secondary transition-colors"><X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {selectedNode.detail && (
                  <p className="text-xs text-muted-foreground bg-secondary/50 rounded-xl px-3 py-2">{selectedNode.detail}</p>
                )}

                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Connections ({selectedConnections.length})
                  </p>
                  <div className="space-y-1.5">
                    {selectedConnections.map(({ edge, node }) => (
                      <button key={edge.id}
                        onClick={() => setSelectedNode(node)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary/50 transition-colors text-left">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                          style={{ backgroundColor: `${node.color}22` }}>
                          {node.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-foreground truncate">{node.label}</p>
                          <p className="text-[9px] text-muted-foreground capitalize">{node.type} · {edge.label}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {selectedNode.type === "instrument" && (
                  <button onClick={() => navigate(`/investments/instrument/${selectedNode.id}`)}
                    className="w-full rounded-xl bg-primary/10 text-primary text-xs font-medium py-2.5 flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Full Instrument Detail
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
