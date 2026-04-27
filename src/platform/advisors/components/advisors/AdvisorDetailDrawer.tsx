import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdvisorPortrait } from "@/platform/advisors/components/advisors/AdvisorPortrait";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { AdvisorKnowledgePanel } from "@/platform/advisors/components/advisors/AdvisorKnowledgePanel";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, History, MessageSquare, ThumbsUp, ThumbsDown, Star, Sparkles, Upload, Trash2, RefreshCw, ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AdvisorConfig } from "./AdvisorCouncilShell";
import { useAdvisorPortraits } from "@/platform/advisors/hooks/use-advisor-portraits";
import { toast } from "sonner";

interface AdvisorDetailDrawerProps {
  advisor: AdvisorConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvisorDetailDrawer = ({ advisor, open, onOpenChange }: AdvisorDetailDrawerProps) => {
  if (!advisor) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <AdvisorPortrait domain={advisor.domain} name={advisor.name} status={advisor.status} size="lg" />
            <div>
              <SheetTitle className="text-base">{advisor.name}</SheetTitle>
              <SheetDescription className="text-xs">{advisor.role}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="w-full bg-muted/50 text-[11px]">
            <TabsTrigger value="overview" className="text-[11px] gap-1"><Brain className="h-3 w-3" />Overview</TabsTrigger>
            <TabsTrigger value="portrait" className="text-[11px] gap-1"><ImageIcon className="h-3 w-3" />Portrait</TabsTrigger>
            <TabsTrigger value="knowledge" className="text-[11px] gap-1"><BookOpen className="h-3 w-3" />Knowledge</TabsTrigger>
            <TabsTrigger value="memory" className="text-[11px] gap-1"><History className="h-3 w-3" />Memory</TabsTrigger>
            <TabsTrigger value="feedback" className="text-[11px] gap-1"><MessageSquare className="h-3 w-3" />Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab advisor={advisor} />
          </TabsContent>
          <TabsContent value="portrait">
            <PortraitTab advisor={advisor} />
          </TabsContent>
          <TabsContent value="knowledge">
            <div className="mt-3">
              <AdvisorKnowledgePanel advisorId={advisor.advisorId || advisor.domain} domain={advisor.domain} />
            </div>
          </TabsContent>
          <TabsContent value="memory">
            <MemoryTab advisor={advisor} />
          </TabsContent>
          <TabsContent value="feedback">
            <FeedbackTab advisor={advisor} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

/* ── Overview ── */
const OverviewTab = ({ advisor }: { advisor: AdvisorConfig }) => (
  <div className="space-y-5 mt-4">
    {/* Confidence Gauge */}
    <div className="flex flex-col items-center gap-3 py-4">
      <ConfidenceGauge value={advisor.confidence} />
      <p className="text-sm font-semibold text-foreground">{advisor.confidence}% Confidence</p>
    </div>

    {/* Mission */}
    {advisor.mission && (
      <div className="rounded-lg bg-muted/30 p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mission</p>
        <p className="text-xs text-foreground leading-relaxed">{advisor.mission}</p>
      </div>
    )}

    {/* Special Ability */}
    {advisor.specialAbility && (
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Special Ability</p>
        </div>
        <p className="text-xs text-foreground">{advisor.specialAbility}</p>
      </div>
    )}

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Status" value={advisor.status} />
      <StatCard label="Domain" value={advisor.domain} />
    </div>
  </div>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-muted/30 p-3">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-sm font-semibold text-foreground capitalize mt-0.5">{value}</p>
  </div>
);

/* ── Portrait Tab ── */
const PortraitTab = ({ advisor }: { advisor: AdvisorConfig }) => {
  const { getPortraitUrl, uploadPortrait, removePortrait, uploading } = useAdvisorPortraits();
  const advisorId = advisor.advisorId || advisor.domain;
  const customUrl = getPortraitUrl(advisorId);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      await uploadPortrait(advisorId, file);
    };
    input.click();
  };

  const handleRemove = async () => {
    await removePortrait(advisorId);
  };

