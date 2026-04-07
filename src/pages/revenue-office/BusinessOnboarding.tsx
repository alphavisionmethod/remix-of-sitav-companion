import FormationShell from "./onboarding/FormationShell";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

export default function BusinessOnboarding() {
  const { isDemoMode } = useDataMode();
  return <><DemoModeBadge /><FormationShell /></>;
}
