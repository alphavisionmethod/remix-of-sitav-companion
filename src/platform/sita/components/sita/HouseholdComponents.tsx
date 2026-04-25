import { cn } from "@/lib/utils";
import { LucideIcon, Clock, Users, MapPin, AlertTriangle, CheckCircle, ArrowRight, Calendar, Sparkles, Shield, ChevronRight, Heart } from "lucide-react";
import { ReactNode } from "react";
import { TrustBadge, TrustLevel } from "./TrustBadge";
import { SitaCard, SitaCardTitle } from "./SitaCard";

/* =============== HOUSEHOLD MEMBER AVATAR =============== */
export const MemberAvatar = ({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) => {
  const initial = name[0]?.toUpperCase() || "?";
  const sizes = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <div className={cn("rounded-full bg-primary/8 flex items-center justify-center font-display font-semibold text-primary shrink-0", sizes[size], className)}>
      {initial}
    </div>
  );
};

/* =============== HOUSEHOLD PRIORITY CARD =============== */
export const PriorityCard = ({ title, due, category, who, icon: Icon, urgency = "medium", prepNeeded, linkedTo, onAction, className }: {
  title: string; due: string; category: string; who?: string; icon: LucideIcon; urgency?: "high" | "medium" | "low";
  prepNeeded?: string; linkedTo?: string; onAction?: () => void; className?: string;
}) => (
  <SitaCard lane={urgency === "high" ? "action" : undefined} className={cn("p-4", className)} onClick={onAction}>
    <div className="flex items-start gap-3">
      <div className={cn("rounded-xl p-2 shrink-0", urgency === "high" ? "bg-destructive/8" : "bg-primary/8")}>
        <Icon className={cn("h-4 w-4", urgency === "high" ? "text-destructive" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <span className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">{category}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{due}</span>
          {who && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{who}</span>}
        </div>
        {prepNeeded && <p className="text-[10px] text-primary/70 mt-1">⚡ Prep: {prepNeeded}</p>}
        {linkedTo && <p className="text-[10px] text-muted-foreground/60 mt-0.5">↗ {linkedTo}</p>}
      </div>
      <TrustBadge level={urgency === "high" ? "high-impact" : urgency === "medium" ? "review" : "safe"} label={urgency} size="sm" />
    </div>
  </SitaCard>
);

/* =============== CALENDAR EVENT CARD =============== */
export const CalendarEventCard = ({ title, time, who, location, category, conflict, prep, owner, transportTime, className, onClick }: {
  title: string; time: string; who: string; location?: string; category: string; conflict?: boolean;
  prep?: string[]; owner?: string; transportTime?: string; className?: string; onClick?: () => void;
}) => (
  <SitaCard className={cn("p-4", conflict && "border-destructive/20", className)} onClick={onClick}>
    <div className="flex items-start gap-3">
      <div className={cn("rounded-xl p-2 shrink-0", conflict ? "bg-destructive/8" : "bg-primary/8")}>
        <Calendar className={cn("h-4 w-4", conflict ? "text-destructive" : "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {conflict && <TrustBadge level="high-impact" label="Conflict" size="sm" />}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{who}</span>
          {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>}
          {transportTime && <span>🚗 {transportTime}</span>}
        </div>
        {owner && <p className="text-[10px] text-muted-foreground mt-1">Owner: {owner}</p>}
        {prep && prep.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {prep.map((p, i) => (
              <span key={i} className="rounded-md bg-accent/10 px-1.5 py-px text-[10px] text-accent">⚡ {p}</span>
            ))}
          </div>
        )}
      </div>
      <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground shrink-0">{category}</span>
    </div>
  </SitaCard>
);

/* =============== CONFLICT CARD =============== */
export const ConflictCard = ({ events, resolution, className }: {
  events: { title: string; time: string; who: string }[]; resolution?: string; className?: string;
}) => (
  <SitaCard lane="action" className={cn("p-4", className)}>
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <p className="text-sm font-semibold text-foreground">Schedule Conflict</p>
    </div>
    <div className="space-y-1.5 ml-6">
      {events.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="text-foreground font-medium">{e.title}</span>
          <span className="text-muted-foreground">{e.time}</span>
          <span className="text-muted-foreground">· {e.who}</span>
        </div>
      ))}
    </div>
    {resolution && (
      <div className="mt-3 ml-6 rounded-lg bg-accent/5 border border-accent/10 px-3 py-2">
        <p className="text-xs text-accent flex items-center gap-1"><Sparkles className="h-3 w-3" /> {resolution}</p>
      </div>
    )}
    <div className="mt-3 ml-6 flex gap-2">
      <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Resolve</button>
      <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Dismiss</button>
    </div>
  </SitaCard>
);

/* =============== PREP CARD =============== */
export const PrepCard = ({ title, linkedEvent, items, owner, dueIn, className }: {
  title: string; linkedEvent?: string; items: string[]; owner?: string; dueIn?: string; className?: string;
}) => (
  <SitaCard className={cn("p-4", className)}>
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="h-3.5 w-3.5 text-primary" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {dueIn && <span className="text-[10px] text-muted-foreground ml-auto">{dueIn}</span>}
    </div>
    {linkedEvent && <p className="text-[10px] text-primary/70 mb-2 ml-5.5">↗ {linkedEvent}</p>}
    <div className="space-y-1 ml-5.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 shrink-0" />
          <span className="text-xs text-foreground">{item}</span>
        </div>
      ))}
    </div>
    {owner && <p className="text-[10px] text-muted-foreground mt-2 ml-5.5">Assigned to: {owner}</p>}
  </SitaCard>
);

