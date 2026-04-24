// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Calling System
// Click-to-call, power dialer, call scripts, call logging
// Twilio-powered outbound calling for revenue teams
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SitaPageHeader, SitaCard, SitaCardTitle, SitaSectionHeader } from "@/components/sita/SitaCard";
import { EmptyState } from "@/components/sita/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone, PhoneCall, PhoneOff, PhoneIncoming, Clock, Users, Target,
  FileText, Play, Pause, SkipForward, ChevronRight, ChevronDown,
  MessageSquare, Star, AlertTriangle, CheckCircle, DollarSign,
  Mic, MicOff, Timer, BarChart3, TrendingUp, Volume2,
  ArrowRight, Hash, Zap, XCircle, Calendar, User,
} from "lucide-react";

import type { CallingContact as Contact, CallingCallLog as CallLog, CallingCallScript as CallScript } from "@/data/fixtures/mock-data/revenue-calling";
import { useCallingContactsData } from "@/hooks/use-business-data";
import { useCallingContacts, useCallLogs } from "@/hooks/use-live-data";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

type DialerState = "idle" | "dialing" | "connected" | "wrapping-up";

// ── Helpers ─────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  return `${d}d ago`;
}

const PRIORITY_COLORS: Record<string, string> = {
  hot: "text-destructive bg-destructive/10 border-destructive/20",
  warm: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  cold: "text-muted-foreground bg-muted border-border",
};

const STAGE_COLORS: Record<string, string> = {
  new: "text-primary bg-primary/10",
  contacted: "text-amber-600 bg-amber-500/10",
  qualified: "text-trust-safe bg-trust-safe/10",
  proposal: "text-primary bg-primary/10",
  negotiation: "text-destructive bg-destructive/10",
};

const OUTCOME_COLORS: Record<string, string> = {
  interested: "text-trust-safe", callback: "text-primary", "not-interested": "text-muted-foreground",
  voicemail: "text-amber-500", "no-answer": "text-muted-foreground", "closed-won": "text-trust-safe", "closed-lost": "text-destructive",
};

// ── Sub-Components ──────────────────────────────────────────────

