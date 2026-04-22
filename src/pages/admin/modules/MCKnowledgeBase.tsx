import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, Search, FileText, AlertTriangle, Wrench, Lightbulb,
  Bug, Rocket, Shield, ChevronRight, Clock, Eye, Link2, Brain,
  Plus, Filter, Tag, Star, Archive, ExternalLink
} from "lucide-react";
import { useDataMode } from "@/contexts/DataModeContext";

type DocCategory = "all" | "architecture" | "runbook" | "incident" | "pattern" | "policy" | "release";

interface KBArticle {
  id: string;
  title: string;
  category: DocCategory;
  summary: string;
  tags: string[];
  lastUpdated: string;
  linkedIncidents: number;
  linkedReleases: number;
  confidence: number;
  source: "human" | "ai" | "auto";
}

const DEMO_ARTICLES: KBArticle[] = [
  { id: "1", title: "Sync Retry Policy — Exponential Backoff with Jitter", category: "architecture", summary: "Canonical retry policy for all sync operations. Includes idempotency requirements and circuit breaker thresholds.", tags: ["sync", "retry", "reliability"], lastUpdated: "2 hours ago", linkedIncidents: 3, linkedReleases: 2, confidence: 95, source: "human" },
  { id: "2", title: "Runbook: Sync Storm Recovery", category: "runbook", summary: "Step-by-step guide for recovering from sync retry storms. Includes queue drain procedure and client throttle activation.", tags: ["sync", "incident", "recovery"], lastUpdated: "1 day ago", linkedIncidents: 5, linkedReleases: 0, confidence: 92, source: "human" },
  { id: "3", title: "Incident Lesson: Storage Finalization Race Condition", category: "incident", summary: "Root cause analysis of the Jan 2026 storage finalization failures. Race condition in blob commit path under concurrent uploads.", tags: ["storage", "race-condition", "postmortem"], lastUpdated: "3 days ago", linkedIncidents: 1, linkedReleases: 1, confidence: 88, source: "human" },
  { id: "4", title: "Pattern: Trust False Positive Reduction", category: "pattern", summary: "Proven approach to reducing trust prompt false positives by 40% through cohort-based threshold tuning.", tags: ["trust", "UX", "optimization"], lastUpdated: "1 week ago", linkedIncidents: 0, linkedReleases: 3, confidence: 85, source: "ai" },
  { id: "5", title: "Policy Rationale: Canary Rollout 10-25-50-100", category: "policy", summary: "Why we use the 10-25-50-100 staged rollout pattern. Evidence from 3 incidents where faster rollouts caused regressions.", tags: ["release", "policy", "canary"], lastUpdated: "2 weeks ago", linkedIncidents: 3, linkedReleases: 8, confidence: 97, source: "human" },
  { id: "6", title: "AI Memory: Budget Model Performance Boundaries", category: "pattern", summary: "Documented boundaries where budget AI models produce unacceptable quality. Used by AI router to prevent degraded outputs.", tags: ["AI", "cost", "quality"], lastUpdated: "5 days ago", linkedIncidents: 0, linkedReleases: 0, confidence: 78, source: "ai" },
  { id: "7", title: "Release Lesson: Desktop v3.2 Battery Regression", category: "release", summary: "Post-release analysis of battery drain caused by aggressive background sync. Led to adaptive sync frequency based on power state.", tags: ["release", "battery", "desktop"], lastUpdated: "1 month ago", linkedIncidents: 1, linkedReleases: 2, confidence: 94, source: "human" },
  { id: "8", title: "Architecture: Auth Token Refresh Flow", category: "architecture", summary: "Canonical flow for auth token refresh across web, desktop, and mobile clients. Includes edge cases for offline-first scenarios.", tags: ["auth", "tokens", "security"], lastUpdated: "2 weeks ago", linkedIncidents: 2, linkedReleases: 1, confidence: 96, source: "human" },
];

const CATEGORY_CONFIG: Record<DocCategory, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: "All", icon: BookOpen, color: "text-foreground" },
  architecture: { label: "Architecture", icon: FileText, color: "text-blue-400" },
  runbook: { label: "Runbooks", icon: Wrench, color: "text-emerald-400" },
  incident: { label: "Incident Lessons", icon: AlertTriangle, color: "text-amber-400" },
  pattern: { label: "Patterns", icon: Lightbulb, color: "text-purple-400" },
  policy: { label: "Policy Rationale", icon: Shield, color: "text-cyan-400" },
  release: { label: "Release Lessons", icon: Rocket, color: "text-green-400" },
};

