// ═══════════════════════════════════════════════════════════════
// SITA OS — Communications Workspace
// Unified comms center with priority inbox, follow-up queue,
// draft center, reply-gap detection, and thread context.
// ═══════════════════════════════════════════════════════════════

import { PageSkeleton } from "@/components/sita/PageSkeleton";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail, Phone, Send, Clock, CheckCircle2, AlertCircle, Star, Search, Filter, Archive, Edit3, AlertTriangle, Users, ChevronRight, Inbox, FileText, ArrowRight, RotateCcw, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaPageHeader } from "@/components/sita/SitaPageHeader";
import { type DemoCommunicationEntry as CommunicationEntry, type ChannelType, type MessageStatus } from "@/data/seed/communications";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase-helpers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";
const CHANNEL_ICONS: Record<ChannelType, typeof Mail> = { email: Mail, sms: MessageSquare, call: Phone, chat: Send };
const STATUS_STYLES: Record<MessageStatus, { color: string; icon: typeof CheckCircle2 }> = {
  sent: { color: "text-muted-foreground", icon: Clock },
  delivered: { color: "text-primary", icon: CheckCircle2 },
  read: { color: "text-emerald-400", icon: CheckCircle2 },
  failed: { color: "text-destructive", icon: AlertCircle },
  queued: { color: "text-muted-foreground", icon: Clock },
};

// ── Extended demo data for new features ──────────────────────
const FOLLOW_UPS = [
  { id: "f1", contact: "Apex Corp — Sarah Chen", lastContact: "5 days ago", urgency: "high" as const, channel: "email" as ChannelType, reason: "No reply to proposal sent Monday" },
  { id: "f2", contact: "Delta Inc — James Park", lastContact: "3 days ago", urgency: "medium" as const, channel: "email" as ChannelType, reason: "Invoice follow-up needed" },
  { id: "f3", contact: "Mom", lastContact: "2 weeks ago", urgency: "low" as const, channel: "call" as ChannelType, reason: "Personal — haven't called in a while" },
  { id: "f4", contact: "Broker — Michael Torres", lastContact: "8 days ago", urgency: "high" as const, channel: "email" as ChannelType, reason: "Waiting on insurance quote" },
];

const DRAFTS = [
  { id: "d1", to: "Sarah Chen", subject: "Re: Q2 Partnership Proposal", channel: "email" as ChannelType, lastEdited: "2 hours ago", status: "draft" as const, approvalNeeded: false },
  { id: "d2", to: "Board Members", subject: "Monthly Update — March 2026", channel: "email" as ChannelType, lastEdited: "Yesterday", status: "review" as const, approvalNeeded: true },
  { id: "d3", to: "Delta Inc", subject: "Service Agreement Amendment", channel: "email" as ChannelType, lastEdited: "3 days ago", status: "draft" as const, approvalNeeded: false },
];

