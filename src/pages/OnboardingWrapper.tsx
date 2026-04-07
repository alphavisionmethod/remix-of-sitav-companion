// Onboarding wrapper that renders the premium OS Setup Experience
import { OSSetupExperience } from "@/components/sita/OSSetupExperience";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const OnboardingWrapper = () => (<><DemoModeBadge /><OSSetupExperience /></>);
export default OnboardingWrapper;
