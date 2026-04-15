import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import type { Explanation } from "@/lib/services/explainability/index";

interface ExplainabilityDrawerProps {
  open: boolean;
  onClose: () => void;
  explanation: Explanation | null;
  onFeedback?: (id: string, feedback: "helpful" | "not_helpful") => void;
}

const TYPE_COLORS: Record<string, string> = {
  decision: "text-sita-purple border-sita-purple/30",
  trust_score: "text-emerald-400 border-emerald-400/30",
  automation: "text-blue-400 border-blue-400/30",
  block: "text-red-400 border-red-400/30",
  recommendation: "text-sita-gold border-sita-gold/30",
  mode_change: "text-amber-400 border-amber-400/30",
  safety_gate: "text-orange-400 border-orange-400/30",
};

export default function ExplainabilityDrawer({ open, onClose, explanation, onFeedback }: ExplainabilityDrawerProps) {
  const [showFullChain, setShowFullChain] = useState(false);

  if (!explanation) return null;

  const typeColor = TYPE_COLORS[explanation.type] ?? "text-muted-foreground border-white/[0.06]";

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="bg-background/95 backdrop-blur-xl border-white/[0.06] w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Info className="h-5 w-5 text-sita-purple" />
            Why?
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-2">
          <div className="space-y-5">
            {/* Type & Confidence */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`capitalize ${typeColor}`}>
                {explanation.type.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {Math.round(explanation.confidence * 100)}% confident
              </Badge>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{explanation.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{explanation.summary}</p>
            </div>

            {/* Reasoning Chain */}
            <div className="space-y-2">
              <button
                onClick={() => setShowFullChain(!showFullChain)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-sita-purple transition-colors"
              >
                Reasoning Chain
                {showFullChain ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <div className="pl-3 border-l-2 border-sita-purple/30 space-y-2">
                {(showFullChain ? explanation.reasoningChain : explanation.reasoningChain.slice(0, 3)).map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-sita-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-sita-purple font-mono">{i + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            {explanation.sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Sources</p>
                {explanation.sources.map((src, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-sita-purple">{src.system}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(src.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{src.component}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Alternatives */}
            {explanation.alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Alternatives</p>
                <div className="space-y-1">
                  {explanation.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{alt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-sm text-muted-foreground mb-3">Was this explanation helpful?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={explanation.feedbackGiven === "helpful" ? "default" : "outline"}
                  className={explanation.feedbackGiven === "helpful" ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30" : ""}
                  onClick={() => onFeedback?.(explanation.id, "helpful")}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                </Button>
                <Button
                  size="sm"
                  variant={explanation.feedbackGiven === "not_helpful" ? "default" : "outline"}
                  className={explanation.feedbackGiven === "not_helpful" ? "bg-red-500/20 text-red-400 border-red-400/30" : ""}
                  onClick={() => onFeedback?.(explanation.id, "not_helpful")}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Not helpful
                </Button>
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">
              Generated: {new Date(explanation.timestamp).toLocaleString()}
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
