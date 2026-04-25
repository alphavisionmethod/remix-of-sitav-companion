// ═══════════════════════════════════════════════════════════════
// SITA OS — Integration Receipt Drawer (Phase 4)
//
// Real receipt visibility for an account: last 20 oauth probe rows
// + token rotation count + last refresh time. Opened from any
// OAuthRefreshHealthBoard row.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectorStateBadge } from "@/platform/cloud/components/ConnectorStateBadge";
import { requestProviderReauth } from "@/lib/connectors/reauth-actions";
import { toast } from "sonner";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** account_id from connector_accounts */
  accountId: string | null;
  provider: string | null;
  /** Optional fallback identifier shown when accountId is unknown */
  fallbackLabel?: string | null;
}

interface ProbeRow {
  id: string;
  status: string;
  lifecycle_state: string;
  reauth_required: boolean;
  failure_class: string | null;
  failure_reason: string | null;
  probe_finished_at: string | null;
  duration_ms: number | null;
}

interface TokenRow {
  id: string;
  rotation_count: number;
  last_refreshed_at: string | null;
  expires_at: string | null;
  reauth_required: boolean;
}

function relTime(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function IntegrationReceiptDrawer({
  open,
  onOpenChange,
  accountId,
  provider,
  fallbackLabel,
}: Props) {
  const [probes, setProbes] = useState<ProbeRow[]>([]);
  const [token, setToken] = useState<TokenRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [reauthing, setReauthing] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const probeFilter = supabase
        .from("oauth_refresh_probe_results")
        .select("id, status, lifecycle_state, reauth_required, failure_class, failure_reason, probe_finished_at, duration_ms")
        .order("probe_finished_at", { ascending: false })
        .limit(20);
      if (accountId) probeFilter.eq("account_id", accountId);
      else if (provider) probeFilter.eq("provider", provider);
      const { data: probesData } = await probeFilter;

      let tokenData: TokenRow | null = null;
      if (accountId) {
        const { data } = await supabase
          .from("connector_oauth_tokens")
          .select("id, rotation_count, last_refreshed_at, expires_at, reauth_required")
          .eq("account_id", accountId)
          .maybeSingle();
        tokenData = data as TokenRow | null;
      }

      if (!cancelled) {
        setProbes((probesData ?? []) as ProbeRow[]);
        setToken(tokenData);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, accountId, provider]);

  const handleReauth = async () => {
    if (!accountId) {
      toast.error("Cannot reauth: account id missing");
      return;
    }
    setReauthing(true);
    try {
      const r = await requestProviderReauth({ accountId, reason: "Operator drawer" });
      if (!r.ok) throw new Error(r.error);
      toast.success("Reauth flagged — operator must reconnect");
      onOpenChange(false);
    } catch (e) {
      toast.error("Reauth request failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setReauthing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base capitalize">
            {provider ?? "Provider"} — receipts
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground font-mono">
            {accountId ?? fallbackLabel ?? "—"}
          </p>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Token section */}
          <section>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              Token state
            </p>
            {!token && (
              <p className="text-xs text-muted-foreground italic">
                No token row found for this account.
              </p>
            )}
            {token && (
              <Card className="p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rotations</span>
                  <span className="font-medium tabular-nums">{token.rotation_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last refreshed</span>
                  <span className="font-medium">{relTime(token.last_refreshed_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">
                    {token.expires_at ? new Date(token.expires_at).toLocaleString() : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reauth required</span>
                  <ConnectorStateBadge
                    state={token.reauth_required ? "reauth_required" : "connected"}
                    size="xs"
                  />
                </div>
              </Card>
            )}
          </section>

          {/* Reauth CTA */}
          <section>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReauth}
              disabled={reauthing || !accountId}
              className="w-full"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {reauthing ? "Flagging…" : "Request reauth"}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-1">
              Marks the account + token as reauth_required and emits a timeline event.
            </p>
          </section>

          {/* Probes */}
          <section>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-1">
              Recent probes ({probes.length})
            </p>
            {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loading && probes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                No probe receipts recorded yet.
              </p>
            )}
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {probes.map((p) => (
                <Card key={p.id} className="p-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <ConnectorStateBadge
                      state={p.reauth_required ? "reauth_required" : p.lifecycle_state}
                      size="xs"
                    />
                    <span className="text-muted-foreground">
                      {relTime(p.probe_finished_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{p.status}</span>
                    {p.duration_ms != null && <span>· {p.duration_ms}ms</span>}
                    {p.failure_class && <span>· {p.failure_class}</span>}
                  </div>
                  {p.failure_reason && (
                    <p className="mt-1 text-[10px] text-destructive line-clamp-2">
                      {p.failure_reason}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ReauthCTAButton({ accountId, label = "Reconnect" }: { accountId: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-6 text-[10px]"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await requestProviderReauth({ accountId, reason: "Inline CTA" });
          if (!r.ok) throw new Error(r.error);
          toast.success("Reauth flagged");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Reauth failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${busy ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
}
