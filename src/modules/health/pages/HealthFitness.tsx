import { Dumbbell } from "lucide-react";
import HealthMetricsApp from "./HealthMetricsApp";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function HealthFitness() {
  return (
    <>
      <div className="px-6 pt-4"><PageTruthBanner truthState="partial" /></div>
      <HealthMetricsApp
      title="Fitness"
      icon={Dumbbell}
      defaultKind="fitness.steps"
      description="Log workouts, steps, and training volume. Each entry produces a Trust receipt."
      kindOptions={[
        { value: "fitness.steps",          label: "Steps"           },
        { value: "fitness.workout_min",    label: "Workout minutes" },
        { value: "fitness.distance_km",    label: "Distance"        },
        { value: "fitness.calories_burn",  label: "Calories burned" },
        { value: "fitness.heart_rate_avg", label: "Avg heart rate"  },
      ]}
      unitOptions={["count", "min", "km", "mi", "kcal", "bpm"]}
      />
    </>
  );
}