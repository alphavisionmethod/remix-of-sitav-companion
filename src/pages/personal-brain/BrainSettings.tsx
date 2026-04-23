// ═══════════════════════════════════════════════════════════════
// Personal Brain — Settings Hub (Phase 5)
// ═══════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  ShieldAlert,
  Sparkles,
  Clock,
  Mic,
  Download,
  ChevronRight,
} from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePbSecurityPrefs } from "@/components/personal-brain/hooks/usePbSecurityPrefs";

interface Section {
  id: string;
  label: string;
  desc: string;
  icon: typeof Settings;
  to: string;
}

const SECTIONS: Section[] = [
  {
    id: "security",
    label: "Security & Privacy",
    desc: "Sensitive mode, retention, security activity log",
    icon: ShieldAlert,
    to: "/personal-brain/settings/security",
  },
  {
    id: "learning",
    label: "Learning & Memory",
    desc: "Auto-learn, confidence threshold, source toggles",
    icon: Sparkles,
    to: "/personal-brain/settings/learning",
  },
  {
    id: "retention",
    label: "Data Retention",
    desc: "Message lifespan, voice transcript policy",
    icon: Clock,
    to: "/personal-brain/settings/retention",
  },
  {
    id: "voice",
    label: "Voice & Speech",
    desc: "Voice selection, autoread, hands-free",
    icon: Mic,
    to: "/personal-brain/voice-settings",
  },
  {
    id: "data",
    label: "Export Your Data",
    desc: "Download a portable JSON archive of your Brain",
    icon: Download,
    to: "/personal-brain/settings/data",
  },
];

export default function BrainSettings() {
  const navigate = useNavigate();
  const { prefs } = usePbSecurityPrefs();

  return (
    <GlobalErrorBoundary>
      <PageShell>
        <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Brain settings</h1>
            {prefs?.sensitive_mode && (
              <Badge variant="outline" className="ml-auto border-destructive/50 text-destructive">
                <ShieldAlert className="mr-1 h-3 w-3" />
                Sensitive mode on
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.id}
                  className="cursor-pointer transition hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => navigate(s.to)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{s.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}