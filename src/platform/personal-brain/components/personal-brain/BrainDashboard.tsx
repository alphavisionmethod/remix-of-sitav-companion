import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Card, CardContent } from "@/components/ui/card";
import { BrainHero, type BrainScope } from "./BrainHero";
import { ChatList } from "./ChatList";
import { GoalProgressCard } from "./GoalProgressCard";
import { BrainInsightCard } from "./BrainInsightCard";
import { BrainDigestsCard } from "./BrainDigestsCard";
import { BrainSignalsCard } from "./BrainSignalsCard";
import { SuggestedPromptStrip } from "./SuggestedPromptStrip";
import { ModePicker } from "./ModePicker";
import { WorkspaceGrid } from "./WorkspaceGrid";
import { usePbWorkspaces } from "./hooks/usePbWorkspaces";
import { usePbChats } from "./hooks/usePbChats";
import { usePbGoals } from "./hooks/usePbGoals";
import { usePbInsights } from "./hooks/usePbInsights";
import { usePbSecurityPrefs } from "./hooks/usePbSecurityPrefs";
import type { BrainModeId } from "./BRAIN_MODES";
import { supabase } from "@/integrations/supabase/client";
import { VoicePanel } from "./voice/VoicePanel";
import { ShieldAlert } from "lucide-react";
import { BrainOnboardingTour } from "./onboarding-tour/BrainOnboardingTour";
import { useSitaVoice } from "@/contexts/SitaVoiceContext";
import { SitaContext } from "@/lib/sita-context";

function greetingFor(name?: string | null): string {
  const hour = new Date().getHours();
  const part =
    hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name.split(" ")[0]}.` : `${part}.`;
}

export function BrainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scope, setScope] = useState<BrainScope>("personal");
  const [mode, setMode] = useState<BrainModeId>("think");

  const { workspaces, loading: workspacesLoading, createWorkspace } = usePbWorkspaces();
  const { chats, loading: chatsLoading } = usePbChats({ limit: 5 });
  const { goals, loading: goalsLoading } = usePbGoals();
  const { insights, loading: insightsLoading } = usePbInsights(3);
  const [voiceOpen, setVoiceOpen] = useState(false);
  // Sentinel is now an OS-wide singleton (SitaVoiceProvider, Phase B).
  // The dashboard just reflects + toggles its armed state.
  const sitaVoice = useSitaVoice();
  const sentinelOn = Boolean(sitaVoice?.armed);
  const toggleSentinel = () => sitaVoice?.setArmed(!sentinelOn);
  const { prefs: securityPrefs } = usePbSecurityPrefs();

  const filteredWorkspaces = useMemo(() => {
    if (scope === "business") {
      return workspaces.filter((w) => ["business", "finance"].includes(w.kind));
    }
    return workspaces.filter((w) => !["business", "finance"].includes(w.kind));
  }, [workspaces, scope]);

  const startNewChat = async (mode: BrainModeId, prefill?: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("pb_chats")
      .insert({
        user_id: user.id,
        title: prefill ? prefill.slice(0, 60) : "New chat",
        mode,
      })
      .select()
      .single();
    if (error || !data) return;
    const search = prefill ? `?prompt=${encodeURIComponent(prefill)}` : "";
    navigate(`/personal-brain/c/${data.id}${search}`);
  };

  const displayName =
    (user?.user_metadata as Record<string, unknown> | undefined)?.full_name as string | undefined;

  return (
    <PageShell>
      <SitaContext
        surfaceId="personal-brain-dashboard"
        title="Personal Brain"
        route="/personal-brain"
        summary={`Brain dashboard for ${displayName ?? user?.email ?? "the user"} — scope ${scope}, mode ${mode}.`}
        suggestedIntents={["start a new chat", "open my goals", "summarize my recent insights"]}
        payload={{
          scope,
          mode,
          recentChats: chats.slice(0, 3).map((c) => ({ id: c.id, title: c.title })),
          goalsCount: goals.length,
        }}
      >
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
        <BrainHero
          greeting={greetingFor(displayName ?? user?.email)}
          scope={scope}
          onScopeChange={setScope}
          onNewChat={() => void startNewChat(mode)}
          onVoice={() => setVoiceOpen(true)}
          onSettings={() => navigate("/personal-brain/settings")}
          onTools={() => navigate("/personal-brain/tools")}
          onCommandCenter={() => navigate("/personal-brain/command-center")}
          sentinelOn={sentinelOn}
          onToggleSentinel={toggleSentinel}
        />

        {securityPrefs?.sensitive_mode && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm text-destructive"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              <strong>Sensitive mode is on.</strong> Auto-learning is paused and voice transcripts won't persist.
            </span>
            <button
              className="text-xs font-medium underline-offset-2 hover:underline"
              onClick={() => navigate("/personal-brain/settings/security")}
            >
              Manage
            </button>
          </div>
        )}

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Pick a mode</h2>
              <span className="text-xs text-muted-foreground">9 specialized brain modes</span>
            </div>
            <ModePicker value={mode} onChange={setMode} />
            <SuggestedPromptStrip mode={mode} onPick={(p) => void startNewChat(mode, p)} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ChatList
              chats={chats}
              loading={chatsLoading}
              onOpen={(id) => navigate(`/personal-brain/c/${id}`)}
              showWorkspaceBadge
            />
            <div data-tour="brain-workspaces">
            <WorkspaceGrid
              workspaces={filteredWorkspaces}
              loading={workspacesLoading}
              onOpen={(id) => navigate(`/personal-brain/w/${id}`)}
              onCreate={async ({ name, kind, default_mode }) => {
                await createWorkspace({ name, kind, default_mode });
              }}
            />
            </div>
          </div>
          <div className="space-y-6">
            <GoalProgressCard goals={goals} loading={goalsLoading} />
            <div data-tour="brain-digests"><BrainDigestsCard /></div>
            <BrainSignalsCard />
            <BrainInsightCard insights={insights} loading={insightsLoading} />
          </div>
        </div>
      </div>
      {voiceOpen && (
        <VoicePanel
          initialMode={mode}
          onClose={() => setVoiceOpen(false)}
        />
      )}
      <BrainOnboardingTour />
      </SitaContext>
    </PageShell>
  );
}