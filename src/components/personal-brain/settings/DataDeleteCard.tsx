// ═══════════════════════════════════════════════════════════════
// Personal Brain — Delete All Brain Data card (Phase 6)
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function DataDeleteCard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function performDelete() {
    if (confirm !== "DELETE") return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("personal-brain", {
        body: { action: "data.delete", payload: { confirm: "DELETE" } },
      });
      if (error) throw error;
      const counts = (data as { counts?: Record<string, number> } | null)?.counts ?? {};
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      toast({
        title: "Brain data deleted",
        description: `Removed ${total} record${total === 1 ? "" : "s"} across ${Object.keys(counts).length} tables.`,
      });
      setOpen(false);
      setConfirm("");
      navigate("/personal-brain");
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete all Brain data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permanently removes your profile, goals, workspaces, chats, messages, memories,
            files, voice prefs, and security log. Your account itself is untouched.
          </p>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete my Brain data…
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Tip: download an export first if you'd like a copy.
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-4 w-4" />
              Confirm permanent deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-xs">
              Confirmation phrase
            </Label>
            <Input
              id="confirm-delete"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              disabled={busy}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void performDelete()}
              disabled={busy || confirm !== "DELETE"}
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Permanently delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}