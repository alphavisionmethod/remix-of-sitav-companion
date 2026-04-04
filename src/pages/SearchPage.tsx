import { useState, useMemo, useRef, useEffect } from "react";
import { EmptyStateCTA } from "@/components/sita/EmptyStateCTA";
import { useAuth } from "@/contexts/AuthContext";
import { SitaPageHeader, SitaCard, SitaSectionHeader } from "@/components/sita/SitaCard";
import { Search, FileText, Users, Receipt, Briefcase, CheckSquare, Loader2, Bot, Shield, Workflow, BarChart3, Filter, X, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchFabricService, type IndexableItem, type SearchQuery, type SearchResponse, type SearchDomain, type SearchResultType } from "@/lib/core-services/search-fabric";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MOCK_SEARCH_ITEMS } from "@/lib/mock-data";

const ICONS: Record<string, typeof Search> = {
  lead: Briefcase, customer: Users, invoice: Receipt, task: CheckSquare,
  file: FileText, document: FileText, workflow: Workflow, advisor: Bot,
  receipt: BarChart3, event: Clock, opportunity: Briefcase, booking: Clock,
  bill: Receipt, thesis: FileText,
};

const DOMAIN_LABELS: Record<string, string> = {
  business: "Business", finance: "Finance", concierge: "Concierge",
  files: "Files", workflows: "Workflows", memory: "Memory",
  proof: "Proof", advisors: "Advisors", all: "All",
};

const SORT_OPTIONS = [
  { key: "relevance" as const, label: "Relevance" },
  { key: "date" as const, label: "Newest" },
  { key: "value" as const, label: "Value" },
];

const searchFabric = new SearchFabricService();
searchFabric.addBatch(MOCK_SEARCH_ITEMS);


const SearchPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "value">("relevance");
  const [activeDomains, setActiveDomains] = useState<SearchDomain[]>([]);
  const [activeTypes, setActiveTypes] = useState<SearchResultType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const searchResponse: SearchResponse = useMemo(() => {
    const sq: SearchQuery = {
      query: query.trim(),
      sortBy,
      limit: 50,
      ...(activeDomains.length > 0 && { domains: activeDomains }),
      ...(activeTypes.length > 0 && { resultTypes: activeTypes }),
    };
    return searchFabric.search(sq);
  }, [query, sortBy, activeDomains, activeTypes]);

  const { results, facets } = searchResponse;

  const toggleDomain = (d: SearchDomain) => {
    setActiveDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleType = (t: SearchResultType) => {
    setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const clearFilters = () => { setActiveDomains([]); setActiveTypes([]); };

  const grouped = useMemo(() => {
    const g: Record<string, typeof results> = {};
    results.forEach(r => {
      const key = r.domain;
      if (!g[key]) g[key] = [];
      g[key].push(r);
    });
    return Object.entries(g);
  }, [results]);

  const hasFilters = activeDomains.length > 0 || activeTypes.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl space-y-4">
      <SitaPageHeader title="Search" subtitle="Cross-domain search powered by Search Fabric" />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all domains — leads, invoices, agents, files, workflows..."
          className="w-full rounded-2xl border border-border bg-card pl-12 pr-28 py-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={cn(
            "rounded-lg p-1.5 transition-colors",
            showFilters || hasFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Filter className="h-4 w-4" />
          </button>
          <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <SitaCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters</span>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                    <X className="h-2.5 w-2.5" /> Clear all
                  </button>
                )}
              </div>

              {/* Domain Facets */}
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">Domain</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(facets.byDomain).map(([domain, count]) => (
                    <button key={domain} onClick={() => toggleDomain(domain as SearchDomain)}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-full border transition-all",
                        activeDomains.includes(domain as SearchDomain) ? "bg-primary/15 text-primary border-primary/30" : "border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >{DOMAIN_LABELS[domain] || domain} ({count})</button>
                  ))}
                </div>
              </div>

              {/* Type Facets */}
              <div>
                <span className="text-[10px] text-muted-foreground font-medium">Type</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(facets.byType).map(([type, count]) => (
                    <button key={type} onClick={() => toggleType(type as SearchResultType)}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-full border transition-all capitalize",
                        activeTypes.includes(type as SearchResultType) ? "bg-primary/15 text-primary border-primary/30" : "border-border/40 text-muted-foreground hover:text-foreground"
                      )}
                    >{type} ({count})</button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">Sort:</span>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setSortBy(opt.key)}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                      sortBy === opt.key ? "bg-primary/15 text-primary border-primary/30" : "border-border/40 text-muted-foreground"
                    )}
                  >{opt.label}</button>
                ))}
              </div>
            </SitaCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meta bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-muted-foreground">
          {facets.totalResults} result{facets.totalResults !== 1 ? "s" : ""} · {searchResponse.took}ms
          {hasFilters && ` · ${activeDomains.length + activeTypes.length} filter(s)`}
        </span>
        {/* Sensitivity badges */}
        <div className="flex gap-1">
          {Object.entries(facets.bySensitivity).map(([s, c]) => (
            <span key={s} className={cn(
              "text-[8px] px-1.5 py-0.5 rounded-full border",
              s === "confidential" ? "border-destructive/20 text-destructive" :
              s === "restricted" ? "border-amber-500/20 text-amber-600" :
              "border-border/30 text-muted-foreground"
            )}>{s} ({c})</span>
          ))}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 && query.length > 0 && (
        <EmptyStateCTA
          icon={Search}
          title={`No results for "${query}"`}
          description="Try different keywords, remove filters, or broaden your search across all domains."
          actions={[
            { label: "Clear Search", onClick: () => { /* handled upstream */ }, variant: "secondary" },
          ]}
          tip="SITA searches leads, invoices, agents, files, workflows, and compliance controls"
        />
      )}

      {results.length === 0 && query.length === 0 && !hasFilters && (
        <EmptyStateCTA
          icon={Search}
          title="Search Across All Domains"
          description="Start typing to search leads, invoices, agents, files, workflows, compliance controls, and more."
          actions={[]}
          tip="Use filters to narrow results by domain, type, or date range"
        />
      )}

      {grouped.map(([domain, items]) => {
        const Icon = ICONS[items[0]?.type] || FileText;
        return (
          <div key={domain} className="space-y-2">
            <SitaSectionHeader title={DOMAIN_LABELS[domain] || domain} subtitle={`${items.length} result${items.length !== 1 ? "s" : ""}`} />
            {items.map(item => {
              const ItemIcon = ICONS[item.type] || FileText;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <SitaCard className="p-3 cursor-pointer hover:border-primary/20 transition-all group" onClick={() => item.actionUrl && navigate(item.actionUrl)}>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/8 p-2 shrink-0"><ItemIcon className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full border border-border/30 text-muted-foreground capitalize shrink-0">{item.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.snippet}</p>
                        {item.linkedEntities.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.linkedEntities.slice(0, 3).map(e => (
                              <span key={e} className="text-[8px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">{e}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full",
                          item.sensitivity === "confidential" ? "bg-destructive/10 text-destructive" :
                          item.sensitivity === "restricted" ? "bg-amber-500/10 text-amber-600" :
                          "bg-secondary text-muted-foreground"
                        )}>{item.sensitivity}</span>
                        <span className="text-[9px] text-muted-foreground/50">
                          {Math.round(item.relevanceScore * 100)}% match
                        </span>
                        {item.actionUrl && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>
                  </SitaCard>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
};

export default SearchPage;
