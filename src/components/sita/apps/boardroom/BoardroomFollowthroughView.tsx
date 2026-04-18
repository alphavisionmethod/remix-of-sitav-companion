// ═══════════════════════════════════════════════════════════════
// BoardroomFollowthroughView (user-facing, shell-aware)
// Lists boardroom items past APPROVED and lets the user drill into
// the canonical BoardroomFollowthroughPanel for the full chain.
// Wired into BoardroomAppShell as the "Follow-through" module.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BoardroomFollowthroughPanel } from "./BoardroomFollowthroughPanel";
import { Workflow, ChevronRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ItemRow {
  id: string;
  title: string | null;
  domain: string | null;
  followthrough_state: string | null;
  last_followthrough_event_at: string | null;
  followthrough_failure_reason: string | null;
  updated_at: string;
}

const STATE_TONE: Record<string, { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  approved: { label: "Approved", tone: "info" },
  dispatch_pending: { label: "Dispatch pending", tone: "info" },
  dispatched: { label: "Dispatched", tone: "info" },
  executing: { label: "Executing", tone: "warning" },
  executed: { label: "Executed", tone: "success" },
  receipt_recorded: { label: "Receipt", tone: "success" },
  outcome_pending: { label: "Outcome pending", tone: "warning" },
  outcome_tracked: { label: "Outcome tracked", tone: "success" },
  reflected: { label: "Reflected", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  failed: { label: "Failed", tone: "danger" },
};

const TONE_CLASSES: Record<string, string> = {
  success: "bg-[hsl(145_45%_25%/0.25)] text-[hsl(145_60%_70%)] border-[hsl(145_45%_35%/0.4)]",
  warning: "bg-[hsl(40_50%_25%/0.25)] text-[hsl(40_60%_75%)] border-[hsl(40_45%_35%/0.4)]",
  danger:  "bg-[hsl(0_50%_25%/0.25)]  text-[hsl(0_60%_75%)]  border-[hsl(0_45%_35%/0.4)]",
  info:    "bg-[hsl(220_50%_25%/0.25)] text-[hsl(220_60%_75%)] border-[hsl(220_45%_35%/0.4)]",
  neutral: "bg-[hsl(0_0%_100%/0.05)]  text-[hsl(0_0%_100%/0.55)] border-[hsl(0_0%_100%/0.1)]",
};

export function BoardroomFollowthroughView({ scope }: { scope: string }) {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "attention" | "closed">("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      let q = supabase
        .from("boardroom_items")
        .select(
          "id, title, domain, followthrough_state, last_followthrough_event_at, followthrough_failure_reason, updated_at",
        )
        .not("followthrough_state", "is", null)
        .order("last_followthrough_event_at", { ascending: false, nullsFirst: false })
        .limit(50);
      if (scope && scope !== "global") q = q.eq("domain", scope);
      const { data } = await q;
      if (!cancelled) {
        setItems((data ?? []) as ItemRow[]);
        setLoading(false);
      }
    };
    void load();

    // Realtime: refresh when any item's follow-through state changes
    const channel = supabase
      .channel("boardroom-followthrough-view")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "boardroom_items" },
        () => {
          void load();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [scope]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => {
      const s = it.followthrough_state ?? "";
      if (filter === "closed") return s === "closed" || s === "reflected";
      if (filter === "attention") return s === "failed" || s === "outcome_pending";
      // active
      return !["closed", "reflected", "failed"].includes(s);
    });
  }, [items, filter]);

  const selected = items.find((it) => it.id === selectedId) ?? null;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[hsl(0_0%_100%/0.92)] flex items-center gap-2">
            <Workflow size={18} className="text-[hsl(170_60%_65%)]" />
            Follow-through
          </h2>
          <p className="text-xs text-[hsl(0_0%_100%/0.5)] mt-1">
            Approved boardroom decisions, dispatched into the world, with proof of what actually happened.
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "attention", "closed"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="h-7 text-[11px] capitalize"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* List */}
        <Card className="bg-[hsl(220_18%_5%/0.6)] border-[hsl(0_0%_100%/0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[11px] uppercase tracking-[0.2em] text-[hsl(0_0%_100%/0.5)]">
              Items ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              <div className="divide-y divide-[hsl(0_0%_100%/0.04)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-3 py-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div className="px-4 py-12 text-center text-xs text-[hsl(0_0%_100%/0.4)]">
                    No follow-through items in scope.
                  </div>
                ) : (
                  filtered.map((it) => {
                    const tone = STATE_TONE[it.followthrough_state ?? ""] ?? STATE_TONE.approved;
                    const isSelected = selectedId === it.id;
                    return (
                      <button
                        key={it.id}
                        onClick={() => setSelectedId(it.id)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 transition-colors group",
                          isSelected
                            ? "bg-[hsl(170_45%_18%/0.25)]"
                            : "hover:bg-[hsl(0_0%_100%/0.02)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-[hsl(0_0%_100%/0.85)] truncate">
                              {it.title ?? "Untitled"}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className={cn(
                                  "h-4 px-1.5 text-[9px] font-medium border",
                                  TONE_CLASSES[tone.tone],
                                )}
                              >
                                {tone.label}
                              </Badge>
                              {it.last_followthrough_event_at && (
                                <span className="text-[10px] text-[hsl(0_0%_100%/0.4)] flex items-center gap-1">
                                  <Clock size={9} />
                                  {formatDistanceToNow(new Date(it.last_followthrough_event_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              )}
                            </div>
                            {it.followthrough_failure_reason && (
                              <div className="text-[10px] text-[hsl(0_60%_75%)] mt-1 flex items-center gap-1">
                                <AlertTriangle size={9} />
                                {it.followthrough_failure_reason}
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            size={14}
                            className={cn(
                              "shrink-0 mt-1 transition-transform",
                              isSelected ? "text-[hsl(170_60%_65%)]" : "text-[hsl(0_0%_100%/0.25)]",
                            )}
                          />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail */}
        <div className="min-w-0">
          {selected ? (
            <BoardroomFollowthroughPanel
              itemId={selected.id}
              itemTitle={selected.title ?? undefined}
            />
          ) : (
            <Card className="bg-[hsl(220_18%_5%/0.4)] border-[hsl(0_0%_100%/0.05)] h-full min-h-[360px] flex items-center justify-center">
              <div className="text-center max-w-xs px-6">
                <CheckCircle2 size={28} className="mx-auto text-[hsl(170_50%_55%/0.5)] mb-3" />
                <p className="text-sm text-[hsl(0_0%_100%/0.65)] font-medium">
                  Select an item
                </p>
                <p className="text-xs text-[hsl(0_0%_100%/0.4)] mt-1">
                  Pick a follow-through item from the list to see the full chain — dispatch, execution, proof, outcome, and reflection.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