/* =============== GROCERY CONTINUITY CARD =============== */
export const GroceryContinuityCard = ({ item, lastPurchased, cycle, status, className }: {
  item: string; lastPurchased: string; cycle: string; status: "ok" | "low" | "out"; className?: string;
}) => (
  <div className={cn(
    "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all",
    status === "out" ? "border-destructive/20 bg-destructive/5" : status === "low" ? "border-amber-500/20 bg-amber-500/5" : "border-border bg-card",
    className
  )}>
    <div className={cn(
      "h-2 w-2 rounded-full shrink-0",
      status === "out" ? "bg-destructive" : status === "low" ? "bg-amber-500" : "bg-chart-2"
    )} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{item}</p>
      <p className="text-[10px] text-muted-foreground">Last: {lastPurchased} · Cycle: {cycle}</p>
    </div>
    <span className={cn(
      "rounded-md px-1.5 py-px text-[10px] font-medium capitalize",
      status === "out" ? "bg-destructive/10 text-destructive" : status === "low" ? "bg-amber-500/10 text-amber-600" : "bg-chart-2/10 text-chart-2"
    )}>{status === "ok" ? "stocked" : status}</span>
  </div>
);

/* =============== TRIP CARD =============== */
export const TripCard = ({ destination, dates, travelers, status, budget, spent, tasksComplete, tasksTotal, daysUntil, className, onClick }: {
  destination: string; dates: string; travelers: string; status: string; budget: string; spent: string;
  tasksComplete: number; tasksTotal: number; daysUntil?: number; className?: string; onClick?: () => void;
}) => (
  <SitaCard className={cn("p-5", className)} onClick={onClick}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{destination}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{dates}</span>
          <span>{travelers}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {daysUntil !== undefined && daysUntil > 0 && (
          <span className="text-xs font-medium text-primary">{daysUntil}d away</span>
        )}
        <span className={cn(
          "rounded-md px-2 py-0.5 text-[10px] font-medium capitalize",
          status === "upcoming" ? "bg-chart-2/10 text-chart-2" : status === "planning" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
        )}>{status}</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
        <p className="text-[10px] text-muted-foreground">Budget</p>
        <p className="text-sm font-semibold text-foreground">{budget}</p>
        <p className="text-[10px] text-muted-foreground">{spent} spent</p>
      </div>
      <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
        <p className="text-[10px] text-muted-foreground">Prep</p>
        <p className="text-sm font-semibold text-foreground">{tasksComplete}/{tasksTotal}</p>
        <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasksTotal > 0 ? (tasksComplete / tasksTotal) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
        <p className="text-[10px] text-muted-foreground">Status</p>
        <p className="text-sm font-semibold text-foreground capitalize">{status}</p>
      </div>
    </div>
  </SitaCard>
);

/* =============== APPROVAL CARD =============== */
export const ApprovalCard = ({ title, reason, whoAffected, impact, riskLevel, policyRule, onApprove, onReject, onRevise, className }: {
  title: string; reason: string; whoAffected: string; impact: string; riskLevel: TrustLevel;
  policyRule?: string; onApprove?: () => void; onReject?: () => void; onRevise?: () => void; className?: string;
}) => (
  <SitaCard lane="action" className={cn("p-5", className)}>
    <div className="flex items-center gap-2 mb-3">
      <Shield className="h-4 w-4 text-trust-approval" />
      <p className="text-sm font-semibold text-foreground">Approval Required</p>
      <TrustBadge level={riskLevel} size="sm" />
    </div>
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1">{reason}</p>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div><span className="text-muted-foreground">Affects:</span> <span className="text-foreground">{whoAffected}</span></div>
      <div><span className="text-muted-foreground">Impact:</span> <span className="text-foreground">{impact}</span></div>
      {policyRule && <div className="col-span-2"><span className="text-muted-foreground">Policy:</span> <span className="text-foreground">{policyRule}</span></div>}
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={onApprove} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Approve</button>
      <button onClick={onRevise} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors">Revise</button>
      <button onClick={onReject} className="rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">Reject</button>
    </div>
  </SitaCard>
);

