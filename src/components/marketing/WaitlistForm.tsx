// Waitlist signup form — calls edge function, shows position + share card.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Result { position: number; referral_code: string; already?: boolean }

export function WaitlistForm({ referredBy }: { referredBy?: string | null }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-signup", {
        body: { email: email.trim(), referred_by: referredBy ?? null, source: "waitlist_page" },
      });
      if (error || !data?.ok) throw error ?? new Error(data?.error ?? "Failed");
      setResult({ position: data.position, referral_code: data.referral_code, already: data.already });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not join waitlist. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const shareUrl = `${window.location.origin}/waitlist?ref=${result.referral_code}`;
    return (
      <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 text-center space-y-5">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{result.already ? "You're already on the list" : "You're in"}</div>
          <div className="text-4xl font-bold tabular-nums mt-1">#{result.position.toLocaleString()}</div>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Share your link. Every confirmed referral moves you up <strong>5 positions</strong> (cap 50). Top 100 get founder pricing for life.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <div className="flex-1 px-3 py-2 rounded-md bg-muted text-sm truncate text-left">{shareUrl}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copied");
            }}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (navigator.share) navigator.share({ url: shareUrl, title: "SITA OS waitlist", text: "I just joined the SITA OS waitlist." });
              else { navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }
            }}
          >
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          placeholder="you@domain.com"
          className="mt-1"
          autoComplete="email"
        />
      </label>
      {referredBy && (
        <p className="text-xs text-muted-foreground">Referred by code <strong>{referredBy}</strong></p>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Joining…" : "Join the waitlist"}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        One email. No spam. Confirmation only.
      </p>
    </form>
  );
}
