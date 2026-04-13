// Route-entry wrapper for the OS Setup Experience.
// OSSetupExperience handles its own DB persistence and data mode internally.
import { OSSetupExperience } from "@/components/sita/OSSetupExperience";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

const OnboardingWrapper = () => (
  <>
    <h1 className="sr-only">Setup</h1>
<OSSetupExperience />
  </>
);

export default OnboardingWrapper;
