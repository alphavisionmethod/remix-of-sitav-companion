import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { usePbWorkspaces } from "@/components/personal-brain/hooks/usePbWorkspaces";

export default function WorkspacesSettings() {
  const { workspaces, archiveWorkspace, loading } = usePbWorkspaces();
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Workspaces & Projects</h2>
          <p className="text-xs text-muted-foreground">Each workspace has its own memory, mode, and members.</p>
        </div>
        {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : workspaces.length === 0 ? (
          <p className="text-xs text-muted-foreground">No workspaces yet.</p>
        ) : (
          <div className="space-y-2">
            {workspaces.map((w) => (
              <div key={w.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{w.name}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{w.kind} · default mode {w.default_mode}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void archiveWorkspace(w.id)}>
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
