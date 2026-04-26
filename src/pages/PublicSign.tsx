// SITA OS — Phase 10: Public e-sign page (no auth required).
// Accessed via /sign/:token from the email signing link.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, AlertTriangle, FileSignature } from "lucide-react";
import { toast } from "sonner";

interface ViewState {
  status: string;
  document_type: string;
  document_title: string | null;
  document_body: string | null;
  signer_email: string;
  signer_name: string | null;
  expires_at: string;
  already_signed: boolean;
  typed_signature: string | null;
  signed_at: string | null;
}

export default function PublicSign() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<ViewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("business-esign-finalize", {
          body: { action: "view", sign_token: token },
        });
        if (error) throw new Error(error.message);
        setState(data as ViewState);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load signing link");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSign = async () => {
    if (!token || !typedName.trim() || !accepted) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("business-esign-finalize", {
        body: { action: "sign", sign_token: token, typed_signature: typedName.trim(), accepted_terms: true },
      });
      if (error) throw new Error(error.message);
      toast.success("Signed successfully");
      setState(s => s ? { ...s, status: "signed", already_signed: true, typed_signature: typedName.trim(), signed_at: (data as { signed_at?: string })?.signed_at ?? new Date().toISOString() } : s);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Signing link unavailable</h1>
          <p className="text-sm text-muted-foreground">{error ?? "This link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-border">
          <FileSignature className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{state.document_title ?? "Agreement"}</h1>
            <p className="text-xs text-muted-foreground">For {state.signer_name ?? state.signer_email}</p>
          </div>
        </header>

        <div className="rounded-xl border border-border bg-card p-6 max-h-[55vh] overflow-y-auto">
          {state.document_body ? (
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{state.document_body}</pre>
          ) : (
            <p className="text-sm text-muted-foreground italic">No document body provided.</p>
          )}
        </div>

        {state.already_signed ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Signed</h2>
            <p className="text-sm text-muted-foreground">
              Signed by <span className="font-mono text-foreground">{state.typed_signature}</span>
              {state.signed_at && <> on {new Date(state.signed_at).toLocaleString()}</>}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type your full legal name as your signature</label>
              <Input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={state.signer_name ?? "Your name"}
                className="mt-1 font-serif italic text-lg"
                maxLength={120}
              />
              {typedName && (
                <div className="mt-2 px-4 py-3 rounded-lg bg-muted/40 border border-border">
                  <span className="text-2xl italic text-primary" style={{ fontFamily: "Georgia, serif" }}>{typedName}</span>
                </div>
              )}
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree that typing my name above constitutes a legal electronic signature and that I am bound by the terms of this document. My IP address, user agent, and timestamp will be recorded as part of an audit trail.
              </span>
            </label>
            <Button
              className="w-full"
              size="lg"
              disabled={!typedName.trim() || !accepted || submitting}
              onClick={handleSign}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSignature className="h-4 w-4 mr-2" />}
              Sign Agreement
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Expires {new Date(state.expires_at).toLocaleDateString()} · Powered by SITA OS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}