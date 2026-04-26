import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Key, Globe, Wallet, ArrowRight, Shield, ExternalLink } from "lucide-react";
import type { AvailablePlatform } from "@/domains/investment";
import { cn } from "@/lib/utils";

interface Props {
  platform: AvailablePlatform | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AUTH_LABELS: Record<string, { label: string; icon: typeof Key; description: string }> = {
  oauth: { label: "Sign In", icon: Globe, description: "Securely authorize via the platform's login page" },
  "api-key": { label: "API Key", icon: Key, description: "Paste your read-only API key and secret" },
  "wallet-connect": { label: "WalletConnect", icon: Wallet, description: "Scan QR code or connect from your wallet app" },
  extension: { label: "Browser Extension", icon: Wallet, description: "Connect via your installed wallet extension" },
};

type Step = "overview" | "auth" | "confirm";

export function ConnectPlatformModal({ platform, open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>("overview");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  if (!platform) return null;

  const auth = AUTH_LABELS[platform.authMethod || "oauth"];

  const handleClose = (v: boolean) => {
    if (!v) { setStep("overview"); setApiKey(""); setApiSecret(""); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{platform.icon}</span>
            Connect {platform.name}
          </DialogTitle>
          <DialogDescription>
            {step === "overview" && "Review what data will be synced and how."}
            {step === "auth" && `Authenticate with ${platform.name}`}
            {step === "confirm" && "Connection ready — confirm to start syncing."}
          </DialogDescription>
        </DialogHeader>

        {step === "overview" && (
          <div className="space-y-4">
            {/* Capabilities */}
            {platform.capabilities && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Data Access</p>
                <div className="flex flex-wrap gap-1.5">
                  {platform.capabilities.map(c => (
                    <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {platform.chain && (
                <Badge variant="outline" className="text-[10px]">⛓ {platform.chain}</Badge>
              )}
              {platform.region && (
                <Badge variant="outline" className="text-[10px]">🌍 {platform.region}</Badge>
              )}
              <Badge variant="outline" className="text-[10px] capitalize">
                {auth.label} auth
              </Badge>
            </div>

            {/* Security note */}
            <div className="rounded-lg border border-border bg-secondary/10 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <Shield className="h-3.5 w-3.5 text-[hsl(var(--trust-safe))] mt-0.5 shrink-0" />
              <span>All connections are encrypted, scoped to read-only by default, and governed by your trust settings. SITA never stores raw credentials.</span>
            </div>

            <button
              onClick={() => setStep("auth")}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "auth" && (
          <div className="space-y-4">
            {(platform.authMethod === "api-key") && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">API Key</label>
                  <Input placeholder="Paste your API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">API Secret</label>
                  <Input type="password" placeholder="Paste your API secret" value={apiSecret} onChange={e => setApiSecret(e.target.value)} />
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Find your API keys in {platform.name}'s settings → API Management
                </p>
              </>
            )}

            {(platform.authMethod === "oauth") && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-2">
                <Globe className="h-8 w-8 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">Redirect to {platform.name}</p>
                <p className="text-[11px] text-muted-foreground">You'll be redirected to authorize read-only access</p>
              </div>
            )}

            {(platform.authMethod === "wallet-connect") && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-3">
                <div className="mx-auto w-24 h-24 rounded-xl bg-muted flex items-center justify-center text-3xl">📱</div>
                <p className="text-sm font-medium text-foreground">Scan with {platform.name}</p>
                <p className="text-[11px] text-muted-foreground">Open your wallet app and scan the QR code</p>
              </div>
            )}

            {(platform.authMethod === "extension") && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-2">
                <Wallet className="h-8 w-8 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">Connect {platform.name} Extension</p>
                <p className="text-[11px] text-muted-foreground">Click below to connect via your browser extension</p>
              </div>
            )}

            <button
              onClick={() => setStep("confirm")}
              disabled={platform.authMethod === "api-key" && !apiKey}
              className={cn(
                "w-full rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                platform.authMethod === "api-key" && !apiKey
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {platform.authMethod === "oauth" ? "Authorize" : "Connect"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-[hsl(var(--trust-safe))]" />
            <div>
              <p className="text-sm font-semibold text-foreground">{platform.name} Connected</p>
              <p className="text-xs text-muted-foreground mt-1">Initial sync will begin shortly. You can manage permissions in Settings.</p>
            </div>
            {platform.capabilities && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {platform.capabilities.map(c => (
                  <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            )}
            <button
              onClick={() => handleClose(false)}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
