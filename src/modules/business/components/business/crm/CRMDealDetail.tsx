// SITA OS — CRM Deal Detail Panel
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  X, DollarSign, Calendar, TrendingUp, User, FileText, CheckSquare,
  MessageSquare, Sparkles, Plus, Mail, Phone, Heart, Shield
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { useCRMCommunications, useCRMTasks, useCRMNotes, useCRMContacts, useCRMCompanies, useCRMPipelineStages, useUpdateOpportunity, useCreateTask, useCreateNote } from "@/modules/business/hooks/use-crm-data";
import type { CRMOpportunity } from "@/data/repositories/crm-data-service";
import { CRMEscalateToBoardroom } from "./CRMEscalateToBoardroom";

const healthColor = (p: number) => p >= 70 ? "text-green-400" : p >= 40 ? "text-yellow-400" : "text-red-400";

interface CRMDealDetailProps {
  deal: CRMOpportunity;
  onClose: () => void;
}

export function CRMDealDetail({ deal, onClose }: CRMDealDetailProps) {
  const { data: allContacts = [] } = useCRMContacts();
  const { data: allCompanies = [] } = useCRMCompanies();
  const { data: allComms = [] } = useCRMCommunications();
  const { data: allTasks = [] } = useCRMTasks();
  const { data: allNotes = [] } = useCRMNotes();
  const { data: stages = [] } = useCRMPipelineStages();
  const updateOpp = useUpdateOpportunity();
  const createTask = useCreateTask();
  const createNote = useCreateNote();

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [showEscalation, setShowEscalation] = useState(false);

  const contact = allContacts.find(c => c.id === deal.contact_id);
  const company = allCompanies.find(c => c.id === deal.company_id);
  const comms = useMemo(() => allComms.filter(c => c.opportunity_id === deal.id), [allComms, deal.id]);
  const tasks = useMemo(() => allTasks.filter(t => t.opportunity_id === deal.id), [allTasks, deal.id]);
  const notes = useMemo(() => allNotes.filter(n => n.opportunity_id === deal.id), [allNotes, deal.id]);

  const weightedValue = (deal.value || 0) * (deal.probability / 100);
  const currentStageIndex = stages.findIndex(s => s.name === deal.stage);

  const moveStage = async (newStage: string) => {
    const stage = stages.find(s => s.name === newStage);
    try {
      await updateOpp.mutateAsync({
        id: deal.id,
        updates: {
          stage: newStage,
          ...(stage?.is_won ? { status: "won", won_at: new Date().toISOString() } : {}),
          ...(stage?.is_lost ? { status: "lost", lost_at: new Date().toISOString() } : {}),
        } as any
      });
      toast.success(`Moved to ${newStage}`);
    } catch { toast.error("Failed to update"); }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    try {
      await createTask.mutateAsync({ title: taskTitle, opportunity_id: deal.id, contact_id: deal.contact_id, task_type: "follow-up", priority: "medium" } as any);
      toast.success("Task created");
      setTaskTitle("");
      setShowAddTask(false);
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-shrink-0 border-b border-border/50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{deal.title}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-lg font-bold text-foreground flex items-center gap-0.5">
                <DollarSign className="h-4 w-4" />{deal.value?.toLocaleString()}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{deal.stage}</span>
              <span className={`text-sm font-semibold ${healthColor(deal.probability)}`}>{deal.probability}% likely</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowEscalation(true)}><Shield className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Stage progress */}
        <div className="flex gap-1 mt-3">
          {stages.filter(s => !s.is_lost).map((s, i) => (
            <button
              key={s.id}
              className={`flex-1 h-2 rounded-full transition-all cursor-pointer hover:opacity-80 ${
                i <= currentStageIndex ? "bg-primary" : "bg-muted/30"
              } ${s.is_won ? "bg-green-500" : ""}`}
              onClick={() => moveStage(s.name)}
              title={s.name}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          {stages.filter(s => !s.is_lost).map(s => <span key={s.id}>{s.name}</span>)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-shrink-0 mx-4 mt-3 bg-muted/30">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity ({comms.length})</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xl font-bold text-foreground">${(weightedValue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Weighted Value</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xl font-bold text-foreground">
                    {deal.expected_close_date ? format(new Date(deal.expected_close_date), "MMM d") : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                </div>
              </div>

              {/* Linked entities */}
              {contact && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</p>
                      <p className="text-xs text-muted-foreground">{contact.title || contact.email || ""}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {company && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.industry || company.domain || ""}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {deal.notes && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{deal.notes}</p></CardContent>
                </Card>
              )}

              {/* Advisor */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Deal Intelligence</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deal.probability >= 70 ? "High probability deal — ensure all terms are finalized and close date is firm."
                        : deal.probability >= 40 ? "Moderate probability — identify and address remaining objections."
                        : "Early-stage opportunity — focus on qualification and building champion support."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick stage actions */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Move to Stage</p>
                <div className="flex gap-2 flex-wrap">
                  {stages.filter(s => s.name !== deal.stage).map(s => (
                    <Button key={s.id} variant="outline" size="sm" className="h-7 text-xs" onClick={() => moveStage(s.name)}>
                      <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-2">
              {comms.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity on this deal</p>
                </div>
              ) : comms.map(c => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {c.comm_type === "email" ? <Mail className="h-3.5 w-3.5" /> : c.comm_type === "call" ? <Phone className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.subject || c.comm_type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(c.occurred_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Deal Tasks</h3>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAddTask(true)}>
                  <Plus className="h-3 w-3" /> Task
                </Button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks</p>
                </div>
              ) : tasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30">
                  <CheckSquare className={`h-4 w-4 mt-0.5 ${t.status === "completed" ? "text-green-400" : "text-muted-foreground"}`} />
                  <div>
                    <p className={`text-sm ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                    {t.due_date && <p className="text-xs text-muted-foreground">Due {format(new Date(t.due_date), "MMM d")}</p>}
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Task to Deal</DialogTitle></DialogHeader>
          <Input placeholder="Task title..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
          <Button className="w-full" onClick={handleAddTask} disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogContent>
      </Dialog>

      <CRMEscalateToBoardroom
        open={showEscalation}
        onOpenChange={setShowEscalation}
        context={{
          entityType: "deal",
          entityId: deal.id,
          entityName: deal.title,
          pipelineValue: deal.value,
          advisorSummary: deal.probability < 40 ? `Low probability deal — may need strategic intervention.` : undefined,
        }}
      />
    </div>
  );
}
