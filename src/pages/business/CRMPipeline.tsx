import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCRMOpportunities, useCRMPipelineStages, useCreateOpportunity, useUpdateOpportunity } from "@/hooks/use-crm-data";
import { TrendingUp, Plus, DollarSign, Calendar, List, Columns3 } from "lucide-react";
import { format } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { CRMDealDetail } from "@/components/business/crm/CRMDealDetail";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const CRMPipeline = () => {
  const { data: opportunities = [] } = useCRMOpportunities();
  const { data: stages = [] } = useCRMPipelineStages();
  const createOpp = useCreateOpportunity();
  const updateOpp = useUpdateOpportunity();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", value: "", stage: "Discovery", probability: "20", source: "" });

  const openOpps = opportunities.filter(o => o.status === "open");
  const totalValue = openOpps.reduce((s, o) => s + (o.value || 0), 0);
  const weightedValue = openOpps.reduce((s, o) => s + (o.value || 0) * (o.probability / 100), 0);

  const stageGroups = useMemo(() => {
    const groups: Record<string, typeof opportunities> = {};
    stages.forEach(s => { groups[s.name] = []; });
    openOpps.forEach(o => {
      if (!groups[o.stage]) groups[o.stage] = [];
      groups[o.stage].push(o);
    });
    return groups;
  }, [openOpps, stages]);

  const activeDeal = opportunities.find(o => o.id === selectedDeal);

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    try {
      await createOpp.mutateAsync({
        title: form.title, value: Number(form.value) || 0, stage: form.stage,
        probability: Number(form.probability) || 20, source: form.source || null,
      } as any);
      toast.success("Opportunity created");
      setShowAdd(false);
      setForm({ title: "", value: "", stage: "Discovery", probability: "20", source: "" });
    } catch { toast.error("Failed to create opportunity"); }
  };

  const moveStage = async (id: string, newStage: string) => {
    const stage = stages.find(s => s.name === newStage);
    try {
      await updateOpp.mutateAsync({ id, updates: { stage: newStage, ...(stage?.is_won ? { status: "won", won_at: new Date().toISOString() } : stage?.is_lost ? { status: "lost", lost_at: new Date().toISOString() } : {}) } as any });
      toast.success(`Moved to ${newStage}`);
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="flex gap-0 h-full">
      <div className={`flex-1 space-y-4 transition-all ${activeDeal ? "max-w-[55%]" : ""}`}>
        <PageTruthBanner truthState="demo" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Pipeline</h2>
            <p className="text-xs text-muted-foreground">
              {openOpps.length} deals · ${(totalValue / 1000).toFixed(0)}K total · ${(weightedValue / 1000).toFixed(0)}K weighted
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-border rounded-md">
              <Button variant={view === "kanban" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-r-none" onClick={() => setView("kanban")}>
                <Columns3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-9 w-9 rounded-l-none" onClick={() => setView("list")}>
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Deal</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Deal title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  <Input placeholder="Value ($)" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                    {stages.filter(s => !s.is_won && !s.is_lost).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <Input placeholder="Probability (%)" type="number" value={form.probability} onChange={e => setForm(p => ({ ...p, probability: e.target.value }))} />
                  <Input placeholder="Source" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
                  <Button className="w-full" onClick={handleAdd} disabled={createOpp.isPending}>
                    {createOpp.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {stages.map(stage => {
              const deals = stageGroups[stage.name] || [];
              const stageValue = deals.reduce((s, d) => s + (d.value || 0), 0);
              return (
                <div key={stage.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{deals.length} · ${(stageValue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="space-y-2 min-h-[100px] p-2 rounded-lg bg-muted/20 border border-border/30">
                    {deals.map(d => (
                      <Card
                        key={d.id}
                        className={`border-border/50 bg-card hover:border-primary/30 transition-all cursor-pointer ${selectedDeal === d.id ? "border-primary/50 bg-primary/5" : ""}`}
                        onClick={() => setSelectedDeal(d.id)}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" />{d.value?.toLocaleString()}</span>
                            <span>{d.probability}%</span>
                          </div>
                          {d.expected_close_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {format(new Date(d.expected_close_date), "MMM d")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {deals.length === 0 && (
                      <p className="text-xs text-muted-foreground/40 text-center py-6">No deals</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Deal</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium">Stage</th>
                    <th className="text-right p-3 text-xs text-muted-foreground font-medium">Value</th>
                    <th className="text-center p-3 text-xs text-muted-foreground font-medium">Probability</th>
                    <th className="text-left p-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {openOpps.map(o => (
                    <tr
                      key={o.id}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer ${selectedDeal === o.id ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDeal(o.id)}
                    >
                      <td className="p-3 font-medium text-foreground">{o.title}</td>
                      <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{o.stage}</span></td>
                      <td className="p-3 text-right font-semibold">${o.value?.toLocaleString()}</td>
                      <td className="p-3 text-center">{o.probability}%</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {o.expected_close_date ? format(new Date(o.expected_close_date), "MMM d, yyyy") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {openOpps.length === 0 && (
              <div className="py-12 text-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No active deals</p>
              </div>
            )}
          </Card>
        )}
      </div>

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
