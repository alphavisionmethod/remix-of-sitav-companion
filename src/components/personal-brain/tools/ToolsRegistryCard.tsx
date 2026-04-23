// Personal Brain — Phase 7 external Tools registry
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, Plus, Trash2, Loader2, Globe, Calendar, FileSearch, BrainCircuit, Sparkles } from "lucide-react";
import { usePbTools, type PbToolKind, type PbTool } from "../hooks/usePbTools";

const KIND_META: Record<PbToolKind, { label: string; Icon: typeof Globe; tone: string }> = {
  web_search:    { label: "Web search",    Icon: Globe,        tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  calendar:      { label: "Calendar",      Icon: Calendar,     tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  file_search:   { label: "File search",   Icon: FileSearch,   tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  memory_search: { label: "Memory search", Icon: BrainCircuit, tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  custom:        { label: "Custom",        Icon: Sparkles,     tone: "bg-muted text-muted-foreground" },
};

export function ToolsRegistryCard() {
  const { tools, loading, busy, upsert, toggle, remove } = usePbTools();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PbTool | null>(null);

  const startCreate = () => { setEditing(null); setOpen(true); };
  const startEdit = (t: PbTool) => { setEditing(t); setOpen(true); };

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-4 w-4 text-primary" />
          External tools
        </CardTitle>
        <Button size="sm" onClick={startCreate}>
          <Plus className="h-3.5 w-3.5" /> Add tool
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tools…</p>
        ) : tools.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
            <Wrench className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">
              No tools yet. Add web search, calendar, or custom tools your Brain can call during chat.
            </p>
          </div>
        ) : (
          tools.map((t) => {
            const meta = KIND_META[t.kind] ?? KIND_META.custom;
            const Icon = meta.Icon;
            return (
              <div key={t.id} className="group flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-muted/30">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold">{t.display_name}</h4>
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{t.description || t.tool_key}</p>
                </div>
                <Switch checked={t.enabled} onCheckedChange={(v) => void toggle(t.id, v)} />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(t)}>
                  <Wrench className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => void remove(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>

      <ToolDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        busy={busy}
        onSave={async (input) => {
          await upsert(input);
          setOpen(false);
        }}
      />
    </Card>
  );
}

interface ToolDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PbTool | null;
  busy: boolean;
  onSave: (input: {
    tool_key: string; display_name: string; description: string;
    kind: PbToolKind; config: Record<string, unknown>; enabled: boolean;
  }) => Promise<void>;
}

function ToolDialog({ open, onOpenChange, initial, busy, onSave }: ToolDialogProps) {
  const [toolKey, setToolKey] = useState(initial?.tool_key ?? "");
  const [name, setName] = useState(initial?.display_name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<PbToolKind>(initial?.kind ?? "web_search");
  const [endpoint, setEndpoint] = useState((initial?.config?.endpoint as string) ?? "");
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  // Reset on open
  const reset = () => {
    setToolKey(initial?.tool_key ?? "");
    setName(initial?.display_name ?? "");
    setDesc(initial?.description ?? "");
    setKind(initial?.kind ?? "web_search");
    setEndpoint((initial?.config?.endpoint as string) ?? "");
    setEnabled(initial?.enabled ?? true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit tool" : "Add external tool"}</DialogTitle>
          <DialogDescription>
            Register a tool the Brain can call during chat. Keys must be unique per user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Tool key</label>
              <Input value={toolKey} onChange={(e) => setToolKey(e.target.value)} placeholder="web_search_v1" disabled={!!initial} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Kind</label>
              <Select value={kind} onValueChange={(v) => setKind(v as PbToolKind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_META) as PbToolKind[]).map((k) => (
                    <SelectItem key={k} value={k}>{KIND_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Display name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Web search" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="What does this tool do?" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Endpoint (optional)</label>
            <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.example.com/search" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
            <span className="text-sm">Enabled</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={busy || !toolKey.trim() || !name.trim()}
            onClick={() => void onSave({
              tool_key: toolKey.trim(),
              display_name: name.trim(),
              description: desc.trim(),
              kind,
              config: endpoint ? { endpoint } : {},
              enabled,
            })}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
