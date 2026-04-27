import { Apple } from "lucide-react";
import HealthMetricsApp from "./HealthMetricsApp";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";

export default function HealthNutrition() {
  return (
    <>
      <div className="px-6 pt-4"><PageTruthBanner truthState="partial" /></div>
      <HealthMetricsApp
      title="Nutrition"
      icon={Apple}
      defaultKind="nutrition.calories"
      description="Log meals, calories, and macro intake. All entries owner-only with a Trust receipt."
      kindOptions={[
        { value: "nutrition.calories", label: "Calories" },
        { value: "nutrition.protein_g", label: "Protein" },
        { value: "nutrition.carbs_g",   label: "Carbs"   },
        { value: "nutrition.fat_g",     label: "Fat"     },
        { value: "nutrition.water_ml",  label: "Water"   },
      ]}
      unitOptions={["kcal", "g", "ml", "oz"]}
      />
    </>
  );
}