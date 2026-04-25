// ═══════════════════════════════════════════════════════════════
// SITA OS — Imports & Exports Advisor detail drawer.
// Read-only deep dive on a vendor contact or trade document.
// Imports/Exports Advisor never executes filings, contracts, or
// live shipping changes — recommend-only.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Ship, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";

export type ImpExpDrawerTarget =
  | { kind: "vendor"; id: string; label: string }
  | { kind: "doc"; id: string; label: string };

interface VendorDetail {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  source: string | null;
  tags: string[] | null;
  last_contacted_at: string | null;
  created_at: string;
}

interface DocDetail {
  id: string;
  filename: string;
  classification: string | null;
  sensitivity: string | null;
  status: string | null;
  size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
}

interface DetailState {
  vendor?: VendorDetail | null;
  doc?: DocDetail | null;
  loading: boolean;
}

interface Props {
  target: ImpExpDrawerTarget | null;
  onClose: () => void;
}

export function ImportsExportsDetailDrawer({ target, onClose }: Props) {
  const [state, setState] = useState<DetailState>({ loading: false });
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDraft(null);
    if (!target) {
      setState({ loading: false });
      return;
    }
    setState({ loading: true });

    async function load() {
      if (!target) return;
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setState({ loading: false });
        return;
      }
      if (target.kind === "vendor") {
        const { data } = await supabase
          .from("crm_contacts")
          .select("id, first_name, last_name, email, phone, country, city, source, tags, last_contacted_at, created_at")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) setState({ loading: false, vendor: (data ?? null) as VendorDetail | null });
      } else {
        const { data } = await supabase
          .from("file_metadata")
          .select("id, filename, classification, sensitivity, status, size_bytes, mime_type, created_at")
          .eq("user_id", userId)
          .eq("id", target.id)
          .maybeSingle();
        if (!cancelled) setState({ loading: false, doc: (data ?? null) as DocDetail | null });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [target]);

  async function draftMemo() {
    if (!target) return;
    setDrafting(true);
    try {
      let prompt = "";
      if (target.kind === "vendor" && state.vendor) {
        const v = state.vendor;
        prompt = `Vendor "${[v.first_name, v.last_name].filter(Boolean).join(" ") || "(unnamed)"}" based in ${v.city ?? "?"}, ${v.country ?? "?"}. Source: ${v.source ?? "n/a"}. Tags: ${(v.tags ?? []).join(", ") || "none"}. Last contacted ${v.last_contacted_at ?? "never"}. Recommend the top 3 trade-readiness checks before placing a cross-border order with this vendor. Recommend-only.`;
      } else if (target.kind === "doc" && state.doc) {
        const d = state.doc;
        prompt = `Trade document "${d.filename}" — classification "${d.classification ?? "unclassified"}", sensitivity "${d.sensitivity ?? "unset"}", status "${d.status ?? "unset"}". Recommend (a) the correct classification if missing, (b) the top 2 compliance checks to run before relying on this document. Recommend-only.`;
      } else {
        return;
      }
      const r = await askBusinessAdvisor({
        advisorId: "imports-exports-advisor",
        prompt,
        intent: "draft",
      });
      setDraft(r.response.content);
    } finally {
      setDrafting(false);
    }
  }

  return (
    <Sheet open={!!target} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            {target?.kind === "vendor" && <Ship className="h-4 w-4" />}
            {target?.kind === "doc" && <FileText className="h-4 w-4" />}
            {target?.label ?? "Trade detail"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Read-only — Imports & Exports Advisor never files customs, commits supplier contracts, or modifies live shipments.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-3 mt-3">
          {state.loading && <Skeleton className="h-32 w-full" />}

          {!state.loading && target?.kind === "vendor" && state.vendor && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <p className="text-[10px] uppercase text-muted-foreground">Vendor</p>
              <p className="text-sm font-semibold">
                {[state.vendor.first_name, state.vendor.last_name].filter(Boolean).join(" ") || "(unnamed)"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Country: </span>{state.vendor.country ?? "—"}</div>
                <div><span className="text-muted-foreground">City: </span>{state.vendor.city ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Email: </span>{state.vendor.email ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Phone: </span>{state.vendor.phone ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Source: </span>{state.vendor.source ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Tags: </span>{(state.vendor.tags ?? []).join(", ") || "—"}</div>
              </div>
            </div>
          )}

          {!state.loading && target?.kind === "doc" && state.doc && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <p className="text-[10px] uppercase text-muted-foreground">Trade document</p>
              <p className="text-sm font-semibold break-all">{state.doc.filename}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Classification: </span>{state.doc.classification ?? "—"}</div>
                <div><span className="text-muted-foreground">Sensitivity: </span>{state.doc.sensitivity ?? "—"}</div>
                <div><span className="text-muted-foreground">Status: </span>{state.doc.status ?? "—"}</div>
                <div><span className="text-muted-foreground">Mime: </span>{state.doc.mime_type ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Uploaded: </span>{new Date(state.doc.created_at).toLocaleString()}</div>
              </div>
            </div>
          )}

          {!state.loading && target && !state.vendor && !state.doc && (
            <Alert>
              <AlertDescription className="text-xs">
                Could not load this record — it may have been removed or you no longer have access.
              </AlertDescription>
            </Alert>
          )}

          {draft && (
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                Imports & Exports Advisor draft
              </p>
              <p className="text-xs whitespace-pre-wrap">{draft}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-2">
          <Button
            onClick={draftMemo}
            disabled={drafting || state.loading}
            className="w-full"
            size="sm"
          >
            {drafting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting…</>
            ) : (
              "Draft trade memo"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}