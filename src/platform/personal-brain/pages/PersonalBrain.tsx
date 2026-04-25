import { Loader2 } from "lucide-react";
import { GlobalErrorBoundary } from "@/components/sita/GlobalErrorBoundary";
import { PageShell } from "@/components/sita/PageShell";
import { usePersonalBrainOnboarding } from "@/components/personal-brain/onboarding/usePersonalBrainOnboarding";
import { PersonalBrainOnboarding } from "@/components/personal-brain/onboarding/PersonalBrainOnboarding";
import { BrainDashboard } from "@/components/personal-brain/BrainDashboard";

function PersonalBrainGate() {
  const { loading, onboarded, refresh } = usePersonalBrainOnboarding();

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!onboarded) {
    return <PersonalBrainOnboarding onComplete={() => void refresh()} />;
  }

  return <BrainDashboard />;
}

export default function PersonalBrain() {
  return (
    <GlobalErrorBoundary>
      <PersonalBrainGate />
    </GlobalErrorBoundary>
  );
}
