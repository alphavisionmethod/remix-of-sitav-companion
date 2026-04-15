import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, FileText, AlertTriangle, Zap, Link2, Brain, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const ARTICLES = [
  { id: "kb1", title: "Sync Architecture Overview", category: "Architecture", tags: ["sync", "core"], linkedIncidents: 2, lastUpdated: "3d ago" },
  { id: "kb2", title: "Runbook: Elevated Sync Failure Rate", category: "Runbook", tags: ["sync", "incident"], linkedIncidents: 5, lastUpdated: "1d ago" },
  { id: "kb3", title: "AI Budget Governance Policies", category: "Policy", tags: ["ai", "cost"], linkedIncidents: 0, lastUpdated: "1w ago" },
  { id: "kb4", title: "Root Cause: Upload Finalization Timeout", category: "Bug/Fix", tags: ["storage", "sync"], linkedIncidents: 3, lastUpdated: "2d ago" },
  { id: "kb5", title: "Release Rollback Procedure", category: "Runbook", tags: ["release", "rollback"], linkedIncidents: 1, lastUpdated: "5d ago" },
  { id: "kb6", title: "Trust Prompt Calibration Guide", category: "Policy", tags: ["trust", "ux"], linkedIncidents: 0, lastUpdated: "1w ago" },
  { id: "kb7", title: "Device Trust Verification Flow", category: "Architecture", tags: ["trust", "devices"], linkedIncidents: 0, lastUpdated: "2w ago" },
  { id: "kb8", title: "Incident Lessons: Storage Latency Spike 2024-03", category: "Lessons", tags: ["storage", "incident"], linkedIncidents: 1, lastUpdated: "3w ago" },
];

const categoryColor: Record<string, string> = {
  Architecture: "text-primary border-primary/20",
  Runbook: "text-amber-400 border-amber-500/20",
  Policy: "text-emerald-400 border-emerald-500/20",
  "Bug/Fix": "text-red-400 border-red-500/20",
  Lessons: "text-blue-400 border-blue-500/20",
};

const MCKnowledgeBase = () => {
  const { isDemo } = useAuth();
  const [search, setSearch] = useState("");
  const filtered = ARTICLES.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some(t => t.includes(search.toLowerCase())));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">Architecture docs, runbooks, incident lessons, and AI-assisted retrieval</p>
        </div>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search knowledge base…" className="pl-9 h-9" />
          </div>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card>
            <CardContent className="p-0">
              {filtered.map((article, i) => (
                <div key={article.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors group ${i < filtered.length - 1 ? "border-b border-border/10" : ""}`}>
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground">{article.title}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 ${categoryColor[article.category] || ""}`}>{article.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      {article.tags.map(t => <span key={t}>#{t}</span>)}
                      {article.linkedIncidents > 0 && <span className="flex items-center gap-0.5"><Link2 className="h-2.5 w-2.5" /> {article.linkedIncidents} incidents</span>}
                      <span>Updated: {article.lastUpdated}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default MCKnowledgeBase;
