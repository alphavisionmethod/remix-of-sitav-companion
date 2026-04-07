import { LearnLaterHub } from "@/components/sita/onboarding/LearnLaterHub";

export default function LearnLaterPage() {
  const { isDemoMode } = useDataMode();
  return (
    <div className="min-h-screen bg-background p-6">
      <LearnLaterHub />
    </div>
  );
}
