// Personal Brain — Phase 7 external Tools registry
// Premium dialog with zod-style validation, loading states, and a
// live preview of how the tool surfaces inside chat.
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, Plus, Trash2, Loader2, Globe, Calendar, FileSearch, BrainCircuit,
  Sparkles, AlertCircle, CheckCircle2, MessageSquare, Bot,
} from "lucide-react";
import { usePbTools, type PbToolKind, type PbTool } from "../hooks/usePbTools";
import { toast } from "sonner";

// ─── Kind metadata ──────────────────────────────────────────────────────────
interface KindMeta {
  label: string;
  Icon: typeof Globe;
  tone: string;
  example: { prompt: string; toolCall: string };
  hint: string;
}
const KIND_META: Record<PbToolKind, KindMeta> = {
  web_search: {
    label: "Web search",
    Icon: Globe,
    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    hint: "Real-time web lookups for current facts, news, and references.",
    example: {
      prompt: "What did Apple announce at WWDC last week?",
      toolCall: 'web_search({ "query": "Apple WWDC announcements last week" })',
    },
  },
  calendar: {
    label: "Calendar",
    Icon: Calendar,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    hint: "Read availability, propose times, and create events on your calendar.",
    example: {
      prompt: "Find me a 30-min slot with Sara next Tuesday afternoon.",
      toolCall: 'calendar({ "op": "find_slot", "with": "sara@…", "duration": 30 })',
    },
  },
  file_search: {
    label: "File search",
    Icon: FileSearch,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    hint: "Semantic search across your uploaded files and documents.",
    example: {
      prompt: "Pull the Q3 pricing tier from the partner agreement.",
      toolCall: 'file_search({ "query": "Q3 pricing tier", "scope": "agreements" })',
    },
  },
  memory_search: {
    label: "Memory search",
    Icon: BrainCircuit,
    tone: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    hint: "Search across your saved Brain memories before answering.",
    example: {
      prompt: "Remind me what I decided about the launch checklist.",
      toolCall: 'memory_search({ "query": "launch checklist decision" })',
    },
  },
  custom: {
    label: "Custom",
    Icon: Sparkles,
    tone: "bg-muted text-muted-foreground",
    hint: "Any HTTP endpoint your Brain can call. Define the contract yourself.",
    example: {
      prompt: "Run the deployment health check.",
      toolCall: 'custom_tool({ "input": "…" })',
    },
  },
};

// ─── Validation ─────────────────────────────────────────────────────────────
const TOOL_KEY_RE = /^[a-z][a-z0-9_]{2,39}$/;
const URL_RE = /^https?:\/\/[^\s]{4,500}$/i;

interface FormState {
  tool_key: string;
  display_name: string;
  description: string;
  kind: PbToolKind;
  endpoint: string;
  enabled: boolean;
}
interface FieldErrors {
  tool_key?: string;
  display_name?: string;
  description?: string;
  endpoint?: string;
}

function validate(form: FormState): FieldErrors {
  const e: FieldErrors = {};
  const k = form.tool_key.trim();
  if (!k) e.tool_key = "Required.";
  else if (!TOOL_KEY_RE.test(k))
    e.tool_key = "Use lowercase letters, digits, underscores. Start with a letter (3–40 chars).";
  const n = form.display_name.trim();
  if (!n) e.display_name = "Required.";
  else if (n.length > 60) e.display_name = "Keep under 60 characters.";
  if (form.description.length > 280) e.description = "Keep under 280 characters.";
  const ep = form.endpoint.trim();
  if (ep && !URL_RE.test(ep)) e.endpoint = "Must be a valid http(s) URL.";
  return e;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .slice(0, 40);
}

