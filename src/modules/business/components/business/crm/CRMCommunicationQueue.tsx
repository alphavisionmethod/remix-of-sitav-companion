import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCRMCommunications, useCRMContacts, useCRMCompanies } from "@/modules/business/hooks/use-crm-data";
import {
  Mail, Phone, MessageSquare, Clock, AlertTriangle, CheckCircle2, Send,
  ArrowUpRight, ArrowDownLeft, Search, Calendar, Video, FileText, 
  Timer, Eye, Reply, Sparkles, Shield, Bell, ChevronRight, MoreHorizontal,
  Inbox, AlertCircle, Hourglass, ThumbsUp, XCircle, Zap
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays, differenceInHours, isAfter, subDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  email: { icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", label: "Email" },
  call: { icon: Phone, color: "text-green-400", bg: "bg-green-500/10", label: "Call" },
  meeting: { icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10", label: "Meeting" },
  note: { icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Note" },
  video: { icon: Video, color: "text-pink-400", bg: "bg-pink-500/10", label: "Video" },
  proposal: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Proposal" },
};

const OUTCOME_COLORS: Record<string, string> = {
  positive: "bg-green-500/10 text-green-400 border-green-500/20",
  replied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  interested: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  neutral: "bg-muted text-muted-foreground",
  negative: "bg-red-500/10 text-red-400 border-red-500/20",
  "no-answer": "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

type QueueView = "waiting" | "no-response" | "follow-up" | "sensitive" | "all";

interface CommunicationQueueProps {
  onViewTimeline?: () => void;
}

export const CRMCommunicationQueue: React.FC<CommunicationQueueProps> = ({ onViewTimeline }) => {
  const { data: comms = [] } = useCRMCommunications();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const [activeView, setActiveView] = useState<QueueView>("waiting");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const contactMap = useMemo(() => {
    const m: Record<string, { name: string; avatar: string; health: number }> = {};
    contacts.forEach(c => {
      m[c.id] = {
        name: `${c.first_name} ${c.last_name}`,
        avatar: `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`,
        health: c.health_score ?? 50,
      };
    });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  // Derive queue categories from communications
  const queues = useMemo(() => {
    const now = new Date();

    // Waiting on reply: outbound comms without a subsequent inbound from same contact
    const outboundByContact = new Map<string, typeof comms>();
    comms.forEach(c => {
      if (c.direction === "outbound" && c.contact_id) {
        if (!outboundByContact.has(c.contact_id)) outboundByContact.set(c.contact_id, []);
        outboundByContact.get(c.contact_id)!.push(c);
      }
    });

    const inboundByContact = new Map<string, Date>();
    comms.forEach(c => {
      if (c.direction === "inbound" && c.contact_id) {
        const existing = inboundByContact.get(c.contact_id);
        const d = new Date(c.occurred_at);
        if (!existing || d > existing) inboundByContact.set(c.contact_id, d);
      }
    });

    const waiting = comms.filter(c => {
      if (c.direction !== "outbound" || !c.contact_id) return false;
      if (c.outcome === "replied" || c.outcome === "positive") return false;
      const lastInbound = inboundByContact.get(c.contact_id);
      return !lastInbound || lastInbound < new Date(c.occurred_at);
    });

    // No response: outbound with no reply after 3+ days
    const noResponse = waiting.filter(c => differenceInDays(now, new Date(c.occurred_at)) >= 3);

    // Follow-up due: contacts with next_follow_up_at in past or today
    const followUpContacts = contacts.filter(c => c.next_follow_up_at && !isAfter(new Date(c.next_follow_up_at), now));
    const followUpDue = followUpContacts.map(c => {
      const lastComm = comms.find(cm => cm.contact_id === c.id);
      return {
        id: `followup-${c.id}`,
        contactId: c.id,
        contactName: `${c.first_name} ${c.last_name}`,
        dueDate: c.next_follow_up_at!,
        lastComm,
        overdueDays: differenceInDays(now, new Date(c.next_follow_up_at!)),
      };
    });

    // Sensitive: comms involving contacts with low health or negative outcomes
    const sensitive = comms.filter(c => {
      if (c.outcome === "negative" || c.outcome === "no-answer") return true;
      if (c.contact_id && contactMap[c.contact_id]?.health < 40) return true;
      return false;
    });

    return { waiting, noResponse, followUpDue, sensitive };
  }, [comms, contacts, contactMap]);

  const stats = [
    { key: "waiting" as QueueView, label: "Waiting on Reply", count: queues.waiting.length, icon: Hourglass, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { key: "no-response" as QueueView, label: "No Response", count: queues.noResponse.length, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    { key: "follow-up" as QueueView, label: "Follow-up Due", count: queues.followUpDue.length, icon: Bell, color: "text-orange-400", bg: "bg-orange-500/10" },
    { key: "sensitive" as QueueView, label: "Sensitive", count: queues.sensitive.length, icon: Shield, color: "text-purple-400", bg: "bg-purple-500/10" },
    { key: "all" as QueueView, label: "All Comms", count: comms.length, icon: Inbox, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  const getActiveList = () => {
    switch (activeView) {
      case "waiting": return queues.waiting;
      case "no-response": return queues.noResponse;
      case "sensitive": return queues.sensitive;
      case "all": return comms;
      default: return [];
    }
  };

  const activeList = activeView === "follow-up" ? [] : getActiveList();
  const filteredList = searchQuery.trim()
    ? activeList.filter(c =>
        c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.contact_id && contactMap[c.contact_id]?.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : activeList;

  const selectedComm = comms.find(c => c.id === selectedId);

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary" />
            Communication Queue
          </h2>
          <p className="text-xs text-muted-foreground">Relationship execution support — know what needs attention</p>
        </div>
        <div className="flex items-center gap-2">
          {onViewTimeline && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onViewTimeline}>
              <Clock className="h-3.5 w-3.5" /> View Timeline
            </Button>
          )}
        </div>
      </div>

      {/* Queue stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stats.map(s => (
          <Card
            key={s.key}
            className={`border-border/30 cursor-pointer transition-all hover:border-primary/30 ${activeView === s.key ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : "bg-card/50"}`}
            onClick={() => setActiveView(s.key)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{s.count}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search communications..."
          className="pl-8 h-8 text-xs"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Queue content */}
      <div className="flex gap-4">
        {/* List */}
        <div className="flex-1 space-y-1.5">
          {activeView === "follow-up" ? (
            queues.followUpDue.length === 0 ? (
              <EmptyQueueState label="No follow-ups due" description="All contacts are within their follow-up window" icon={CheckCircle2} />
            ) : (
              queues.followUpDue.map(f => (
                <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                  <Card className="border-border/30 bg-card/50 hover:bg-card/80 transition-all cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{f.contactName}</p>
                            <p className="text-xs text-muted-foreground">
                              Follow-up was due {f.overdueDays > 0 ? `${f.overdueDays} days ago` : "today"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {f.overdueDays > 7 && (
                            <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">Overdue</Badge>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                            <Send className="h-3 w-3" /> Follow Up
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )
          ) : filteredList.length === 0 ? (
            <EmptyQueueState
              label={`No ${stats.find(s => s.key === activeView)?.label.toLowerCase() || "items"}`}
              description="This queue is clear — great relationship hygiene"
              icon={CheckCircle2}
            />
          ) : (
            filteredList.map((cm, i) => {
              const meta = TYPE_META[cm.comm_type] || TYPE_META.note;
              const Icon = meta.icon;
              const contactInfo = cm.contact_id ? contactMap[cm.contact_id] : null;
              const companyName = cm.company_id ? companyMap[cm.company_id] : null;
              const daysSince = differenceInDays(new Date(), new Date(cm.occurred_at));
              const isSelected = selectedId === cm.id;

              return (
                <motion.div
                  key={cm.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                >
                  <Card
                    className={`border-border/30 hover:bg-card/80 transition-all cursor-pointer ${isSelected ? "border-primary/50 bg-primary/5" : "bg-card/50"}`}
                    onClick={() => setSelectedId(cm.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{cm.subject || meta.label}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {daysSince >= 7 && (
                                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">
                                  {daysSince}d ago
                                </Badge>
                              )}
                              {daysSince >= 3 && daysSince < 7 && (
                                <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20">
                                  {daysSince}d ago
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(cm.occurred_at), "MMM d")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] flex items-center gap-0.5 ${cm.direction === "inbound" ? "text-green-400" : "text-blue-400"}`}>
                              {cm.direction === "inbound" ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                              {cm.direction}
                            </span>
                            {contactInfo && (
                              <span className="text-xs text-primary flex items-center gap-1">
                                <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">{contactInfo.avatar}</span>
                                {contactInfo.name}
                              </span>
                            )}
                            {companyName && <span className="text-[10px] text-muted-foreground">{companyName}</span>}
                            {cm.outcome && (
                              <Badge variant="outline" className={`text-[10px] ${OUTCOME_COLORS[cm.outcome] || ""}`}>{cm.outcome}</Badge>
                            )}
                          </div>
                          {cm.content && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cm.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedComm && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "40%" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border/50"
            >
              <div className="pl-4 space-y-4">
                <CommDetailPanel
                  comm={selectedComm}
                  contactMap={contactMap}
                  companyMap={companyMap}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Detail panel for selected communication
const CommDetailPanel: React.FC<{
  comm: any;
  contactMap: Record<string, { name: string; avatar: string; health: number }>;
  companyMap: Record<string, string>;
  onClose: () => void;
}> = ({ comm, contactMap, companyMap, onClose }) => {
  const meta = TYPE_META[comm.comm_type] || TYPE_META.note;
  const Icon = meta.icon;
  const contactInfo = comm.contact_id ? contactMap[comm.contact_id] : null;
  const daysSince = differenceInDays(new Date(), new Date(comm.occurred_at));

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg}`}>
              <Icon className={`h-5 w-5 ${meta.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{comm.subject || meta.label}</CardTitle>
              <p className="text-xs text-muted-foreground">{format(new Date(comm.occurred_at), "PPp")}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>✕</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-muted-foreground">Direction</p>
            <p className="font-medium capitalize text-foreground">{comm.direction}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-muted-foreground">Channel</p>
            <p className="font-medium capitalize text-foreground">{comm.channel || comm.comm_type}</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-muted-foreground">Age</p>
            <p className={`font-medium ${daysSince >= 7 ? "text-red-400" : daysSince >= 3 ? "text-orange-400" : "text-foreground"}`}>
              {daysSince === 0 ? "Today" : `${daysSince} days ago`}
            </p>
          </div>
          {comm.outcome && (
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-muted-foreground">Outcome</p>
              <Badge variant="outline" className={`text-[10px] mt-0.5 ${OUTCOME_COLORS[comm.outcome] || ""}`}>{comm.outcome}</Badge>
            </div>
          )}
        </div>

        {/* Contact */}
        {contactInfo && (
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">Contact</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {contactInfo.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{contactInfo.name}</p>
                <p className={`text-xs ${contactInfo.health >= 70 ? "text-green-400" : contactInfo.health >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                  Health: {contactInfo.health}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {comm.content && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Content</p>
            <div className="rounded-lg bg-muted/20 p-3 text-sm text-foreground whitespace-pre-wrap border border-border/20">
              {comm.content}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Suggested Actions
          </p>
          <div className="space-y-1.5">
            {comm.direction === "outbound" && !comm.outcome?.match(/replied|positive/) && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <Reply className="h-3.5 w-3.5 text-blue-400" /> Draft follow-up
              </Button>
            )}
            {daysSince >= 5 && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
                <Phone className="h-3.5 w-3.5 text-green-400" /> Schedule call
              </Button>
            )}
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs">
              <Calendar className="h-3.5 w-3.5 text-purple-400" /> Set follow-up reminder
            </Button>
            {contactInfo && contactInfo.health < 40 && (
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs border-red-500/20 text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" /> Escalate — at-risk contact
              </Button>
            )}
          </div>
        </div>

        {/* Proof trail indicator */}
        <div className="rounded-lg bg-muted/20 p-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Shield className="h-3 w-3 text-primary/60" />
          Logged {format(new Date(comm.created_at), "PPp")} • {comm.comm_type} record
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyQueueState: React.FC<{ label: string; description: string; icon: React.ElementType }> = ({ label, description, icon: Icon }) => (
  <div className="py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
      <Icon className="h-8 w-8 text-green-400" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">{label}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
  </div>
);

export default CRMCommunicationQueue;
