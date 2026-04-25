import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdvisorAvatar } from "@/platform/sita/components/sita/primitives/AdvisorAvatar";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { ConfidenceBar } from "@/platform/sita/components/sita/primitives/ConfidenceBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Swords, MessageCircle, Clock, LayoutGrid, Video } from "lucide-react";
import { AdvisorDebateView } from "./AdvisorDebateView";
import { AskAdvisorChat } from "./AskAdvisorChat";
import { AdvisorTimelineView } from "./AdvisorTimelineView";
import { AdvisorDetailDrawer } from "./AdvisorDetailDrawer";
import { AdvisorMeetingRoom } from "./AdvisorMeetingRoom";
import { AdvisorShowcaseCard } from "./AdvisorShowcaseCard";
import { ImmersiveBoardroomCouncil } from "./ImmersiveBoardroomCouncil";
import { MobileAdvisorBoard } from "./MobileAdvisorBoard";
import { GlassPanel, CinematicBackground } from "./boardroom-primitives";
import { Brain } from "lucide-react";

export interface AdvisorConfig {
  id: string;
  name: string;
  role: string;
  domain: "business" | "money" | "concierge" | "general" | "growth" | "trust" | "opportunity" | "recovery" | "boardroom" | "family";
  confidence: number;
  status: "active" | "thinking" | "idle" | "offline";
  mission?: string;
  specialAbility?: string;
  advisorId?: string;
  avatarUrl?: string | null;
}

interface AdvisorCouncilShellProps {
  advisors: AdvisorConfig[];
  domainLabel: string;
  domainColor?: string;
  children?: React.ReactNode;
  className?: string;
}

const viewModes = [
  { key: "boardroom", label: "Boardroom", icon: Brain },
  { key: "council", label: "Showcase", icon: LayoutGrid },
  { key: "debate", label: "Debate", icon: Swords },
  { key: "ask", label: "Ask", icon: MessageCircle },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "meeting", label: "Meeting", icon: Video },
] as const;

export const AdvisorCouncilShell = ({ advisors, domainLabel, children, className }: AdvisorCouncilShellProps) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorConfig | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAdvisorClick = (advisor: AdvisorConfig) => {
    setSelectedAdvisor(advisor);
    setDrawerOpen(true);
  };

  const avgConfidence = Math.round(advisors.reduce((s, a) => s + a.confidence, 0) / advisors.length);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tabbed Views */}
      <Tabs defaultValue="boardroom" className="w-full">
        <TabsList className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08]">
          {viewModes.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Immersive Boardroom */}
        <TabsContent value="boardroom">
          {isMobile ? (
            <MobileAdvisorBoard advisors={advisors} onAdvisorClick={handleAdvisorClick} className="mt-3" />
          ) : (
            <ImmersiveBoardroomCouncil advisors={advisors} onAdvisorClick={handleAdvisorClick} className="mt-3" />
          )}
        </TabsContent>

        {/* Showcase Cards */}
        <TabsContent value="council">
          {isMobile ? (
            <MobileAdvisorBoard advisors={advisors} onAdvisorClick={handleAdvisorClick} className="mt-3" />
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
            {advisors.map((advisor, i) => (
              <motion.div
                key={advisor.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <AdvisorShowcaseCard
                  advisor={advisor}
                  onClick={() => handleAdvisorClick(advisor)}
                />
              </motion.div>
            ))}
          </div>
          )}
          {children}
        </TabsContent>

        {/* Debate */}
        <TabsContent value="debate">
          <AdvisorDebateView advisors={advisors} domainLabel={domainLabel} />
        </TabsContent>

        {/* Ask */}
        <TabsContent value="ask">
          <AskAdvisorChat advisors={advisors} domainLabel={domainLabel} />
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <AdvisorTimelineView advisors={advisors} />
        </TabsContent>

        {/* Meeting */}
        <TabsContent value="meeting">
          <AdvisorMeetingRoom advisors={advisors} domainLabel={domainLabel} />
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      <AdvisorDetailDrawer
        advisor={selectedAdvisor}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

/* ── Council Card ── */
const AdvisorCouncilCard = ({ advisor, onClick }: { advisor: AdvisorConfig; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      className={cn(
        "relative rounded-xl border bg-card p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-lg hover:border-primary/30",
        hovered && "ring-2 ring-primary/20"
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 relative z-10">
        <AdvisorAvatar
          domain={advisor.domain}
          name={advisor.name}
          status={advisor.status}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{advisor.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{advisor.role}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Confidence</span>
          <AnimatedCounter value={advisor.confidence} />
        </div>
        <ConfidenceBar value={advisor.confidence} size="sm" />
      </div>

      {advisor.specialAbility && (
        <p className="mt-2 text-[9px] text-primary/70 font-medium truncate">
          ✦ {advisor.specialAbility}
        </p>
      )}
    </motion.div>
  );
};

/* ── Animated Counter ── */
const AnimatedCounter = ({ value }: { value: number }) => {
  return (
    <motion.span
      className={cn(
        "text-[10px] font-bold",
        value >= 80 ? "text-[hsl(var(--trust-safe))]" :
        value >= 60 ? "text-amber-500" : "text-orange-500"
      )}
      key={value}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}%
    </motion.span>
  );
};
