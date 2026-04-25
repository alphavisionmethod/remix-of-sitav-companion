// ═══════════════════════════════════════════════════════════════
// SITA OS — Knowledge & Memory System (FCC12)
// Platform memory, past incidents, repair patterns, architecture
// decisions, code ownership, escalation history
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/platform/sita/components/sita/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Search, Brain, History, Wrench, GitBranch, AlertTriangle,
  CheckCircle2, ChevronRight, FileText, Lightbulb, Database, Clock,
  Users, Zap, Shield, Code, MapPin, TrendingUp, Archive, Tag
} from "lucide-react";

// ── Knowledge Types ──
interface KnowledgeEntry {
  id: string;
  title: string;
  category: "incident" | "repair" | "architecture" | "ownership" | "pattern" | "decision" | "runbook";
  domain: string;
  content: string;
  tags: string[];
  confidence: number;
  source: string;
  learnedAt: string;
  usedCount: number;
  lastUsed: string | null;
}

const CATEGORY_CONFIG = {
  incident: { icon: AlertTriangle, color: "text-destructive", label: "Incident" },
  repair: { icon: Wrench, color: "text-sita-gold", label: "Repair Pattern" },
  architecture: { icon: GitBranch, color: "text-primary", label: "Architecture Decision" },
  ownership: { icon: Users, color: "text-trust-safe", label: "Code Ownership" },
  pattern: { icon: Lightbulb, color: "text-sita-gold", label: "Known Pattern" },
  decision: { icon: CheckCircle2, color: "text-primary", label: "Decision Record" },
  runbook: { icon: BookOpen, color: "text-trust-safe", label: "Runbook" },
};

const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: "k1", title: "Sync retry storm resolution pattern", category: "repair", domain: "sync",
    content: "When sync retry storms occur due to server-side timeouts, apply exponential backoff with jitter. Pattern: base delay 2s, multiplier 2x, max 32s, jitter ±500ms. Always check if the root cause is server timeout vs client error before applying.",
    tags: ["sync", "retry", "performance", "reliability"], confidence: 0.95, source: "Incident INC-001 postmortem",
    learnedAt: "2026-03-28", usedCount: 3, lastUsed: "2026-04-14",
  },
  {
    id: "k2", title: "Upload finalization timeout calibration", category: "incident", domain: "storage",
    content: "Upload finalization handlers must use dynamic timeouts based on file size: <10MB → 30s, 10-100MB → 60s, >100MB → 120s. Static timeouts cause failures for large files on slow connections. Discovered during INC-001.",
    tags: ["upload", "timeout", "storage", "large-files"], confidence: 0.92, source: "Incident INC-001",
    learnedAt: "2026-04-14", usedCount: 1, lastUsed: "2026-04-14",
  },
  {
    id: "k3", title: "Auth connection pool sizing", category: "pattern", domain: "auth",
    content: "Auth service connection pool should be sized at 2.5x peak concurrent auth requests. Default 20 connections saturates at ~800 concurrent logins. Scale formula: pool = ceil(peak_concurrent / 8).",
    tags: ["auth", "database", "connection-pool", "scaling"], confidence: 0.88, source: "Performance analysis Q1 2026",
    learnedAt: "2026-02-15", usedCount: 5, lastUsed: "2026-04-15",
  },
  {
    id: "k4", title: "Trust classifier model update protocol", category: "decision", domain: "trust",
    content: "Trust classifier model updates require: (1) 7-day shadow mode with comparison metrics, (2) false positive rate delta < 2%, (3) false negative rate delta < 0.5%, (4) dual approval from Security Engineer + Founder, (5) staged rollout: 5% → 25% → 50% → 100%.",
    tags: ["trust", "ml-model", "rollout", "security"], confidence: 0.97, source: "Architecture Decision Record ADR-042",
    learnedAt: "2026-01-20", usedCount: 2, lastUsed: "2026-04-14",
  },
  {
    id: "k5", title: "Sync service code ownership", category: "ownership", domain: "sync",
    content: "sync-service (src/lib/services/sync/): owned by Platform Team. sync-client (src/lib/sync-client/): owned by Client Team. sync-queue-worker: owned by Platform Team. Changes crossing boundaries require joint review.",
    tags: ["sync", "ownership", "team-boundary"], confidence: 1.0, source: "Service Ownership Manifest",
    learnedAt: "2026-01-01", usedCount: 12, lastUsed: "2026-04-13",
  },
  {
    id: "k6", title: "Database migration safety checklist", category: "runbook", domain: "data",
    content: "Before any migration: (1) backup verified, (2) migration tested on staging with production-like data, (3) rollback script prepared and tested, (4) zero-downtime strategy confirmed (add column → backfill → swap), (5) monitoring alert thresholds adjusted, (6) maintenance window if destructive.",
    tags: ["database", "migration", "safety", "checklist"], confidence: 0.98, source: "Engineering Standards v3",
    learnedAt: "2025-12-01", usedCount: 8, lastUsed: "2026-04-10",
  },
  {
    id: "k7", title: "Feature flag cleanup protocol", category: "decision", domain: "config",
    content: "Feature flags must be cleaned up within 14 days of reaching 100% rollout. Stale flags (>30 days at 100%) are auto-flagged for removal. Kill-switch flags are exempt from auto-cleanup but require annual review.",
    tags: ["feature-flags", "cleanup", "hygiene"], confidence: 0.9, source: "Architecture Decision Record ADR-035",
    learnedAt: "2025-11-15", usedCount: 6, lastUsed: "2026-04-08",
  },
  {
    id: "k8", title: "AI gateway fallback chain pattern", category: "architecture", domain: "ai",
    content: "AI gateway must implement 3-deep fallback chains: (1) Primary model per task class, (2) Fallback model (same provider, lower tier), (3) Cross-provider fallback. Each step has independent timeout: primary 30s, fallback-1 20s, fallback-2 15s. Total latency budget: 60s.",
    tags: ["ai-gateway", "fallback", "resilience", "architecture"], confidence: 0.93, source: "Architecture Decision Record ADR-048",
    learnedAt: "2026-02-28", usedCount: 4, lastUsed: "2026-04-12",
  },
  {
    id: "k9", title: "Platform-wide weak points map", category: "pattern", domain: "platform",
    content: "Known weak points: (1) Sync conflict resolution under high concurrency — merge conflicts may cause data loss if >10 concurrent edits, (2) Auth session refresh race condition under poor network, (3) Storage quota calculation drift over time — recalculation job needed weekly, (4) Trust scoring cold-start for new accounts.",
    tags: ["weak-points", "known-issues", "risk"], confidence: 0.85, source: "Platform Health Review Q1 2026",
    learnedAt: "2026-03-31", usedCount: 7, lastUsed: "2026-04-15",
  },
  {
    id: "k10", title: "Escalation history: production deploy failures", category: "incident", domain: "deployment",
    content: "3 production deploy failures in Q1 2026: (1) v2.12.0 — broken migration rollback, 45 min outage. (2) v2.13.1 — config key typo, 15 min. (3) v2.14.2 — upload timeout regression, 2.5h degradation. Common thread: insufficient pre-deploy integration testing for edge cases.",
    tags: ["deployment", "failures", "escalation", "q1-2026"], confidence: 0.95, source: "Quarterly Incident Summary",
    learnedAt: "2026-04-01", usedCount: 3, lastUsed: "2026-04-14",
  },
];