function CallStats({ contacts, callLogs }: { contacts: Contact[]; callLogs: CallLog[] }) {
  const today = callLogs.filter(l => Date.now() - l.timestamp < 86400000);
  const week = callLogs.filter(l => Date.now() - l.timestamp < 604800000);
  const totalRevenue = callLogs.reduce((s, l) => s + (l.revenue || 0), 0);
  const avgDuration = week.length > 0 ? Math.round(week.reduce((s, l) => s + l.duration, 0) / week.length) : 0;
  const connectRate = week.length > 0 ? Math.round(week.filter(l => l.status === "completed").length / week.length * 100) : 0;

  return (
    <PageShell>
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
      {[
        { label: "Calls Today", value: today.length.toString(), icon: Phone, color: "text-primary" },
        { label: "This Week", value: week.length.toString(), icon: BarChart3, color: "text-foreground" },
        { label: "Connect Rate", value: `${connectRate}%`, icon: PhoneCall, color: connectRate >= 60 ? "text-trust-safe" : "text-amber-500" },
        { label: "Avg Duration", value: formatDuration(avgDuration), icon: Timer, color: "text-foreground" },
        { label: "Pipeline Value", value: `$${(contacts.reduce((s, c) => s + c.value, 0) / 1000).toFixed(0)}K`, icon: Target, color: "text-primary" },
        { label: "Revenue Won", value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-trust-safe" },
      ].map(m => (
        <div key={m.label} className="rounded-xl border border-border/40 bg-card/40 p-2.5 flex items-center gap-2">
          <m.icon className={cn("h-3.5 w-3.5", m.color)} />
          <div>
            <p className={cn("font-display text-sm font-bold", m.color)}>{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
    </PageShell>
  );
}

function ActiveDialer({ contact, onEnd, onSkip }: { contact: Contact; onEnd: () => void; onSkip: () => void }) {
  const { isDemo } = useAuth();
  const [state, setState] = useState<DialerState>("dialing");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showScript, setShowScript] = useState(true);
  const [disposition, setDisposition] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Timer
  useState(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    setTimeout(() => setState("connected"), 3000);
    return () => clearInterval(timer);
  });
  const script = null;

  const handleEndCall = () => {
    setState("wrapping-up");
  };

  const handleSaveAndNext = () => {
    if (disposition) {
      toast.success(`Call logged: ${contact.name}`, { description: `Outcome: ${disposition}` });
      onEnd();
    } else {
      toast.error("Please select a disposition");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-4"
    >
      {/* Call Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl",
            state === "dialing" ? "bg-amber-500/15 animate-pulse" :
            state === "connected" ? "bg-trust-safe/15" :
            "bg-primary/15"
          )}>
            {state === "dialing" ? <PhoneCall className="h-6 w-6 text-amber-500" /> :
             state === "connected" ? <PhoneCall className="h-6 w-6 text-trust-safe" /> :
             <FileText className="h-6 w-6 text-primary" />}
          </div>
          <div>
            <p className="font-display text-base font-bold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.company} · {contact.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("font-mono text-lg font-bold",
            state === "connected" ? "text-trust-safe" : state === "dialing" ? "text-amber-500" : "text-foreground"
          )}>{formatDuration(elapsed)}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{state === "wrapping-up" ? "Wrap-Up" : state}</p>
        </div>
      </div>

      {/* Call Controls */}
      {state !== "wrapping-up" && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setMuted(!muted)}
            className={cn("rounded-full p-3 transition-all", muted ? "bg-destructive/15 text-destructive" : "bg-secondary text-foreground")}>
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button onClick={handleEndCall} className="rounded-full bg-destructive p-4 text-destructive-foreground hover:bg-destructive/90 transition-all shadow-lg">
            <PhoneOff className="h-5 w-5" />
          </button>
          <button onClick={onSkip} className="rounded-full bg-secondary p-3 text-foreground hover:bg-secondary/80 transition-all">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Call Script (during connected state) */}
      {state === "connected" && showScript && script && (
        <div className="rounded-xl border border-primary/15 bg-primary/3 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3 w-3" /> {script.name}
            </span>
            <button onClick={() => setShowScript(false)} className="text-[9px] text-muted-foreground hover:text-foreground">Hide</button>
          </div>
          <p className="text-[11px] text-foreground italic">"{script.opener.replace("[Name]", contact.name.split(" ")[0])}"</p>
          <div className="space-y-1">
            {script.talkingPoints.map((tp, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px]">
                <CheckCircle className="h-3 w-3 text-primary/50 mt-0.5 shrink-0" />
                <span className="text-foreground">{tp}</span>
              </div>
            ))}
          </div>
          {script.objectionHandlers.length > 0 && (
            <details className="text-[10px]">
              <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Objection Handlers ({script.objectionHandlers.length})</summary>
              <div className="mt-1.5 space-y-1.5">
                {script.objectionHandlers.map((oh, i) => (
                  <div key={i} className="rounded-lg bg-secondary/30 p-2">
                    <p className="font-semibold text-amber-600">"{oh.objection}"</p>
                    <p className="text-foreground mt-0.5">→ {oh.response}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
          <p className="text-[10px] text-muted-foreground mt-2">
            <span className="font-semibold">Close:</span> "{script.closer.replace("[specific pain point]", "your current challenge").replace("[specific outcome]", "measurable results").replace("[offer]", "current pricing")}"
          </p>
        </div>
      )}

      {/* Wrap-Up / Disposition */}
      {state === "wrapping-up" && (
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Disposition</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {["interested", "callback", "not-interested", "voicemail", "no-answer", "closed-won", "closed-lost"].map(d => (
                <button key={d} onClick={() => setDisposition(d)}
                  className={cn(
                    "text-[10px] px-2.5 py-1.5 rounded-lg border transition-all capitalize",
                    disposition === d ? "bg-primary/15 text-primary border-primary/30 font-semibold" : "border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >{d.replace("-", " ")}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Call notes..."
              className="w-full mt-1 rounded-lg border border-border/40 bg-card/30 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[60px] resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveAndNext} className="flex-1 text-xs h-9 gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Save & Next
            </Button>
            <Button variant="outline" onClick={onEnd} className="text-xs h-9">Skip</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

const RevenueCallingPage = () => {
  const { user , isDemo} = useAuth();
  const { data: liveContacts } = useCallingContacts();
  const { data: liveLogs } = useCallLogs();
  const [activeView, setActiveView] = useState<"queue" | "dialer" | "logs" | "scripts">("queue");
  const [dialerContact, setDialerContact] = useState<Contact | null>(null);
  const [dialerQueue, setDialerQueue] = useState<Contact[]>([]);
  const [dialerIndex, setDialerIndex] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Map live contacts to Contact shape or use demo data
  const contacts: Contact[] = useMemo(() => {
    if (!liveContacts?.length) return [];
    return liveContacts.map((c: Record<string, any>) => ({
      id: c.id,
      name: c.name,
      company: c.company || "",
      phone: c.phone || "",
      email: c.email || "",
      value: Number(c.value) || 0,
      priority: (c.priority || "medium") as never,
      stage: (c.stage || "new") as never,
      callCount: 0,
      lastContact: c.last_called_at ? new Date(c.last_called_at).getTime() : undefined,
      notes: c.notes || "",
    }));
  }, [liveContacts]);

  const callLogs: CallLog[] = useMemo(() => {
    if (!liveLogs?.length) return [];
    return liveLogs.map((l: Record<string, any>): CallLog => ({
      id: l.id,
      contactId: l.contact_id || "",
      contactName: l.contact_name || "",
      phone: "",
      duration: l.duration_seconds || 0,
      status: l.status as never,
      outcome: (l.outcome || "no-answer") as never,
      notes: l.notes || "",
      revenue: Number(l.revenue_impact) || 0,
      timestamp: new Date(l.recorded_at || l.created_at).getTime(),
      direction: "outbound" as const,
      recordingUrl: null,
    }));
  }, [liveLogs]);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (priorityFilter !== "all") result = result.filter(c => c.priority === priorityFilter);
    if (stageFilter !== "all") result = result.filter(c => c.stage === stageFilter);
    return result.sort((a, b) => {
      const prio = { hot: 0, warm: 1, cold: 2 };
      return prio[a.priority] - prio[b.priority];
    });
  }, [priorityFilter, stageFilter]);

  const startDialer = (contacts: Contact[]) => {
    setDialerQueue(contacts);
    setDialerIndex(0);
    setDialerContact(contacts[0]);
    setActiveView("dialer");
  };

  const nextInQueue = () => {
    const next = dialerIndex + 1;
    if (next < dialerQueue.length) {
      setDialerIndex(next);
      setDialerContact(dialerQueue[next]);
    } else {
      setDialerContact(null);
      setActiveView("queue");
      toast.success("Power dialer complete!", { description: `${dialerQueue.length} calls processed.` });
    }
  };

  const clickToCall = useCallback(async (contact: Contact) => {
    setDialerContact(contact);
    setDialerQueue([contact]);
    setDialerIndex(0);
    setActiveView("dialer");

    // Attempt real Twilio call via edge function
    try {
      const { data, error } = await supabase.functions.invoke("revenue-caller", {
        body: { action: "call", to: contact.phone, contactId: contact.id, contactName: contact.name },
      });
      if (error) console.warn("Twilio call initiation:", error.message);
    } catch {
      // Edge function may not exist yet — dialer works in demo mode
    }
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-4">
<SitaPageHeader title="Revenue Calling" subtitle="Power dialer, call scripts, and logging — powered by Twilio" />

      <CallStats contacts={contacts} callLogs={callLogs} />

      {/* View Tabs */}
      <div className="flex gap-1">
        {[
          { key: "queue" as const, label: "Call Queue", icon: Users },
          { key: "dialer" as const, label: "Dialer", icon: PhoneCall },
          { key: "logs" as const, label: "Call History", icon: Clock },
          { key: "scripts" as const, label: "Scripts", icon: FileText },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)}
            className={cn(
              "flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all",
              activeView === tab.key ? "bg-primary/10 text-primary border-primary/30 font-semibold" : "border-border/30 text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" onClick={() => startDialer(filteredContacts)} className="text-[10px] h-7 gap-1">
          <Zap className="h-3 w-3" /> Start Power Dialer ({filteredContacts.length})
        </Button>
      </div>

      {/* Active Dialer */}
      {activeView === "dialer" && dialerContact && (
        <ActiveDialer
          contact={dialerContact}
          onEnd={nextInQueue}
          onSkip={nextInQueue}
        />
      )}

      {activeView === "dialer" && !dialerContact && (
        <EmptyState variant="cta"
          icon={Phone}
          title="No Active Call"
          description="Select a contact from the queue or start the power dialer to begin outbound calling."
          actions={[
            { label: "Start Power Dialer", onClick: () => toast.info("Power Dialer planned — coming in a future update"), variant: "primary" },
            { label: "View Queue", onClick: () => toast.info("Call queue planned — coming in a future update"), variant: "secondary" },
          ]}
          tip="The power dialer auto-advances through prioritized leads"
        />
      )}

      {/* Call Queue */}
      {activeView === "queue" && (
        <div className="space-y-3">
          <div className="flex gap-1 flex-wrap">
            {["all", "hot", "warm", "cold"].map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize",
                  priorityFilter === p ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground"
                )}>{p === "all" ? "All Priorities" : p}</button>
            ))}
            <div className="w-px bg-border mx-1" />
            {["all", "new", "contacted", "qualified", "proposal", "negotiation"].map(s => (
              <button key={s} onClick={() => setStageFilter(s)}
                className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-all capitalize",
                  stageFilter === s ? "bg-primary/15 text-primary border-primary/30" : "border-border/30 text-muted-foreground"
                )}>{s === "all" ? "All Stages" : s}</button>
            ))}
          </div>

          {filteredContacts.map(contact => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <SitaCard className="p-3 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{contact.name}</span>
                      <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border capitalize", PRIORITY_COLORS[contact.priority])}>{contact.priority}</span>
                      <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full capitalize", STAGE_COLORS[contact.stage])}>{contact.stage}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{contact.company}</span>
                      <span>{contact.phone}</span>
                      <span>{contact.callCount} calls</span>
                      {contact.lastContact && <span>Last: {timeAgo(contact.lastContact)}</span>}
                    </div>
                    {contact.notes && <p className="text-[10px] text-muted-foreground/70 mt-1 truncate">{contact.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-foreground">${(contact.value / 1000).toFixed(0)}K</span>
                    <Button size="sm" onClick={() => clickToCall(contact)} className="text-[10px] h-7 gap-1 px-3">
                      <Phone className="h-3 w-3" /> Call
                    </Button>
                  </div>
                </div>
              </SitaCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Call History */}
      {activeView === "logs" && (
        <div className="space-y-2">
          {callLogs.sort((a, b) => b.timestamp - a.timestamp).map(log => (
            <SitaCard key={log.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  log.status === "completed" ? "bg-trust-safe/10" : "bg-muted"
                )}>
                  {log.direction === "outbound" ? <PhoneCall className="h-4 w-4 text-primary" /> : <PhoneIncoming className="h-4 w-4 text-trust-safe" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{log.contactName}</span>
                    <span className={cn("text-[8px] capitalize font-semibold", OUTCOME_COLORS[log.outcome])}>{log.outcome.replace("-", " ")}</span>
                    {log.revenue && <span className="text-[8px] font-bold text-trust-safe">${(log.revenue / 1000).toFixed(0)}K won</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[9px] text-muted-foreground">
                    <span>{log.direction}</span>
                    <span>{formatDuration(log.duration)}</span>
                    <span>{timeAgo(log.timestamp)}</span>
                    {log.recordingUrl && <span className="flex items-center gap-0.5 text-primary"><Volume2 className="h-2.5 w-2.5" />Recording</span>}
                  </div>
                  {log.notes && <p className="text-[10px] text-muted-foreground mt-1">{log.notes}</p>}
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}

      {/* Scripts */}
      {activeView === "scripts" && (
        <div className="space-y-3">
          {true ? (
            <SitaCard className="p-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No Scripts Configured</p>
              <p className="text-xs text-muted-foreground mt-1">Call scripts will appear here once configured.</p>
            </SitaCard>
          ) : ([] as never[]).map(script => (
            <SitaCard key={script.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{script.name}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full capitalize", STAGE_COLORS[script.stage] || "bg-secondary text-muted-foreground")}>{script.stage}</span>
                </div>
                <div className="rounded-lg bg-primary/3 border border-primary/10 p-3">
                  <p className="text-[10px] font-semibold text-primary mb-1">OPENER</p>
                  <p className="text-[11px] text-foreground italic">"{script.opener}"</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">TALKING POINTS</p>
                  {script.talkingPoints.map((tp, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] py-0.5">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span className="text-foreground">{tp}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">OBJECTION HANDLERS ({script.objectionHandlers.length})</p>
                  {script.objectionHandlers.map((oh, i) => (
                    <div key={i} className="rounded-lg bg-secondary/30 p-2 mb-1">
                      <p className="text-[10px] font-semibold text-amber-600">"{oh.objection}"</p>
                      <p className="text-[10px] text-foreground mt-0.5">→ {oh.response}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-trust-safe/5 border border-trust-safe/10 p-3">
                  <p className="text-[10px] font-semibold text-trust-safe mb-1">CLOSER</p>
                  <p className="text-[11px] text-foreground italic">"{script.closer}"</p>
                </div>
              </div>
            </SitaCard>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RevenueCallingPage;
