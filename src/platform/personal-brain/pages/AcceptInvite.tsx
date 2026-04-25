// Personal Brain — Phase 7 Accept invite landing
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Brain, CheckCircle2, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type State = "loading" | "ready" | "accepted" | "error" | "needs_auth";

function AcceptInner() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setState("error"); setError("Missing invite token"); return; }
    if (!user) { setState("needs_auth"); return; }
    setState("ready");
  }, [authLoading, user, token]);

  const accept = async () => {
    if (!token) return;
    setState("loading");
    const { data, error: invokeError } = await supabase.functions.invoke("personal-brain", {
      body: { action: "workspace.accept", payload: { invite_token: token } },
    });
    if (invokeError) {
      setError(invokeError.message);
      setState("error");
      return;
    }
    const member = (data as { member?: { workspace_id: string } } | null)?.member;
    if (member?.workspace_id) setWorkspaceId(member.workspace_id);
    setState("accepted");
  };

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
        <Card className="w-full overflow-hidden border-border/60 bg-gradient-to-br from-primary/10 via-card to-card-elevated">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_60%)]" />
            <CardContent className="relative space-y-5 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>

              {state === "loading" && (
                <>
                  <h1 className="text-xl font-semibold">Working on it…</h1>
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </>
              )}

              {state === "needs_auth" && (
                <>
                  <h1 className="text-xl font-bold">Sign in to accept</h1>
                  <p className="text-sm text-muted-foreground">
                    You've been invited to a shared Brain workspace. Sign in to continue.
                  </p>
                  <Button className="w-full" onClick={() => navigate(`/auth?redirect=/personal-brain/invite/${token}`)}>
                    Sign in
                  </Button>
                </>
              )}

              {state === "ready" && (
                <>
                  <h1 className="text-xl font-bold">You've been invited</h1>
                  <p className="text-sm text-muted-foreground">
                    Accept this invitation to join the shared Brain workspace and collaborate with the owner.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Shared chats, memories, and goals
                  </div>
                  <Button className="w-full" size="lg" onClick={() => void accept()}>
                    Accept invitation
                  </Button>
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate("/personal-brain")}>
                    Maybe later
                  </button>
                </>
              )}

              {state === "accepted" && (
                <>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                  <h1 className="text-xl font-bold">You're in!</h1>
                  <p className="text-sm text-muted-foreground">Welcome to the shared workspace.</p>
                  <Button
                    className="w-full"
                    onClick={() => navigate(workspaceId ? `/personal-brain/w/${workspaceId}` : "/personal-brain")}
                  >
                    Open workspace
                  </Button>
                </>
              )}

              {state === "error" && (
                <>
                  <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
                  <h1 className="text-xl font-bold">Couldn't accept invite</h1>
                  <p className="text-sm text-muted-foreground">{error ?? "Invite is invalid or expired."}</p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/personal-brain")}>
                    Back to Brain
                  </Button>
                </>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

export default function AcceptInvite() {
  return (
    <GlobalErrorBoundary>
      <AcceptInner />
    </GlobalErrorBoundary>
  );
}
