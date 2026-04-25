import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MFAService, type MFAFactor } from "@/lib/services/identity-auth/mfa.service";
import { Shield, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MFAEnrollment() {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    try {
      setFactors(await MFAService.listFactors());
    } catch (e: any) {
      toast({ title: "Failed to load factors", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const result = await MFAService.enrollTOTP("Authenticator");
      setEnrollResult(result);
    } catch (e: any) {
      toast({ title: "Enrollment failed", description: e.message, variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerify = async () => {
    if (!enrollResult || verifyCode.length !== 6) return;
    setVerifying(true);
    try {
      const ok = await MFAService.challengeAndVerify(enrollResult.factorId, verifyCode);
      if (ok) {
        toast({ title: "MFA enrolled", description: "TOTP factor verified successfully." });
        setEnrollResult(null);
        setVerifyCode("");
        await refresh();
      } else {
        toast({ title: "Invalid code", description: "Please try again.", variant: "destructive" });
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async (factorId: string) => {
    if (!confirm("Remove this authentication factor?")) return;
    const ok = await MFAService.unenroll(factorId);
    toast({
      title: ok ? "Removed" : "Failed to remove",
      variant: ok ? "default" : "destructive",
    });
    await refresh();
  };

  return (
    <div className="container mx-auto max-w-3xl py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Multi-factor authentication</h1>
        <p className="text-muted-foreground mt-1">Add an authenticator app to protect your account.</p>
      </div>

      {/* Existing factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Enrolled factors
          </CardTitle>
          <CardDescription>Authenticator apps and other MFA factors currently enrolled.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : factors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No factors enrolled yet.</p>
          ) : (
            <ul className="space-y-2">
              {factors.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{f.friendlyName ?? f.factorType}</p>
                      <p className="text-xs text-muted-foreground">Enrolled {new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={f.status === "verified" ? "default" : "secondary"}>{f.status}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleUnenroll(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Enroll new */}
      {!enrollResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Add authenticator app</CardTitle>
            <CardDescription>Use Google Authenticator, 1Password, Authy, or any TOTP app.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Begin enrollment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Scan & verify</CardTitle>
            <CardDescription>Scan the QR code with your authenticator app, then enter the 6-digit code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center rounded-lg bg-muted p-4">
              <img src={enrollResult.qrCode} alt="MFA QR code" className="h-48 w-48" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Manual entry secret:</p>
              <code className="block break-all rounded bg-muted px-2 py-1 text-xs">{enrollResult.secret}</code>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEnrollResult(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={verifyCode.length !== 6 || verifying} className="flex-1">
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & enable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