const URGENCY_COLORS = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border/30",
};

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [channelFilter, setChannelFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedComm, setSelectedComm] = useState<CommunicationEntry | null>(null);
  const { user , isDemo} = useAuth();
  const { data: realComms } = useQuery({
    queryKey: ["communications", user?.id],
    enabled: !!user && !false,
    queryFn: async () => {
      const { data } = await fromTable("communications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      if (!data?.length) return null;
      return data.map((c: Record<string, any>) => ({
        id: c.id, contactName: c.contact_name || c.recipient || "Unknown",
        channel: (c.channel || "email") as ChannelType, direction: c.direction || "outbound",
        subject: c.subject || "", preview: c.preview || c.body?.slice(0, 100) || "",
        status: (c.status || "sent") as MessageStatus, timestamp: c.sent_at || c.created_at, domain: c.domain || "general",
      }));
    },
  });

  const communications = (realComms ?? []);

  const filtered = useMemo(() => {
    let result = communications;
    if (channelFilter !== "all") result = result.filter(c => c.channel === channelFilter);
    if (search) result = result.filter(c => c.contactName.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [communications, channelFilter, search]);

  const stats = {
    totalToday: communications.length,
    needsReply: communications.filter(c => c.direction === "inbound" && c.status !== "read").length,
    followUpRisks: ([] as any[]).filter(f => f.urgency === "high").length,
    draftsWaiting: ([] as any[]).length,
    failedToday: communications.filter(c => c.status === "failed").length,
  };

  return (
    <PageShell>
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
<SitaPageHeader
        icon={<MessageSquare className="h-6 w-6" />}
        title="Communications"
        subtitle="Unified signal-over-noise communications center"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search comms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-48 bg-card/30" />
          </div>
          <Button size="sm"><Send className="h-4 w-4 mr-1.5" /> Compose</Button>
        </div>
      </SitaPageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Today", value: stats.totalToday, icon: MessageSquare, color: "text-primary" },
          { label: "Needs Reply", value: stats.needsReply, icon: Inbox, color: "text-amber-400" },
          { label: "Follow-up Risks", value: stats.followUpRisks, icon: AlertTriangle, color: "text-destructive" },
          { label: "Drafts", value: stats.draftsWaiting, icon: Edit3, color: "text-muted-foreground" },
          { label: "Failed", value: stats.failedToday, icon: AlertCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview"><Inbox className="h-4 w-4 mr-1.5" />Overview</TabsTrigger>
          <TabsTrigger value="inbox"><Mail className="h-4 w-4 mr-1.5" />Inbox</TabsTrigger>
          <TabsTrigger value="follow-ups"><AlertTriangle className="h-4 w-4 mr-1.5" />Follow-ups</TabsTrigger>
          <TabsTrigger value="drafts"><Edit3 className="h-4 w-4 mr-1.5" />Drafts</TabsTrigger>
          <TabsTrigger value="threads"><MessageSquare className="h-4 w-4 mr-1.5" />Threads</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Needs Reply */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-amber-400" /> Needs Reply
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {communications.filter(c => c.direction === "inbound").slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/20 transition-colors cursor-pointer">
                    {(() => { const Icon = CHANNEL_ICONS[c.channel]; return <Icon className="h-4 w-4 text-primary shrink-0" />; })()}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.contactName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.subject}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(c.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Follow-up Risks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Follow-up Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {([] as any[]).filter(f => f.urgency !== "low").map(f => (
                  <div key={f.id} className="flex items-start gap-3 p-2 rounded-lg border border-border/30">
                    <Badge variant="outline" className={cn("text-[9px] shrink-0 mt-0.5", URGENCY_COLORS[f.urgency])}>{f.urgency}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{f.contact}</p>
                      <p className="text-[10px] text-muted-foreground">{f.reason}</p>
                      <p className="text-[10px] text-muted-foreground/60">Last contact: {f.lastContact}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2">Follow up</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INBOX TAB */}
        <TabsContent value="inbox" className="mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {["all", "email", "sms", "call", "chat"].map(ch => (
              <button key={ch} onClick={() => setChannelFilter(ch)} className={cn("px-2 py-1 text-xs rounded-md transition-colors capitalize", channelFilter === ch ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{ch}</button>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              {filtered.map((comm, i) => {
                const ChannelIcon = CHANNEL_ICONS[comm.channel];
                const statusInfo = STATUS_STYLES[comm.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <motion.div key={comm.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className={cn("hover:bg-accent/20 transition-colors cursor-pointer border-border/30", selectedComm?.id === comm.id && "border-primary/40 bg-primary/5")} onClick={() => setSelectedComm(comm)}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                          <ChannelIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground text-xs truncate">{comm.contactName}</span>
                            <Badge variant="outline" className="text-[9px]">{comm.direction}</Badge>
                          </div>
                          <p className="text-xs text-foreground/80 truncate">{comm.subject}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{comm.preview}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <StatusIcon className={cn("h-3.5 w-3.5", statusInfo.color)} />
                          <span className="text-[10px] text-muted-foreground">{new Date(comm.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Thread detail panel */}
            <AnimatePresence>
              {selectedComm && (
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="w-80 shrink-0 hidden lg:block">
                  <Card className="border-border/40">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        {(() => { const I = CHANNEL_ICONS[selectedComm.channel]; return <I className="h-4 w-4 text-primary" />; })()}
                        <span className="text-sm font-semibold">{selectedComm.contactName}</span>
                      </div>
                      <p className="text-xs font-medium">{selectedComm.subject}</p>
                      <p className="text-xs text-muted-foreground">{selectedComm.preview}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span className="capitalize">{selectedComm.channel}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Direction</span><span>{selectedComm.direction}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="text-[9px]">{selectedComm.status}</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{selectedComm.domain}</span></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 text-xs gap-1"><Send className="h-3 w-3" /> Reply</Button>
                        <Button size="sm" variant="outline" className="text-xs"><ArrowRight className="h-3 w-3" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* FOLLOW-UPS TAB */}
        <TabsContent value="follow-ups" className="mt-4 space-y-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Follow-up Queue</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as any[]).map(f => {
                const Icon = CHANNEL_ICONS[f.channel];
                return (
                  <div key={f.id} className={cn("flex items-center gap-3 p-3 rounded-lg border", f.urgency === "high" ? "border-destructive/20 bg-destructive/5" : "border-border/30")}>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{f.contact}</p>
                        <Badge variant="outline" className={cn("text-[9px]", URGENCY_COLORS[f.urgency])}>{f.urgency}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.reason}</p>
                      <p className="text-[10px] text-muted-foreground/60">Last: {f.lastContact}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="text-xs h-7">Snooze</Button>
                      <Button size="sm" className="text-xs h-7 gap-1"><Send className="h-3 w-3" /> Follow up</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DRAFTS TAB */}
        <TabsContent value="drafts" className="mt-4 space-y-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Draft Center</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([] as any[]).map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-accent/20 transition-colors cursor-pointer">
                  <Edit3 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{d.subject}</p>
                    <p className="text-xs text-muted-foreground">To: {d.to} · {d.lastEdited}</p>
                  </div>
                  <Badge variant={d.approvalNeeded ? "default" : "outline"} className="text-[9px] shrink-0">
                    {d.approvalNeeded ? "Needs Approval" : d.status}
                  </Badge>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* THREADS TAB */}
        <TabsContent value="threads" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Active Threads</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {communications.slice(0, 6).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-accent/20 transition-colors cursor-pointer">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.contactName} — {c.subject}</p>
                      <p className="text-[10px] text-muted-foreground">3 messages · Last: {new Date(c.timestamp).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{c.channel}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </PageShell>
  );
}
