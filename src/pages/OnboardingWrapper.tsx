// Route-entry wrapper for the OS Setup Experience.
// OSSetupExperience handles its own DB persistence and data mode internally.
import { OSSetupExperience } from "@/components/sita/OSSetupExperience";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const OnboardingWrapper = () => (
  <>
    <DemoModeBadge />
    <OSSetupExperience />
  </>
);

export default OnboardingWrapper;
