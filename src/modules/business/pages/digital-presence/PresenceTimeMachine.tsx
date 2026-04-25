import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { motion } from "framer-motion";
import { Clock, ArrowLeft, ArrowRight, Eye, TrendingUp, TrendingDown, Sparkles, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import DPOSubNav from "./DPOSubNav";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
const TIMELINE_EVENTS: any[] = [];
export default function PresenceTimeMachine() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = TIMELINE_EVENTS[selectedIdx];

  return (
    <PageShell width="wide">
      <DPOSubNav />
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
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIdx(Math.min(([] as any[]).length - 1, selectedIdx + 1))} disabled={selectedIdx === ([] as any[]).length - 1}><ArrowRight className="w-3 h-3" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {([] as any[]).map((e, i) => (
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
    </PageShell>
  );
}
