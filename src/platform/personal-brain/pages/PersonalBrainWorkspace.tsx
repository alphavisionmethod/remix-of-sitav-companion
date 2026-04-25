import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban, Loader2, Plus } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import { ModePicker } from "@/components/personal-brain/ModePicker";
import { ChatList } from "@/components/personal-brain/ChatList";
import { SuggestedPromptStrip } from "@/components/personal-brain/SuggestedPromptStrip";
import { usePbChats } from "@/components/personal-brain/hooks/usePbChats";
import { MembersPanel } from "@/components/personal-brain/members/MembersPanel";
import {
  isBrainModeId,
  type BrainModeId,
} from "@/components/personal-brain/BRAIN_MODES";

type PbWorkspace = Database["public"]["Tables"]["pb_workspaces"]["Row"];

function WorkspaceInner() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<PbWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<BrainModeId>("think");
  const { chats, loading: chatsLoading, createChat } = usePbChats({
    workspaceId: workspaceId ?? null,
  });

  useEffect(() => {
    if (!user || !workspaceId) {
      setLoading(false);
      return;
    }
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("pb_workspaces")
        .select("*")
        .eq("id", workspaceId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      const w = (data as PbWorkspace) ?? null;
      setWorkspace(w);
      if (w && isBrainModeId(w.default_mode)) {
        setMode(w.default_mode);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, workspaceId]);

  const startChat = async (prefillMode: BrainModeId, prefill?: string) => {
    if (!workspaceId) return;
    const created = await createChat({
      title: prefill ? prefill.slice(0, 60) : "New chat",
      mode: prefillMode,
      workspace_id: workspaceId,
    });
    const search = prefill ? `?prompt=${encodeURIComponent(prefill)}` : "";
    navigate(`/personal-brain/c/${created.id}${search}`);
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!workspace) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md p-8 text-center">
          <h2 className="text-base font-semibold text-foreground">Workspace not found</h2>
          <Button className="mt-3" variant="outline" onClick={() => navigate("/personal-brain")}>
            Back to Brain
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-primary/10 p-2">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{workspace.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {workspace.kind}
                </Badge>
                <span>·</span>
                <span className="capitalize">Default mode: {workspace.default_mode}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => void startChat(mode)}>
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {workspace.custom_instructions && (
          <Card>
            <CardContent className="space-y-1.5 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Workspace instructions
              </h2>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {workspace.custom_instructions}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-sm font-semibold text-foreground">Pick a mode</h2>
            <ModePicker value={mode} onChange={setMode} />
            <SuggestedPromptStrip mode={mode} onPick={(p) => void startChat(mode, p)} />
          </CardContent>
        </Card>

        <ChatList
          title="Workspace chats"
          chats={chats}
          loading={chatsLoading}
          onOpen={(id) => navigate(`/personal-brain/c/${id}`)}
          emptyMessage="No chats in this workspace yet."
        />

        {workspaceId && <MembersPanel workspaceId={workspaceId} />}
      </div>
    </PageShell>
  );
}

export default function PersonalBrainWorkspace() {
  return (
    <GlobalErrorBoundary>
      <WorkspaceInner />
    </GlobalErrorBoundary>
  );
}