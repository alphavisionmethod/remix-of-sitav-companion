/**
 * SITA OS — Notification Disclosure Card
 * Calm, premium disclosure of what notifications exist and how they behave.
 * Embedded in Settings (notifications page) and First-Boot onboarding.
 *
 * Class: USER-FACING TRUST DISCLOSURE (Economic Governance + UX Trust closure).
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Settings as SettingsIcon } from "lucide-react";

export function NotificationDisclosureCard({
  showCalmModeBadge = true,
}: {
  showCalmModeBadge?: boolean;
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Bell className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          How notifications work here
          {showCalmModeBadge ? (
            <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Calm by default
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/70 mb-1">
            What you may see
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><span className="font-medium text-foreground">Operational</span> — security events, billing, account safety. Always shown.</li>
            <li><span className="font-medium text-foreground">Workflow</span> — approvals waiting on you, follow-ups due.</li>
            <li><span className="font-medium text-foreground">Insights</span> — periodic summaries from your AI workspace. Quiet by default.</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/70 mb-1">
            Default posture
          </p>
          <p className="text-xs flex items-start gap-1.5">
            <BellOff className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Calm mode is on by default. You'll only be interrupted for safety,
              approvals, and items you've explicitly subscribed to. Insights and
              digests batch quietly and surface in their dedicated boards.
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/70 mb-1">
            How to tune
          </p>
          <p className="text-xs flex items-start gap-1.5">
            <SettingsIcon className="h-3 w-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>
              Open Settings → Notifications to change channels (in-app, email, push)
              per category, set quiet hours, or temporarily mute non-critical alerts.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationDisclosureCard;
