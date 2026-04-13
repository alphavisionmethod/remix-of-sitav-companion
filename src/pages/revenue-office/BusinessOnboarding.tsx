// Route-entry wrapper for the Business Formation flow.
// FormationShell manages its own multi-step onboarding screens internally.
import FormationShell from "./onboarding/FormationShell";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";

export default function BusinessOnboarding() {
  return (
    <>
      <h1 className="sr-only">Business Onboarding</h1>
<FormationShell />
    </>
  );
}
