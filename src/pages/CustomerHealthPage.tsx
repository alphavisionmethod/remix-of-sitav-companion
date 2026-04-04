import { SitaPageHeader } from "@/components/sita/SitaCard";
import { motion } from "framer-motion";
import { CustomerHealthDashboard } from "@/components/business/CustomerHealthDashboard";

const CustomerHealthPage = () => (
  <motion.div className="mx-auto max-w-7xl space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
    <SitaPageHeader title="Customer Health" subtitle="Lifecycle stages, health scores, and churn risk across your portfolio" />
    <CustomerHealthDashboard />
  </motion.div>
);

export default CustomerHealthPage;
