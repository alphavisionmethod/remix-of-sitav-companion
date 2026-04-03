// ═══════════════════════════════════════════════════════════════
// SITA OS — Agent Communication Graph
// Interactive force-directed graph showing agent-to-agent messaging,
// data flows, dependencies, and communication health
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { KPITile } from "@/components/sita/SitaComponents";
import {
  Activity, Zap, ArrowRight, AlertTriangle, CheckCircle, Clock,
  Shield, Brain, Eye, Server, Wifi, Database, GitBranch, RefreshCw,
  TrendingUp, TrendingDown, Radio, Cpu, Target, MessageSquare, XCircle
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

interface AgentNode {
  id: string;
  name: string;
  role: string;
  domain: "business" | "finance" | "concierge" | "platform" | "security";
  status: "active" | "idle" | "busy" | "error" | "quarantined";
  messagesPerMin: number;
  x: number;
  y: number;
  radius: number;
}

interface CommEdge {
  id: string;
  from: string;
  to: string;
  messageType: "request" | "response" | "broadcast" | "event" | "delegation";
  messagesPerMin: number;
  avgLatencyMs: number;
  errorRate: number;
  status: "healthy" | "degraded" | "failing";
  lastMessage: string;
}

interface CommMetrics {
  totalMessagesPerMin: number;
  avgLatencyMs: number;
  errorRate: number;
  activeEdges: number;
  hotspotAgent: string;
  bottleneckEdge: string;
}

// ── Mock Data ────────────────────────────────────────────────────

const AGENTS: AgentNode[] = [
  { id: "orchestrator", name: "Orchestrator", role: "Brain Core", domain: "platform", status: "active", messagesPerMin: 142, x: 50, y: 50, radius: 28 },
  { id: "biz-advisor", name: "Business Advisor", role: "Revenue Intelligence", domain: "business", status: "active", messagesPerMin: 68, x: 20, y: 25, radius: 22 },
  { id: "fin-advisor", name: "Finance Advisor", role: "Treasury & Cash", domain: "finance", status: "active", messagesPerMin: 45, x: 80, y: 25, radius: 20 },
  { id: "concierge", name: "Concierge", role: "Life Management", domain: "concierge", status: "idle", messagesPerMin: 12, x: 20, y: 75, radius: 16 },
  { id: "fraud-sentinel", name: "Fraud Sentinel", role: "Security & Anomaly", domain: "security", status: "active", messagesPerMin: 35, x: 80, y: 75, radius: 18 },
  { id: "revenue-autopilot", name: "Revenue Autopilot", role: "Recovery Engine", domain: "business", status: "busy", messagesPerMin: 89, x: 15, y: 50, radius: 24 },
  { id: "collections", name: "Collections Agent", role: "Chase Sequences", domain: "business", status: "active", messagesPerMin: 28, x: 35, y: 80, radius: 17 },
  { id: "compliance", name: "Compliance Monitor", role: "SOC 2 / ISO 27001", domain: "security", status: "active", messagesPerMin: 22, x: 65, y: 80, radius: 16 },
  { id: "self-healer", name: "Self-Healer", role: "Auto Recovery", domain: "platform", status: "active", messagesPerMin: 15, x: 50, y: 85, radius: 15 },
  { id: "nlp-companion", name: "NLP Companion", role: "Natural Language", domain: "platform", status: "idle", messagesPerMin: 8, x: 50, y: 15, radius: 14 },
];

const EDGES: CommEdge[] = [
  { id: "e1", from: "orchestrator", to: "biz-advisor", messageType: "delegation", messagesPerMin: 45, avgLatencyMs: 12, errorRate: 0.01, status: "healthy", lastMessage: "Delegate: analyze revenue pipeline" },
  { id: "e2", from: "orchestrator", to: "fin-advisor", messageType: "delegation", messagesPerMin: 32, avgLatencyMs: 15, errorRate: 0.02, status: "healthy", lastMessage: "Delegate: process payment batch" },
  { id: "e3", from: "orchestrator", to: "concierge", messageType: "delegation", messagesPerMin: 8, avgLatencyMs: 10, errorRate: 0, status: "healthy", lastMessage: "Delegate: schedule grocery delivery" },
  { id: "e4", from: "orchestrator", to: "fraud-sentinel", messageType: "broadcast", messagesPerMin: 18, avgLatencyMs: 5, errorRate: 0.005, status: "healthy", lastMessage: "Broadcast: new transaction for review" },
  { id: "e5", from: "biz-advisor", to: "revenue-autopilot", messageType: "event", messagesPerMin: 38, avgLatencyMs: 8, errorRate: 0.03, status: "healthy", lastMessage: "Event: cold customer detected — Johnson & Co" },
  { id: "e6", from: "revenue-autopilot", to: "collections", messageType: "delegation", messagesPerMin: 15, avgLatencyMs: 20, errorRate: 0.05, status: "degraded", lastMessage: "Delegate: escalate INV-1035 to step 6" },
  { id: "e7", from: "fraud-sentinel", to: "compliance", messageType: "event", messagesPerMin: 12, avgLatencyMs: 18, errorRate: 0.01, status: "healthy", lastMessage: "Event: anomaly score exceeded threshold" },
  { id: "e8", from: "self-healer", to: "orchestrator", messageType: "response", messagesPerMin: 8, avgLatencyMs: 25, errorRate: 0.02, status: "healthy", lastMessage: "Response: connector-health auto-recovered" },
  { id: "e9", from: "biz-advisor", to: "orchestrator", messageType: "response", messagesPerMin: 42, avgLatencyMs: 14, errorRate: 0.01, status: "healthy", lastMessage: "Response: pipeline analysis complete" },
  { id: "e10", from: "nlp-companion", to: "orchestrator", messageType: "request", messagesPerMin: 6, avgLatencyMs: 30, errorRate: 0.08, status: "degraded", lastMessage: "Request: parse intent — 'show me overdue invoices'" },
  { id: "e11", from: "collections", to: "biz-advisor", messageType: "event", messagesPerMin: 10, avgLatencyMs: 12, errorRate: 0, status: "healthy", lastMessage: "Event: payment received — TechVentures $15K" },
  { id: "e12", from: "compliance", to: "orchestrator", messageType: "event", messagesPerMin: 5, avgLatencyMs: 8, errorRate: 0, status: "healthy", lastMessage: "Event: SOC 2 CC6.1 audit passed" },
  { id: "e13", from: "revenue-autopilot", to: "fraud-sentinel", messageType: "request", messagesPerMin: 7, avgLatencyMs: 22, errorRate: 0.12, status: "failing", lastMessage: "Request: validate payment plan — Bloom Studio" },
];

// ── Helpers ──────────────────────────────────────────────────────

const domainColors: Record<string, { bg: string; text: string; ring: string }> = {
  business: { bg: "bg-accent/15", text: "text-accent", ring: "ring-accent/30" },
  finance: { bg: "bg-trust-safe/15", text: "text-trust-safe", ring: "ring-trust-safe/30" },
  concierge: { bg: "bg-primary/15", text: "text-primary", ring: "ring-primary/30" },
  platform: { bg: "bg-foreground/10", text: "text-foreground", ring: "ring-foreground/20" },
  security: { bg: "bg-destructive/15", text: "text-destructive", ring: "ring-destructive/30" },
};

const statusColors: Record<string, string> = {
  active: "bg-trust-safe", idle: "bg-muted-foreground", busy: "bg-accent",
  error: "bg-destructive", quarantined: "bg-urgency-high",
};

const edgeStatusColors: Record<string, string> = {
  healthy: "text-trust-safe", degraded: "text-urgency-high", failing: "text-destructive",
};

function computeMetrics(edges: CommEdge[]): CommMetrics {
  const totalMsgs = edges.reduce((s, e) => s + e.messagesPerMin, 0);
  const avgLat = edges.reduce((s, e) => s + e.avgLatencyMs, 0) / edges.length;
  const avgErr = edges.reduce((s, e) => s + e.errorRate, 0) / edges.length;
  const hotAgent = AGENTS.reduce((a, b) => a.messagesPerMin > b.messagesPerMin ? a : b);
  const bottleneck = edges.reduce((a, b) => a.errorRate > b.errorRate ? a : b);
  return {
    totalMessagesPerMin: totalMsgs, avgLatencyMs: Math.round(avgLat),
    errorRate: Math.round(avgErr * 10000) / 100, activeEdges: edges.filter(e => e.messagesPerMin > 0).length,
    hotspotAgent: hotAgent.name, bottleneckEdge: `${AGENTS.find(a => a.id === bottleneck.from)?.name} → ${AGENTS.find(a => a.id === bottleneck.to)?.name}`,
  };
}

// ── SVG Graph ────────────────────────────────────────────────────

const GraphVisualization = ({
  agents, edges, selectedAgent, onSelectAgent, selectedEdge, onSelectEdge
}: {
  agents: AgentNode[]; edges: CommEdge[];
  selectedAgent: string | null; onSelectAgent: (id: string | null) => void;
  selectedEdge: string | null; onSelectEdge: (id: string | null) => void;
}) => {
  const svgW = 800;
  const svgH = 500;
  const toX = (pct: number) => (pct / 100) * svgW;
  const toY = (pct: number) => (pct / 100) * svgH;

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" style={{ minHeight: 350 }}>
        <defs>
          <marker id="arrow-healthy" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--trust-safe))" opacity={0.6} />
          </marker>
          <marker id="arrow-degraded" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--urgency-high))" opacity={0.6} />
          </marker>
          <marker id="arrow-failing" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--destructive))" opacity={0.6} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map(edge => {
          const fromAgent = agents.find(a => a.id === edge.from);
          const toAgent = agents.find(a => a.id === edge.to);
          if (!fromAgent || !toAgent) return null;
          const x1 = toX(fromAgent.x); const y1 = toY(fromAgent.y);
          const x2 = toX(toAgent.x); const y2 = toY(toAgent.y);
          const isSelected = selectedEdge === edge.id;
          const isHighlighted = selectedAgent ? (edge.from === selectedAgent || edge.to === selectedAgent) : true;
          const strokeColors = { healthy: "hsl(var(--trust-safe))", degraded: "hsl(var(--urgency-high))", failing: "hsl(var(--destructive))" };
          const thickness = Math.max(1, Math.min(4, edge.messagesPerMin / 15));

          return (
            <g key={edge.id} onClick={() => onSelectEdge(isSelected ? null : edge.id)} className="cursor-pointer">
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={strokeColors[edge.status]} strokeWidth={isSelected ? thickness + 2 : thickness}
                opacity={isHighlighted ? (isSelected ? 1 : 0.5) : 0.1}
                markerEnd={`url(#arrow-${edge.status})`}
                strokeDasharray={edge.status === "failing" ? "6 4" : edge.status === "degraded" ? "8 3" : "none"}
              />
              {/* Message count label */}
              {isHighlighted && edge.messagesPerMin > 10 && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8}
                  textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" opacity={0.7}>
                  {edge.messagesPerMin}/min
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {agents.map(agent => {
          const cx = toX(agent.x); const cy = toY(agent.y);
          const colors = domainColors[agent.domain];
          const isSelected = selectedAgent === agent.id;
          const isHighlighted = selectedAgent ? (selectedAgent === agent.id || edges.some(e => (e.from === selectedAgent || e.to === selectedAgent) && (e.from === agent.id || e.to === agent.id))) : true;

          return (
            <g key={agent.id} onClick={() => onSelectAgent(isSelected ? null : agent.id)} className="cursor-pointer">
              {/* Glow ring for selected */}
              {isSelected && (
                <circle cx={cx} cy={cy} r={agent.radius + 8} fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="2" opacity={0.4}>
                  <animate attributeName="r" values={`${agent.radius + 6};${agent.radius + 12};${agent.radius + 6}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Node circle */}
              <circle cx={cx} cy={cy} r={agent.radius}
                fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2"
                opacity={isHighlighted ? 1 : 0.25}
              />
              {/* Status dot */}
              <circle cx={cx + agent.radius - 4} cy={cy - agent.radius + 4} r="4"
                fill={agent.status === "active" ? "hsl(var(--trust-safe))" : agent.status === "busy" ? "hsl(var(--accent))" : agent.status === "error" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                stroke="hsl(var(--card))" strokeWidth="1.5"
              />
              {/* Label */}
              <text x={cx} y={cy - 2} textAnchor="middle" fontSize="9" fontWeight="600"
                fill="hsl(var(--foreground))" opacity={isHighlighted ? 1 : 0.3}>
                {agent.name.length > 12 ? agent.name.slice(0, 10) + "…" : agent.name}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7"
                fill="hsl(var(--muted-foreground))" opacity={isHighlighted ? 0.7 : 0.2}>
                {agent.messagesPerMin}/min
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Detail Panels ────────────────────────────────────────────────

const AgentDetailPanel = ({ agent, edges }: { agent: AgentNode; edges: CommEdge[] }) => {
  const incoming = edges.filter(e => e.to === agent.id);
  const outgoing = edges.filter(e => e.from === agent.id);
  const colors = domainColors[agent.domain];

  return (
    <SitaCard className="p-4" hover={false}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Brain className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{agent.name}</p>
          <p className="text-[10px] text-muted-foreground">{agent.role} · {agent.domain}</p>
        </div>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${
          agent.status === "active" ? "bg-trust-safe/10 text-trust-safe" :
          agent.status === "busy" ? "bg-accent/10 text-accent" :
          agent.status === "error" ? "bg-destructive/10 text-destructive" :
          "bg-secondary text-muted-foreground"
        }`}>{agent.status}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground">{agent.messagesPerMin}</p>
          <p className="text-[9px] text-muted-foreground">msg/min</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground">{incoming.length}</p>
          <p className="text-[9px] text-muted-foreground">incoming</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground">{outgoing.length}</p>
          <p className="text-[9px] text-muted-foreground">outgoing</p>
        </div>
      </div>

      {/* Connection list */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">Active Connections</p>
        {[...incoming.map(e => ({ ...e, direction: "in" as const })), ...outgoing.map(e => ({ ...e, direction: "out" as const }))].map(conn => {
          const peer = AGENTS.find(a => a.id === (conn.direction === "in" ? conn.from : conn.to));
          return (
            <div key={conn.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/30">
              <span className="text-[10px] text-muted-foreground w-6">{conn.direction === "in" ? "←" : "→"}</span>
              <span className="text-[11px] font-medium text-foreground flex-1">{peer?.name}</span>
              <span className={`text-[9px] font-medium ${edgeStatusColors[conn.status]}`}>{conn.messagesPerMin}/m</span>
              <span className="text-[9px] text-muted-foreground">{conn.avgLatencyMs}ms</span>
            </div>
          );
        })}
      </div>
    </SitaCard>
  );
};

const EdgeDetailPanel = ({ edge }: { edge: CommEdge }) => {
  const fromAgent = AGENTS.find(a => a.id === edge.from);
  const toAgent = AGENTS.find(a => a.id === edge.to);

  return (
    <SitaCard className="p-4" hover={false}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">{fromAgent?.name}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{toAgent?.name}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${
          edge.status === "healthy" ? "bg-trust-safe/10 text-trust-safe" :
          edge.status === "degraded" ? "bg-urgency-high/10 text-urgency-high" :
          "bg-destructive/10 text-destructive"
        }`}>{edge.status}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground">{edge.messagesPerMin}</p>
          <p className="text-[9px] text-muted-foreground">msg/min</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground">{edge.avgLatencyMs}ms</p>
          <p className="text-[9px] text-muted-foreground">latency</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className={`text-xs font-bold ${edge.errorRate > 0.05 ? "text-destructive" : "text-foreground"}`}>{(edge.errorRate * 100).toFixed(1)}%</p>
          <p className="text-[9px] text-muted-foreground">error rate</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-bold text-foreground capitalize">{edge.messageType}</p>
          <p className="text-[9px] text-muted-foreground">type</p>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-secondary/30">
        <p className="text-[10px] text-muted-foreground mb-1">Last Message</p>
        <p className="text-[11px] text-foreground font-mono">{edge.lastMessage}</p>
      </div>
    </SitaCard>
  );
};

// ── Main Component ───────────────────────────────────────────────

export const AgentCommunicationGraph = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "healthy" | "degraded" | "failing">("all");

  const metrics = useMemo(() => computeMetrics(EDGES), []);

  const filteredEdges = filter === "all" ? EDGES : EDGES.filter(e => e.status === filter);
  const selectedAgentData = AGENTS.find(a => a.id === selectedAgent);
  const selectedEdgeData = EDGES.find(e => e.id === selectedEdge);

  return (
    <div className="space-y-5">
      <SitaSectionHeader title="Agent Communication Graph" subtitle="Real-time visualization of agent-to-agent messaging, data flows, and communication health" />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPITile label="Total Messages" value={`${metrics.totalMessagesPerMin}/min`} sub="Across all agents" icon={MessageSquare} />
        <KPITile label="Avg Latency" value={`${metrics.avgLatencyMs}ms`} sub="Inter-agent" icon={Clock} trend="up" />
        <KPITile label="Error Rate" value={`${metrics.errorRate}%`} sub={metrics.errorRate > 3 ? "Above threshold" : "Within limits"} icon={AlertTriangle} trend={metrics.errorRate > 3 ? "down" : "up"} />
        <KPITile label="Active Channels" value={String(metrics.activeEdges)} sub={`${AGENTS.length} agents`} icon={GitBranch} />
        <KPITile label="Hotspot" value={metrics.hotspotAgent} sub="Highest traffic" icon={Zap} />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {(["all", "healthy", "degraded", "failing"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all capitalize ${
              filter === f ? "gradient-sita text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}>
            {f === "all" ? `All (${EDGES.length})` : `${f} (${EDGES.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Graph */}
        <div className="lg:col-span-2">
          <GraphVisualization
            agents={AGENTS} edges={filteredEdges}
            selectedAgent={selectedAgent} onSelectAgent={(id) => { setSelectedAgent(id); setSelectedEdge(null); }}
            selectedEdge={selectedEdge} onSelectEdge={(id) => { setSelectedEdge(id); setSelectedAgent(null); }}
          />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Click agents or edges to inspect. Node size = message volume. Edge color = health status.</p>
        </div>

        {/* Detail Panel */}
        <div className="space-y-3">
          {selectedAgentData ? (
            <AgentDetailPanel agent={selectedAgentData} edges={EDGES} />
          ) : selectedEdgeData ? (
            <EdgeDetailPanel edge={selectedEdgeData} />
          ) : (
            <SitaCard className="p-6 text-center" hover={false}>
              <Eye className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Select an Agent or Edge</p>
              <p className="text-[11px] text-muted-foreground mt-1">Click on the graph to inspect connections, traffic, and health</p>
            </SitaCard>
          )}

          {/* Legend */}
          <SitaCard className="p-3" hover={false}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Legend</p>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
              {Object.entries(domainColors).map(([domain, colors]) => (
                <div key={domain} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${colors.bg} ring-1 ${colors.ring}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{domain}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border flex items-center gap-3">
              <div className="flex items-center gap-1"><div className="h-1 w-6 bg-trust-safe rounded" /><span className="text-[9px] text-muted-foreground">Healthy</span></div>
              <div className="flex items-center gap-1"><div className="h-1 w-6 bg-urgency-high rounded" /><span className="text-[9px] text-muted-foreground">Degraded</span></div>
              <div className="flex items-center gap-1"><div className="h-1 w-6 bg-destructive rounded" style={{ borderStyle: "dashed" }} /><span className="text-[9px] text-muted-foreground">Failing</span></div>
            </div>
          </SitaCard>

          {/* Bottleneck alert */}
          {EDGES.some(e => e.status === "failing") && (
            <SitaCard className="p-3 border-destructive/20" hover={false}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-destructive">Communication Bottleneck Detected</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{metrics.bottleneckEdge} — {(EDGES.find(e => e.status === "failing")?.errorRate ?? 0) * 100}% error rate</p>
                  <button className="mt-1.5 rounded-lg bg-destructive/10 px-2.5 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/20 transition-colors">
                    Investigate
                  </button>
                </div>
              </div>
            </SitaCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentCommunicationGraph;