const SOURCE_BADGE: Record<string, { label: string; style: string }> = {
  human: { label: "Human", style: "text-blue-400 border-blue-500/20" },
  ai: { label: "AI-Generated", style: "text-purple-400 border-purple-500/20" },
  auto: { label: "Auto-Detected", style: "text-amber-400 border-amber-500/20" },
};

export default function MCKnowledgeBase() {
  const { isDemoMode } = useDataMode();
  const { isDemo } = useAuth();
  const isDemoMode = isDemo;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DocCategory>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const articles = DEMO_ARTICLES;
  const filtered = useMemo(() => {
    return articles.filter(a => {
      if (category !== "all" && a.category !== category) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.summary.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [articles, category, search]);

  const selected = articles.find(a => a.id === selectedId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" /> Knowledge Base
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Living memory — architecture docs, runbooks, incident lessons, and AI prevention rules</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Article</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Articles", value: articles.length, icon: BookOpen, color: "text-foreground" },
          { label: "Runbooks", value: articles.filter(a => a.category === "runbook").length, icon: Wrench, color: "text-emerald-400" },
          { label: "Incident Lessons", value: articles.filter(a => a.category === "incident").length, icon: AlertTriangle, color: "text-amber-400" },
          { label: "AI-Generated", value: articles.filter(a => a.source === "ai").length, icon: Brain, color: "text-purple-400" },
          { label: "Avg Confidence", value: `${Math.round(articles.reduce((s, a) => s + a.confidence, 0) / articles.length)}%`, icon: Star, color: "text-cyan-400" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-border/30 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1"><kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} /><span className="text-[10px] text-muted-foreground">{kpi.label}</span></div>
            <p className="text-lg font-display font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Search & categories */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, runbooks, patterns..." className="pl-9 bg-white/[0.03] border-white/[0.06]" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {(Object.entries(CATEGORY_CONFIG) as [DocCategory, typeof CATEGORY_CONFIG["all"]][]).map(([key, cfg]) => (
            <button key={key} onClick={() => setCategory(key)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border", category === key ? "bg-primary/15 text-primary border-primary/30" : "bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]")}>{cfg.label}</button>
          ))}
        </div>
      </div>

      {/* List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((article, i) => {
              const catCfg = CATEGORY_CONFIG[article.category]; const CatIcon = catCfg.icon;
              return (
                <motion.div key={article.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setSelectedId(article.id)}
                  className={cn("rounded-xl border p-4 cursor-pointer transition-all", selectedId === article.id ? "bg-white/[0.05] border-primary/30 ring-1 ring-primary/10" : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]")}>
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-lg p-1.5 bg-white/[0.04] shrink-0", catCfg.color)}><CatIcon className="h-3.5 w-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground truncate">{article.title}</h4>
                        <Badge variant="outline" className={cn("text-[8px] px-1", SOURCE_BADGE[article.source].style)}>{SOURCE_BADGE[article.source].label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.summary}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.lastUpdated}</span>
                        {article.linkedIncidents > 0 && <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{article.linkedIncidents} incidents</span>}
                        {article.linkedReleases > 0 && <span className="flex items-center gap-1"><Rocket className="h-3 w-3" />{article.linkedReleases} releases</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No articles match your search.</div>}
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border/30 bg-white/[0.02] p-5 sticky top-6 space-y-4">
              <div><Badge variant="outline" className={cn("text-[9px] mb-2", CATEGORY_CONFIG[selected.category].color)}>{CATEGORY_CONFIG[selected.category].label}</Badge><h3 className="text-base font-semibold text-foreground">{selected.title}</h3></div>
              <p className="text-sm text-muted-foreground">{selected.summary}</p>
              <div className="space-y-2"><div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Confidence</span><span className="font-medium text-foreground">{selected.confidence}%</span></div><div className="w-full h-1.5 rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-primary" style={{ width: `${selected.confidence}%` }} /></div></div>
              <div className="flex flex-wrap gap-1.5">{selected.tags.map(tag => (<span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-muted-foreground border border-white/[0.06]"><Tag className="inline h-2.5 w-2.5 mr-0.5" />{tag}</span>))}</div>
              <div className="flex gap-2 pt-2"><Button size="sm" variant="outline" className="gap-1 text-xs flex-1"><Eye className="h-3 w-3" />View Full</Button><Button size="sm" variant="outline" className="gap-1 text-xs flex-1"><Link2 className="h-3 w-3" />Linked Items</Button></div>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/30 bg-white/[0.01] p-8 text-center"><BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Select an article to view details</p></div>
          )}
        </div>
      </div>
    </div>
  );
}