/* =============== BOARDROOM SECTION =============== */
export const BoardroomSection = ({ title, icon: Icon, children, className }: {
  title: string; icon: LucideIcon; children: ReactNode; className?: string;
}) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
    </div>
    {children}
  </div>
);

/* =============== OVERLOAD CARD =============== */
export const OverloadCard = ({ level, message, recommendation, className }: {
  level: "low" | "moderate" | "high" | "critical"; message: string; recommendation: string; className?: string;
}) => {
  const colors = {
    low: "border-chart-2/20 bg-chart-2/5", moderate: "border-amber-500/20 bg-amber-500/5",
    high: "border-destructive/20 bg-destructive/5", critical: "border-destructive/30 bg-destructive/8",
  };
  return (
    <div className={cn("rounded-xl border p-4", colors[level], className)}>
      <div className="flex items-center gap-2 mb-2">
        <Heart className={cn("h-4 w-4", level === "low" ? "text-chart-2" : level === "moderate" ? "text-amber-500" : "text-destructive")} />
        <p className="text-sm font-semibold text-foreground">Household Load: <span className="capitalize">{level}</span></p>
      </div>
      <p className="text-xs text-foreground/80">{message}</p>
      <div className="mt-2 rounded-lg bg-card/60 px-3 py-2">
        <p className="text-xs text-primary flex items-center gap-1"><Sparkles className="h-3 w-3" /> {recommendation}</p>
      </div>
    </div>
  );
};

/* =============== CONNECTOR STATUS =============== */
export const ConnectorStatus = ({ name, type, connected, lastSync, icon: Icon, className }: {
  name: string; type: string; connected: boolean; lastSync?: string; icon: LucideIcon; className?: string;
}) => (
  <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all", className)}>
    <div className={cn("rounded-xl p-2 shrink-0", connected ? "bg-chart-2/10" : "bg-secondary")}>
      <Icon className={cn("h-4 w-4", connected ? "text-chart-2" : "text-muted-foreground")} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{type}</p>
    </div>
    {connected ? (
      <div className="text-right shrink-0">
        <CheckCircle className="h-3.5 w-3.5 text-chart-2 mb-0.5 ml-auto" />
        {lastSync && <span className="text-[10px] text-muted-foreground">{lastSync}</span>}
      </div>
    ) : (
      <button className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors">Connect</button>
    )}
  </div>
);

/* =============== QUICK ACTION BAR =============== */
export const QuickActionBar = ({ actions, className }: {
  actions: { label: string; icon: LucideIcon; onClick?: () => void }[]; className?: string;
}) => (
  <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2", className)}>
    {actions.map((a) => (
      <button key={a.label} onClick={a.onClick} className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-3 py-2.5 text-xs font-medium text-foreground hover:bg-secondary/60 hover:border-primary/15 transition-all">
        <a.icon className="h-3.5 w-3.5 text-primary" />
        {a.label}
      </button>
    ))}
  </div>
);

/* =============== HOUSEHOLD ADVISOR =============== */
export const HouseholdAdvisor = ({ role, icon: Icon, message, confidence, linkedItems, requiresApproval, className }: {
  role: string; icon: LucideIcon; message: string; confidence: "high" | "medium" | "low";
  linkedItems?: string[]; requiresApproval?: boolean; className?: string;
}) => (
  <SitaCard hover={false} className={cn("", className)}>
    <div className="flex items-center gap-3 mb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-sita">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <SitaCardTitle>{role}</SitaCardTitle>
        <div className="flex items-center gap-1 mt-0.5">
          <TrustBadge level={confidence === "high" ? "verified" : confidence === "medium" ? "review" : "low-confidence"} label={`${confidence} confidence`} size="sm" />
        </div>
      </div>
    </div>
    <p className="text-sm text-foreground leading-relaxed">{message}</p>
    {linkedItems && linkedItems.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-1.5">
        {linkedItems.map((item, i) => (
          <span key={i} className="rounded-md bg-secondary px-1.5 py-px text-[10px] text-muted-foreground">↗ {item}</span>
        ))}
      </div>
    )}
    {requiresApproval && (
      <div className="mt-3">
        <TrustBadge level="approval" label="Requires Approval" />
      </div>
    )}
  </SitaCard>
);