export default function FCC12KnowledgeMemorySystem() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);

  const filtered = KNOWLEDGE_ENTRIES.filter(e => {
    const matchesSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.content.toLowerCase().includes(searchQuery.toLowerCase()) || e.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = Object.keys(CATEGORY_CONFIG).map(cat => ({
    key: cat,
    ...CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG],
    count: KNOWLEDGE_ENTRIES.filter(e => e.category === cat).length,
  }));

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        icon={Brain}
        title="Knowledge & Memory System"
        subtitle="Platform memory — past incidents, repair patterns, architecture decisions, and learned behaviors"
        accent="primary"
      />

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {categoryCounts.map((cat, i) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <motion.div key={cat.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                onClick={() => setSelectedCategory(isActive ? null : cat.key)}
                className={`cursor-pointer transition-all border ${isActive ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
              >
                <CardContent className="p-3 text-center">
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${cat.color}`} />
                  <p className="text-lg font-bold">{cat.count}</p>
                  <p className="text-[9px] text-muted-foreground">{cat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge base — incidents, patterns, decisions, runbooks..."
          className="pl-10 bg-white/[0.02] border-white/10"
        />
      </div>

      {/* Knowledge List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((entry, i) => {
            const catCfg = CATEGORY_CONFIG[entry.category];
            const CatIcon = catCfg.icon;
            const isSelected = selectedEntry?.id === entry.id;
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  onClick={() => setSelectedEntry(entry)}
                  className={`cursor-pointer transition-all border ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <CatIcon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${catCfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{entry.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{catCfg.label}</Badge>
                          <Badge variant="outline" className="text-[9px]">{entry.domain}</Badge>
                          <span className="text-[10px] text-muted-foreground ml-auto">×{entry.usedCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No entries match your search</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedEntry ? (
            <motion.div key={selectedEntry.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="border-white/10 bg-white/[0.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {(() => { const Ic = CATEGORY_CONFIG[selectedEntry.category].icon; return <Ic className={`h-5 w-5 ${CATEGORY_CONFIG[selectedEntry.category].color}`} />; })()}
                    <CardTitle className="text-base">{selectedEntry.title}</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-[9px]">{CATEGORY_CONFIG[selectedEntry.category].label}</Badge>
                    <Badge variant="outline" className="text-[9px]">{selectedEntry.domain}</Badge>
                    <Badge variant="outline" className="text-[9px]">Confidence: {Math.round(selectedEntry.confidence * 100)}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content */}
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground">Source</p>
                      <p className="text-xs font-medium">{selectedEntry.source}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground">Learned</p>
                      <p className="text-xs font-medium">{selectedEntry.learnedAt}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground">Used</p>
                      <p className="text-xs font-medium">{selectedEntry.usedCount} times</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted-foreground">Last Used</p>
                      <p className="text-xs font-medium">{selectedEntry.lastUsed || "Never"}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[9px] gap-1">
                          <Tag className="h-2.5 w-2.5" />{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Lightbulb className="h-3.5 w-3.5" /> Find Related</Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><History className="h-3.5 w-3.5" /> View History</Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Archive className="h-3.5 w-3.5" /> Archive</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-white/10 bg-white/[0.02]">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium mb-1">Platform Knowledge Base</p>
                <p className="text-xs">Select an entry to view full details, or search for specific knowledge</p>
                <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto text-left">
                  {[
                    { icon: Wrench, text: "Repair patterns speed up diagnosis", color: "text-sita-gold" },
                    { icon: AlertTriangle, text: "Past incidents prevent repeated mistakes", color: "text-destructive" },
                    { icon: GitBranch, text: "Architecture decisions guide consistency", color: "text-primary" },
                    { icon: Shield, text: "Security patterns enforce safety", color: "text-trust-safe" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${item.color}`} />
                        <span className="text-[10px]">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
