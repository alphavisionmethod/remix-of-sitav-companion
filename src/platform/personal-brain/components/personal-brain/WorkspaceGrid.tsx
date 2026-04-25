import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceCard } from "./WorkspaceCard";
import { ModePicker } from "./ModePicker";
import type { BrainModeId } from "./BRAIN_MODES";
import type { PbWorkspace } from "./hooks/usePbWorkspaces";

interface WorkspaceGridProps {
  workspaces: PbWorkspace[];
  loading: boolean;
  onOpen: (id: string) => void;
  onCreate: (input: {
    name: string;
    kind: string;
    default_mode: BrainModeId;
  }) => Promise<void>;
}

export function WorkspaceGrid({ workspaces, loading, onOpen, onCreate }: WorkspaceGridProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("personal");
  const [mode, setMode] = useState<BrainModeId>("think");
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onCreate({ name: name.trim(), kind, default_mode: mode });
      setName("");
      setKind("personal");
      setMode("think");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Workspaces</h2>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New workspace
        </Button>
      </div>
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading workspaces…</CardContent>
        </Card>
      ) : workspaces.length === 0 ? (
        <Card>
          <CardContent className="space-y-2 p-6 text-sm text-muted-foreground">
            <p>No workspaces yet. Create one to scope chats, files, and memory.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((w) => (
            <WorkspaceCard key={w.id} workspace={w} onOpen={onOpen} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              Workspaces scope chats, files, and brain memory to a project or life area.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Founder Sprint" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Kind</label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="skill">Skill</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default mode</label>
              <ModePicker value={mode} onChange={setMode} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={busy || !name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}