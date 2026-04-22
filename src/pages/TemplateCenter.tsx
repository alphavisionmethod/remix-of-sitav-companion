import { useState } from "react";
import { SitaPageHeader, SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { EmptyState, SitaTabs } from "@/components/sita/SitaComponents";
import { motion } from "framer-motion";
import { Layout, FileText, DollarSign, Briefcase, Users, Home, CheckSquare, Repeat, Mail, BarChart3, Plus, ChevronRight, Copy, Star, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
import { PageShell } from "@/components/sita/PageShell";

interface Template { id: string; title: string; description: string; category: string; domain: string; usageCount: number; starred: boolean; }

const TEMPLATES: Template[] = [
  { id: "1", title: "Client Proposal", description: "Professional proposal with scope, timeline, and pricing sections", category: "Documents", domain: "business", usageCount: 12, starred: true },
  { id: "2", title: "Invoice Template", description: "Standard invoice with line items, tax, and payment terms", category: "Finance", domain: "finance", usageCount: 28, starred: true },
  { id: "3", title: "Meeting Notes", description: "Structured meeting notes with attendees, decisions, and action items", category: "Notes", domain: "business", usageCount: 15, starred: false },
  { id: "4", title: "Weekly Review", description: "Personal weekly review with wins, challenges, and next week planning", category: "Planning", domain: "personal", usageCount: 8, starred: false },
  { id: "5", title: "Client Onboarding", description: "Step-by-step client onboarding workflow checklist", category: "Workflows", domain: "business", usageCount: 6, starred: false },
  { id: "6", title: "Quarterly Business Review", description: "Boardroom-ready quarterly review document", category: "Reports", domain: "business", usageCount: 4, starred: true },
  { id: "7", title: "Household Budget", description: "Monthly household budget tracker with categories", category: "Finance", domain: "household", usageCount: 10, starred: false },
  { id: "8", title: "Follow-up Email", description: "Professional follow-up email after meeting or proposal", category: "Communications", domain: "business", usageCount: 22, starred: false },
];

const DOMAIN_COLORS: Record<string, string> = { business: "text-primary", finance: "text-emerald-400", personal: "text-violet-400", household: "text-amber-400" };
const DOMAIN_ICONS: Record<string, React.ElementType> = { business: Briefcase, finance: DollarSign, personal: Users, household: Home };

const TemplateCenter = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const categories = [...new Set(TEMPLATES.map(t => t.category))];

  const filtered = TEMPLATES.filter(t => {
    if (category !== "all" && t.category !== category) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageShell>
    <div className="min-h-screen pb-12">
<SitaPageHeader title="Template Center" subtitle="Reusable structures for documents, workflows, and communications" actions={
        <Button size="sm" variant="outline" className="gap-1.5 text-xs border-border/50"><Plus className="w-3.5 h-3.5" /> Create Template</Button>
      } />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-card/30" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setCategory("all")} className={cn("px-2 py-1 text-xs rounded-md transition-colors", category === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={cn("px-2 py-1 text-xs rounded-md transition-colors", category === c ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-accent/30")}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(template => {
          const DomainIcon = DOMAIN_ICONS[template.domain] || FileText;
          return (
            <motion.div key={template.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <SitaCard className="p-4 h-full" hover>
                <div className="flex items-start justify-between mb-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-card/50", DOMAIN_COLORS[template.domain])}>
                    <DomainIcon className="w-4 h-4" />
                  </div>
                  {template.starred && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                <h3 className="text-sm font-semibold mb-1">{template.title}</h3>
                <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 border-border/20">{template.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{template.usageCount} uses</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs gap-1 h-7"><Copy className="w-3 h-3" /> Use</Button>
                </div>
              </SitaCard>
            </motion.div>
          );
        })}
      </div>
    </div>
    </PageShell>
  );
};

export default TemplateCenter;
