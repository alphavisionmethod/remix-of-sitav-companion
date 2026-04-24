import { Navigate, useParams } from "react-router-dom";
import { AdvisorPageShell } from "@/components/business-advisors/AdvisorPageShell";
import { getBusinessAdvisor } from "@/lib/ai-platform/runtime";
import { SalesAdvisorRecommendations } from "@/components/business-advisors/sales/SalesAdvisorRecommendations";
import { SalesAdvisorSimulationForm } from "@/components/business-advisors/sales/SalesAdvisorSimulationForm";
import { SalesAdvisorHeaderStats } from "@/components/business-advisors/sales/SalesAdvisorHeaderStats";
import { CustomerServiceRecommendations } from "@/components/business-advisors/customer-service/CustomerServiceRecommendations";
import { CustomerServiceSimulationForm } from "@/components/business-advisors/customer-service/CustomerServiceSimulationForm";
import { CustomerServiceHeaderStats } from "@/components/business-advisors/customer-service/CustomerServiceHeaderStats";
import { CFOAdvisorRecommendations } from "@/components/business-advisors/cfo/CFOAdvisorRecommendations";
import { CFOAdvisorSimulationForm } from "@/components/business-advisors/cfo/CFOAdvisorSimulationForm";
import { CFOAdvisorHeaderStats } from "@/components/business-advisors/cfo/CFOAdvisorHeaderStats";
import { MarketingAdvisorRecommendations } from "@/components/business-advisors/marketing/MarketingAdvisorRecommendations";
import { MarketingAdvisorSimulationForm } from "@/components/business-advisors/marketing/MarketingAdvisorSimulationForm";
import { MarketingAdvisorHeaderStats } from "@/components/business-advisors/marketing/MarketingAdvisorHeaderStats";
import { GrowthAdvisorRecommendations } from "@/components/business-advisors/growth/GrowthAdvisorRecommendations";
import { GrowthAdvisorSimulationForm } from "@/components/business-advisors/growth/GrowthAdvisorSimulationForm";
import { GrowthAdvisorHeaderStats } from "@/components/business-advisors/growth/GrowthAdvisorHeaderStats";

export default function BusinessAdvisorPage() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const advisor = advisorId ? getBusinessAdvisor(advisorId) : undefined;
  if (!advisor) {
    return <Navigate to="/business-advisors" replace />;
  }
  if (advisor.id === "sales-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<SalesAdvisorHeaderStats />}
        recommendationsSlot={<SalesAdvisorRecommendations />}
        simulationFormSlot={<SalesAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "customer-service-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<CustomerServiceHeaderStats />}
        recommendationsSlot={<CustomerServiceRecommendations />}
        simulationFormSlot={<CustomerServiceSimulationForm />}
      />
    );
  }
  if (advisor.id === "cfo-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<CFOAdvisorHeaderStats />}
        recommendationsSlot={<CFOAdvisorRecommendations />}
        simulationFormSlot={<CFOAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "marketing-advertising-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<MarketingAdvisorHeaderStats />}
        recommendationsSlot={<MarketingAdvisorRecommendations />}
        simulationFormSlot={<MarketingAdvisorSimulationForm />}
      />
    );
  }
  if (advisor.id === "growth-advisor") {
    return (
      <AdvisorPageShell
        advisor={advisor}
        headerStatsSlot={<GrowthAdvisorHeaderStats />}
        recommendationsSlot={<GrowthAdvisorRecommendations />}
        simulationFormSlot={<GrowthAdvisorSimulationForm />}
      />
    );
  }
  return <AdvisorPageShell advisor={advisor} />;
}