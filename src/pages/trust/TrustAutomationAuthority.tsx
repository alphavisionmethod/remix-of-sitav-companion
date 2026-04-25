import { Bot, ShieldCheck } from "lucide-react";

export default function TrustAutomationAuthority() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <Bot className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-semibold">Automation Authority</h1>
      </header>
      <p className="text-muted-foreground mb-6">
        Set the autonomy level for every advisor and automation. Nothing acts on your behalf without
        an explicit grant of authority — and you can revoke it at any time.
      </p>
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>
            Wired in Phase 2 to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">advisor_autonomy_policies</code>{" "}
            and the action-safety classifier.
          </span>
        </div>
      </div>
    </div>
  );
}