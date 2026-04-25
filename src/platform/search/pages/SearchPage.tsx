// ═══════════════════════════════════════════════════════════════
// SITA OS — Global Search Page (Section 1.6)
// Cross-domain search with live Supabase data, preview pane,
// filters, facets, result actions, and trust-awareness
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SitaPageHeader, SitaCard } from "@/platform/sita/components/sita/SitaCard";
import {
  Search, FileText, Users, Receipt, Briefcase, CheckSquare, Filter, X, Clock,
  ArrowRight, UserPlus, Target, DollarSign, Workflow, CheckCircle, AlertTriangle,
  FolderOpen, Lock, ExternalLink, MessageSquare, CalendarPlus, Settings,
  Loader2, ChevronRight, Eye, Send, PenSquare, MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGlobalSearch, type SearchResult } from "@/hooks/use-global-search";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

// ── Icon & Color Maps ────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ElementType> = {
  lead: UserPlus, customer: Users, task: Target, invoice: FileText,
  bill: DollarSign, workflow: Workflow, approval: CheckCircle,
  incident: AlertTriangle, file: FolderOpen, receipt: Receipt,
  note: FileText, booking: CalendarPlus, setting: Settings,
};

const DOMAIN_LABELS: Record<string, string> = {
  business: "Business", finance: "Finance", concierge: "Concierge",
  system: "System", files: "Files", workflows: "Workflows", proof: "Proof",
};

const DOMAIN_COLORS: Record<string, string> = {
  business: "text-primary border-primary/20",
  finance: "text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/20",
  concierge: "text-[hsl(var(--sita-gold))] border-[hsl(var(--sita-gold))]/20",
  system: "text-muted-foreground border-border/40",
  files: "text-muted-foreground border-border/40",
  workflows: "text-primary border-primary/20",
  proof: "text-[hsl(var(--trust-safe))] border-[hsl(var(--trust-safe))]/20",
};

const DOMAIN_BG: Record<string, string> = {
  business: "bg-primary/8",
  finance: "bg-[hsl(var(--trust-safe))]/8",
  concierge: "bg-[hsl(var(--sita-gold))]/8",
  system: "bg-secondary/60",
  files: "bg-secondary/60",
  workflows: "bg-primary/8",
  proof: "bg-[hsl(var(--trust-safe))]/8",
};

// ── Result Actions by Type ────────────────────────────────────

const RESULT_ACTIONS: Record<string, { label: string; icon: React.ElementType; action: string }[]> = {
  lead: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Message", icon: MessageSquare, action: "message" },
    { label: "Add note", icon: PenSquare, action: "note" },
  ],
  customer: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Message", icon: Send, action: "message" },
    { label: "View history", icon: Clock, action: "history" },
  ],
  invoice: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Review", icon: Eye, action: "review" },
    { label: "Send reminder", icon: Send, action: "remind" },
  ],
  task: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Mark complete", icon: CheckCircle, action: "complete" },
  ],
  incident: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Acknowledge", icon: CheckCircle, action: "acknowledge" },
  ],
  file: [
    { label: "Preview", icon: Eye, action: "preview" },
    { label: "Open", icon: ExternalLink, action: "open" },
  ],
  workflow: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "View runs", icon: Clock, action: "runs" },
  ],
  approval: [
    { label: "Review", icon: Eye, action: "review" },
    { label: "Open", icon: ExternalLink, action: "open" },
  ],
  bill: [
    { label: "Open", icon: ExternalLink, action: "open" },
    { label: "Pay", icon: DollarSign, action: "pay" },
  ],
};

import { DATE_RANGES } from "@/lib/constants/ui-config";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

const SearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDomains, setActiveDomains] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("all");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading, facets, search, clearResults } = useGlobalSearch();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounced search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (query.trim().length < 2) { clearResults(); return; }
    searchTimerRef.current = setTimeout(() => {
      search(query, { domains: activeDomains.length ? activeDomains : undefined, types: activeTypes.length ? activeTypes : undefined });
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [query, activeDomains, activeTypes, search, clearResults]);

  // Group results by domain
  const grouped = useMemo(() => {
    const g: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!g[r.domain]) g[r.domain] = [];
      g[r.domain].push(r);
    });
    return Object.entries(g).sort(([, a], [, b]) => b.length - a.length);
  }, [results]);

  const toggleDomain = (d: string) => setActiveDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const toggleType = (t: string) => setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const hasFilters = activeDomains.length > 0 || activeTypes.length > 0 || dateRange !== "all";

  const handleResultAction = (result: SearchResult, action: string) => {
    if (action === "open" && result.actionUrl) {
      navigate(result.actionUrl);
    } else {
      toast.info(`Action: ${action} on ${result.title}`, { description: "This action will be available when the module is connected." });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-4">
<SitaPageHeader
        title="Global Search"
        subtitle="Find anything across business, finance, concierge, files, workflows, and trust"
      />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedResult(null); }}
          placeholder="Search people, tasks, invoices, files, workflows, receipts, incidents…"
          className="w-full rounded-2xl border border-border/40 bg-card pl-12 pr-32 py-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              showFilters || hasFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="h-4 w-4" />
          </button>
          <kbd className="rounded-md border border-border/30 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hidden sm:flex">⌘K</kbd>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <SitaCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters & Scopes</span>
                {hasFilters && (
                  <button onClick={() => { setActiveDomains([]); setActiveTypes([]); setDateRange("all"); }} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                    <X className="h-2.5 w-2.5" /> Clear all
                  </button>
                )}
              </div>

              {/* Domain */}
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">Domain</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {Object.keys(DOMAIN_LABELS).map(domain => (
                    <button
                      key={domain}
                      onClick={() => toggleDomain(domain)}
                      className={cn(
                        "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium",
                        activeDomains.includes(domain)
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {DOMAIN_LABELS[domain]}
                      {facets.domain?.[domain] ? ` (${facets.domain[domain]})` : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              {Object.keys(facets.type || {}).length > 0 && (
                <div>
                  <span className="text-[10px] text-muted-foreground font-medium">Type</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.entries(facets.type || {}).map(([type, count]) => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={cn(
                          "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium capitalize",
                          activeTypes.includes(type)
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "border-border/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {type} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date range */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">Period:</span>
                {DATE_RANGES.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setDateRange(opt.key)}
                    className={cn(
                      "text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium",
                      dateRange === opt.key ? "bg-primary/15 text-primary border-primary/30" : "border-border/40 text-muted-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta */}
      {results.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} across {grouped.length} domain{grouped.length !== 1 ? "s" : ""}
            {hasFilters && ` · ${activeDomains.length + activeTypes.length} filter(s) active`}
          </span>
        </div>
      )}

      {/* Main content: results + preview */}
      <div className="flex gap-4">
        {/* Results list */}
        <div className={cn("flex-1 min-w-0 space-y-4", selectedResult && "lg:max-w-[60%]")}>
          {/* Empty states */}
          {!loading && results.length === 0 && query.length >= 2 && (
            <SitaCard className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords, remove filters, or broaden your search.</p>
            </SitaCard>
          )}

          {results.length === 0 && query.length < 2 && (
            <SitaCard className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Search across your entire environment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start typing to find leads, invoices, tasks, files, workflows, receipts, and more.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["Sarah Martin", "Invoice March", "pending approval", "overdue task", "workflow failed"].map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-lg border border-border/30 bg-secondary/20 px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground hover:border-border/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </SitaCard>
          )}

          {/* Grouped results */}
          {grouped.map(([domain, items]) => (
            <div key={domain} className="space-y-1.5">
              <div className="flex items-center gap-2 px-1">
                <div className={cn("h-1 w-1 rounded-full", DOMAIN_BG[domain]?.replace("/8", ""))} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {DOMAIN_LABELS[domain] || domain}
                </span>
                <span className="text-[9px] text-muted-foreground/50">{items.length}</span>
              </div>

              {items.map(result => {
                const Icon = TYPE_ICONS[result.type] || FileText;
                const isSelected = selectedResult?.id === result.id;
                const actions = RESULT_ACTIONS[result.type] || [{ label: "Open", icon: ExternalLink, action: "open" }];

                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SitaCard
                      className={cn(
                        "p-3 cursor-pointer transition-all group",
                        isSelected ? "border-primary/30 bg-primary/3 ring-1 ring-primary/10" : "hover:border-border/60"
                      )}
                      onClick={() => setSelectedResult(isSelected ? null : result)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("rounded-lg p-2 shrink-0", DOMAIN_BG[result.domain] || "bg-secondary/60")}>
                          <Icon className={cn("h-4 w-4", DOMAIN_COLORS[result.domain]?.split(" ")[0] || "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-foreground truncate">{result.title}</p>
                            <span className="text-[8px] px-1.5 py-0.5 rounded-full border border-border/30 text-muted-foreground capitalize shrink-0">{result.type}</span>
                          </div>
                          {result.subtitle && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {result.sensitivity && result.sensitivity !== "public" && (
                            <Lock className="h-3 w-3 text-muted-foreground/40" />
                          )}

                          {/* Quick actions */}
                          <div className="hidden group-hover:flex items-center gap-1">
                            {actions.slice(0, 2).map(a => (
                              <button
                                key={a.action}
                                onClick={(e) => { e.stopPropagation(); handleResultAction(result, a.action); }}
                                className="rounded-md p-1 hover:bg-secondary transition-colors"
                                title={a.label}
                              >
                                <a.icon className="h-3 w-3 text-muted-foreground" />
                              </button>
                            ))}
                          </div>

                          <ChevronRight className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isSelected ? "text-primary rotate-90" : "text-muted-foreground/30"
                          )} />
                        </div>
                      </div>
                    </SitaCard>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Preview Pane */}
        <AnimatePresence>
          {selectedResult && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "40%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block shrink-0 overflow-hidden"
            >
              <SitaCard className="sticky top-20 p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {(() => { const Icon = TYPE_ICONS[selectedResult.type] || FileText; return (
                      <div className={cn("rounded-lg p-2", DOMAIN_BG[selectedResult.domain])}>
                        <Icon className={cn("h-5 w-5", DOMAIN_COLORS[selectedResult.domain]?.split(" ")[0])} />
                      </div>
                    ); })()}
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedResult.title}</p>
                      <p className="text-[11px] text-muted-foreground">{selectedResult.subtitle}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedResult(null)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize font-medium">{selectedResult.type}</span>
                  <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", DOMAIN_BG[selectedResult.domain], DOMAIN_COLORS[selectedResult.domain]?.split(" ")[0])}>
                    {DOMAIN_LABELS[selectedResult.domain]}
                  </span>
                  {selectedResult.sensitivity && selectedResult.sensitivity !== "public" && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> {selectedResult.sensitivity}
                    </span>
                  )}
                </div>

                {/* Metadata */}
                {selectedResult.metadata && Object.keys(selectedResult.metadata).length > 0 && (
                  <div className="rounded-xl bg-secondary/30 p-3 space-y-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Details</span>
                    {Object.entries(selectedResult.metadata).filter(([, v]) => v != null).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="text-foreground font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Updated */}
                {selectedResult.updatedAt && (
                  <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {new Date(selectedResult.updatedAt).toLocaleDateString()}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(RESULT_ACTIONS[selectedResult.type] || [{ label: "Open", icon: ExternalLink, action: "open" }]).map(a => (
                      <button
                        key={a.action}
                        onClick={() => handleResultAction(selectedResult, a.action)}
                        className="flex items-center gap-1.5 rounded-lg border border-border/30 px-3 py-2 text-[11px] font-medium text-foreground hover:bg-secondary/40 transition-colors"
                      >
                        <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Related hint */}
                <div className="rounded-lg border border-primary/10 bg-primary/3 p-2.5">
                  <p className="text-[10px] text-primary font-medium flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Why this result
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Matched "{query}" in {selectedResult.type} name within {DOMAIN_LABELS[selectedResult.domain]} domain.
                  </p>
                </div>
              </SitaCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPage;
