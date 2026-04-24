import { Navigate, useParams } from "react-router-dom";
import { AdvisorPageShell } from "@/components/business-advisors/AdvisorPageShell";
import { getBusinessAdvisor } from "@/lib/ai-platform/runtime";

export default function BusinessAdvisorPage() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const advisor = advisorId ? getBusinessAdvisor(advisorId) : undefined;
  if (!advisor) {
    return <Navigate to="/business-advisors" replace />;
  }
  return <AdvisorPageShell advisor={advisor} />;
}