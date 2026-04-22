// SITA OS — CRM Contact Detail Dossier
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  X, Mail, Phone, Globe, MapPin, Building2, Heart, Star,
  Calendar, Clock, Send, MessageSquare, FileText, CheckSquare,
  TrendingUp, DollarSign, Edit2, Tag, ChevronRight, Plus,
  AlertTriangle, ArrowUpRight, Sparkles, MoreHorizontal, User,
  Shield, Receipt, Handshake, HeadphonesIcon, Video,
  Banknote, FolderOpen, CalendarClock
} from "lucide-react";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { useCRMCommunications, useCRMTasks, useCRMNotes, useCRMOpportunities, useCreateCommunication, useCreateTask, useCreateNote, useUpdateContact } from "@/hooks/use-crm-data";
import type { CRMContact, CRMCompany } from "@/data/repositories/crm-data-service";
import { CRMEscalateToBoardroom } from "./CRMEscalateToBoardroom";
import { CRMMeetingPrep } from "./CRMMeetingPrep";
import { CRMNextBestAction } from "./CRMNextBestAction";
import { InlineAdvisorInsights, generateContactInsights } from "./CRMAdvisorInsight";
import { CRMFinanceLinkage } from "./CRMFinanceLinkage";
import { CRMFilesLinkage } from "./CRMFilesLinkage";
import { CRMConciergeLinkage } from "./CRMConciergeLinkage";
import { CRMProofTrail } from "./CRMProofTrail";
import { CRMOwnership } from "./CRMOwnership";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { getContactDetailTabs } from "@/components/business/adaptive/AdaptiveContactLayout";

const LIFECYCLE_COLORS: Record<string, string> = {
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  qualified: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  opportunity: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  customer: "bg-green-500/20 text-green-400 border-green-500/30",
  churned: "bg-red-500/20 text-red-400 border-red-500/30",
};

const healthColor = (s: number) => s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";
const healthBg = (s: number) => s >= 80 ? "bg-green-500/10" : s >= 60 ? "bg-yellow-500/10" : s >= 40 ? "bg-orange-500/10" : "bg-red-500/10";
const healthLabel = (s: number) => s >= 80 ? "Healthy" : s >= 60 ? "Warming" : s >= 40 ? "Drifting" : "At Risk";

const COMM_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  meeting: <MessageSquare className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
};

interface CRMContactDetailProps {
  contact: CRMContact;
  companies?: CRMCompany[];
  onClose: () => void;
  onEdit?: (contact: CRMContact) => void;
}

