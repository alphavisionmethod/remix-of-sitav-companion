import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import {
  Home, Briefcase, DollarSign, Headphones, Workflow, Receipt, BarChart3, FolderOpen, Settings, Shield, Search,
  Plus, Phone, FileUp, FileText, UserPlus, CalendarPlus, Eye, Users, Brain, Sparkles, Activity,
  Target, CheckCircle, Package, Heart, Server, Inbox, Zap, GitBranch, Scale, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Searchable Entity Index ─────────────────────────────────

interface SearchableItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  path: string;
  category: "navigate" | "advisor" | "entity" | "proof" | "action" | "system";
  domain?: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchableItem[] = [
  // ── Navigation ──
  { id: "nav-pulse", label: "Daily Pulse", sublabel: "Home overview", icon: Home, path: "/", category: "navigate", keywords: ["home", "dashboard", "overview", "pulse"] },
  { id: "nav-life", label: "Life Dashboard", sublabel: "Personal overview", icon: Heart, path: "/life", category: "navigate", keywords: ["life", "personal", "wellness"] },
  { id: "nav-business", label: "Business Center", sublabel: "Leads, customers, revenue", icon: Briefcase, path: "/business", category: "navigate", domain: "business", keywords: ["business", "crm", "leads", "customers", "sales", "revenue"] },
  { id: "nav-money", label: "Money Center", sublabel: "Accounts, bills, investments", icon: DollarSign, path: "/money", category: "navigate", domain: "finance", keywords: ["money", "finance", "bills", "accounts", "budget", "investment"] },
  { id: "nav-concierge", label: "Concierge", sublabel: "Household, calendar, tasks", icon: Headphones, path: "/concierge", category: "navigate", domain: "concierge", keywords: ["concierge", "household", "calendar", "tasks", "family"] },
  { id: "nav-files", label: "Files & Knowledge", sublabel: "Documents & media", icon: FolderOpen, path: "/files", category: "navigate", keywords: ["files", "documents", "knowledge", "upload"] },
  { id: "nav-workflows", label: "Workflows", sublabel: "Actions & automations", icon: Workflow, path: "/workflows", category: "navigate", keywords: ["workflows", "automation", "actions"] },
  { id: "nav-proof", label: "Proof Center", sublabel: "Receipts & audit trail", icon: Receipt, path: "/proof", category: "navigate", keywords: ["proof", "receipts", "audit", "chain", "verification"] },
  { id: "nav-boardroom", label: "Boardroom", sublabel: "Reviews & planning", icon: BarChart3, path: "/boardroom", category: "navigate", keywords: ["boardroom", "review", "planning", "briefing"] },
  { id: "nav-advisors", label: "Advisory Council", sublabel: "AI advisors & reasoning", icon: Users, path: "/advisors", category: "navigate", keywords: ["advisors", "council", "intelligence", "ai"] },
  { id: "nav-council-dashboard", label: "Council Dashboard", sublabel: "Performance, escalations, budget", icon: Scale, path: "/advisors/council-dashboard", category: "navigate", keywords: ["dashboard", "performance", "escalation", "budget", "scorecard"] },
  { id: "nav-approvals", label: "Approvals", sublabel: "Pending decisions", icon: CheckCircle, path: "/approvals", category: "navigate", keywords: ["approvals", "pending", "decisions"] },
  { id: "nav-opportunities", label: "Opportunities", sublabel: "AI-detected opportunities", icon: Sparkles, path: "/opportunities", category: "navigate", keywords: ["opportunities", "insights"] },
  { id: "nav-inbox", label: "Inbox Capture", sublabel: "Incoming items", icon: Inbox, path: "/inbox", category: "navigate", keywords: ["inbox", "capture", "incoming"] },
  { id: "nav-search", label: "Search Fabric", sublabel: "Cross-domain search", icon: Search, path: "/search", category: "navigate", keywords: ["search", "find", "cross-domain"] },
  { id: "nav-settings", label: "Settings", sublabel: "Trust & preferences", icon: Settings, path: "/settings", category: "navigate", keywords: ["settings", "preferences", "trust"] },
  { id: "nav-mission", label: "Mission Control", sublabel: "System health & agents", icon: Server, path: "/mission-control", category: "navigate", keywords: ["mission", "control", "system", "agents", "health"] },
  { id: "nav-store", label: "Pack Store", sublabel: "Extensions & packs", icon: Package, path: "/store", category: "navigate", keywords: ["store", "packs", "extensions", "marketplace"] },
  { id: "nav-owner", label: "Owner Panel", sublabel: "Admin & governance", icon: Shield, path: "/owner", category: "navigate", keywords: ["owner", "admin", "governance"] },
  { id: "nav-replay", label: "Boardroom Replay", sublabel: "Auto-generated review slides", icon: BarChart3, path: "/boardroom/replay", category: "navigate", keywords: ["replay", "presentation", "slides"] },

  // ── Business Sub-Pages ──
  { id: "nav-leads", label: "Leads Inbox", sublabel: "New & active leads", icon: UserPlus, path: "/business/leads", category: "navigate", domain: "business", keywords: ["leads", "prospects", "pipeline"] },
  { id: "nav-customers", label: "Customers", sublabel: "Client management", icon: Users, path: "/business/customers", category: "navigate", domain: "business", keywords: ["customers", "clients", "accounts"] },
  { id: "nav-opportunities-biz", label: "Opportunities", sublabel: "Deal pipeline", icon: Target, path: "/business/opportunities", category: "navigate", domain: "business", keywords: ["opportunities", "deals", "pipeline"] },
  { id: "nav-invoices", label: "Invoices & Collections", sublabel: "Billing & AR", icon: FileText, path: "/business/invoices", category: "navigate", domain: "business", keywords: ["invoices", "collections", "billing", "ar"] },
  { id: "nav-revenue-autopilot", label: "Revenue Autopilot", sublabel: "Automated revenue actions", icon: Zap, path: "/business/revenue-autopilot", category: "navigate", domain: "business", keywords: ["revenue", "autopilot", "automation", "reactivation"] },
  { id: "nav-quotes", label: "Quotes & Proposals", sublabel: "Quote management", icon: FileText, path: "/business/quotes", category: "navigate", domain: "business", keywords: ["quotes", "proposals"] },

  // ── Money Sub-Pages ──
  { id: "nav-bills", label: "Bills & Due Soon", sublabel: "Bill calendar", icon: DollarSign, path: "/money/bills", category: "navigate", domain: "finance", keywords: ["bills", "due", "calendar", "payments"] },
  { id: "nav-subs", label: "Subscriptions", sublabel: "Waste detection", icon: Activity, path: "/money/subscriptions", category: "navigate", domain: "finance", keywords: ["subscriptions", "waste", "recurring"] },
  { id: "nav-reserves", label: "Reserves & Savings", sublabel: "Emergency & sinking funds", icon: Shield, path: "/money/reserves", category: "navigate", domain: "finance", keywords: ["reserves", "savings", "emergency", "sinking"] },
  { id: "nav-investments", label: "Investment Office", sublabel: "Portfolio & thesis", icon: BarChart3, path: "/money/investments", category: "navigate", domain: "finance", keywords: ["investments", "portfolio", "thesis", "family office"] },

  // ── Advisors ──
  { id: "adv-business", label: "Business Advisor", sublabel: "Pipeline, revenue, client health", icon: Briefcase, path: "/advisors/business-advisor", category: "advisor", domain: "business", keywords: ["business", "advisor", "pipeline", "revenue", "crm"] },
  { id: "adv-money", label: "Money Advisor", sublabel: "Cashflow, reserves, tax", icon: DollarSign, path: "/advisors/money-advisor", category: "advisor", domain: "finance", keywords: ["money", "advisor", "cashflow", "tax", "budget"] },
  { id: "adv-concierge", label: "Concierge Advisor", sublabel: "Tasks, bookings, household", icon: Headphones, path: "/advisors/concierge-advisor", category: "advisor", domain: "concierge", keywords: ["concierge", "advisor", "tasks", "household", "calendar"] },
  { id: "adv-strategy", label: "Strategy Advisor", sublabel: "Cross-domain synthesis", icon: Brain, path: "/advisors/strategy-advisor", category: "advisor", keywords: ["strategy", "advisor", "cross-domain", "synthesis", "risk"] },

  // ── Demo Entities ──
  { id: "ent-bloom", label: "Bloom Studio", sublabel: "Customer · Active", icon: Briefcase, path: "/business/customers?inspect=bloom-studio", category: "entity", domain: "business", keywords: ["bloom", "studio", "customer", "client"] },
  { id: "ent-sarah", label: "Sarah Chen", sublabel: "Lead · Hot", icon: UserPlus, path: "/business/leads?inspect=sarah-chen", category: "entity", domain: "business", keywords: ["sarah", "chen", "lead"] },
  { id: "ent-james", label: "James Rodriguez", sublabel: "Lead · Warm", icon: UserPlus, path: "/business/leads?inspect=james-rodriguez", category: "entity", domain: "business", keywords: ["james", "rodriguez", "lead"] },
  { id: "ent-rent", label: "Rent Payment", sublabel: "Bill · Due Apr 1", icon: DollarSign, path: "/money/bills?inspect=rent", category: "entity", domain: "finance", keywords: ["rent", "payment", "bill", "monthly"] },
  { id: "ent-spotify", label: "Spotify Premium", sublabel: "Subscription · $14.99/mo", icon: Activity, path: "/money/subscriptions?inspect=spotify", category: "entity", domain: "finance", keywords: ["spotify", "subscription", "music"] },

  // ── Proof Records ──
  { id: "proof-invoice", label: "Invoice #1038 payment", sublabel: "Verified · Hash chain intact", icon: CheckCircle, path: "/proof?id=1038", category: "proof", keywords: ["invoice", "1038", "payment", "verified", "proof"] },
  { id: "proof-quote", label: "Quote #1042 to Sarah Chen", sublabel: "Verified · 3 steps", icon: CheckCircle, path: "/proof?id=1042", category: "proof", keywords: ["quote", "1042", "sarah", "chen", "proof"] },
  { id: "proof-callback", label: "Callback: James Rodriguez", sublabel: "Verified · Complete", icon: CheckCircle, path: "/proof?id=callback-james", category: "proof", keywords: ["callback", "james", "rodriguez", "proof"] },
  { id: "proof-transfer", label: "Rent transfer $2,400", sublabel: "Pending verification", icon: Hash, path: "/proof?id=rent-transfer", category: "proof", keywords: ["rent", "transfer", "2400", "pending", "proof"] },

  // ── Quick Actions ──
  { id: "act-new-lead", label: "Add New Lead", sublabel: "Business", icon: UserPlus, path: "/business?action=new-lead", category: "action", keywords: ["add", "new", "lead", "create"] },
  { id: "act-invoice", label: "Create Invoice", sublabel: "Business", icon: FileText, path: "/business?action=new-invoice", category: "action", keywords: ["create", "invoice", "bill"] },
  { id: "act-callback", label: "Schedule Callback", sublabel: "Business", icon: Phone, path: "/business?action=callback", category: "action", keywords: ["schedule", "callback", "call", "phone"] },
  { id: "act-upload", label: "Upload Document", sublabel: "Files", icon: FileUp, path: "/files?action=upload", category: "action", keywords: ["upload", "document", "file"] },
  { id: "act-boardroom", label: "New Boardroom Review", sublabel: "Boardroom", icon: BarChart3, path: "/boardroom?action=new", category: "action", keywords: ["new", "boardroom", "review"] },
  { id: "act-appointment", label: "Schedule Appointment", sublabel: "Concierge", icon: CalendarPlus, path: "/concierge?action=schedule", category: "action", keywords: ["schedule", "appointment", "calendar"] },
  { id: "act-approvals", label: "Review Approvals", sublabel: "Workflows", icon: Eye, path: "/workflows?tab=approvals", category: "action", keywords: ["review", "approvals", "pending"] },

  // ── System ──
  { id: "sys-agents", label: "Agent Control Panel", sublabel: "Manage 40 agents", icon: Shield, path: "/mission-control?tab=control-panel", category: "system", keywords: ["agents", "control", "panel", "fleet"] },
  { id: "sys-predictive", label: "Predictive Analysis", sublabel: "Failure predictions", icon: BarChart3, path: "/mission-control?tab=predictive", category: "system", keywords: ["predictive", "analysis", "failures"] },
  { id: "sys-audit", label: "Audit Log", sublabel: "ISO compliant trail", icon: FileText, path: "/mission-control?tab=audit-log", category: "system", keywords: ["audit", "log", "iso", "compliance"] },
  { id: "sys-compliance", label: "Compliance Dashboard", sublabel: "ISO/SOC/NIST", icon: Shield, path: "/mission-control?tab=compliance", category: "system", keywords: ["compliance", "iso", "soc", "nist"] },
  { id: "sys-handoffs", label: "Advisor Handoffs", sublabel: "Transfer history", icon: GitBranch, path: "/advisors/council-dashboard?tab=handoffs", category: "system", keywords: ["handoff", "transfer", "advisor"] },
  { id: "sys-escalations", label: "Escalation Log", sublabel: "Council escalations", icon: Shield, path: "/advisors/council-dashboard?tab=escalations", category: "system", keywords: ["escalation", "council", "urgent"] },
];

const CATEGORY_LABELS: Record<string, string> = {
  navigate: "Navigate",
  advisor: "Advisors",
  entity: "Entities",
  proof: "Proof Records",
  action: "Quick Actions",
  system: "System & Control",
};

const CATEGORY_ORDER = ["action", "navigate", "advisor", "entity", "proof", "system"];

const DOMAIN_COLORS: Record<string, string> = {
  business: "text-primary",
  finance: "text-trust-safe",
  concierge: "text-accent",
};

// ── Component ────────────────────────────────────────────────

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX;
    const q = query.toLowerCase().split(/\s+/);
    return SEARCH_INDEX.filter(item => {
      const searchable = [item.label, item.sublabel || "", ...item.keywords].join(" ").toLowerCase();
      return q.every(word => searchable.includes(word));
    });
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchableItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return CATEGORY_ORDER
      .filter(cat => groups[cat]?.length)
      .map(cat => ({ category: cat, label: CATEGORY_LABELS[cat], items: groups[cat] }));
  }, [filtered]);

  const handleSelect = (item: SearchableItem) => {
    navigate(item.path);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2.5 rounded-xl border border-border/50 glass-panel px-3.5 py-2 text-xs text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:border-border w-64">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or do anything...</span>
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
        <CommandInput
          placeholder="Search spaces, advisors, customers, proof records..."
          className="text-sm"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[440px]">
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No results for "{query}". Try a different search.
          </CommandEmpty>
          {grouped.map((group, i) => (
            <div key={group.category}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={[item.label, item.sublabel, ...item.keywords].join(" ")}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  >
                    <div className={cn(
                      "rounded-md p-1.5",
                      item.category === "advisor" ? "bg-primary/10" :
                      item.category === "entity" ? "bg-accent/10" :
                      item.category === "proof" ? "bg-trust-safe/10" :
                      item.category === "action" ? "bg-primary/10" :
                      "bg-secondary"
                    )}>
                      <item.icon className={cn(
                        "h-3.5 w-3.5",
                        item.domain ? DOMAIN_COLORS[item.domain] || "text-muted-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground">{item.label}</span>
                      {item.sublabel && (
                        <span className="ml-2 text-[11px] text-muted-foreground">{item.sublabel}</span>
                      )}
                    </div>
                    <span className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                      item.category === "advisor" ? "bg-primary/8 text-primary" :
                      item.category === "entity" ? "bg-accent/8 text-accent" :
                      item.category === "proof" ? "bg-trust-safe/8 text-trust-safe" :
                      item.category === "action" ? "bg-secondary text-muted-foreground" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {item.category === "navigate" ? item.domain || "nav" : item.category}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
