// ═══════════════════════════════════════════════════════════════
// SITA OS — Mobile Honesty Notice
//
// Small inline alert linking to docs/MOBILE_HONESTY.md. Appears on
// install/distribution surfaces so users who land there understand
// SITA OS does NOT currently ship a native iOS or Android app.
//
// Enforced by scripts/validation/check-install-page-mobile-honesty.ts
// ═══════════════════════════════════════════════════════════════
import { Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MobileHonestyNoticeProps {
  className?: string;
}

export function MobileHonestyNotice({ className }: MobileHonestyNoticeProps) {
  return (
    <Alert className={className}>
      <Smartphone className="h-4 w-4" />
      <AlertDescription className="text-xs">
        On a phone? SITA OS runs as a responsive web app (and installable PWA on
        supported browsers) — there is currently no native iOS or Android app.{" "}
        <a
          href="/docs/MOBILE_HONESTY.md"
          className="underline text-primary hover:text-primary/80"
        >
          Read the mobile honesty doc →
        </a>
      </AlertDescription>
    </Alert>
  );
}

export default MobileHonestyNotice;
