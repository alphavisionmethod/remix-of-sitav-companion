import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import {
  Home, Briefcase, DollarSign, Headphones, Workflow, Receipt, BarChart3, FolderOpen, Settings, Shield, Search,
  Plus, Phone, FileUp, FileText, UserPlus, CalendarPlus, Eye
} from "lucide-react";

const commands = [
  { group: "Navigate", items: [
    { label: "Daily Pulse", icon: Home, path: "/", hint: "Home" },
    { label: "Business Center", icon: Briefcase, path: "/business", hint: "Leads & Customers" },
    { label: "Money Center", icon: DollarSign, path: "/money", hint: "Accounts & Bills" },
    { label: "Concierge", icon: Headphones, path: "/concierge", hint: "Household & Life" },
    { label: "Workflows", icon: Workflow, path: "/workflows", hint: "Actions & Approvals" },
    { label: "Proof Center", icon: Receipt, path: "/proof", hint: "Receipts & Logs" },
    { label: "Boardroom", icon: BarChart3, path: "/boardroom", hint: "Reviews & Planning" },
    { label: "Files & Knowledge", icon: FolderOpen, path: "/files", hint: "Documents & Media" },
    { label: "Search", icon: Search, path: "/search", hint: "Cross-domain" },
    { label: "Revenue Calling", icon: Phone, path: "/revenue-calling", hint: "Dialer & Scripts" },
    { label: "Settings", icon: Settings, path: "/settings", hint: "Trust & Preferences" },
    { label: "Mission Control", icon: Shield, path: "/mission-control", hint: "System & Admin" },
  ]},
  { group: "Mission Control", items: [
    { label: "Agent Control Panel", icon: Shield, path: "/mission-control?tab=control-panel", hint: "Manage agents" },
    { label: "Predictive Analysis", icon: BarChart3, path: "/mission-control?tab=predictive", hint: "Failure predictions" },
    { label: "Audit Log", icon: FileText, path: "/mission-control?tab=audit-log", hint: "ISO compliant trail" },
    { label: "Compliance Dashboard", icon: Shield, path: "/mission-control?tab=compliance", hint: "ISO/SOC/NIST" },
    { label: "BCP/DR Planning", icon: Shield, path: "/mission-control?tab=bcpdr", hint: "Disaster recovery" },
    { label: "Change Advisory Board", icon: Shield, path: "/mission-control?tab=cab", hint: "Change management" },
  ]},
  { group: "Quick Actions", items: [
    { label: "Add New Lead", icon: UserPlus, path: "/business?action=new-lead", hint: "Business" },
    { label: "Create Invoice", icon: FileText, path: "/business?action=new-invoice", hint: "Business" },
    { label: "Schedule Callback", icon: Phone, path: "/business?action=callback", hint: "Business" },
    { label: "Upload Document", icon: FileUp, path: "/files?action=upload", hint: "Files" },
    { label: "New Boardroom Review", icon: BarChart3, path: "/boardroom?action=new", hint: "Boardroom" },
    { label: "Schedule Appointment", icon: CalendarPlus, path: "/concierge?action=schedule", hint: "Concierge" },
    { label: "Review Approvals", icon: Eye, path: "/workflows?tab=approvals", hint: "Workflows" },
  ]},
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3.5 py-2 text-xs text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:border-border w-64">
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or do anything...</span>
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search spaces, actions, customers, files..." className="text-sm" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">No results found. Try a different search.</CommandEmpty>
          {commands.map((group, i) => (
            <div key={group.group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={() => { navigate(item.path); setOpen(false); }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  >
                    <div className="rounded-md bg-secondary p-1.5">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/60">{item.hint}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};
