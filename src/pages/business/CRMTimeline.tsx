import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCRMCommunications, useCRMContacts, useCRMCompanies, useCreateCommunication } from "@/hooks/use-crm-data";
import {
  Mail, Phone, MessageSquare, Calendar, Plus, Clock, Video, FileText,
  ChevronDown, ChevronUp, Search, Filter, ArrowUpRight, ArrowDownLeft,
  Sparkles, Send
} from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, startOfDay } from "date-fns";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

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

const CRMTimeline = () => {
  const { data: comms = [] } = useCRMCommunications();
  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const createComm = useCreateCommunication();
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
    const m: Record<string, { name: string; avatar: string }> = {};
    contacts.forEach(c => { m[c.id] = { name: `${c.first_name} ${c.last_name}`, avatar: `${c.first_name[0]}${c.last_name[0]}` }; });
    return m;
  }, [contacts]);

  const companyMap = useMemo(() => {
    const m: Record<string, string> = {};
    companies.forEach(c => { m[c.id] = c.name; });
    return m;
  }, [companies]);

  const filtered = useMemo(() => {
    let result = comms;
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
    const groups: { label: string; entries: typeof filtered }[] = [];
    const byDay = new Map<string, typeof filtered>();

    filtered.forEach(cm => {
      const date = startOfDay(new Date(cm.occurred_at));
      const key = date.toISOString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(cm);
    });

    byDay.forEach((entries, key) => {
      const date = new Date(key);
      let label: string;
      if (isToday(date)) label = "Today";
      else if (isYesterday(date)) label = "Yesterday";
      else if (isThisWeek(date)) label = format(date, "EEEE");
      else label = format(date, "MMM d, yyyy");
      groups.push({ label, entries });
    });

    return groups;
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const thisWeek = comms.filter(c => isThisWeek(new Date(c.occurred_at)));
    return {
      total: comms.length,
      thisWeek: thisWeek.length,
      outbound: comms.filter(c => c.direction === "outbound").length,
      inbound: comms.filter(c => c.direction === "inbound").length,
    };
  }, [comms]);

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
      } as any);
      toast.success("Entry added to timeline");
      setShowAdd(false);
      setForm({ comm_type: "note", subject: "", content: "", direction: "outbound", contact_id: "", outcome: "" });
    } catch { toast.error("Failed to add entry"); }
  };

  return (
    <div className="space-y-4">
      <PageTruthBanner truthState="demo" />

      {/* Header with stats */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Communication Timeline</h2>
          <p className="text-xs text-muted-foreground">The memory stream of every relationship</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-blue-400" /> {stats.outbound} sent</span>
            <span className="flex items-center gap-1"><ArrowDownLeft className="h-3 w-3 text-green-400" /> {stats.inbound} received</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> {stats.thisWeek} this week</span>
          </div>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search timeline..."
            className="pl-8 h-8 text-xs"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <Button variant={!typeFilter ? "secondary" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setTypeFilter(null)}>All</Button>
          {Object.entries(TYPE_META).map(([type, { icon: Icon, label }]) => (
            <Button
              key={type}
              variant={typeFilter === type ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setTypeFilter(type === typeFilter ? null : type)}
            >
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
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/40" />

        {grouped.map(group => (
          <div key={group.label} className="mb-4">
            <div className="relative flex items-center gap-3 mb-2 pl-1">
              <div className="w-9 h-5 rounded-full bg-muted/50 flex items-center justify-center z-10">
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</h3>
              <span className="text-[10px] text-muted-foreground/60">{group.entries.length} entries</span>
            </div>

            <div className="space-y-1">
              {group.entries.map(cm => {
                const meta = TYPE_META[cm.comm_type] || TYPE_META.note;
                const Icon = meta.icon;
                const isExpanded = expandedEntries.has(cm.id);
                const contactInfo = cm.contact_id ? contactMap[cm.contact_id] : null;
                const companyName = cm.company_id ? companyMap[cm.company_id] : null;

                return (
                  <div key={cm.id} className="flex gap-3 relative pl-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${meta.bg} ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Card
                      className="flex-1 border-border/30 bg-card/50 hover:bg-card/80 transition-all cursor-pointer"
                      onClick={() => toggleExpand(cm.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{cm.subject || meta.label}</p>
                              <span className={`text-[10px] flex items-center gap-0.5 ${cm.direction === "inbound" ? "text-green-400" : "text-blue-400"}`}>
                                {cm.direction === "inbound" ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                                {cm.direction}
                              </span>
                            </div>
                            {!isExpanded && cm.content && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cm.content}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {contactInfo && (
                                <span className="text-xs text-primary flex items-center gap-1">
                                  <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">{contactInfo.avatar}</span>
                                  {contactInfo.name}
                                </span>
                              )}
                              {companyName && <span className="text-xs text-muted-foreground">{companyName}</span>}
                              {cm.outcome && (
                                <Badge variant="outline" className={`text-[10px] ${OUTCOME_COLORS[cm.outcome] || ""}`}>{cm.outcome}</Badge>
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

                        {isExpanded && cm.content && (
                          <div className="mt-2 pt-2 border-t border-border/30">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{cm.content}</p>
                            {cm.channel && (
                              <p className="text-[10px] text-muted-foreground/60 mt-2">Channel: {cm.channel}</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Communications</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {comms.length === 0 ? "Start logging your conversations and interactions" : "No entries match your current filters"}
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
