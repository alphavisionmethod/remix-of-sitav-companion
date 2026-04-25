import { BedDouble } from "lucide-react";
import HealthMetricsApp from "./HealthMetricsApp";

export default function HealthRecovery() {
  return (
    <HealthMetricsApp
      title="Recovery"
      icon={BedDouble}
      defaultKind="recovery.sleep_hours"
      description="Log sleep, readiness, and HRV. Track your recovery over time."
      kindOptions={[
        { value: "recovery.sleep_hours",     label: "Sleep" },
        { value: "recovery.readiness_score", label: "Readiness score" },
        { value: "recovery.hrv_ms",          label: "HRV" },
        { value: "recovery.resting_hr",      label: "Resting heart rate" },
        { value: "recovery.mood_1to10",      label: "Mood (1-10)" },
      ]}
      unitOptions={["hours", "score", "ms", "bpm", "rating"]}
    />
  );
}
