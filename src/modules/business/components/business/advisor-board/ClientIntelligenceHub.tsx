// ═══════════════════════════════════════════════════════════════
// SITA OS — Client Intelligence Hub
// Deep client relationship visualization with churn prediction
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, TrendingUp, Heart, Shield, ArrowUpRight, ArrowDownRight, Eye, Star } from "lucide-react";
import type { ClientIntelligenceSnapshot, ClientProfile, HealthSignal } from "@/domains/engines/client-intelligence-engine";

interface Props {
  snapshot: ClientIntelligenceSnapshot;
  clients: ClientProfile[];
  onResolveSignal: (clientId: string, signalId: string) => void;
}

export function ClientIntelligenceHub({ snapshot, clients, onResolveSignal }: Props) {
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [view, setView] = useState<"overview" | "clients" | "signals">("overview");

  return (
    <div className="space-y-4">
      {/* ── KPI Strip ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard icon={Users} label="Total Clients" value={snapshot.totalClients.toString()} sub={`$${(snapshot.totalRevenue / 1000).toFixed(0)}K revenue`} color="hsl(265 55% 58%)" />
        <KPICard icon={Heart} label="Avg Satisfaction" value={`${snapshot.avgSatisfaction}%`} sub={`NPS: ${snapshot.npsScore}`} color="hsl(152 55% 48%)" />
        <KPICard icon={AlertTriangle} label="At Risk" value={snapshot.atRiskClients.toString()} sub={`${(snapshot.avgChurnRisk * 100).toFixed(0)}% avg churn risk`} color="hsl(0 72% 51%)" />
        <KPICard icon={TrendingUp} label="Expansion" value={snapshot.expansionOpportunities.toString()} sub={`${snapshot.retentionRate}% retention`} color="hsl(38 85% 58%)" />
      </div>

      {/* ── View Tabs ────────────────────────────────── */}
      <div className="flex gap-1 bg-[hsl(0_0%_100%/0.03)] p-1 rounded-lg border border-[hsl(0_0%_100%/0.06)] w-fit">
        {(["overview", "clients", "signals"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-[10px] rounded-md transition-all ${view === v ? "bg-[hsl(265_55%_58%/0.15)] text-[hsl(265_55%_58%)]" : "text-muted-foreground hover:text-foreground"}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {view === "overview" && (
        <div className="space-y-4">
          {/* Segment Breakdown */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Client Segments</h3>
            <div className="space-y-2">
              {snapshot.segments.filter(s => s.count > 0).map(seg => (
                <div key={seg.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[11px] text-foreground w-20">{seg.name}</span>
                  <div className="flex-1 h-2 bg-[hsl(0_0%_100%/0.05)] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: seg.color }} initial={{ width: 0 }} animate={{ width: `${(seg.totalRevenue / snapshot.totalRevenue) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">${(seg.totalRevenue / 1000).toFixed(0)}K</span>
                  <span className="text-[10px] text-muted-foreground w-12 text-right">{seg.count} clients</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Top Clients by Revenue</h3>
            <div className="space-y-2">
              {snapshot.topClients.map((client, i) => (
                <motion.button key={client.id} onClick={() => setSelectedClient(client)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(0_0%_100%/0.04)] transition-colors text-left" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <span className="text-[10px] text-muted-foreground w-4">#{i + 1}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${getTierColor(client.tier)}20`, color: getTierColor(client.tier) }}>
                    {client.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-[10px] text-muted-foreground">{client.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-mono text-foreground">${(client.revenue / 1000).toFixed(0)}K</p>
                    <div className="flex items-center gap-1 justify-end">
                      {client.churnRisk > 0.4 ? <ArrowDownRight className="h-2.5 w-2.5 text-red-400" /> : <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400" />}
                      <span className={`text-[9px] ${client.churnRisk > 0.4 ? "text-red-400" : "text-emerald-400"}`}>
                        {client.satisfaction}% sat
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "clients" && (
        <div className="space-y-2">
          {clients.map(client => (
            <motion.button key={client.id} onClick={() => setSelectedClient(client)} className="w-full rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3 hover:bg-[hsl(0_0%_100%/0.04)] transition-colors text-left" whileHover={{ scale: 1.005 }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: `${getTierColor(client.tier)}20`, color: getTierColor(client.tier) }}>
                  {client.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-medium text-foreground">{client.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${getTierColor(client.tier)}15`, color: getTierColor(client.tier) }}>{client.tier}</span>
                    {client.churnRisk > 0.4 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">⚠ at risk</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{client.company} · {client.lifetime}mo · Last contact {client.lastContact}d ago</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-mono text-foreground">${(client.revenue / 1000).toFixed(0)}K</p>
                  <ChurnBar risk={client.churnRisk} />
                </div>
              </div>
              {client.healthSignals.filter(s => !s.resolved).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {client.healthSignals.filter(s => !s.resolved).map(s => (
                    <span key={s.id} className={`text-[9px] px-1.5 py-0.5 rounded-full ${s.severity === "critical" ? "bg-red-500/10 text-red-400" : s.severity === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
                      {s.message.slice(0, 40)}…
                    </span>
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {view === "signals" && (
        <div className="space-y-2">
          {snapshot.recentSignals.map(signal => (
            <SignalRow key={signal.id} signal={signal} clients={clients} onResolve={onResolveSignal} />
          ))}
          {snapshot.recentSignals.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-8 w-8 mx-auto text-emerald-400/30 mb-2" />
              <p className="text-xs text-muted-foreground">All clear — no active health signals</p>
            </div>
          )}
        </div>
      )}

      {/* ── Client Detail Sheet ──────────────────────── */}
      {selectedClient && (
        <ClientDetailSheet client={selectedClient} onClose={() => setSelectedClient(null)} onResolveSignal={onResolveSignal} />
      )}
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string; sub: string; color: string }) {
  return (
    <motion.div className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_100%/0.02)] p-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-display font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function ChurnBar({ risk }: { risk: number }) {
  const pct = Math.round(risk * 100);
  const color = risk > 0.6 ? "bg-red-400" : risk > 0.3 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="w-12 h-1.5 bg-[hsl(0_0%_100%/0.05)] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] text-muted-foreground">{pct}%</span>
    </div>
  );
}

function SignalRow({ signal, clients, onResolve }: { signal: HealthSignal; clients: ClientProfile[]; onResolve: (clientId: string, signalId: string) => void }) {
  const client = clients.find(c => c.healthSignals.some(s => s.id === signal.id));
  const severityColor = signal.severity === "critical" ? "border-red-500/20 bg-red-500/5" : signal.severity === "warning" ? "border-amber-500/20 bg-amber-500/5" : "border-blue-500/20 bg-blue-500/5";
  return (
    <div className={`rounded-lg border p-3 ${severityColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${signal.severity === "critical" ? "bg-red-500/20 text-red-400" : signal.severity === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
              {signal.severity}
            </span>
            <span className="text-[9px] text-muted-foreground">{signal.type.replace(/_/g, " ")}</span>
            {client && <span className="text-[9px] text-foreground font-medium">· {client.name}</span>}
          </div>
          <p className="text-[11px] text-foreground">{signal.message}</p>
          <p className="text-[9px] text-muted-foreground mt-1">{signal.detectedAt}</p>
        </div>
        {client && !signal.resolved && (
          <button onClick={() => onResolve(client.id, signal.id)} className="text-[9px] px-2 py-1 rounded-md bg-[hsl(0_0%_100%/0.05)] text-muted-foreground hover:text-foreground transition-colors">
            Resolve
          </button>
        )}
      </div>
    </div>
  );
}

function ClientDetailSheet({ client, onClose, onResolveSignal }: { client: ClientProfile; onClose: () => void; onResolveSignal: (clientId: string, signalId: string) => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div className="relative w-full max-w-md bg-background border-l border-[hsl(0_0%_100%/0.08)] overflow-y-auto" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: "spring", damping: 25 }}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${getTierColor(client.tier)}20`, color: getTierColor(client.tier) }}>
                {client.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{client.name}</h3>
                <p className="text-[10px] text-muted-foreground">{client.company} · {client.tier} tier</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <MetricBox label="Revenue" value={`$${(client.revenue / 1000).toFixed(0)}K`} />
            <MetricBox label="Satisfaction" value={`${client.satisfaction}%`} />
            <MetricBox label="Churn Risk" value={`${(client.churnRisk * 100).toFixed(0)}%`} alert={client.churnRisk > 0.4} />
          </div>

          {/* Revenue Trend */}
          <div className="rounded-lg border border-[hsl(0_0%_100%/0.06)] p-3">
            <h4 className="text-[10px] text-muted-foreground mb-2">Revenue Trend</h4>
            <div className="flex items-end gap-1 h-16">
              {client.revenueHistory.map((h, i) => {
                const max = Math.max(...client.revenueHistory.map(r => r.amount));
                const height = max > 0 ? (h.amount / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <motion.div className="w-full rounded-t-sm bg-[hsl(265_55%_58%/0.4)]" initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.05 }} />
                    <span className="text-[8px] text-muted-foreground mt-1">{h.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health Signals */}
          {client.healthSignals.length > 0 && (
            <div>
              <h4 className="text-[10px] text-muted-foreground mb-2">Health Signals</h4>
              <div className="space-y-1.5">
                {client.healthSignals.map(s => (
                  <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg text-[10px] ${s.resolved ? "bg-[hsl(0_0%_100%/0.02)] text-muted-foreground line-through" : s.severity === "critical" ? "bg-red-500/5 text-red-400" : s.severity === "warning" ? "bg-amber-500/5 text-amber-400" : "bg-blue-500/5 text-blue-400"}`}>
                    <span>{s.message}</span>
                    {!s.resolved && <button onClick={() => onResolveSignal(client.id, s.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-[hsl(0_0%_100%/0.1)] hover:bg-[hsl(0_0%_100%/0.15)]">✓</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactions */}
          <div>
            <h4 className="text-[10px] text-muted-foreground mb-2">Recent Interactions</h4>
            <div className="space-y-2">
              {client.interactions.map(int => (
                <div key={int.id} className="rounded-lg border border-[hsl(0_0%_100%/0.06)] p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(265_55%_58%/0.1)] text-[hsl(265_55%_58%)]">{int.type}</span>
                    <span className="text-[9px] text-muted-foreground">{int.date}</span>
                    <span className={`text-[9px] ${int.sentiment === "positive" ? "text-emerald-400" : int.sentiment === "negative" ? "text-red-400" : "text-muted-foreground"}`}>
                      {int.sentiment === "positive" ? "😊" : int.sentiment === "negative" ? "😟" : "😐"}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground">{int.summary}</p>
                  {int.advisorInsight && (
                    <p className="text-[9px] text-[hsl(265_55%_58%)] mt-1 italic">💡 {int.advisorInsight}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {client.tags.map(tag => (
              <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(0_0%_100%/0.05)] text-muted-foreground">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricBox({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-lg p-2 text-center ${alert ? "bg-red-500/5 border border-red-500/20" : "bg-[hsl(0_0%_100%/0.02)] border border-[hsl(0_0%_100%/0.06)]"}`}>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${alert ? "text-red-400" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "platinum": return "hsl(265 55% 58%)";
    case "gold": return "hsl(38 85% 58%)";
    case "silver": return "hsl(220 15% 65%)";
    case "bronze": return "hsl(25 60% 50%)";
    default: return "hsl(0 0% 50%)";
  }
}
