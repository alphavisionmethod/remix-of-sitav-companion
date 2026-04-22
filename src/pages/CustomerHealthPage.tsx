import { SitaPageHeader } from "@/components/sita/SitaCard";
import { CustomerHealthDashboard } from "@/components/business/CustomerHealthDashboard";
import { PageShell } from "@/components/sita/PageShell";
import { Typography } from "@/components/sita/Typography";

const CustomerHealthPage = () => (
  <PageShell width="wide">
    <SitaPageHeader title="Customer Health" subtitle="Lifecycle stages, health scores, and churn risk across your portfolio" />
    <CustomerHealthDashboard />
  </PageShell>
);

export default CustomerHealthPage;
