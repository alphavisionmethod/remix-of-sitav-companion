// ═══════════════════════════════════════════════════════════════
// SITA OS — Customer Autopilot Intelligence Panel
// Cold detection, callback queue, quote follow-through,
// NBA per customer, and one-click playbook activation
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { SitaTabs, KPITile } from "@/components/sita/SitaComponents";
import {
  Zap, Phone, Mail, Clock, Shield, AlertTriangle, CheckCircle,
  ArrowRight, Target, Brain, Calendar, MessageSquare, TrendingDown,
  TrendingUp, Users, DollarSign, Eye, Play, BarChart3, Sparkles,
  XCircle, RefreshCw
} from "lucide-react";
import {
  analyzeCustomerForAutopilot, getCallbackQueue, getQuoteFollowThroughs,
  type CustomerAutopilotInsight, type CallbackEntry, type QuoteFollowThrough
} from "@/lib/domain-engines/autopilot-engine";
import { useNavigate } from "react-router-dom";

interface CustomerAutopilotPanelProps {
  customers: {
    id: string; name: string; status: string; health_score: number | null;
    lifetime_revenue: number | null; last_contact_at: string | null;
    company?: string | null; email?: string | null; phone?: string | null;
  }[];
}

const urgencyColor: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-urgency-high/10 text-urgency-high",
  medium: "bg-accent/10 text-accent",
  low: "bg-secondary text-muted-foreground",
};

