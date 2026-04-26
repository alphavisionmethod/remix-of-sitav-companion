// truth-allow: ia-config
import { MoneyOnboardingFlow } from "@/platform/sita/components/sita/money-onboarding";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";
import { openFinanceModule } from "@/lib/finance-launcher";

const MoneyOnboarding = () => {
  return (
    <>
      <PageTruthBanner truthState="partial" />
      <MoneyOnboardingFlow onComplete={() => openFinanceModule("overview")} />
    </>
  );
};

export default MoneyOnboarding;