// ─── Public component ──────────────────────────────────────────────────────
export function ToolsRegistryCard() {
  const { tools, loading, busy, upsert, toggle, remove } = usePbTools();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PbTool | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const startCreate = () => { setEditing(null); setOpen(true); };
  const startEdit = (t: PbTool) => { setEditing(t); setOpen(true); };

  const handleToggle = async (id: string, v: boolean) => {
    setTogglingId(id);
    try { await toggle(id, v); }
    finally { setTogglingId(null); }
  };
  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}"? This can't be undone.`)) return;
    setRemovingId(id);
    try { await remove(id); toast.success(`${name} removed`); }
    catch { toast.error("Failed to remove tool"); }
    finally { setRemovingId(null); }
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card-elevated">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wrench className="h-4 w-4 text-primary" />
          External tools
          {tools.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 text-[10px]">{tools.length}</Badge>
          )}
        </CardTitle>
        <Button size="sm" onClick={startCreate}>
          <Plus className="h-3.5 w-3.5" /> Add tool
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border/30 p-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-muted/60" />
                  <div className="h-2.5 w-48 animate-pulse rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
            <Wrench className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">
              No tools yet. Add web search, calendar, or custom tools your Brain can call during chat.
            </p>
            <Button size="sm" variant="outline" className="mt-3" onClick={startCreate}>
              <Plus className="h-3.5 w-3.5" /> Add your first tool
            </Button>
          </div>
        ) : (
          tools.map((t) => {
            const meta = KIND_META[t.kind] ?? KIND_META.custom;
            const Icon = meta.Icon;
            const isToggling = togglingId === t.id;
            const isRemoving = removingId === t.id;
            return (
              <div key={t.id} className={`group flex items-center gap-3 rounded-lg border border-border/40 p-3 transition-all hover:bg-muted/30 hover:border-border/70 ${!t.enabled ? "opacity-60" : ""}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-sm font-semibold">{t.display_name}</h4>
                    <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                    {t.enabled && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <code className="rounded bg-muted/60 px-1 py-0.5 font-mono">{t.tool_key}</code>
                    {t.description ? ` · ${t.description}` : ""}
                  </p>
                </div>
                <Switch checked={t.enabled} disabled={isToggling} onCheckedChange={(v) => void handleToggle(t.id, v)} />
                <Button size="icon" variant="ghost" className="h-7 w-7" disabled={isRemoving} onClick={() => startEdit(t)} aria-label={`Edit ${t.display_name}`}>
                  <Wrench className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  disabled={isRemoving}
                  aria-label={`Remove ${t.display_name}`}
                  onClick={() => void handleRemove(t.id, t.display_name)}
                >
                  {isRemoving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
        existingKeys={tools.map((t) => t.tool_key)}
        busy={busy}
        onSave={async (input) => {
          try {
            await upsert(input);
            toast.success(editing ? "Tool updated" : "Tool added");
            setOpen(false);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to save tool");
          }
        }}
      />
    </Card>
  );
}

// ─── Dialog ────────────────────────────────────────────────────────────────
interface ToolDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PbTool | null;
  existingKeys: string[];
  busy: boolean;
  onSave: (input: {
    tool_key: string; display_name: string; description: string;
    kind: PbToolKind; config: Record<string, unknown>; enabled: boolean;
  }) => Promise<void>;
}

function ToolDialog({ open, onOpenChange, initial, existingKeys, busy, onSave }: ToolDialogProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<FormState>({
    tool_key: "",
    display_name: "",
    description: "",
    kind: "web_search",
    endpoint: "",
    enabled: true,
  });
  const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({
    tool_key: false, display_name: false, description: false, endpoint: false,
  });
  const [autoKey, setAutoKey] = useState(true);

  // Reset whenever dialog opens with a new "initial".
  useEffect(() => {
    if (!open) return;
    setForm({
      tool_key: initial?.tool_key ?? "",
      display_name: initial?.display_name ?? "",
      description: initial?.description ?? "",
      kind: (initial?.kind ?? "web_search") as PbToolKind,
      endpoint: (initial?.config?.endpoint as string) ?? "",
      enabled: initial?.enabled ?? true,
    });
    setTouched({ tool_key: false, display_name: false, description: false, endpoint: false });
    setAutoKey(!initial); // edit mode: leave key alone
  }, [open, initial]);

  // Auto-derive tool_key from display_name in create mode unless user typed it.
  useEffect(() => {
    if (!isEdit && autoKey) {
      setForm((f) => ({ ...f, tool_key: slugify(f.display_name) }));
    }
  }, [form.display_name, isEdit, autoKey]);

  const errors = useMemo(() => validate(form), [form]);
  // Cross-field: duplicate key in create mode.
  const duplicateKey = useMemo(() => {
    if (isEdit) return false;
    return existingKeys.includes(form.tool_key.trim());
  }, [isEdit, existingKeys, form.tool_key]);
  const dupError = duplicateKey ? "This key is already in use." : undefined;

  const allErrors: FieldErrors = { ...errors, tool_key: errors.tool_key ?? dupError };
  const isValid = !allErrors.tool_key && !allErrors.display_name && !allErrors.description && !allErrors.endpoint;

  const meta = KIND_META[form.kind];
  const PreviewIcon = meta.Icon;

  const showError = (k: keyof FieldErrors) => touched[k] && allErrors[k];
  const markTouched = (k: keyof FieldErrors) => setTouched((t) => ({ ...t, [k]: true }));

  const handleSave = async () => {
    setTouched({ tool_key: true, display_name: true, description: true, endpoint: true });
    if (!isValid || busy) return;
    await onSave({
      tool_key: form.tool_key.trim(),
      display_name: form.display_name.trim(),
      description: form.description.trim(),
      kind: form.kind,
      config: form.endpoint.trim() ? { endpoint: form.endpoint.trim() } : {},
      enabled: form.enabled,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.tone}`}>
              <PreviewIcon className="h-3.5 w-3.5" />
            </span>
            {isEdit ? "Edit tool" : "Add external tool"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update how the Brain uses this tool during chat." : "Register a tool the Brain can call during chat. Keys must be unique per user."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* ── Form column ── */}
          <div className="space-y-3">
            <Field label="Display name" error={showError("display_name") ? allErrors.display_name : undefined} required>
              <Input
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                onBlur={() => markTouched("display_name")}
                placeholder="Web search"
                maxLength={60}
                aria-invalid={!!showError("display_name")}
              />
            </Field>

            <Field
              label="Tool key"
              hint={isEdit ? "Cannot be changed after creation." : "Lowercase, numbers, underscores. Auto-filled from name."}
              error={showError("tool_key") ? allErrors.tool_key : undefined}
              required
            >
              <Input
                value={form.tool_key}
                onChange={(e) => { setAutoKey(false); setForm((f) => ({ ...f, tool_key: e.target.value })); }}
                onBlur={() => markTouched("tool_key")}
                placeholder="web_search_v1"
                disabled={isEdit}
                maxLength={40}
                aria-invalid={!!showError("tool_key")}
                className="font-mono text-sm"
              />
            </Field>

            <Field label="Kind">
              <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v as PbToolKind }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_META) as PbToolKind[]).map((k) => {
                    const KMeta = KIND_META[k];
                    const KIcon = KMeta.Icon;
                    return (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <KIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {KMeta.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{meta.hint}</p>
            </Field>

            <Field
              label="Description"
              hint={`${form.description.length}/280 characters`}
              error={showError("description") ? allErrors.description : undefined}
            >
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                onBlur={() => markTouched("description")}
                rows={2}
                placeholder="What does this tool do? The Brain reads this to decide when to call it."
                maxLength={280}
                aria-invalid={!!showError("description")}
              />
            </Field>

            <Field
              label="Endpoint"
              hint="Optional — required for custom tools."
              error={showError("endpoint") ? allErrors.endpoint : undefined}
            >
              <Input
                value={form.endpoint}
                onChange={(e) => setForm((f) => ({ ...f, endpoint: e.target.value }))}
                onBlur={() => markTouched("endpoint")}
                placeholder="https://api.example.com/search"
                aria-invalid={!!showError("endpoint")}
                className="font-mono text-xs"
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
              <div>
                <p className="text-sm font-medium">Enabled</p>
                <p className="text-[11px] text-muted-foreground">When off, the Brain won't call this tool.</p>
              </div>
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
            </div>
          </div>

          {/* ── Preview column ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Live preview
            </div>
            <div className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card-elevated to-card shadow-inner">
              {/* Tool chip */}
              <div className={`flex items-center gap-2 border-b border-border/50 bg-gradient-to-br ${form.enabled ? "from-primary/8 to-transparent" : "from-muted/40 to-transparent"} p-3`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.tone}`}>
                  <PreviewIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{form.display_name || "Untitled tool"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    <code className="font-mono">{form.tool_key || "tool_key"}</code> · {meta.label}
                  </p>
                </div>
                {form.enabled
                  ? <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px]">Live</Badge>
                  : <Badge variant="outline" className="text-[10px]">Off</Badge>}
              </div>

              {/* Chat sample */}
              <div className="space-y-2.5 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">In chat</p>

                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="rounded-lg rounded-tl-none bg-muted/60 px-2.5 py-1.5 text-xs">
                    {meta.example.prompt}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Wrench className="h-2.5 w-2.5" />
                      Calling <code className="rounded bg-primary/10 px-1 font-mono text-primary">{form.tool_key || "tool_key"}</code>…
                    </div>
                    <pre className="overflow-x-auto rounded-md bg-foreground/[0.04] px-2 py-1.5 font-mono text-[10px] leading-relaxed text-foreground">
{meta.example.toolCall.replace(/^[a-z_]+/, form.tool_key || "tool_key")}
                    </pre>
                    <p className="text-[11px] italic text-muted-foreground">
                      The Brain decides when to invoke this tool based on your description.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation summary */}
            <div className={`flex items-start gap-2 rounded-lg border p-2.5 text-[11px] ${
              isValid && form.tool_key && form.display_name
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                : "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
            }`}>
              {isValid && form.tool_key && form.display_name ? (
                <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Ready to save.</>
              ) : (
                <><AlertCircle className="h-3.5 w-3.5 shrink-0" /> Fill in the required fields to enable saving.</>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button
            disabled={busy || !isValid || !form.tool_key.trim() || !form.display_name.trim()}
            onClick={() => void handleSave()}
          >
            {busy
              ? (<><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>)
              : (isEdit ? "Save changes" : "Add tool")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
