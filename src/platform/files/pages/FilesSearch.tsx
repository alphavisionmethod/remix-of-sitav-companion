import { SitaTabs } from "@/components/sita/SitaComponents";
import { PremiumEmptyState } from "@/components/sita/PremiumEmptyState";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
import { useState, useMemo } from "react";
import { Search, FileText, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchFabric } from "@/contexts/SitaKernelContext";
import type { SearchResponse } from "@/lib/services/search-fabric";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFilesSearchIndex } from "@/hooks/use-domain-data";
import { SectionSkeleton } from "@/components/sita/SectionSkeleton";
import { useAIInsight } from "@/hooks/use-backend-actions";
import { useGlobalSearch } from "@/platform/search";
import { toast } from "sonner";

type FilterType = "all" | "business" | "finance" | "concierge" | "obligations" | "deadlines";

const domainFilterMap: Record<FilterType, string[] | undefined> = {
  all: undefined,
  business: ["business"],
  finance: ["finance"],
  concierge: ["concierge"],
  obligations: undefined,
  deadlines: undefined,
};

const FilesSearch = () => {
  const { data: searchData = [], isLoading } = useFilesSearchIndex();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [aiSearchResult, setAiSearchResult] = useState<string | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const aiInsight = useAIInsight();
  const { results: crossDomainResults, search: searchCrossDomain } = useGlobalSearch();

  const kernelSearchFabric = useSearchFabric();
  const searchService = useMemo(() => {
    kernelSearchFabric.addBatch(searchData);
    return kernelSearchFabric;
  }, [searchData, kernelSearchFabric]);

  const handleSearch = (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    const domains = domainFilterMap[filter];
    const response = searchService.search({
      query: searchQuery,
      domains: domains as never,
      limit: 20,
      sortBy: "relevance",
    });
    setSearchResponse(response);
    // Federated cross-domain search via canonical hook.
    searchCrossDomain(searchQuery);
  };

  const handleFilterChange = (f: string) => {
    setFilter(f as FilterType);
    if (query.trim()) {
      const domains = domainFilterMap[f as FilterType];
      const response = searchService.search({
        query,
        domains: domains as never,
        limit: 20,
        sortBy: "relevance",
      });
      setSearchResponse(response);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <PageTruthBanner />

      {/* Hero Search Bar */}
      <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Knowledge Search</h2>
          <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 ml-auto">AI-Powered</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Search by name, content, customer, amount, date, obligation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={() => handleSearch()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors micro-press flex items-center gap-2">
            <Search className="h-4 w-4" /> Search
          </button>
          <button
            onClick={async () => {
              if (!query.trim()) return;
              setAiSearching(true);
              try {
                const result = await aiInsight.mutateAsync({
                  intent: "file_search",
                  domain: "general",
                  context: { query, filter },
                });
                setAiSearchResult(result?.recommendation || result?.response || "No AI results found.");
                toast.success("AI search complete");
              } catch {
                toast.error("AI search unavailable");
              } finally {
                setAiSearching(false);
              }
            }}
            className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors micro-press flex items-center gap-2"
          >
            {aiSearching ? <span className="animate-pulse">Searching…</span> : <><Brain className="h-4 w-4" /> AI Search</>}
          </button>
        </div>
      </div>

      {aiSearchResult && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-primary">AI Search Result</p>
          </div>
          <p className="text-sm text-foreground">{aiSearchResult}</p>
        </div>
      )}

      {/* Quick Queries */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Quick Queries</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Show all docs with obligations",
            "Files with deadlines this month",
            "Everything about Apex Corp",
            "All receipts over $500",
            "Travel confirmations",
            "Unlinked files needing review",
          ].map((q, i) => (
            <button key={i} onClick={() => { setQuery(q); handleSearch(q); }} className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all micro-press">
              {q}
            </button>
          ))}
        </div>
      </div>

      <SitaTabs
        tabs={[
          { key: "all", label: "All Results" },
          { key: "business", label: "Business" },
          { key: "finance", label: "Finance" },
          { key: "concierge", label: "Concierge" },
          { key: "obligations", label: "Obligations" },
          { key: "deadlines", label: "Deadlines" },
        ]}
        active={filter}
        onChange={handleFilterChange}
      />

      {isLoading ? (
        <SectionSkeleton cards={3} columns={1} />
      ) : searchResponse ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-foreground">{searchResponse.facets.totalResults} results in {searchResponse.took}ms</h3>
          </div>

          {searchResponse.facets.totalResults > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(searchResponse.facets.byDomain).map(([domain, count]) => (
                <Badge key={domain} variant="outline" className="text-[10px]">{domain}: {count}</Badge>
              ))}
              {Object.entries(searchResponse.facets.bySensitivity).map(([sens, count]) => (
                <Badge key={sens} variant="outline" className={cn("text-[10px]",
                  sens === "restricted" ? "border-destructive/30 text-destructive" :
                  sens === "confidential" ? "border-accent/30 text-accent" : ""
                )}>{sens}: {count}</Badge>
              ))}
            </div>
          )}

          {searchResponse.results.length > 0 ? (
            searchResponse.results.map((r) => (
              <div key={r.id} className="rounded-xl border border-[hsl(0_0%_100%/0.06)] bg-[hsl(0_0%_9%)] p-4 micro-hover-lift">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/8 p-2 shrink-0"><FileText className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.snippet}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[9px]">{r.domain}</Badge>
                      <Badge variant="outline" className="text-[9px]">{r.type}</Badge>
                      <span className={cn("text-[10px] font-medium",
                        r.sensitivity === "restricted" ? "text-destructive" :
                        r.sensitivity === "confidential" ? "text-accent" : "text-muted-foreground"
                      )}>{r.sensitivity}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">Score: {(r.relevanceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <PremiumEmptyState variant="no-results" icon={FileText} title="No results found" description="Try adjusting your search terms or filters" />
          )}
        </div>
      ) : (
        <PremiumEmptyState variant="no-data" icon={Search} title="Search your knowledge base" description="Enter a query to find files, extracted facts, linked entities, and intelligence across all domains" />
      )}
    </motion.div>
  );
};

export default FilesSearch;
