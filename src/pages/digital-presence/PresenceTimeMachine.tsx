import { motion } from "framer-motion";
import { Clock, ArrowLeft, ArrowRight, Eye, TrendingUp, TrendingDown, Sparkles, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const TIMELINE_EVENTS = [
  { date: "Apr 3", event: "Homepage hero redesign", type: "design", impact: "+18% CTR", positive: true, details: "New value prop + hero image. CRO Advisor recommended duplicating CTA." },
  { date: "Apr 1", event: "Added checkout trust badges", type: "trust", impact: "-8% abandonment", positive: true, details: "SSL + payment badges added near CTA. Advisor-generated recommendation." },
  { date: "Mar 28", event: "Summer sale banner deployed", type: "promotion", impact: "+12% revenue", positive: true, details: "Homepage hero banner for 20% off sale. Auto-cleanup scheduled for Apr 11." },
  { date: "Mar 25", event: "Blog content refresh (5 posts)", type: "content", impact: "+22% organic traffic", positive: true, details: "Content Strategist flagged 5 stale posts. Updated with current data." },
  { date: "Mar 20", event: "Contact form reduced to 4 fields", type: "cro", impact: "-15% form abandon", positive: true, details: "CRO Advisor recommendation. Removed company, title, budget fields." },
  { date: "Mar 15", event: "Mobile nav redesign", type: "design", impact: "-3% mobile time", positive: false, details: "New hamburger menu. Some users struggle with nested items. Under review." },
  { date: "Mar 10", event: "Product page A/B test launched", type: "experiment", impact: "Running", positive: true, details: "Testing larger images vs current layout. 60% through test." },
  { date: "Mar 5", event: "WordPress security patches", type: "maintenance", impact: "3 CVEs fixed", positive: true, details: "Auto-fix applied by Technical QA advisor. No downtime." },
];

export default function PresenceTimeMachine() {
  const { isDemoMode } = useDataMode();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = TIMELINE_EVENTS[selectedIdx];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DemoModeBadge />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Digital Presence Time Machine</h1>
        <p className="text-sm text-muted-foreground">Replay changes, review impact & see what advisors recommended</p>
      </motion.div>

      {/* Timeline */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-sky-400" /> Change Timeline</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))} disabled={selectedIdx === 0}><ArrowLeft className="w-3 h-3" /></Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIdx(Math.min(TIMELINE_EVENTS.length - 1, selectedIdx + 1))} disabled={selectedIdx === TIMELINE_EVENTS.length - 1}><ArrowRight className="w-3 h-3" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {TIMELINE_EVENTS.map((e, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${i === selectedIdx ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/30"}`}
            >
              <span className="text-[10px] font-mono text-muted-foreground w-12">{e.date}</span>
              <span className="text-xs text-foreground flex-1">{e.event}</span>
              <Badge variant={e.type === "design" ? "default" : e.type === "promotion" ? "secondary" : "secondary"} className="text-[10px]">{e.type}</Badge>
              <span className={`text-[10px] font-medium ${e.positive ? "text-green-400" : "text-red-400"}`}>
                {e.positive ? <TrendingUp className="w-3 h-3 inline mr-0.5" /> : <TrendingDown className="w-3 h-3 inline mr-0.5" />}
                {e.impact}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Detail */}
      <motion.div key={selectedIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/50 border-border/50 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{selected.event}</h3>
                <p className="text-[10px] text-muted-foreground">{selected.date} · {selected.type}</p>
              </div>
              <Badge variant={selected.positive ? "default" : "destructive"} className="ml-auto">
                {selected.positive ? "Positive Impact" : "Needs Review"}
              </Badge>
            </div>
            <p className="text-sm text-foreground">{selected.details}</p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant="secondary" className="text-[10px]">Impact: {selected.impact}</Badge>
              <Button variant="outline" size="sm" className="h-7 text-xs"><Eye className="w-3 h-3 mr-1" /> Preview Before/After</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