  return (
    <div className="space-y-5 mt-4">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <AdvisorPortrait
            domain={advisor.domain}
            name={advisor.name}
            avatarUrl={customUrl || undefined}
            status={advisor.status}
            size="xl"
          />
          {customUrl && (
            <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              Custom
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{advisor.name}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {customUrl ? "Custom portrait active" : "Using default portrait"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs gap-2"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {customUrl ? "Replace Portrait" : "Upload Custom Portrait"}
        </Button>

        {customUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs gap-2 text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <Trash2 className="h-3 w-3" />
            Remove Custom Portrait
          </Button>
        )}
      </div>

      {/* Guidelines */}
      <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Portrait Guidelines</p>
        <ul className="text-[10px] text-muted-foreground/80 space-y-1 list-disc list-inside">
          <li>PNG, JPG, or WebP format</li>
          <li>Maximum 5 MB file size</li>
          <li>Between 64×64 and 2048×2048 pixels</li>
          <li>Square images work best</li>
        </ul>
      </div>
    </div>
  );
};

/* ── Confidence Gauge SVG ── */
const ConfidenceGauge = ({ value }: { value: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "hsl(var(--trust-safe))" : value >= 60 ? "hsl(45, 93%, 47%)" : "hsl(var(--destructive))";

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
      <motion.circle
        cx="60" cy="60" r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="65" textAnchor="middle" className="fill-foreground text-xl font-bold" fontSize="20">
        {value}
      </text>
    </svg>
  );
};

/* ── Memory Tab ── */
const MemoryTab = ({ advisor }: { advisor: AdvisorConfig }) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("advisor_memories")
        .select("*")
        .eq("advisor_id", advisor.advisorId || advisor.domain)
        .order("importance", { ascending: false })
        .limit(20);
      setMemories(data || []);
      setLoading(false);
    };
    fetch();
  }, [advisor]);

  if (loading) return <p className="text-xs text-muted-foreground py-6 text-center">Loading memories...</p>;

  if (memories.length === 0) {
    return (
      <div className="py-8 text-center">
        <History className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No memories recorded yet</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">Memories build over time as you interact</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      {memories.map((mem) => (
        <div key={mem.id} className="rounded-lg border border-border/40 bg-card/80 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold uppercase text-muted-foreground">{mem.memory_type}</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.round(Number(mem.importance) * 5) }).map((_, i) => (
                <Star key={i} className="h-2 w-2 fill-primary text-primary" />
              ))}
            </div>
          </div>
          <p className="text-xs text-foreground">{mem.content}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(mem.created_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ── Feedback Tab ── */
const FeedbackTab = ({ advisor }: { advisor: AdvisorConfig }) => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("advisor_feedback")
        .select("*")
        .eq("advisor_id", advisor.advisorId || advisor.domain)
        .order("created_at", { ascending: false })
        .limit(20);
      setFeedback(data || []);
      setLoading(false);
    };
    fetch();
  }, [advisor]);

  const submitFeedback = async (type: "positive" | "negative") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("advisor_feedback").insert({
      user_id: user.id,
      advisor_id: advisor.advisorId || advisor.domain,
      domain: advisor.domain,
      feedback_type: type,
      rating: type === "positive" ? 5 : 1,
      comment: `Quick ${type} feedback from detail drawer`,
    });
    // Refresh
    const { data } = await supabase
      .from("advisor_feedback")
      .select("*")
      .eq("advisor_id", advisor.advisorId || advisor.domain)
      .order("created_at", { ascending: false })
      .limit(20);
    setFeedback(data || []);
  };

  if (loading) return <p className="text-xs text-muted-foreground py-6 text-center">Loading feedback...</p>;

  return (
    <div className="space-y-4 mt-3">
      {/* Quick feedback */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => submitFeedback("positive")}>
          <ThumbsUp className="h-3 w-3 mr-1" /> Helpful
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => submitFeedback("negative")}>
          <ThumbsDown className="h-3 w-3 mr-1" /> Not Helpful
        </Button>
      </div>

      {feedback.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No feedback recorded yet</p>
      ) : (
        feedback.map((fb) => (
          <div key={fb.id} className="rounded-lg border border-border/40 bg-card/80 p-3">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-[10px] font-semibold",
                fb.feedback_type === "positive" ? "text-[hsl(var(--trust-safe))]" : "text-destructive"
              )}>
                {fb.feedback_type === "positive" ? "👍 Positive" : "👎 Negative"}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
              </span>
            </div>
            {fb.comment && <p className="text-xs text-foreground mt-1">{fb.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
};
