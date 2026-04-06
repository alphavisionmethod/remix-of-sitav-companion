import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Link, User } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const APL04AppleIdentityAccounts = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <KeyRound className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Apple Identity & Linked Accounts</h1>
        <p className="text-muted-foreground">Sign in with Apple, identity graph, session semantics</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Sign in with Apple Architecture</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex justify-between p-2 border rounded"><span>Provider</span><Badge>apple_sign_in</Badge></div>
          <div className="flex justify-between p-2 border rounded"><span>Session model</span><Badge variant="outline">JWT</Badge></div>
          <div className="flex justify-between p-2 border rounded"><span>Email relay</span><Badge variant="outline">supported</Badge></div>
          <div className="flex justify-between p-2 border rounded"><span>Device-bound trust</span><Badge variant="outline">linkable</Badge></div>
          <div className="flex justify-between p-2 border rounded"><span>Identity graph</span><Badge variant="outline">unified</Badge></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Identity Link Flow</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>User authenticates via Apple</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span>Apple ID linked to SITA identity graph</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span>Session token issued with device trust context</span>
          </div>
          <p className="text-muted-foreground mt-2">Separate from Google and connector auth. Supports login, linking, and revocation.</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default APL04AppleIdentityAccounts;
