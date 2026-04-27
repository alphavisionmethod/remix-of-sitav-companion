import { useAction } from "@/hooks/use-action";
import { SitaCard, SitaCardTitle, SitaButton } from "@/platform/sita/components/sita/SitaCard";
import { KPITile, SitaTabs, EmptyState } from "@/platform/sita/components/sita/SitaComponents";
import { TrustBadge, TrustLevel } from "@/platform/sita/components/sita/TrustBadge";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import HierarchyHint from "@/modules/business/components/business/shared/HierarchyHint";
import { ModuleAdvisorPanel } from "@/modules/business/components/business/advisor-board/ModuleAdvisorPanel";
import { PremiumEmptyState } from "@/platform/sita/components/sita/PremiumEmptyState";
import { StateBadge, ExecutionState } from "@/platform/sita/components/sita/StateBadge";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromTable } from "@/lib/supabase-helpers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Target, DollarSign, TrendingUp, Clock, AlertTriangle, Sparkles, ArrowRight, CheckCircle, Plus, X, Trash2, LayoutList, Columns } from "lucide-react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { getModuleAdaptation } from "@/domains/engines/business-module-adaptations";
import { generateOpportunityAdvisors } from "@/domains/engines/business-advisor-engine";
import { CrossAppAction } from "@/platform/sita/components/sita/CrossAppAction";
import { setLinkedContext } from "@/platform/sita/components/sita/CrossAppAction";
import { useLinkedContext } from "@/hooks/useLinkedContext";
import { useNavigate } from "react-router-dom";



const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const stageLabels: Record<string, string> = {
  lead: "Lead", discovery: "Discovery", qualified: "Qualified", proposal: "Proposal",
  negotiation: "Negotiation", won: "Won", lost: "Lost", stale: "Stale",
};

const stageToState = (stage: string): ExecutionState => {
  const map: Record<string, ExecutionState> = {
    lead: "queued", discovery: "drafted", qualified: "proposed", proposal: "approval-requested",
    negotiation: "approved", won: "completed", lost: "failed", stale: "escalated",
  };
  return map[stage] || "queued";
};

