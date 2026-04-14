import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCRMContacts, useCRMCompanies, useCRMOpportunities } from "@/hooks/use-crm-data";
import { Search, User, Building2, TrendingUp, ArrowRight, Hash, Mail, Phone, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: "contact" | "company" | "deal";
  title: string;
  subtitle: string;
  icon: any;
  path: string;
  score: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const CRMCommandSearch = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: contacts = [] } = useCRMContacts();
  const { data: companies = [] } = useCRMCompanies();
  const { data: opportunities = [] } = useCRMOpportunities();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent / important items
      const recent: SearchResult[] = [];
      contacts.slice(0, 3).forEach(c => recent.push({
        id: c.id, type: "contact", title: `${c.first_name} ${c.last_name}`,
        subtitle: c.email || c.lifecycle_stage || "", icon: User, path: "crm-contacts", score: 1,
      }));
      companies.slice(0, 2).forEach(c => recent.push({
        id: c.id, type: "company", title: c.name,
        subtitle: c.industry || c.domain || "", icon: Building2, path: "crm-companies", score: 1,
      }));
      opportunities.filter(o => o.status === "open").slice(0, 2).forEach(o => recent.push({
        id: o.id, type: "deal", title: o.title,
        subtitle: `$${o.value?.toLocaleString()} · ${o.stage}`, icon: TrendingUp, path: "crm-pipeline", score: 1,
      }));
      return recent;
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    contacts.forEach(c => {
      const name = `${c.first_name} ${c.last_name}`.toLowerCase();
      const email = (c.email || "").toLowerCase();
      const phone = (c.phone || "").toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 10;
      else if (name.includes(q)) score = 7;
      else if (email.includes(q)) score = 6;
      else if (phone.includes(q)) score = 5;
      if (score > 0) {
        matches.push({
          id: c.id, type: "contact", title: `${c.first_name} ${c.last_name}`,
          subtitle: [c.email, c.phone, c.lifecycle_stage].filter(Boolean).join(" · "),
          icon: User, path: "crm-contacts", score,
        });
      }
    });

    companies.forEach(c => {
      const name = c.name.toLowerCase();
      const domain = (c.domain || "").toLowerCase();
      let score = 0;
      if (name.startsWith(q)) score = 10;
      else if (name.includes(q)) score = 7;
      else if (domain.includes(q)) score = 6;
      if (score > 0) {
        matches.push({
          id: c.id, type: "company", title: c.name,
          subtitle: [c.industry, c.domain, c.city].filter(Boolean).join(" · "),
          icon: Building2, path: "crm-companies", score,
        });
      }
    });

    opportunities.forEach(o => {
      const title = o.title.toLowerCase();
      let score = 0;
      if (title.startsWith(q)) score = 10;
      else if (title.includes(q)) score = 7;
      if (score > 0) {
        matches.push({
          id: o.id, type: "deal", title: o.title,
          subtitle: `$${o.value?.toLocaleString()} · ${o.stage} · ${o.status}`,
          icon: TrendingUp, path: "crm-pipeline", score,
        });
      }
    });

    return matches.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [query, contacts, companies, opportunities]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(`/business/${result.path}`);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const typeIcons = { contact: User, company: Building2, deal: TrendingUp };
  const typeColors = { contact: "text-primary", company: "text-blue-400", deal: "text-[hsl(var(--trust-safe))]" };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search contacts, companies, deals..."
            className="flex-1 bg-transparent border-0 outline-none px-3 py-3.5 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <Search className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          ) : (
            <div className="py-1">
              {!query.trim() && <p className="px-4 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Recent</p>}
              {results.map((result, i) => {
                const Icon = typeIcons[result.type];
                const color = typeColors[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selectedIndex === i ? "bg-primary/10" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                      result.type === "contact" ? "bg-primary/10 text-primary" :
                      result.type === "company" ? "bg-blue-500/10 text-blue-400" :
                      "bg-[hsl(var(--trust-safe))]/10 text-[hsl(var(--trust-safe))]"
                    }`}>{result.type}</span>
                    {selectedIndex === i && <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-0.5"><kbd className="px-1 py-0.5 rounded bg-muted font-mono">↵</kbd> select</span>
          </div>
          <span className="text-[10px] text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CRMCommandSearch;