export function CRMContactDetail({ contact, companies = [], onClose, onEdit }: CRMContactDetailProps) {
  const { data: allComms = [] } = useCRMCommunications();
  const { data: allTasks = [] } = useCRMTasks();
  const { data: allNotes = [] } = useCRMNotes();
  const { data: allOpps = [] } = useCRMOpportunities();
  const createComm = useCreateCommunication();
  const createTask = useCreateTask();
  const createNote = useCreateNote();
  const updateContact = useUpdateContact();
  const { primaryMode } = useBusinessProfile();
  const tabOrder = getContactDetailTabs(primaryMode);

  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNote, setQuickNote] = useState("");
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [showLogComm, setShowLogComm] = useState(false);
  const [commForm, setCommForm] = useState({ comm_type: "email", subject: "", content: "", outcome: "" });
  const [showEscalation, setShowEscalation] = useState(false);

  // Filter data for this contact
  const comms = useMemo(() => allComms.filter(c => c.contact_id === contact.id), [allComms, contact.id]);
  const tasks = useMemo(() => allTasks.filter(t => t.contact_id === contact.id), [allTasks, contact.id]);
  const notes = useMemo(() => allNotes.filter(n => n.contact_id === contact.id), [allNotes, contact.id]);
  const opps = useMemo(() => allOpps.filter(o => o.contact_id === contact.id), [allOpps, contact.id]);

  const linkedCompany = companies.find(c => contact.tags?.includes(c.name));
  const health = contact.health_score ?? 50;
  const overdueTasks = tasks.filter(t => t.status !== "completed" && t.due_date && isPast(new Date(t.due_date)));
  const pendingTasks = tasks.filter(t => t.status !== "completed");

  const handleAddNote = async () => {
    if (!quickNote.trim()) return;
    try {
      await createNote.mutateAsync({ content: quickNote, contact_id: contact.id, note_type: "quick" } as any);
      toast.success("Note added");
      setQuickNote("");
      setShowQuickNote(false);
    } catch { toast.error("Failed to add note"); }
  };

  const handleAddTask = async () => {
    if (!quickTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({ title: quickTaskTitle, contact_id: contact.id, task_type: "follow-up", priority: "medium" } as any);
      toast.success("Task created");
      setQuickTaskTitle("");
      setShowQuickTask(false);
    } catch { toast.error("Failed to create task"); }
  };

  const handleLogComm = async () => {
    if (!commForm.subject.trim()) return;
    try {
      await createComm.mutateAsync({ ...commForm, contact_id: contact.id, direction: "outbound" } as any);
      toast.success("Communication logged");
      setCommForm({ comm_type: "email", subject: "", content: "", outcome: "" });
      setShowLogComm(false);
    } catch { toast.error("Failed to log communication"); }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 p-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {contact.first_name?.[0]}{contact.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">{contact.first_name} {contact.last_name}</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize border ${LIFECYCLE_COLORS[contact.lifecycle_stage] || "bg-muted text-muted-foreground"}`}>
                {contact.lifecycle_stage}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${healthBg(health)} ${healthColor(health)} font-semibold`}>
                <Heart className="h-3 w-3 inline mr-1" />{health} — {healthLabel(health)}
              </span>
              {contact.tags?.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  <Tag className="h-2.5 w-2.5 inline mr-0.5" />{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {contact.email && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
              <a href={`mailto:${contact.email}`}><Mail className="h-3 w-3" /> Email</a>
            </Button>
          )}
          {contact.phone && (
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
              <a href={`tel:${contact.phone}`}><Phone className="h-3 w-3" /> Call</a>
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowQuickNote(true)}>
            <FileText className="h-3 w-3" /> Note
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowQuickTask(true)}>
            <CheckSquare className="h-3 w-3" /> Task
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowLogComm(true)}>
            <Send className="h-3 w-3" /> Log Activity
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setShowEscalation(true)}>
            <Shield className="h-3 w-3" /> Escalate
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-shrink-0 mx-4 mt-3 bg-muted/30 flex-wrap h-auto gap-0.5 py-1">
          {tabOrder.map((tab) => {
            const tabLabels: Record<string, React.ReactNode> = {
              overview: "Overview",
              timeline: <>Timeline ({comms.length})</>,
              tasks: <>Tasks ({pendingTasks.length})</>,
              notes: <>Notes ({notes.length})</>,
              deals: <>Deals ({opps.length})</>,
              prep: "Prep",
              finance: <span className="flex items-center gap-1"><Banknote className="h-3 w-3" />Finance</span>,
              files: <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" />Files</span>,
              concierge: <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />Concierge</span>,
              proof: <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Proof</span>,
            };
            return (
              <TabsTrigger key={tab} value={tab} className="text-xs">
                {tabLabels[tab] || tab}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {/* Overview */}
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Contact Info */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <a href={`mailto:${contact.email}`} className="hover:text-foreground transition-colors">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 shrink-0" />
                      <span>{contact.website}</span>
                    </div>
                  )}
                  {(contact.city || contact.state || contact.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{[contact.city, contact.state, contact.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {contact.owner && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span>Owner: {contact.owner}</span>
                    </div>
                  )}
                  {contact.source && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      <span>Source: {contact.source}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Relationship Summary */}
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" /> Relationship Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-2xl font-bold ${healthColor(health)}`}>{health}</p>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">{comms.length}</p>
                      <p className="text-xs text-muted-foreground">Interactions</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">{opps.length}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/30">
                      <p className="text-2xl font-bold text-foreground">
                        {contact.last_contacted_at ? formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: false }) : "Never"}
                      </p>
                      <p className="text-xs text-muted-foreground">Since Contact</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {overdueTasks.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
                      <p className="text-xs text-orange-400">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}</p>
                    </div>
                  )}
                  {contact.next_follow_up_at && isPast(new Date(contact.next_follow_up_at)) && (
                    <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-xs text-red-400">Follow-up overdue — was due {formatDistanceToNow(new Date(contact.next_follow_up_at), { addSuffix: true })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Next Best Actions */}
              <CRMNextBestAction
                contact={contact}
                communications={comms}
                opportunities={opps}
                tasks={tasks}
              />

              {/* Advisor Insight Zone */}
              <InlineAdvisorInsights
                insights={generateContactInsights(contact, comms, tasks, opps)}
                maxInsights={3}
              />

              {/* Recent timeline preview */}
              {comms.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {comms.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-start gap-2.5 text-sm">
                        <div className="mt-0.5 text-muted-foreground">{COMM_ICONS[c.comm_type] || <MessageSquare className="h-3.5 w-3.5" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{c.subject || c.comm_type}</p>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.occurred_at), { addSuffix: true })}</p>
                        </div>
                        {c.outcome && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c.outcome}</span>}
                      </div>
                    ))}
                    {comms.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setActiveTab("timeline")}>
                        View all {comms.length} activities <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Timeline */}
            <TabsContent value="timeline" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Communication History</h3>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowLogComm(true)}>
                  <Plus className="h-3 w-3" /> Log
                </Button>
              </div>
              {comms.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No communications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {comms.map(c => (
                    <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                        {COMM_ICONS[c.comm_type] || <MessageSquare className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{c.subject || c.comm_type}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">{c.comm_type}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c.direction}</span>
                        </div>
                        {c.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.content}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(c.occurred_at), "MMM d, yyyy 'at' h:mm a")}
                          {c.outcome && <> · <span className="text-foreground">{c.outcome}</span></>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tasks */}
            <TabsContent value="tasks" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Follow-Through</h3>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowQuickTask(true)}>
                  <Plus className="h-3 w-3" /> Task
                </Button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks linked</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {tasks.map(t => {
                    const overdue = t.status !== "completed" && t.due_date && isPast(new Date(t.due_date));
                    return (
                      <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors ${overdue ? "bg-red-500/5" : ""}`}>
                        <CheckSquare className={`h-4 w-4 mt-0.5 shrink-0 ${t.status === "completed" ? "text-green-400" : overdue ? "text-red-400" : "text-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${t.priority === "high" ? "bg-red-500/10 text-red-400" : t.priority === "medium" ? "bg-yellow-500/10 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                              {t.priority}
                            </span>
                            {t.due_date && (
                              <span className={`text-xs ${overdue ? "text-red-400" : "text-muted-foreground"}`}>
                                Due {format(new Date(t.due_date), "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notes & Memory</h3>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowQuickNote(true)}>
                  <Plus className="h-3 w-3" /> Note
                </Button>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map(n => (
                    <Card key={n.id} className="border-border/50 bg-card/50">
                      <CardContent className="p-3">
                        {n.title && <p className="text-sm font-medium text-foreground">{n.title}</p>}
                        <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">{format(new Date(n.created_at), "MMM d, yyyy")}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Deals */}
            <TabsContent value="deals" className="mt-0 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Opportunities</h3>
              </div>
              {opps.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No deals linked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {opps.map(o => (
                    <Card key={o.id} className="border-border/50 bg-card/50 hover:border-primary/30 transition-all cursor-pointer">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-foreground">{o.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5 font-semibold text-foreground"><DollarSign className="h-3 w-3" />{o.value?.toLocaleString()}</span>
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{o.stage}</span>
                          <span>{o.probability}%</span>
                          {o.expected_close_date && <span>Close {format(new Date(o.expected_close_date), "MMM d")}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Meeting/Call Prep */}
            <TabsContent value="prep" className="mt-0 space-y-4">
              <CRMMeetingPrep
                contact={contact}
                communications={comms}
                opportunities={opps}
                tasks={tasks}
                notes={notes}
                prepType="meeting"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.info("Call prep coming soon")}>
                  <Phone className="h-3 w-3" /> Call Prep
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.info("Meeting prep coming soon")}>
                  <Video className="h-3 w-3" /> Meeting Prep
                </Button>
              </div>
            </TabsContent>

            {/* Finance Linkage */}
            <TabsContent value="finance" className="mt-0">
              <CRMFinanceLinkage
                entityType="contact"
                entityId={contact.id}
                entityName={`${contact.first_name} ${contact.last_name}`}
                healthScore={health}
              />
            </TabsContent>

            {/* Files Linkage */}
            <TabsContent value="files" className="mt-0">
              <CRMFilesLinkage
                entityType="contact"
                entityId={contact.id}
                entityName={`${contact.first_name} ${contact.last_name}`}
              />
            </TabsContent>

            {/* Concierge Linkage */}
            <TabsContent value="concierge" className="mt-0">
              <CRMConciergeLinkage
                entityType="contact"
                entityId={contact.id}
                entityName={`${contact.first_name} ${contact.last_name}`}
              />
            </TabsContent>

            {/* Proof Trail + Ownership */}
            <TabsContent value="proof" className="mt-0 space-y-4">
              <CRMOwnership
                entityType="contact"
                entityId={contact.id}
                entityName={`${contact.first_name} ${contact.last_name}`}
                currentOwner={contact.owner || undefined}
              />
              <CRMProofTrail
                entityType="contact"
                entityId={contact.id}
                entityName={`${contact.first_name} ${contact.last_name}`}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Quick Note Dialog */}
      <Dialog open={showQuickNote} onOpenChange={setShowQuickNote}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Quick Note</DialogTitle></DialogHeader>
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Write a note..."
            value={quickNote}
            onChange={e => setQuickNote(e.target.value)}
          />
          <Button className="w-full" onClick={handleAddNote} disabled={createNote.isPending}>
            {createNote.isPending ? "Saving..." : "Save Note"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Quick Task Dialog */}
      <Dialog open={showQuickTask} onOpenChange={setShowQuickTask}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Quick Task</DialogTitle></DialogHeader>
          <Input placeholder="Task title..." value={quickTaskTitle} onChange={e => setQuickTaskTitle(e.target.value)} />
          <Button className="w-full" onClick={handleAddTask} disabled={createTask.isPending}>
            {createTask.isPending ? "Creating..." : "Create Task"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Log Communication Dialog */}
      <Dialog open={showLogComm} onOpenChange={setShowLogComm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Log Activity</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={commForm.comm_type}
              onChange={e => setCommForm(p => ({ ...p, comm_type: e.target.value }))}
            >
              <option value="email">Email</option>
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
            <Input placeholder="Subject" value={commForm.subject} onChange={e => setCommForm(p => ({ ...p, subject: e.target.value }))} />
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Details..."
              value={commForm.content}
              onChange={e => setCommForm(p => ({ ...p, content: e.target.value }))}
            />
            <Input placeholder="Outcome (e.g. positive, no answer)" value={commForm.outcome} onChange={e => setCommForm(p => ({ ...p, outcome: e.target.value }))} />
            <Button className="w-full" onClick={handleLogComm} disabled={createComm.isPending}>
              {createComm.isPending ? "Logging..." : "Log Activity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Boardroom Escalation */}
      <CRMEscalateToBoardroom
        open={showEscalation}
        onOpenChange={setShowEscalation}
        context={{
          entityType: "contact",
          entityId: contact.id,
          entityName: `${contact.first_name} ${contact.last_name}`,
          healthScore: health,
          advisorSummary: health < 40 ? `Relationship at risk — re-engage ${contact.first_name}.` : undefined,
        }}
      />
    </div>
  );
}
