import React, { useState, useMemo } from "react";
import { useBusinessProfile } from "@/modules/business/hooks/useBusinessProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCRMCommunications, useCRMContacts, useCRMCompanies, useCreateCommunication } from "@/modules/business/hooks/use-crm-data";
import {
  Mail, Phone, MessageSquare, Calendar, Plus, Clock, Video, FileText,
  ChevronDown, ChevronUp, Search, ArrowUpRight, ArrowDownLeft,
  Sparkles, Send, Shield, AlertTriangle, CheckCircle2, Brain,
  Receipt, Link2, ThumbsUp, ThumbsDown, Eye, Reply, Zap, Inbox
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, startOfDay, differenceInDays } from "date-fns";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  email: { icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10", label: "Email" },
  call: { icon: Phone, color: "text-green-400", bg: "bg-green-500/10", label: "Call" },
  meeting: { icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10", label: "Meeting" },
  note: { icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Note" },
  video: { icon: Video, color: "text-pink-400", bg: "bg-pink-500/10", label: "Video" },
  proposal: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Proposal" },
};

const OUTCOME_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  positive: { bg: "bg-green-500/10", text: "text-green-400", icon: ThumbsUp },
  replied: { bg: "bg-blue-500/10", text: "text-blue-400", icon: Reply },
  interested: { bg: "bg-purple-500/10", text: "text-purple-400", icon: Eye },
  neutral: { bg: "bg-muted", text: "text-muted-foreground", icon: MessageSquare },
  negative: { bg: "bg-red-500/10", text: "text-red-400", icon: ThumbsDown },
  "no-answer": { bg: "bg-orange-500/10", text: "text-orange-400", icon: AlertTriangle },
};

const CRMTimeline = () => {
  const { primaryMode } = useBusinessProfile();
  const { data: comms = [] } = useCRMCommunications();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const createComm = useCreateCommunication();
  const { navigateTo } = useBusinessNavigation();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    comm_type: "note", subject: "", content: "", direction: "outbound",
    contact_id: "", outcome: ""
  });

  const contactMap = useMemo(() => {
    const m: Record<string, { name: string; avatar: string; health: number; stage: string }> = {};
    contacts.forEach(c => {
      m[c.id] = {
        name: `${c.first_name} ${c.last_name}`,
        avatar: `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`,
        health: c.health_score ?? 50,
        stage: c.lifecycle_stage,
      };
    });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  const filtered = useMemo(() => {
    let result = [...comms].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    if (typeFilter) result = result.filter(c => c.comm_type === typeFilter);
    if (directionFilter) result = result.filter(c => c.direction === directionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.subject?.toLowerCase().includes(q)) ||
        (c.content?.toLowerCase().includes(q)) ||
        (c.contact_id && contactMap[c.contact_id]?.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [comms, typeFilter, directionFilter, searchQuery, contactMap]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { label: string; date: Date; entries: typeof filtered }[] = [];
    const byDay = new Map<string, typeof filtered>();

    filtered.forEach(cm => {
      const date = startOfDay(new Date(cm.occurred_at));
      const key = date.toISOString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(cm);
    });

    const sortedKeys = Array.from(byDay.keys()).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    sortedKeys.forEach(key => {
      const entries = byDay.get(key)!;
      const date = new Date(key);
      let label: string;
      if (isToday(date)) label = "Today";
      else if (isYesterday(date)) label = "Yesterday";
      else if (isThisWeek(date)) label = format(date, "EEEE");
      else label = format(date, "MMM d, yyyy");
      groups.push({ label, date, entries });
    });

    return groups;
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const thisWeek = comms.filter(c => isThisWeek(new Date(c.occurred_at)));
    const withOutcome = comms.filter(c => c.outcome);
    const positive = comms.filter(c => c.outcome === "positive" || c.outcome === "replied" || c.outcome === "interested");
    return {
      total: comms.length,
      thisWeek: thisWeek.length,
      outbound: comms.filter(c => c.direction === "outbound").length,
      inbound: comms.filter(c => c.direction === "inbound").length,
      positiveRate: withOutcome.length > 0 ? Math.round((positive.length / withOutcome.length) * 100) : 0,
      types: Object.entries(TYPE_META).map(([type, meta]) => ({
        type, ...meta, count: comms.filter(c => c.comm_type === type).length,
      })).filter(t => t.count > 0),
    };
  }, [comms]);

  // Derive follow-up state for a communication
  const getFollowUpState = (cm: any) => {
    if (cm.direction !== "outbound" || !cm.contact_id) return null;
    if (cm.outcome === "replied" || cm.outcome === "positive") return "resolved";
    const daysSince = differenceInDays(new Date(), new Date(cm.occurred_at));
    if (daysSince >= 7) return "critical";
    if (daysSince >= 3) return "overdue";
    if (daysSince >= 1) return "pending";
    return null;
  };

  // Generate advisor annotation for a communication
  const getAdvisorAnnotation = (cm: any) => {
    const contact = cm.contact_id ? contactMap[cm.contact_id] : null;
    if (!contact) return null;
    if (contact.health < 30 && cm.outcome === "no-answer") {
      return { text: "At-risk contact with no response — consider escalation", severity: "critical" as const };
    }
    if (contact.health < 50 && cm.direction === "outbound") {
      return { text: "Low-health contact — tread carefully with outreach cadence", severity: "warning" as const };
    }
    if (cm.outcome === "interested" && cm.comm_type === "proposal") {
      return { text: "High-interest signal on proposal — prioritize follow-through", severity: "positive" as const };
    }
    return null;
  };

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!form.subject.trim() && !form.content.trim()) { toast.error("Subject or content required"); return; }
    try {
      await createComm.mutateAsync({
        comm_type: form.comm_type,
        subject: form.subject || null,
        content: form.content || null,
        direction: form.direction,
        contact_id: form.contact_id || null,
        outcome: form.outcome || null,
      });
      toast.success("Entry added to timeline");
      setShowAdd(false);
      setForm({ comm_type: "note", subject: "", content: "", direction: "outbound", contact_id: "", outcome: "" });
    } catch { toast.error("Failed to add entry"); }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Premium Header */}
      <div className="rounded-xl border border-border/30 bg-gradient-to-r from-card/80 to-card/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Communication Timeline
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">The memory stream of every relationship — with proof, context, and intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigateTo("crm-communications")}>
              <Inbox className="h-3.5 w-3.5" /> Queue
            </Button>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Log Activity</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Log Communication</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.comm_type} onChange={e => setForm(p => ({ ...p, comm_type: e.target.value }))}>
                      {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value }))}>
                      <option value="outbound">Outbound</option>
                      <option value="inbound">Inbound</option>
                    </select>
                  </div>
                  {contacts.length > 0 && (
                    <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.contact_id} onChange={e => setForm(p => ({ ...p, contact_id: e.target.value }))}>
                      <option value="">No linked contact</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                    </select>
                  )}
                  <Input placeholder="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                  <textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Details / notes..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
                  <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))}>
                    <option value="">No outcome</option>
                    <option value="positive">Positive</option>
                    <option value="replied">Replied</option>
                    <option value="interested">Interested</option>
                    <option value="neutral">Neutral</option>
                    <option value="no-answer">No Answer</option>
                    <option value="negative">Negative</option>
                  </select>
                  <Button className="w-full gap-1.5" onClick={handleAdd} disabled={createComm.isPending}>
                    <Send className="h-3.5 w-3.5" />
                    {createComm.isPending ? "Saving..." : "Log Activity"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stat strip */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpRight className="h-3 w-3 text-blue-400" />
            <span className="text-muted-foreground">{stats.outbound} sent</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowDownLeft className="h-3 w-3 text-green-400" />
            <span className="text-muted-foreground">{stats.inbound} received</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">{stats.thisWeek} this week</span>
          </div>
          {stats.positiveRate > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <ThumbsUp className="h-3 w-3 text-green-400" />
              <span className="text-muted-foreground">{stats.positiveRate}% positive</span>
            </div>
          )}
          {/* Type breakdown chips */}
          <div className="flex items-center gap-1 ml-auto">
            {stats.types.slice(0, 4).map(t => {
              const TIcon = t.icon;
              return (
                <span key={t.type} className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${t.bg} ${t.color}`}>
                  <TIcon className="h-2.5 w-2.5" /> {t.count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search timeline..." className="pl-8 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-1">
          <Button variant={!typeFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setTypeFilter(null)}>All</Button>
          {Object.entries(TYPE_META).map(([type, { icon: Icon, label }]) => (
            <Button key={type} variant={typeFilter === type ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" onClick={() => setTypeFilter(type === typeFilter ? null : type)}>
              <Icon className="h-3 w-3" /> {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 border-l border-border/50 pl-2 ml-1">
          <Button variant={directionFilter === "outbound" ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" onClick={() => setDirectionFilter(directionFilter === "outbound" ? null : "outbound")}>
            <ArrowUpRight className="h-3 w-3" /> Out
          </Button>
          <Button variant={directionFilter === "inbound" ? "secondary" : "ghost"} size="sm" className="h-7 text-xs gap-1" onClick={() => setDirectionFilter(directionFilter === "inbound" ? null : "inbound")}>
            <ArrowDownLeft className="h-3 w-3" /> In
          </Button>
        </div>
      </div>

      {/* Grouped Timeline */}
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border/40 to-transparent" />

        <AnimatePresence>
          {grouped.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: gi * 0.05 }}
              className="mb-5"
            >
              {/* Day header */}
              <div className="relative flex items-center gap-3 mb-2.5 pl-1">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center z-10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {group.entries.length} entr{group.entries.length !== 1 ? "ies" : "y"} •{" "}
                    {group.entries.filter(e => e.direction === "outbound").length} out, {group.entries.filter(e => e.direction === "inbound").length} in
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {group.entries.map((cm, ci) => {
                  const meta = TYPE_META[cm.comm_type] || TYPE_META.note;
                  const Icon = meta.icon;
                  const isExpanded = expandedEntries.has(cm.id);
                  const contactInfo = cm.contact_id ? contactMap[cm.contact_id] : null;
                  const companyName = cm.company_id ? companyMap[cm.company_id] : null;
                  const followUp = getFollowUpState(cm);
                  const advisor = getAdvisorAnnotation(cm);
                  const outcomeInfo = cm.outcome ? OUTCOME_COLORS[cm.outcome] : null;

                  return (
                    <motion.div
                      key={cm.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: ci * 0.02 }}
                      className="flex gap-3 relative pl-1"
                    >
                      {/* Icon node */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border ${meta.bg} ${meta.color} border-border/20`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Card */}
                      <Card
                        className={`flex-1 border-border/30 hover:bg-card/80 transition-all cursor-pointer group ${
                          followUp === "critical" ? "border-l-2 border-l-red-500/50" :
                          followUp === "overdue" ? "border-l-2 border-l-orange-500/50" :
                          "bg-card/50"
                        }`}
                        onClick={() => toggleExpand(cm.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-foreground truncate">{cm.subject || meta.label}</p>
                                <span className={`text-[10px] flex items-center gap-0.5 ${cm.direction === "inbound" ? "text-green-400" : "text-blue-400"}`}>
                                  {cm.direction === "inbound" ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                                  {cm.direction}
                                </span>
                                {/* Follow-up state badge */}
                                {followUp === "critical" && (
                                  <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20 gap-0.5">
                                    <AlertTriangle className="h-2.5 w-2.5" /> No reply 7d+
                                  </Badge>
                                )}
                                {followUp === "overdue" && (
                                  <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20 gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> Awaiting 3d+
                                  </Badge>
                                )}
                                {followUp === "resolved" && (
                                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20 gap-0.5">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Resolved
                                  </Badge>
                                )}
                              </div>

                              {!isExpanded && cm.content && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cm.content}</p>
                              )}

                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {contactInfo && (
                                  <span className="text-xs text-primary flex items-center gap-1">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                      contactInfo.health >= 70 ? "bg-green-500/20 text-green-400" :
                                      contactInfo.health >= 40 ? "bg-primary/20 text-primary" :
                                      "bg-red-500/20 text-red-400"
                                    }`}>{contactInfo.avatar}</span>
                                    {contactInfo.name}
                                  </span>
                                )}
                                {companyName && <span className="text-[10px] text-muted-foreground">@ {companyName}</span>}
                                {outcomeInfo && (
                                  <Badge variant="outline" className={`text-[10px] gap-0.5 ${outcomeInfo.bg} ${outcomeInfo.text}`}>
                                    <outcomeInfo.icon className="h-2.5 w-2.5" /> {cm.outcome}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(cm.occurred_at), "h:mm a")}
                              </span>
                              {cm.content && (
                                isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
                                  {/* Content block */}
                                  {cm.content && (
                                    <div className="rounded-lg bg-muted/20 p-3 text-sm text-muted-foreground whitespace-pre-wrap border border-border/10">
                                      {cm.content}
                                    </div>
                                  )}

                                  {/* Advisor annotation */}
                                  {advisor && (
                                    <div className={`rounded-lg p-2.5 flex items-start gap-2 text-xs border ${
                                      advisor.severity === "critical" ? "bg-red-500/5 border-red-500/20 text-red-400" :
                                      advisor.severity === "warning" ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-400" :
                                      "bg-green-500/5 border-green-500/20 text-green-400"
                                    }`}>
                                      <Brain className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Advisor Insight</p>
                                        <p className="opacity-80 mt-0.5">{advisor.text}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Metadata row */}
                                  <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                                    {cm.channel && (
                                      <span className="flex items-center gap-1">
                                        <Link2 className="h-2.5 w-2.5" /> {cm.channel}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Shield className="h-2.5 w-2.5 text-primary/50" />
                                      Proof: {format(new Date(cm.created_at), "PP")}
                                    </span>
                                    {contactInfo && (
                                      <span className="flex items-center gap-1">
                                        Health: <span className={contactInfo.health >= 70 ? "text-green-400" : contactInfo.health >= 40 ? "text-yellow-400" : "text-red-400"}>{contactInfo.health}</span>
                                      </span>
                                    )}
                                    {cm.comm_type === "proposal" && (
                                      <span className="flex items-center gap-1 text-indigo-400">
                                        <Receipt className="h-2.5 w-2.5" /> Linked to proposal
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No Communications</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {comms.length === 0 ? "Start logging your conversations and interactions to build relationship memory" : "No entries match your current filters"}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus className="h-3.5 w-3.5" /> Log First Activity
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMTimeline;
