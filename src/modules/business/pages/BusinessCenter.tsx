import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * BusinessCenter is now a redirect shim.
 * When any /business/* route is hit, it opens the Business windowed app
 * at the correct sub-page and redirects back to /desktop.
 */

const subpageFromPath = (path: string): string => {
  // Phase 8: Revenue Operations Home is the canonical landing for /business/revenue.
  if (path.endsWith("/business/revenue") || path.includes("/revenue-home")) {
    return "revenue-home";
  }
  if (path.includes("/crm-communications")) return "crm-communications";
  if (path.includes("/crm-home")) return "crm-home";
  if (path.includes("/crm-contacts")) return "crm-contacts";
  if (path.includes("/crm-companies")) return "crm-companies";
  if (path.includes("/crm-pipeline")) return "crm-pipeline";
  if (path.includes("/crm-health")) return "crm-health";
  if (path.includes("/crm-timeline")) return "crm-timeline";
  if (path.includes("/crm-tasks")) return "crm-tasks";
  if (path.includes("/crm-notes")) return "crm-notes";
  if (path.includes("/crm-segments")) return "crm-segments";
  if (path.includes("/crm-automations")) return "crm-automations";
  if (path.includes("/crm-import")) return "crm-import";
  if (path.includes("/crm-duplicates")) return "crm-duplicates";
  if (path.includes("/crm-advisor")) return "crm-advisor";
  if (path.includes("/crm-fields")) return "crm-fields";
  if (path.includes("/documents")) return "documents";
  if (path.includes("/operations")) return "operations";
  if (path.includes("/follow-through")) return "follow-through";
  if (path.includes("/support")) return "support";
  if (path.includes("/appointments")) return "appointments";
  if (path.includes("/website-builder")) return "website-builder";
  if (path.includes("/proposals")) return "proposals";
  if (path.includes("/lead-recovery")) return "lead-recovery";
  if (path.includes("/social")) return "social";
  if (path.includes("/revenue-forecast")) return "revenue-forecast";
  if (path.includes("/playbook-builder")) return "playbook-builder";
  if (path.includes("/revenue-impact")) return "revenue-impact";
  // Phase 2 IA cleanup — order matters: longer/canonical slug must be tested
  // before its prefix substring. /revenue-autopilot-console contains
  // "/revenue-autopilot" as a substring, so check console first.
  if (path.includes("/revenue-autopilot-console")) return "revenue-autopilot-console";
  if (path.includes("/autopilot-hub")) return "autopilot-hub";
  if (path.includes("/collections")) return "collections";
  if (path.includes("/revenue-autopilot")) return "revenue-autopilot";
  if (path.includes("/leads")) return "leads";
  if (path.includes("/customers")) return "customers";
  if (path.includes("/opportunities")) return "opportunities";
  if (path.includes("/quotes")) return "quotes";
  if (path.includes("/invoices")) return "invoices";
  if (path.includes("/communications")) return "communications";
  if (path.includes("/boardroom")) return "boardroom";
  if (path.includes("/proof")) return "proof";
  if (path.includes("/ecommerce")) return "ecommerce";
  if (path.includes("/integrations")) return "integrations";
  if (path.includes("/customer-health")) return "customer-health";
  if (path.includes("/continuity-report") || path.includes("/continuity")) return "continuity-report";
  // Handle /customers/:id pattern
  const customerMatch = path.match(/\/customers\/([^/]+)/);
  if (customerMatch) return `customer-detail:${customerMatch[1]}`;
  return "crm-home";
};

const BusinessCenter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const module = subpageFromPath(location.pathname);
    // Dispatch event to open Business app with correct module
    window.dispatchEvent(new CustomEvent("sita-open-business", { detail: { module } }));
    // Redirect to desktop
    navigate("/desktop", { replace: true });
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Opening Business OS…</p>
      </div>
    </div>
  );
};

export default BusinessCenter;
