import { Card, CardContent } from "@/components/ui/card";
import { LearningSettingsCard } from "@/components/personal-brain/settings/LearningSettingsCard";

export default function MemorySettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold">Memory & Learning</h2>
          <p className="text-xs text-muted-foreground">Auto-learn behavior, confidence threshold, and source toggles.</p>
        </CardContent>
      </Card>
      <LearningSettingsCard />
    </div>
  );
}