const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const OpportunitiesCenter = () => {
  const { primaryMode } = useBusinessProfile();
  const moduleConfig = getModuleAdaptation("opportunities", primaryMode);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [form, setForm] = useState({ title: "", value: "", confidence: 50, stage: "lead", next_action: "" });

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Canonical table is crm_opportunities. Customer name is resolved via crm_contacts (display_name) or crm_companies (name).
      const { data, error } = await fromTable("crm_opportunities")
        .select("*, crm_contacts(display_name), crm_companies(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Normalize: expose `confidence` (UI legacy) from `probability`, and a unified `customer_label`.
      return (data ?? []).map((o: Record<string, any>) => ({
        ...o,
        confidence: o.probability ?? 0,
        customer_label: o.crm_contacts?.display_name ?? o.crm_companies?.name ?? null,
        stale_risk: o.status === "stale" || o.stage === "stale",
        next_action: o.notes ?? null,
      }));
    },
    enabled: !!user,
  });

  const addOpp = useAction("business", "opportunity.create", {
    successMessage: "Opportunity added",
    invalidateKeys: [["opportunities"]],
    onSuccess: () => { setShowAdd(false); setForm({ title: "", value: "", confidence: 50, stage: "lead", next_action: "" }); },
  });

  const updateStage = useAction("business", "opportunity.update-stage", {
    invalidateKeys: [["opportunities"]],
  });

  const deleteOpp = useAction("business", "opportunity.delete", {
    invalidateKeys: [["opportunities"]],
    onSuccess: () => { setSelectedId(null); },
  });

  // Phase 3 — opportunity → quote transition. Lands user on QuotesWorkspace
  // with the new quote pre-selected.
  const convertToQuote = useAction("business", "opportunity.convert-to-quote", {
    successMessage: "Quote drafted from opportunity",
    invalidateKeys: [["opportunities"], ["quotes"]],
    onSuccess: (data) => {
      const result = (data?.result ?? data) as Record<string, unknown> | null;
      const newQuoteId = (result?.id as string | undefined) ?? null;
      setLinkedContext({
        entityType: "quote",
        entityId: newQuoteId ?? "new",
        entityLabel: "Drafted from opportunity",
      });
      navigate("/business/quotes");
    },
  });

  const selected = opportunities.find((o: Record<string, any>) => o.id === selectedId);

  const filtered = tab === "all" ? opportunities
    : tab === "at-risk" ? opportunities.filter((o: Record<string, any>) => o.stale_risk)
    : tab === "high-value" ? opportunities.filter((o: Record<string, any>) => (o.confidence || 0) >= 70)
    : opportunities.filter((o: Record<string, any>) => o.stage === "won");

  const totalValue = opportunities.reduce((sum: number,  o: Record<string, any>) => sum + (o.value || 0), 0);
  const avgConf = opportunities.length > 0 ? Math.round(opportunities.reduce((s: number,  o: Record<string, any>) => s + (o.confidence || 0), 0) / opportunities.length) : 0;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <PageTruthBanner />
      <HierarchyHint tier="workflow" surface="Opportunities" description="Source of every quote and invoice" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-border p-0.5">
            <button onClick={() => setView("list")} className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutList className="h-3.5 w-3.5" /></button>
            <button onClick={() => setView("kanban")} className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${view === "kanban" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}><Columns className="h-3.5 w-3.5" /></button>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors micro-press"><Plus className="h-3.5 w-3.5" /> New Opportunity</button>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <SitaCard className="p-5">
              <div className="flex items-center justify-between mb-4"><SitaCardTitle>New Opportunity</SitaCardTitle><button onClick={() => setShowAdd(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Opportunity title *" className="col-span-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="Value ($)" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <input type="number" min={0} max={100} value={form.confidence} onChange={e => setForm({ ...form, confidence: parseInt(e.target.value) || 0 })} placeholder="Confidence %" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
                <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
                  {Object.entries(stageLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input value={form.next_action} onChange={e => setForm({ ...form, next_action: e.target.value })} placeholder="Next action" className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={() => addOpp.mutate({ title: form.title.trim(), value: form.value ? parseFloat(form.value) : null, confidence: form.confidence, stage: form.stage, next_action: form.next_action || null })} disabled={addOpp.isPending || !form.title.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">{addOpp.isPending ? "Adding..." : "Add Opportunity"}</button>
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" variants={stagger} initial="hidden" animate="show">
        {[
          { label: "Open", value: String(opportunities.filter((o: Record<string, any>) => !["won", "lost"].includes(o.stage)).length), icon: Target },
          { label: "Pipeline Value", value: totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K` : "$0", icon: DollarSign },
          { label: "At Risk", value: String(opportunities.filter((o: Record<string, any>) => o.stale_risk).length), icon: AlertTriangle },
          { label: "Avg Confidence", value: `${avgConf}%`, icon: TrendingUp },
        ].map(kpi => <motion.div key={kpi.label} variants={fadeUp}><KPITile {...kpi} /></motion.div>)}
      </motion.div>

      <SitaTabs tabs={[
        { key: "all", label: "All", count: opportunities.length },
        { key: "at-risk", label: "At Risk", count: opportunities.filter((o: Record<string, any>) => o.stale_risk).length },
        { key: "high-value", label: "High Confidence", count: opportunities.filter((o: Record<string, any>) => (o.confidence || 0) >= 70).length },
        { key: "won", label: "Won" },
      ]} active={tab} onChange={setTab} />

      {view === "kanban" ? (
        /* ── Pipeline Kanban ── */
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
          {["lead", "discovery", "qualified", "proposal", "negotiation", "won"].map(stage => {
            const stageOpps = opportunities.filter((o: Record<string, any>) => o.stage === stage);
            const stageValue = stageOpps.reduce((s: number,  o: Record<string, any>) => s + (o.value || 0), 0);
            return (
              <div key={stage} className="flex-shrink-0 w-64 rounded-xl border border-border bg-card/50">
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-foreground capitalize">{stageLabels[stage]}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">{stageOpps.length}</span>
                  </div>
                  {stageValue > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">${(stageValue / 1000).toFixed(0)}K</p>}
                </div>
                <div className="p-2 space-y-2 min-h-[120px]">
                  {stageOpps.map((opp: Record<string, any>) => (
                    <div key={opp.id} onClick={() => setSelectedId(opp.id)} className="rounded-lg border border-border/50 bg-card p-3 cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all">
                      <p className="text-[12px] font-medium text-foreground truncate">{opp.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{opp.customer_label || "No contact"}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-semibold text-foreground">{opp.value ? `$${Number(opp.value).toLocaleString()}` : "—"}</span>
                        <ConfidenceBar value={opp.confidence || 0} size="sm" showValue={false} className="w-12" />
                      </div>
                      {opp.stale_risk && <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[hsl(var(--destructive))]"><AlertTriangle className="h-2.5 w-2.5" /> Stale</div>}
                    </div>
                  ))}
                  {stageOpps.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">No deals</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-2">
            {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)}</div>
            : filtered.length === 0 ? <EmptyState icon={Target} title="No opportunities" description={opportunities.length === 0 ? "Add your first opportunity to build your pipeline" : "Try a different filter"} />
            : (
              <motion.div className="space-y-2" variants={stagger} initial="hidden" animate="show">
                {filtered.map((opp: Record<string, any>) => {
                  const conf = opp.confidence || 0;
                  const customerName = opp.customer_label || "No contact";
                  return (
                    <motion.div key={opp.id} variants={fadeUp} layout>
                      <SitaCard onClick={() => setSelectedId(opp.id)} selected={selectedId === opp.id} lane={opp.stale_risk ? "action" : conf >= 80 ? "opportunity" : undefined} className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 font-display text-sm font-semibold text-primary shrink-0">{initials(opp.title)}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{opp.title}</p>
                              <p className="text-xs text-muted-foreground">{customerName} · {stageLabels[opp.stage] || opp.stage}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display text-sm font-semibold text-foreground">{opp.value ? `$${Number(opp.value).toLocaleString()}` : "—"}</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <div className="h-1.5 w-8 rounded-full overflow-hidden bg-secondary">
                                <div className={`h-full rounded-full ${conf >= 70 ? "bg-trust-verified" : conf >= 40 ? "bg-trust-review" : "bg-urgency-high"}`} style={{ width: `${conf}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{conf}%</span>
                            </div>
                          </div>
                        </div>
                        {opp.stale_risk && <div className="mt-2 flex items-center gap-2 text-xs"><AlertTriangle className="h-3 w-3 text-urgency-high" /><span className="text-urgency-high">{opp.blockers || "Going stale — needs follow-up"}</span></div>}
                      </SitaCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <SitaCard hover={false} glow className="p-5">
                  <SitaCardTitle sub={`${selected.customer_label || "No contact"} · ${stageLabels[selected.stage] || selected.stage}`}>{selected.title}</SitaCardTitle>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Value</span><span className="font-semibold text-foreground">{selected.value ? `$${Number(selected.value).toLocaleString()}` : "—"}</span></div>
                    <ConfidenceBar value={selected.confidence || 0} label="Confidence" />
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">State</span><StateBadge state={stageToState(selected.stage)} size="sm" /></div>
                    {selected.next_action && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Next Action</span><span className="text-foreground">{selected.next_action}</span></div>}
                    {selected.blockers && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Blocker</span><span className="text-urgency-high">{selected.blockers}</span></div>}
                  </div>
                </SitaCard>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => convertToQuote.mutate({ opportunity_id: selected.id })}
                    disabled={convertToQuote.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15 disabled:opacity-50 transition-colors micro-press"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> {convertToQuote.isPending ? "Drafting…" : "Draft Quote"}
                  </button>
                  {selected.stage !== "won" && <button onClick={() => updateStage.mutate({ id: selected.id, stage: "won" })} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"><CheckCircle className="h-3.5 w-3.5" /> Mark Won</button>}
                  <button onClick={() => deleteOpp.mutate({ id: selected.id })} className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </>
            ) : <EmptyState icon={Target} title="Select an opportunity" description="Click on an opportunity to see details and actions" />}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-border/40 bg-card p-4">
        <ModuleAdvisorPanel
          advisors={generateOpportunityAdvisors()}
          title="Opportunity & Pipeline Advisors"
          defaultExpanded={false}
          compact
        />
      </div>
    </motion.div>
  );
};

export default OpportunitiesCenter;
