import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCRMOpportunities, useCRMPipelineStages, useCRMContacts, useCRMCompanies, useCreateOpportunity, useUpdateOpportunity } from "@/hooks/use-crm-data";
import {
  TrendingUp, Plus, DollarSign, Calendar, List, Columns3, ChevronRight,
  ChevronLeft, Trophy, XCircle, Target, BarChart3, User, Building2, ArrowRight, Clock,
  AlertTriangle, Brain
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { CRMDealDetail } from "@/modules/business/components/business/crm/CRMDealDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DealAdvisorSignal } from "@/modules/business/components/business/crm/CRMAdvisorInsight";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { ModuleAdvisorPanel } from "@/modules/business/components/business/advisor-board/ModuleAdvisorPanel";
import { generateStagesAdvisors } from "@/domains/engines/business-advisor-engine";

const CRMPipeline = () => {
  const { adaptations } = useBusinessProfile();
  const crmLang = adaptations.crm.language;
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: stages = [] } = useCRMPipelineStages();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const createOpp = useCreateOpportunity();
  const updateOpp = useUpdateOpportunity();
  const [view, setView] = useState<"kanban" | "list" | "focus">("kanban");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [focusFilter, setFocusFilter] = useState<"stalled" | "closing" | "at-risk" | "all">("all");
  const [form, setForm] = useState({
    title: "", value: "", stage: "Discovery", probability: "20", source: "",
    contact_id: "", company_id: "", expected_close_date: "", notes: ""
  });

  const contactMap = useMemo(() => {
    const m: Record<string, string> = {};
    contacts.forEach(c => { m[c.id] = `${c.first_name} ${c.last_name}`; });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  const openOpps = opportunities.filter(o => o.status === "open");
  const wonOpps = opportunities.filter(o => o.status === "won");
  const lostOpps = opportunities.filter(o => o.status === "lost");
  const totalValue = openOpps.reduce((s, o) => s + (o.value || 0), 0);
  const weightedValue = openOpps.reduce((s, o) => s + (o.value || 0) * (o.probability / 100), 0);
  const wonValue = wonOpps.reduce((s, o) => s + (o.value || 0), 0);

  const activeStages = stages.filter(s => !s.is_won && !s.is_lost);
  const wonStage = stages.find(s => s.is_won);
  const lostStage = stages.find(s => s.is_lost);

  const stageGroups = useMemo(() => {
    const groups: Record<string, typeof opportunities> = {};
    stages.forEach(s => { groups[s.name] = []; });
    opportunities.forEach(o => {
      if (!groups[o.stage]) groups[o.stage] = [];
      groups[o.stage].push(o);
    });
    return groups;
  }, [opportunities, stages]);

  const activeDeal = opportunities.find(o => o.id === selectedDeal);

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      await createOpp.mutateAsync({
        title: form.title, value: Number(form.value) || 0, stage: form.stage,
        probability: Number(form.probability) || 20, source: form.source || null,
        contact_id: form.contact_id || null, company_id: form.company_id || null,
        expected_close_date: form.expected_close_date || null,
        notes: form.notes || null,
      });
      toast.success("Deal created");
      setShowAdd(false);
      setForm({ title: "", value: "", stage: "Discovery", probability: "20", source: "", contact_id: "", company_id: "", expected_close_date: "", notes: "" });
    } catch { toast.error("Failed to create opportunity"); }
  };

  const moveStage = async (id: string, newStage: string) => {
    const stage = stages.find(s => s.name === newStage);
    try {
      await updateOpp.mutateAsync({
        id,
        updates: {
          stage: newStage,
          ...(stage?.is_won ? { status: "won", won_at: new Date().toISOString() } : {}),
          ...(stage?.is_lost ? { status: "lost", lost_at: new Date().toISOString() } : {}),
        },
      });
      toast.success(`Moved to ${newStage}`);
    } catch { toast.error("Failed to update"); }
  };

  // Conversion funnel
  const funnel = useMemo(() => {
    return activeStages.map(s => {
      const count = (stageGroups[s.name] || []).length;
      const value = (stageGroups[s.name] || []).reduce((sum, d) => sum + (d.value || 0), 0);
      return { ...s, count, value };
    });
  }, [activeStages, stageGroups]);

  const maxFunnelCount = Math.max(1, ...funnel.map(f => f.count));

  // Strategic focus views
  const stalledDeals = useMemo(() => openOpps.filter(o => differenceInDays(new Date(), new Date(o.updated_at)) > 7), [openOpps]);
  const closingSoonDeals = useMemo(() => openOpps.filter(o => o.expected_close_date && differenceInDays(new Date(o.expected_close_date), new Date()) <= 14 && differenceInDays(new Date(o.expected_close_date), new Date()) >= 0), [openOpps]);
  const atRiskDeals = useMemo(() => openOpps.filter(o => (o.probability || 50) < 30 || (o.expected_close_date && isPast(new Date(o.expected_close_date)))), [openOpps]);

  const focusDeals = useMemo(() => {
    if (focusFilter === "stalled") return stalledDeals;
    if (focusFilter === "closing") return closingSoonDeals;
    if (focusFilter === "at-risk") return atRiskDeals;
    return openOpps;
  }, [focusFilter, stalledDeals, closingSoonDeals, atRiskDeals, openOpps]);

  return (
    <div className="flex gap-0 h-full">
      <div className={`flex-1 space-y-4 transition-all overflow-y-auto ${activeDeal ? "max-w-[55%]" : ""}`}>
        <PageTruthBanner truthState="demo" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
           <div>
            <h2 className="text-xl font-bold text-foreground">{crmLang.pipelineLabel}</h2>
            <p className="text-xs text-muted-foreground">
              {openOpps.length} active · ${(totalValue / 1000).toFixed(0)}K {crmLang.pipelineLabel.toLowerCase()} · ${(weightedValue / 1000).toFixed(0)}K weighted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <Button variant={view === "kanban" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("kanban")}>
                <Columns3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-none" onClick={() => setView("list")}>
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button variant={view === "focus" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("focus")}>
                <Target className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add {crmLang.dealLabel.replace(/s$/, "")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Deal title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Value ($)" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                      {activeStages.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Probability (%)" type="number" value={form.probability} onChange={e => setForm(p => ({ ...p, probability: e.target.value }))} />
                    <Input type="date" placeholder="Expected close" value={form.expected_close_date} onChange={e => setForm(p => ({ ...p, expected_close_date: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {contacts.length > 0 && (
                      <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}>
                        <option value="">Link contact...</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                      </select>
                    )}
                    {companies.length > 0 && (
                      <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.company_id} onChange={e => setForm(p => ({ ...p, company_id: e.target.value }))}>
                        <option value="">Link company...</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                  <Input placeholder="Source" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
                  <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                  <Button className="w-full" onClick={handleAdd} disabled={createOpp.isPending}>
                    {createOpp.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{openOpps.length}</p>
                <p className="text-[10px] text-muted-foreground">Active Deals</p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <div>
                <p className="text-lg font-bold text-foreground">${(totalValue / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-lg font-bold text-foreground">${(weightedValue / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground">Weighted</p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 p-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="text-lg font-bold text-foreground">${(wonValue / 1000).toFixed(0)}K</p>
                <p className="text-[10px] text-muted-foreground">Won</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Conversion Funnel */}
        {funnel.length > 0 && openOpps.length > 0 && (
          <Card className="border-border/50 bg-card/50 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Pipeline Funnel</p>
            <div className="space-y-1.5">
              {funnel.map(f => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24 truncate">{f.name}</span>
                  <div className="flex-1 h-6 rounded-md bg-muted/20 overflow-hidden relative">
                    <div
                      className="h-full rounded-md transition-all"
                      style={{
                        width: `${(f.count / maxFunnelCount) * 100}%`,
                        backgroundColor: f.color,
                        opacity: 0.3,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center px-2 justify-between">
                      <span className="text-[10px] font-medium text-foreground">{f.count} deal{f.count !== 1 ? "s" : ""}</span>
                      <span className="text-[10px] text-muted-foreground">${(f.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Focus View */}
        {view === "focus" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All Active", count: openOpps.length },
                { key: "stalled", label: "Stalled 7d+", count: stalledDeals.length },
                { key: "closing", label: "Closing Soon", count: closingSoonDeals.length },
                { key: "at-risk", label: "At Risk", count: atRiskDeals.length },
              ].map(f => (
                <Button
                  key={f.key}
                  variant={focusFilter === f.key ? "default" : "outline"}
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => setFocusFilter(f.key as "stalled" | "closing" | "at-risk" | "all")}
                >
                  {f.label}
                  {f.count > 0 && <span className="text-[10px] px-1 rounded-full bg-background/20">{f.count}</span>}
                </Button>
              ))}
            </div>
            {focusDeals.length === 0 ? (
              <div className="py-12 text-center">
                <Target className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No deals match this filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {focusDeals.map(d => {
                  const stageObj = stages.find(s => s.name === d.stage);
                  const isOverdue = d.expected_close_date && isPast(new Date(d.expected_close_date));
                  const isStalled = differenceInDays(new Date(), new Date(d.updated_at)) > 7;
                  const daysTillClose = d.expected_close_date ? differenceInDays(new Date(d.expected_close_date), new Date()) : null;
                  return (
                    <Card
                      key={d.id}
                      className={`border-border/50 bg-card/50 hover:border-primary/30 cursor-pointer transition-all ${selectedDeal === d.id ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
                      onClick={() => setSelectedDeal(d.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{d.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                              {d.contact_id && contactMap[d.contact_id] && <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{contactMap[d.contact_id]}</span>}
                              {d.company_id && companyMap[d.company_id] && <span className="flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{companyMap[d.company_id]}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">${d.value?.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">{d.probability}% prob</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stageObj?.color}20`, color: stageObj?.color }}>{d.stage}</span>
                          {isStalled && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> Stalled</span>}
                          {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" /> Overdue</span>}
                          {daysTillClose !== null && daysTillClose >= 0 && daysTillClose <= 14 && !isOverdue && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{daysTillClose}d to close</span>
                          )}
                          <DealAdvisorSignal opp={d} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) :
        /* Kanban View */
        view === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {stages.map(stage => {
              const deals = stageGroups[stage.name] || [];
              const stageValue = deals.reduce((s, d) => s + (d.value || 0), 0);
              return (
                <div key={stage.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                    {stage.is_won && <Trophy className="h-3 w-3 text-yellow-400" />}
                    {stage.is_lost && <XCircle className="h-3 w-3 text-red-400" />}
                    <span className="text-xs text-muted-foreground ml-auto">{deals.length} · ${(stageValue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="space-y-2 min-h-[100px] p-2 rounded-lg bg-muted/20 border border-border/30">
                    {deals.map(d => {
                      const isOverdue = d.expected_close_date && isPast(new Date(d.expected_close_date)) && d.status === "open";
                      const daysTillClose = d.expected_close_date ? differenceInDays(new Date(d.expected_close_date), new Date()) : null;
                      return (
                        <Card
                          key={d.id}
                          className={`border-border/50 bg-card hover:border-primary/30 transition-all cursor-pointer ${selectedDeal === d.id ? "border-primary/50 ring-1 ring-primary/20" : ""} ${isOverdue ? "border-orange-500/30" : ""}`}
                          onClick={() => setSelectedDeal(d.id)}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                            {d.contact_id && contactMap[d.contact_id] && (
                              <p className="text-[10px] text-primary mt-0.5 flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{contactMap[d.contact_id]}</p>
                            )}
                            {d.company_id && companyMap[d.company_id] && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{companyMap[d.company_id]}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
                              <span className="flex items-center gap-0.5 font-semibold text-foreground"><DollarSign className="h-3 w-3 text-green-400" />{d.value?.toLocaleString()}</span>
                              <span className="text-muted-foreground">{d.probability}%</span>
                              {d.expected_close_date && (
                                <span className={`flex items-center gap-0.5 ml-auto ${isOverdue ? "text-orange-400" : "text-muted-foreground"}`}>
                                  <Calendar className="h-3 w-3" />
                                  {daysTillClose !== null && daysTillClose >= 0 ? `${daysTillClose}d` : format(new Date(d.expected_close_date), "MMM d")}
                                </span>
                              )}
                            </div>
                            <DealAdvisorSignal opp={d} />
                            {/* Stage navigation */}
                            {!stage.is_won && !stage.is_lost && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/20">
                                {(() => {
                                  const idx = activeStages.findIndex(s => s.name === stage.name);
                                  const prev = idx > 0 ? activeStages[idx - 1] : null;
                                  const next = idx < activeStages.length - 1 ? activeStages[idx + 1] : null;
                                  return (
                                    <>
                                      {prev && (
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-0.5 px-1.5" onClick={(e) => { e.stopPropagation(); moveStage(d.id, prev.name); }}>
                                          <ChevronLeft className="h-2.5 w-2.5" /> {prev.name}
                                        </Button>
                                      )}
                                      <div className="flex-1" />
                                      {next && (
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-0.5 px-1.5" onClick={(e) => { e.stopPropagation(); moveStage(d.id, next.name); }}>
                                          {next.name} <ChevronRight className="h-2.5 w-2.5" />
                                        </Button>
                                      )}
                                      {wonStage && (
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-0.5 px-1.5 text-green-400" onClick={(e) => { e.stopPropagation(); moveStage(d.id, wonStage.name); }}>
                                          <Trophy className="h-2.5 w-2.5" />
                                        </Button>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {deals.length === 0 && (
                      <p className="text-xs text-muted-foreground/40 text-center py-6">No deals</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Deal</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Contact</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Stage</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-medium">Value</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-medium">Prob</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Close</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden lg:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map(o => {
                    const stageObj = stages.find(s => s.name === o.stage);
                    const isOverdue = o.expected_close_date && isPast(new Date(o.expected_close_date)) && o.status === "open";
                    return (
                      <tr
                        key={o.id}
                        className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${selectedDeal === o.id ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedDeal(o.id)}
                      >
                        <td className="p-3">
                          <p className="font-medium text-foreground">{o.title}</p>
                          {o.source && <p className="text-[10px] text-muted-foreground">via {o.source}</p>}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {o.contact_id && contactMap[o.contact_id] ? (
                            <span className="text-xs flex items-center gap-1"><User className="h-3 w-3" />{contactMap[o.contact_id]}</span>
                          ) : "—"}
                        </td>
                        <td className="p-3">
                          <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ backgroundColor: `${stageObj?.color}20`, color: stageObj?.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageObj?.color }} />
                            {o.stage}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold">${o.value?.toLocaleString()}</td>
                        <td className="p-3 text-center">{o.probability}%</td>
                        <td className={`p-3 hidden lg:table-cell ${isOverdue ? "text-orange-400" : "text-muted-foreground"}`}>
                          {o.expected_close_date ? format(new Date(o.expected_close_date), "MMM d, yyyy") : "—"}
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <Badge variant="outline" className={`text-[10px] ${o.status === "won" ? "text-green-400 border-green-500/20" : o.status === "lost" ? "text-red-400 border-red-500/20" : "text-foreground"}`}>
                            {o.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {opportunities.length === 0 && (
              <div className="py-16 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No Deals Yet</h3>
                <p className="text-sm text-muted-foreground">Create your first deal to start tracking your pipeline</p>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowAdd(true)}>
                  <Plus className="h-3.5 w-3.5" /> Add First Deal
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Pipeline Advisor Intelligence */}
      {!activeDeal && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 mt-4">
          <ModuleAdvisorPanel
            advisors={generateStagesAdvisors({
              totalInPipeline: openOpps.length || 42,
              stuckLeads: stalledDeals.slice(0, 5).map((o: any) => ({
                id: o.id,
                name: o.title || "Deal",
                stage: o.stage || "Unknown",
                daysStuck: o.expected_close_date ? differenceInDays(new Date(), new Date(o.expected_close_date)) : 30,
              })),
            })}
            title="Pipeline Stage Advisors"
            defaultExpanded={false}
            compact
          />
        </div>
      )}

      {/* Deal detail panel */}
      {activeDeal && (
        <div className="w-[45%] border-l border-border/50 bg-background overflow-hidden">
          <CRMDealDetail deal={activeDeal} onClose={() => setSelectedDeal(null)} />
        </div>
      )}
    </div>
  );
};

export default CRMPipeline;
