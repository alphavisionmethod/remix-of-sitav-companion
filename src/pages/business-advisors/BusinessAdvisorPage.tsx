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
  return <AdvisorPageShell advisor={advisor} />;
}