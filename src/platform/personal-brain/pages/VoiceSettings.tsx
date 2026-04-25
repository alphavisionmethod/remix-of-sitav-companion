import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic } from "lucide-react";
import { GlobalErrorBoundary } from "@/platform/sita/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/platform/sita/components/sita/PageShell";
import { Button } from "@/components/ui/button";
import { VoiceSettingsCard } from "@/platform/personal-brain/components/personal-brain/voice/VoiceSettingsCard";

export default function VoiceSettings() {
  const navigate = useNavigate();
  return (
    <GlobalErrorBoundary>
      <PageShell>
        <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/personal-brain")}>
              <ArrowLeft className="h-4 w-4" />
              Brain
            </Button>
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Mic className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-base font-semibold">Voice settings</h1>
          </div>
          <VoiceSettingsCard />
        </div>
      </PageShell>
    </GlobalErrorBoundary>
  );
}