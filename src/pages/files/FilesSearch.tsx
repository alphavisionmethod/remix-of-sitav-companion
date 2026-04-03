import { SitaPageHeader, SitaSectionHeader, SitaButton, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { SitaTabs, EmptyState } from "@/components/sita/SitaComponents";
import { RetrievalResultCard } from "@/components/sita/FilesComponents";
import { useState, useMemo } from "react";
import { Search, Filter, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { SearchFabricService, type IndexableItem, type SearchResponse } from "@/lib/core-services/search-fabric";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_INDEX: IndexableItem[] = [
  { id: "1", type: "document", domain: "business", title: "Service Agreement — Apex Corp", body: "Service agreement with auto-renew clause, Net-30 terms, $24,000/yr annual contract", tags: ["contract", "apex", "auto-renew"], timestamp: Date.now() - 86400000 * 2, metadata: { value: 24000 }, linkedEntities: ["Apex Corp", "Business"], sensitivity: "confidential", actionUrl: "/files" },
  { id: "2", type: "invoice", domain: "business", title: "Invoice #1038 — Marcus Johnson", body: "Invoice for design services $4,200 payment received via Stripe", tags: ["invoice", "marcus", "design"], timestamp: Date.now() - 86400000, metadata: { value: 4200 }, linkedEntities: ["Marcus Johnson"], sensitivity: "internal", actionUrl: "/money" },
  { id: "3", type: "document", domain: "finance", title: "Bank Statement — Chase Feb", body: "Bank statement with account ending 4821 showing deposits and withdrawals for February", tags: ["bank", "statement", "chase"], timestamp: Date.now() - 86400000 * 5, metadata: {}, linkedEntities: ["Chase Bank", "Money Center"], sensitivity: "restricted", actionUrl: "/money" },
  { id: "4", type: "booking", domain: "concierge", title: "Travel Confirmation — Hawaii", body: "Flight confirmation and hotel reservation Marriott Wailea Apr 12-18 $289/night trip", tags: ["travel", "hawaii", "hotel", "trip"], timestamp: Date.now() - 3600000 * 12, metadata: {}, linkedEntities: ["Hawaii Trip", "Travel"], sensitivity: "internal", actionUrl: "/concierge/travel" },
  { id: "5", type: "customer", domain: "business", title: "Apex Corp — Customer Profile", body: "Enterprise client since 2023, annual contract $24,000, renewal March 2025, primary contact Sarah", tags: ["customer", "apex", "enterprise"], timestamp: Date.now() - 86400000 * 10, metadata: { value: 24000 }, linkedEntities: ["Apex Corp"], sensitivity: "internal", actionUrl: "/business/customers" },
  { id: "6", type: "bill", domain: "finance", title: "AWS Hosting — Monthly Bill", body: "Amazon Web Services hosting bill $340 monthly recurring auto-pay enabled", tags: ["aws", "hosting", "recurring", "bill"], timestamp: Date.now() - 86400000 * 3, metadata: { value: 340 }, linkedEntities: ["AWS"], sensitivity: "internal", actionUrl: "/money/bills" },
  { id: "7", type: "task", domain: "concierge", title: "School Enrollment Deadline", body: "Complete school enrollment form by April 15, 2025 for Spring semester", tags: ["school", "deadline", "enrollment"], timestamp: Date.now() - 3600000 * 24, metadata: {}, linkedEntities: ["Family", "School"], sensitivity: "internal", actionUrl: "/concierge/school" },
  { id: "8", type: "receipt", domain: "finance", title: "Costco Groceries Receipt", body: "Costco wholesale receipt total $342.18 groceries household supplies March 28", tags: ["receipt", "costco", "groceries"], timestamp: Date.now() - 86400000, metadata: { value: 342.18 }, linkedEntities: ["Costco"], sensitivity: "public", actionUrl: "/files" },
  { id: "9", type: "opportunity", domain: "business", title: "Expansion Opportunity — TechFlow", body: "TechFlow expressed interest in expanded design services, potential $15,000 quarterly engagement", tags: ["opportunity", "techflow", "expansion"], timestamp: Date.now() - 86400000 * 7, metadata: { value: 60000 }, linkedEntities: ["TechFlow"], sensitivity: "confidential", actionUrl: "/business/opportunities" },
  { id: "10", type: "document", domain: "finance", title: "Insurance Renewal Notice", body: "Insurance policy renewal notice premium increase $120/mo due date April 30, 2025", tags: ["insurance", "renewal", "deadline"], timestamp: Date.now() - 86400000 * 4, metadata: { value: 1440 }, linkedEntities: ["Insurance"], sensitivity: "internal", actionUrl: "/files" },
];

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  const searchService = useMemo(() => {
    const svc = new SearchFabricService();
    svc.addBatch(MOCK_INDEX);
    return svc;
  }, []);

  const handleSearch = (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    const domains = domainFilterMap[filter];
    const response = searchService.search({
      query: searchQuery,
      domains: domains as any,
      limit: 20,
      sortBy: "relevance",
    });
    setSearchResponse(response);
  };

  const handleFilterChange = (f: string) => {
    setFilter(f as FilterType);
    if (query.trim()) {
      const domains = domainFilterMap[f as FilterType];
      const response = searchService.search({
        query,
        domains: domains as any,
        limit: 20,
        sortBy: "relevance",
      });
      setSearchResponse(response);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
      <SitaPageHeader title="Knowledge Search" subtitle="Find files, facts, entities, and linked intelligence across your OS" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-secondary/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search by name, content, customer, amount, date, obligation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <SitaButton variant="primary" onClick={() => handleSearch()}><Search className="h-4 w-4" /> Search</SitaButton>
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

      <div className="space-y-3">
        <SitaSectionHeader title="Quick Queries" subtitle="Common intelligence retrievals" />
        <div className="flex flex-wrap gap-2">
          {[
            "Show all docs with obligations",
            "Files with deadlines this month",
            "Everything about Apex Corp",
            "All receipts over $500",
            "Travel confirmations",
            "Unlinked files needing review",
          ].map((q, i) => (
            <button key={i} onClick={() => { setQuery(q); handleSearch(q); }} className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all">
              {q}
            </button>
          ))}
        </div>
      </div>

      {searchResponse ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SitaSectionHeader title="Results" subtitle={`${searchResponse.facets.totalResults} items matched in ${searchResponse.took}ms`} />
          </div>

          {/* Facets */}
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
              <SitaCard key={r.id} className="p-3">
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
              </SitaCard>
            ))
          ) : (
            <EmptyState icon={FileText} title="No results found" description="Try adjusting your search terms or filters" />
          )}
        </div>
      ) : (
        <EmptyState icon={FileText} title="Search your knowledge base" description="Enter a query to find files, extracted facts, linked entities, and intelligence across all domains" />
      )}
    </motion.div>
  );
};

export default FilesSearch;
