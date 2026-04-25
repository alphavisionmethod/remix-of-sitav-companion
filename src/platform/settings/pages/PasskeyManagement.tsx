import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { WebAuthnService, type PasskeyRecord } from "@/lib/services/identity-auth/webauthn.service";
import { Fingerprint, Loader2, Trash2, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PasskeyManagement() {
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [supported, setSupported] = useState(false);
  const [platformAvailable, setPlatformAvailable] = useState(false);
  const [label, setLabel] = useState("");
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    try {
      setPasskeys(await WebAuthnService.listPasskeys());
    } catch (e: any) {
      toast({ title: "Failed to load passkeys", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSupported(WebAuthnService.isSupported());
    WebAuthnService.isPlatformAuthenticatorAvailable().then(setPlatformAvailable);
    refresh();
  }, []);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const pk = await WebAuthnService.enrollPasskey(label || "Passkey");
      toast({ title: "Passkey enrolled", description: pk.deviceLabel ?? "Saved" });
      setLabel("");
      await refresh();
    } catch (e: any) {
      toast({ title: "Enrollment failed", description: e.message, variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this passkey? You won't be able to use it to sign in.")) return;
    const ok = await WebAuthnService.revokePasskey(id);
    toast({
      title: ok ? "Passkey revoked" : "Failed to revoke",
      variant: ok ? "default" : "destructive",
    });
    await refresh();
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Passkeys</h1>
        <p className="text-muted-foreground mt-1">
          Hardware-backed passwordless authentication using WebAuthn.
        </p>
      </div>

      {!supported && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Your browser does not support WebAuthn. Try a modern browser like Chrome, Safari, or Edge.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Your passkeys
          </CardTitle>
          <CardDescription>
            {platformAvailable
              ? "Platform authenticator (Touch ID / Windows Hello) is available on this device."
              : "Use a roaming security key (e.g., YubiKey) to enroll."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : passkeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No passkeys enrolled yet.</p>
          ) : (
            <ul className="space-y-2">
              {passkeys.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{p.deviceLabel ?? "Passkey"}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(p.createdAt).toLocaleDateString()}
                        {p.lastUsedAt && ` · Last used ${new Date(p.lastUsedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.transports.length > 0 && (
                      <Badge variant="secondary">{p.transports.join(", ")}</Badge>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleRevoke(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {supported && (
        <Card>
          <CardHeader>
            <CardTitle>Add a passkey</CardTitle>
            <CardDescription>
              Give it a friendly label so you can identify it later (e.g., "MacBook Pro" or "YubiKey 5C").
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passkey-label">Device label</Label>
              <Input
                id="passkey-label"
                placeholder="MacBook Pro"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Fingerprint className="h-4 w-4 mr-2" />}
              Enroll passkey
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