const timeUntil = (dt: string) => {
  const diff = new Date(dt).getTime() - Date.now();
  if (diff < 0) return "Overdue";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const CustomerAutopilotPanel = ({ customers }: CustomerAutopilotPanelProps) => {
  const [activeTab, setActiveTab] = useState("cold-radar");
  const navigate = useNavigate();

  const insights = useMemo(() =>
    customers.map(c => analyzeCustomerForAutopilot(c)),
    [customers]
  );

  const coldCustomers = insights.filter(i => i.status === "cold");
  const atRiskCustomers = insights.filter(i => i.status === "at-risk");
  const champions = insights.filter(i => i.status === "champion");
  const callbacks = getCallbackQueue();
  const quotes = getQuoteFollowThroughs();

  const totalRevenueAtRisk = [...coldCustomers, ...atRiskCustomers].reduce((s, c) => s + c.lifetimeRevenue, 0);
  const callbacksDue = callbacks.filter(cb => cb.status === "scheduled" && new Date(cb.scheduledAt).getTime() <= Date.now() + 3600000).length;

  const tabs = [
    { key: "cold-radar", label: `❄️ Cold Radar (${coldCustomers.length})` },
    { key: "callbacks", label: `📞 Callbacks (${callbacks.length})` },
    { key: "quotes", label: `📋 Quote Follow-Up (${quotes.length})` },
    { key: "nba", label: "🧠 Next Best Actions" },
  ];

  return (
    <div className="space-y-5">
      <SitaSectionHeader title="Revenue Autopilot Intelligence" subtitle="Automated protection for your customer revenue" />

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPITile label="Cold Customers" value={coldCustomers.length} sub={`$${Math.round(coldCustomers.reduce((s, c) => s + c.lifetimeRevenue, 0) / 1000)}K at risk`} icon={AlertTriangle} trend="down" />
        <KPITile label="Callbacks Due" value={`${callbacksDue} now`} sub={`${callbacks.length} total scheduled`} icon={Phone} />
        <KPITile label="Quotes Pending" value={quotes.filter(q => q.status === "pending").length} sub={`$${quotes.filter(q => q.status === "pending").reduce((s, q) => s + q.quoteValue, 0).toLocaleString()} pipeline`} icon={DollarSign} />
        <KPITile label="Revenue Protected" value={`$${Math.round(totalRevenueAtRisk / 1000)}K`} sub="Under autopilot watch" icon={Shield} trend="up" />
      </div>

      <SitaTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Cold Radar */}
      {activeTab === "cold-radar" && (
        <div className="space-y-3">
          {coldCustomers.length === 0 ? (
            <SitaCard className="p-8 text-center" hover={false}>
              <CheckCircle className="h-8 w-8 text-trust-safe mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No cold customers detected</p>
              <p className="text-xs text-muted-foreground mt-1">All customers have been contacted within 60 days</p>
            </SitaCard>
          ) : (
            <>
              {/* Activate playbook CTA */}
              <SitaCard className="p-4 border-primary/20" hover>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl gradient-sita flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Win Back Cold Customers Playbook</p>
                    <p className="text-[11px] text-muted-foreground">Auto-detect → email → SMS → call → discount. Runs for all {coldCustomers.length} cold customers.</p>
                  </div>
                  <button onClick={() => { window.dispatchEvent(new CustomEvent("sita-open-business", { detail: { module: "autopilot-hub" } })); }}
                    className="flex items-center gap-1 rounded-xl gradient-sita px-4 py-2 text-[11px] font-semibold text-primary-foreground hover:opacity-90 transition-all">
                    <Play className="h-3 w-3" /> Activate
                  </button>
                </div>
              </SitaCard>

              {coldCustomers.sort((a, b) => b.lifetimeRevenue - a.lifetimeRevenue).map((cust, i) => (
                <motion.div key={cust.customerId} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <SitaCard className="p-4" hover>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-destructive">{Math.round(cust.churnRisk * 100)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{cust.customerName}</p>
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-semibold text-destructive">
                            {cust.daysSinceContact}d inactive
                          </span>
                        </div>
                        {cust.nextBestAction && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            <span className="text-primary font-medium">Recommended:</span> {cust.nextBestAction.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span>LTV: ${cust.lifetimeRevenue.toLocaleString()}</span>
                          <span>Health: {cust.healthScore}%</span>
                          <span>Churn risk: {Math.round(cust.churnRisk * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors" title="Send re-engagement email">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors" title="Schedule callback">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg gradient-sita p-2 text-primary-foreground" title="Auto-execute best action">
                          <Zap className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </SitaCard>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Callback Queue */}
      {activeTab === "callbacks" && (
        <div className="space-y-3">
          <SitaCard className="p-4 bg-secondary/30" hover={false}>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Callback Manager</p>
                <p className="text-[11px] text-muted-foreground">Auto-scheduled from playbook escalations and NBA recommendations. {callbacksDue} due within the hour.</p>
              </div>
            </div>
          </SitaCard>

          {callbacks.map((cb, i) => {
            const isOverdue = new Date(cb.scheduledAt).getTime() < Date.now();
            return (
              <motion.div key={cb.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <SitaCard className={`p-4 ${isOverdue ? "border-destructive/30" : ""}`} hover>
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                      cb.status === "missed" ? "bg-destructive/10" : isOverdue ? "bg-urgency-high/10" : "bg-primary/10"
                    }`}>
                      {cb.status === "missed" ? <XCircle className="h-5 w-5 text-destructive" /> :
                       isOverdue ? <AlertTriangle className="h-5 w-5 text-urgency-high" /> :
                       <Phone className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{cb.customerName}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${urgencyColor[cb.priority]}`}>{cb.priority}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          cb.status === "missed" ? "bg-destructive/10 text-destructive" :
                          cb.status === "completed" ? "bg-trust-safe/10 text-trust-safe" :
                          "bg-secondary text-muted-foreground"
                        }`}>{cb.status}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{cb.reason}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isOverdue ? <span className="text-destructive font-medium">Overdue</span> : timeUntil(cb.scheduledAt)}
                        </span>
                        <span>${cb.revenueAtStake.toLocaleString()} at stake</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button className="rounded-lg gradient-sita px-3 py-1.5 text-[10px] font-semibold text-primary-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Call Now
                      </button>
                      <button className="rounded-lg bg-secondary px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </SitaCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quote Follow-Through */}
      {activeTab === "quotes" && (
        <div className="space-y-3">
          {quotes.map((qt, i) => (
            <motion.div key={qt.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <SitaCard className="p-4" hover>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                    qt.winProbability >= 0.6 ? "bg-trust-safe/10" :
                    qt.winProbability >= 0.4 ? "bg-accent/10" :
                    "bg-urgency-high/10"
                  }`}>
                    <span className={`text-sm font-bold ${
                      qt.winProbability >= 0.6 ? "text-trust-safe" :
                      qt.winProbability >= 0.4 ? "text-accent" :
                      "text-urgency-high"
                    }`}>{Math.round(qt.winProbability * 100)}%</span>
                    <span className="text-[8px] text-muted-foreground">win</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{qt.customerName}</p>
                      <span className="text-sm font-bold text-primary">${qt.quoteValue.toLocaleString()}</span>
                      {qt.autoFollowUpEnabled && (
                        <span className="rounded-full bg-trust-safe/10 px-2 py-0.5 text-[9px] font-medium text-trust-safe flex items-center gap-1">
                          <Zap className="h-2.5 w-2.5" /> Auto
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sent {qt.sentDaysAgo}d ago · Viewed {qt.viewCount}x · {qt.followUpsSent} follow-ups sent
                    </p>
                    <p className="text-[11px] mt-1">
                      <span className="text-primary font-medium">Next:</span> <span className="text-muted-foreground">{qt.nextAction}</span>
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Follow Up
                    </button>
                    <button className="rounded-lg gradient-sita px-3 py-1.5 text-[10px] font-semibold text-primary-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Auto
                    </button>
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Next Best Actions for all customers */}
      {activeTab === "nba" && (
        <div className="space-y-3">
          {[...coldCustomers, ...atRiskCustomers]
            .filter(c => c.nextBestAction)
            .sort((a, b) => (b.nextBestAction?.expectedROI ?? 0) - (a.nextBestAction?.expectedROI ?? 0))
            .map((cust, i) => {
              const nba = cust.nextBestAction!;
              return (
                <motion.div key={cust.customerId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <SitaCard className="p-5" hover>
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        nba.urgency === "critical" ? "bg-destructive/10 text-destructive" :
                        "bg-urgency-high/10 text-urgency-high"
                      }`}>
                        {nba.confidence}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{cust.customerName}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${urgencyColor[nba.urgency]}`}>{nba.urgency}</span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground capitalize">{nba.actionType}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                            cust.status === "cold" ? "bg-blue-500/10 text-blue-500" : "bg-urgency-high/10 text-urgency-high"
                          }`}>{cust.status}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1">{nba.description}</p>
                        <p className="text-[11px] text-muted-foreground mt-1.5">{nba.reasoning}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {nba.alternativeActions.map((alt, ai) => (
                            <button key={ai} className="rounded-lg bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors capitalize">
                              {alt.type}: ${alt.expectedROI.toLocaleString()} ROI
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-2">
                        <p className="text-lg font-bold text-primary">${nba.expectedROI.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Expected ROI</p>
                        <button className="rounded-xl gradient-sita px-4 py-1.5 text-[11px] font-semibold text-primary-foreground flex items-center gap-1 ml-auto">
                          {nba.autoExecutable ? <><Zap className="h-3 w-3" /> Auto</> : <><ArrowRight className="h-3 w-3" /> Execute</>}
                        </button>
                      </div>
                    </div>
                  </SitaCard>
                </motion.div>
              );
            })}
          {coldCustomers.length + atRiskCustomers.length === 0 && (
            <SitaCard className="p-8 text-center" hover={false}>
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground mt-1">No customers need automated attention right now</p>
            </SitaCard>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerAutopilotPanel;
