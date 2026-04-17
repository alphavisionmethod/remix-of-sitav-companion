import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, ArrowLeftRight, Check, X } from "lucide-react";

export interface SyncConflict {
  id: string;
  table: string;
  recordId: string;
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
  detectedAt: string;
}

interface SyncConflictResolverProps {
  conflicts: SyncConflict[];
  onResolve: (
    conflict: SyncConflict,
    choice: "local" | "remote" | "merge",
    mergedValue?: unknown,
  ) => Promise<void> | void;
  onDismiss?: (conflict: SyncConflict) => void;
}

function fmt(v: unknown): string {
  if (v == null) return "∅ (empty)";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

export function SyncConflictResolver({
  conflicts,
  onResolve,
  onDismiss,
}: SyncConflictResolverProps) {
  const [active, setActive] = useState<string | null>(null);
  const [mergeText, setMergeText] = useState<Record<string, string>>({});
  const [resolving, setResolving] = useState<Record<string, boolean>>({});

  if (conflicts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Check className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No sync conflicts. Local and remote in agreement.</p>
        </CardContent>
      </Card>
    );
  }

  async function handle(c: SyncConflict, choice: "local" | "remote" | "merge") {
    setResolving((s) => ({ ...s, [c.id]: true }));
    try {
      const merged = choice === "merge" ? mergeText[c.id] ?? "" : undefined;
      await onResolve(c, choice, merged);
      setActive(null);
    } finally {
      setResolving((s) => ({ ...s, [c.id]: false }));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Sync Conflicts
          <Badge variant="destructive">{conflicts.length}</Badge>
        </CardTitle>
        <CardDescription>
          The same record was edited on multiple devices. Choose which version to keep.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[520px]">
          <div className="divide-y">
            {conflicts.map((c) => {
              const open = active === c.id;
              const isResolving = resolving[c.id];
              return (
                <div key={c.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-mono text-sm">{c.table}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm">{c.field}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Record {c.recordId} · detected {new Date(c.detectedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActive(open ? null : c.id)}
                    >
                      {open ? "Hide" : "Resolve"}
                    </Button>
                  </div>

                  {open && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="rounded border bg-muted/30 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Local</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.localUpdatedAt).toLocaleString()}
                            </span>
                          </div>
                          <pre className="text-xs whitespace-pre-wrap break-words">
                            {fmt(c.localValue)}
                          </pre>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handle(c, "local")}
                            disabled={isResolving}
                          >
                            Keep local
                          </Button>
                        </div>
                        <div className="rounded border bg-muted/30 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">Remote</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.remoteUpdatedAt).toLocaleString()}
                            </span>
                          </div>
                          <pre className="text-xs whitespace-pre-wrap break-words">
                            {fmt(c.remoteValue)}
                          </pre>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handle(c, "remote")}
                            disabled={isResolving}
                          >
                            Keep remote
                          </Button>
                        </div>
                      </div>
                      <div className="rounded border p-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          Or merge — paste the value you want to write:
                        </p>
                        <Textarea
                          rows={3}
                          value={mergeText[c.id] ?? ""}
                          onChange={(e) =>
                            setMergeText((s) => ({ ...s, [c.id]: e.target.value }))
                          }
                          placeholder="Merged value…"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handle(c, "merge")}
                            disabled={isResolving || !mergeText[c.id]}
                          >
                            Apply merge
                          </Button>
                          {onDismiss && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDismiss(c)}
                              disabled={isResolving}
                            >
                              <X className="h-3 w-3 mr-1" /> Dismiss
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SyncConflictResolver;
