import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Square, Timer, VolumeX, Volume2 } from "lucide-react";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

interface AdvisorMeetingControlsProps {
  advisors: AdvisorConfig[];
  meetingActive: boolean;
  mutedAdvisors: Set<string>;
  onStartMeeting: (topic: string) => void;
  onEndMeeting: () => void;
  onToggleMute: (advisorId: string) => void;
  domainLabel: string;
}

const SUGGESTED_TOPICS: Record<string, string[]> = {
  money: ["Monthly budget review", "Investment rebalancing", "Tax optimization strategy", "Emergency fund assessment"],
  business: ["Q2 revenue targets", "Lead pipeline analysis", "Competitor landscape", "Product launch readiness"],
  concierge: ["Weekly schedule optimization", "Upcoming events prep", "Errand prioritization", "Family coordination"],
  general: ["Strategic priorities", "Risk assessment", "Opportunity analysis", "Performance review"],
};

export const AdvisorMeetingControls = ({
  advisors,
  meetingActive,
  mutedAdvisors,
  onStartMeeting,
  onEndMeeting,
  onToggleMute,
  domainLabel,
}: AdvisorMeetingControlsProps) => {
  const [topic, setTopic] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const domain = advisors[0]?.domain || "general";
  const suggestions = SUGGESTED_TOPICS[domain] || SUGGESTED_TOPICS.general;

  useEffect(() => {
    if (!meetingActive) { setElapsed(0); return; }
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [meetingActive]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (meetingActive) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-2 w-2 rounded-full bg-destructive"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-semibold text-foreground">Meeting Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Mute toggles */}
        <div className="flex flex-wrap gap-1.5">
          {advisors.map((a) => (
            <button
              key={a.id}
              onClick={() => onToggleMute(a.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all border",
                mutedAdvisors.has(a.id)
                  ? "bg-muted/50 text-muted-foreground border-border/50 opacity-50"
                  : "bg-card text-foreground border-border hover:border-primary/30"
              )}
            >
              {mutedAdvisors.has(a.id) ? <VolumeX className="h-2.5 w-2.5" /> : <Volume2 className="h-2.5 w-2.5" />}
              {a.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <Button size="sm" variant="destructive" className="w-full text-xs" onClick={onEndMeeting}>
          <Square className="h-3 w-3 mr-1" /> End Meeting
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {domainLabel} Boardroom Meeting
      </p>

      <div className="flex gap-2">
        <Input
          placeholder="Enter meeting topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="text-xs h-9"
          onKeyDown={(e) => e.key === "Enter" && topic.trim() && onStartMeeting(topic.trim())}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            className="h-9 px-4 text-xs"
            disabled={!topic.trim()}
            onClick={() => onStartMeeting(topic.trim())}
          >
            <Play className="h-3 w-3 mr-1" /> Start
          </Button>
        </motion.div>
      </div>

      {/* Suggested topics */}
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => { setTopic(s); onStartMeeting(s); }}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/30"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
