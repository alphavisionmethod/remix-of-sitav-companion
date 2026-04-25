// ═══════════════════════════════════════════════════════════════
// SITA OS — Taxes & Laws Advisor detail drawer.
// Read-only deep dive on a single tax/legal document.
// L1-suggest authority. NEVER drafts filings, contracts, or legal
// language; only suggests preparation checklists. Persistent
// professional disclaimer at top, suggestion frame at bottom.
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
import { Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { ProfessionalDisclaimerBanner } from "./ProfessionalDisclaimerBanner";

export type TaxesLawsDrawerTarget = { id: string; label: string };

interface DocDetail {
  id: string;
  filename: string;
  classification: string | null;
  sensitivity: string | null;
  status: string | null;
  size_bytes: number | null;
  mime_type: string | null;
  extracted_data: unknown | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  target: TaxesLawsDrawerTarget | null;
  onClose: () => void;
}

export function TaxesLawsDetailDrawer({ target, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<DocDetail | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSuggestion(null);
    setDoc(null);
    if (!target) {
      setLoading(false);
      return;
    }
    setLoading(true);

    async function load() {
      if (!target) return;
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("file_metadata")
        .select("id, filename, classification, sensitivity, status, size_bytes, mime_type, extracted_data, created_at, updated_at")
        .eq("user_id", userId)
        .eq("id", target.id)
        .maybeSingle();
      if (!cancelled) {
        setDoc((data ?? null) as DocDetail | null);
        setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [target]);

  async function suggestChecklist() {
    if (!target || !doc) return;
    setSuggesting(true);
    try {
      const prompt =
        `Tax/legal document "${doc.filename}" — classification "${doc.classification ?? "unclassified"}", ` +
        `sensitivity "${doc.sensitivity ?? "unset"}", status "${doc.status ?? "unset"}". ` +
        `Suggest a 3-step preparation checklist the operator can run BEFORE consulting a licensed professional: ` +
        `(a) what to verify is current, (b) what context to capture, (c) what questions to take to the professional. ` +
        `Suggestion only — do not draft any filing, contract, or legal language; do not provide tax or legal advice; ` +
        `remind the user to consult a licensed professional.`;
      const r = await askBusinessAdvisor({
        advisorId: "taxes-laws-advisor",
        prompt,
        intent: "ask",
      });
      setSuggestion(r.response.content);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <Sheet open={!!target} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {target?.label ?? "Tax / legal document"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Read-only — Taxes & Laws Advisor never files returns, drafts contracts, or provides advice.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-3">
          <ProfessionalDisclaimerBanner variant="compact" />
        </div>

        <ScrollArea className="flex-1 pr-3 mt-3">
          {loading && <Skeleton className="h-32 w-full" />}

          {!loading && doc && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <p className="text-[10px] uppercase text-muted-foreground">Document</p>
              <p className="text-sm font-semibold break-all">{doc.filename}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Classification: </span>{doc.classification ?? "—"}</div>
                <div><span className="text-muted-foreground">Sensitivity: </span>{doc.sensitivity ?? "—"}</div>
                <div><span className="text-muted-foreground">Status: </span>{doc.status ?? "—"}</div>
                <div><span className="text-muted-foreground">Mime: </span>{doc.mime_type ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Uploaded: </span>{new Date(doc.created_at).toLocaleString()}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Last updated: </span>{new Date(doc.updated_at).toLocaleString()}</div>
              </div>
            </div>
          )}

          {!loading && target && !doc && (
            <Alert>
              <AlertDescription className="text-xs">
                Could not load this document — it may have been removed or you no longer have access.
              </AlertDescription>
            </Alert>
          )}

          {suggestion && (
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Advisor suggestion
                </p>
                <ProfessionalDisclaimerBanner variant="inline" />
              </div>
              <p className="text-xs whitespace-pre-wrap">{suggestion}</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border pt-3 mt-2">
          <Button
            onClick={suggestChecklist}
            disabled={suggesting || loading || !doc}
            className="w-full"
            size="sm"
          >
            {suggesting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Suggesting…</>
            ) : (
              "Suggest preparation checklist"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}