import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AdvisorPortrait } from "./AdvisorPortrait";
import { AdvisorMeetingControls } from "./AdvisorMeetingControls";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { AdvisorConfig } from "./AdvisorCouncilShell";

interface AdvisorMeetingRoomProps {
  advisors: AdvisorConfig[];
  domainLabel: string;
}

interface MeetingResponse {
  advisorId: string;
  content: string;
  status: "pending" | "thinking" | "done" | "error";
}

export const AdvisorMeetingRoom = ({ advisors, domainLabel }: AdvisorMeetingRoomProps) => {
  const [meetingActive, setMeetingActive] = useState(false);
  const [topic, setTopic] = useState("");
  const [responses, setResponses] = useState<MeetingResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [synthesis, setSynthesis] = useState("");
  const [mutedAdvisors, setMutedAdvisors] = useState<Set<string>>(new Set());
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});
  const [generatingAvatars, setGeneratingAvatars] = useState(false);

  // Load existing avatar URLs
  useEffect(() => {
    const loadAvatars = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("advisor_profiles")
        .select("advisor_id, avatar_url")
        .eq("user_id", user.id);
      if (data) {
        const urls: Record<string, string> = {};
        data.forEach((p: any) => { if (p.avatar_url) urls[p.advisor_id] = p.avatar_url; });
        setAvatarUrls(urls);
      }
    };
    loadAvatars();
  }, []);

  const generateAvatars = useCallback(async () => {
    setGeneratingAvatars(true);
    toast.info("Generating advisor portraits... This may take a moment.");
    try {
      const payload = advisors.map((a) => ({
        advisor_id: a.advisorId || a.id,
        display_name: a.name,
        domain: a.domain,
      }));
      const { data, error } = await supabase.functions.invoke("advisor-avatar-generate", {
        body: { advisors: payload },
      });
      if (error) throw error;
      if (data?.results) {
        const newUrls: Record<string, string> = { ...avatarUrls };
        data.results.forEach((r: any) => {
          if (r.avatar_url) newUrls[r.advisor_id] = r.avatar_url;
        });
        setAvatarUrls(newUrls);
        toast.success("Advisor portraits generated!");
      }
    } catch (err) {
      console.error("Avatar generation error:", err);
      toast.error("Failed to generate avatars. Please try again.");
    } finally {
      setGeneratingAvatars(false);
    }
  }, [advisors, avatarUrls]);

  const startMeeting = useCallback(async (meetingTopic: string) => {
    setTopic(meetingTopic);
    setMeetingActive(true);
    setSynthesis("");

    const activeAdvisors = advisors.filter((a) => !mutedAdvisors.has(a.id));
    const initialResponses: MeetingResponse[] = activeAdvisors.map((a) => ({
      advisorId: a.advisorId || a.id,
      content: "",
      status: "pending",
    }));
    setResponses(initialResponses);

    // Call each advisor sequentially with stagger for realism
    for (let i = 0; i < activeAdvisors.length; i++) {
      const advisor = activeAdvisors[i];
      setActiveIndex(i);

      setResponses((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: "thinking" } : r))
      );

      try {
        const { data, error } = await supabase.functions.invoke("chat-advisor", {
          body: {
            advisor: advisor.advisorId || advisor.domain,
            message: `Meeting topic: "${meetingTopic}". You are in a boardroom meeting with other advisors. Give your focused perspective in 2-3 sentences. Be concise and actionable.`,
            history: [],
          },
        });

        const content = error ? "Unable to respond at this time." : (data?.response || data?.message || "No response received.");

        setResponses((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, content, status: "done" } : r))
        );
      } catch {
        setResponses((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, content: "Connection error.", status: "error" } : r))
        );
      }

      // Stagger delay between advisors
      if (i < activeAdvisors.length - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setActiveIndex(-1);

    // Generate synthesis
    try {
      const { data } = await supabase.functions.invoke("chat-advisor", {
        body: {
          advisor: "general",
          message: `Synthesize these advisor perspectives on "${meetingTopic}" into a unified recommendation in 2-3 bullet points. Highlight agreements and flag disagreements.`,
          history: [],
        },
      });
      setSynthesis(data?.response || data?.message || "Synthesis unavailable.");
    } catch {
      setSynthesis("Unable to generate synthesis.");
    }
  }, [advisors, mutedAdvisors]);

  const endMeeting = () => {
    setMeetingActive(false);
    setResponses([]);
    setActiveIndex(-1);
    setSynthesis("");
    setTopic("");
  };

  const toggleMute = (id: string) => {
    setMutedAdvisors((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeAdvisors = advisors.filter((a) => !mutedAdvisors.has(a.id));
  const hasAvatars = Object.keys(avatarUrls).length > 0;

  return (
    <div className="space-y-4 mt-3">
      {/* Generate Avatars Button */}
      {!hasAvatars && (
        <motion.div
          className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <ImagePlus className="h-6 w-6 text-primary/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-2">Generate AI portraits for your advisors</p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={generateAvatars}
            disabled={generatingAvatars}
          >
            {generatingAvatars ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
            ) : (
              <><ImagePlus className="h-3 w-3 mr-1" /> Generate Portraits</>
            )}
          </Button>
        </motion.div>
      )}

      {/* Meeting Controls */}
      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
        <AdvisorMeetingControls
          advisors={advisors}
          meetingActive={meetingActive}
          mutedAdvisors={mutedAdvisors}
          onStartMeeting={startMeeting}
          onEndMeeting={endMeeting}
          onToggleMute={toggleMute}
          domainLabel={domainLabel}
        />
      </div>

      {/* Meeting Room */}
      {meetingActive && (
        <motion.div
          className="rounded-xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-4 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Topic header */}
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Meeting Topic</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">"{topic}"</p>
          </div>

          {/* Advisor semicircle */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            <AnimatePresence>
              {activeAdvisors.map((advisor, i) => {
                const response = responses[i];
                const isActive = activeIndex === i;
                const advisorKey = advisor.advisorId || advisor.id;

                return (
                  <motion.div
                    key={advisor.id}
                    className="flex flex-col items-center gap-2 max-w-[140px]"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: isActive ? 1.05 : 1 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <div className="relative">
                      <AdvisorPortrait
                        domain={advisor.domain}
                        name={advisor.name}
                        avatarUrl={avatarUrls[advisorKey]}
                        status={response?.status === "thinking" ? "thinking" : advisor.status}
                        speaking={isActive}
                        size="lg"
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : "auto"}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute -inset-1 rounded-full border-2 border-primary/40 pointer-events-none"
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Name plate */}
                    <p className="text-[10px] font-semibold text-foreground text-center truncate w-full">
                      {advisor.name}
                    </p>

                    {/* Speech bubble */}
                    {response?.status === "thinking" && (
                      <motion.div
                        className="rounded-lg bg-muted/50 px-3 py-2 text-center"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <motion.div className="flex gap-1 justify-center">
                          {[0, 1, 2].map((d) => (
                            <motion.div
                              key={d}
                              className="h-1.5 w-1.5 rounded-full bg-primary/50"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    )}

                    {response?.status === "done" && response.content && (
                      <motion.div
                        className="rounded-lg bg-card border border-border/50 px-3 py-2 shadow-sm"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 20 }}
                      >
                        <div className="text-[10px] text-foreground leading-relaxed line-clamp-4 prose prose-xs">
                          <ReactMarkdown>{response.content}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}

                    {response?.status === "error" && (
                      <p className="text-[10px] text-destructive italic">Error</p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Synthesis panel */}
          {synthesis && (
            <motion.div
              className="rounded-xl bg-primary/5 border border-primary/20 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2">
                ✦ Board Synthesis
              </p>
              <div className="text-xs text-foreground leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{synthesis}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Regenerate avatars when they exist */}
      {hasAvatars && !meetingActive && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="text-[10px] text-muted-foreground"
            onClick={generateAvatars}
            disabled={generatingAvatars}
          >
            {generatingAvatars ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Regenerating...</>
            ) : (
              <><ImagePlus className="h-3 w-3 mr-1" /> Regenerate Portraits</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
