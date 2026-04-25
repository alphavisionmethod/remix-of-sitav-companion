import { Apple } from "lucide-react";
import HealthMetricsApp from "./HealthMetricsApp";

export default function HealthNutrition() {
  return (
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
  );
}