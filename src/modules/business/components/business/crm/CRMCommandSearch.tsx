import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCRMContacts, useCRMCompanies, useCRMOpportunities } from "@/hooks/use-crm-data";
import { Search, User, Building2, TrendingUp, ArrowRight, Plus, Upload, Zap, Shield, MessageSquare, Sparkles, FileText } from "lucide-react";
import { useBusinessNavigation } from "@/modules/business/contexts/BusinessNavigationContext";

interface SearchResult {
  id: string;
  type: "contact" | "company" | "deal" | "action";
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

const QUICK_ACTIONS: SearchResult[] = [
  { id: "add-contact", type: "action", title: "Add Contact", subtitle: "Create a new contact record", icon: Plus, path: "crm-contacts", score: 0 },
  { id: "add-company", type: "action", title: "Add Company", subtitle: "Create a new company record", icon: Building2, path: "crm-companies", score: 0 },
  { id: "create-deal", type: "action", title: "Create Deal", subtitle: "Start a new opportunity", icon: TrendingUp, path: "crm-pipeline", score: 0 },
  { id: "create-quote", type: "action", title: "Create Quote", subtitle: "Draft a new proposal or quote", icon: FileText, path: "crm-pipeline", score: 0 },
  { id: "import", type: "action", title: "Import Contacts", subtitle: "Import from CSV or external CRM", icon: Upload, path: "crm-import", score: 0 },
  { id: "start-workflow", type: "action", title: "Start Workflow", subtitle: "Create or run an automation", icon: Zap, path: "crm-automations", score: 0 },
  { id: "escalate-boardroom", type: "action", title: "Escalate to Boardroom", subtitle: "Flag for strategic review", icon: Shield, path: "crm-health", score: 0 },
  { id: "ask-advisor", type: "action", title: "Ask Advisor", subtitle: "Get AI-powered relationship guidance", icon: Sparkles, path: "crm-health", score: 0 },
  { id: "comm-queue", type: "action", title: "Communication Queue", subtitle: "View pending follow-ups", icon: MessageSquare, path: "crm-communications", score: 0 },
];

const CRMCommandSearch = ({ open, onClose }: Props) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { navigateTo } = useBusinessNavigation();

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
      return [...recent, ...QUICK_ACTIONS];
    }

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Match actions first
    QUICK_ACTIONS.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)) {
        matches.push({ ...a, score: a.title.toLowerCase().startsWith(q) ? 12 : 8 });
      }
    });

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

    return matches.sort((a, b) => b.score - a.score).slice(0, 15);
  }, [query, contacts, companies, opportunities]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigateTo(result.path);
    onClose();
  }, [navigateTo, onClose]);

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

  const typeColors: Record<string, string> = {
    contact: "text-primary",
    company: "text-blue-400",
    deal: "text-emerald-400",
    action: "text-amber-400",
  };
  const typeBgs: Record<string, string> = {
    contact: "bg-primary/10 text-primary",
    company: "bg-blue-500/10 text-blue-400",
    deal: "bg-emerald-500/10 text-emerald-400",
    action: "bg-amber-500/10 text-amber-400",
  };

  // Group results by type for empty query
  const hasActions = results.some(r => r.type === "action");
  const hasRecords = results.some(r => r.type !== "action");

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
            placeholder="Search contacts, companies, deals or type a command..."
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
              {!query.trim() && hasRecords && (
                <p className="px-4 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Recent</p>
              )}
              {results.filter(r => r.type !== "action").map((result, i) => {
                const globalIdx = results.indexOf(result);
                const Icon = result.icon;
                const color = typeColors[result.type];
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selectedIndex === globalIdx ? "bg-primary/10" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${typeBgs[result.type]}`}>{result.type}</span>
                    {selectedIndex === globalIdx && <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}

              {hasActions && (
                <>
                  {!query.trim() && <p className="px-4 py-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1">Quick Actions</p>}
                  {results.filter(r => r.type === "action").map((result) => {
                    const globalIdx = results.indexOf(result);
                    const Icon = result.icon;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                          selectedIndex === globalIdx ? "bg-primary/10" : "hover:bg-muted/30"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400">action</span>
                        {selectedIndex === globalIdx && <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </>
              )}
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
