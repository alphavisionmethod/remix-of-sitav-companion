import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle, Users, Mail, Phone, FileText, Clock, Undo2 } from "lucide-react";

const receipts = [
  { time: "14 min ago", automation: "Stale Lead Recovery", action: "Sent recovery email to 24 leads", contacts: 24, approvedBy: "Auto-run (L3)", outcome: "22 delivered, 2 bounced", rollback: true },
  { time: "1 hr ago", automation: "No-Show Rescue", action: "Sent SMS to 3 no-show contacts", contacts: 3, approvedBy: "Auto-run (L3)", outcome: "3 delivered, 1 rebooked", rollback: true },
  { time: "2 hrs ago", automation: "Quote Follow-up", action: "Sent 5-day reminder to 8 prospects", contacts: 8, approvedBy: "Auto-run (L3)", outcome: "8 delivered, 3 opened", rollback: true },
  { time: "4 hrs ago", automation: "Post-Service Review", action: "Requested review from 12 clients", contacts: 12, approvedBy: "Auto-run (L3)", outcome: "12 sent, 4 reviews submitted", rollback: false },
  { time: "6 hrs ago", automation: "Welcome Onboarding", action: "Sent welcome package to 5 new clients", contacts: 5, approvedBy: "Auto-run (L3)", outcome: "5 delivered, 5 opened", rollback: false },
  { time: "8 hrs ago", automation: "Lead Assignment", action: "Assigned 15 leads to sales team", contacts: 15, approvedBy: "Jane (manual review)", outcome: "15 assigned, 2 re-routed", rollback: true },
  { time: "1 day ago", automation: "Churn Prevention", action: "Sent check-in to 8 at-risk clients", contacts: 8, approvedBy: "AI Draft → User approved", outcome: "8 sent, 3 responded", rollback: true },
  { time: "1 day ago", automation: "Reactivation Campaign", action: "Launched 3-step reactivation for 34 dormant contacts", contacts: 34, approvedBy: "Decision Theater → Approved", outcome: "Step 1: 32 delivered", rollback: true },
];

export default function AutomationReceipts() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Automation Receipts & History</h1>
        <p className="text-muted-foreground">Full audit trail — who created, what happened, which contacts affected, outcomes, and rollback options</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{receipts.length}</p><p className="text-xs text-muted-foreground">Actions (24hrs)</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-400">{receipts.reduce((a, r) => a + r.contacts, 0)}</p><p className="text-xs text-muted-foreground">Contacts Affected</p></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-400">{receipts.filter(r => r.rollback).length}</p><p className="text-xs text-muted-foreground">Rollback Available</p></CardContent></Card>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-5 w-5 text-blue-400" />Action History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {receipts.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-foreground">{r.automation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.time}</span>
                  {r.rollback && (
                    <button className="px-2 py-1 rounded text-[10px] bg-secondary text-secondary-foreground flex items-center gap-1 hover:bg-secondary/80"><Undo2 className="h-3 w-3" />Rollback</button>
                  )}
                </div>
              </div>
              <p className="text-xs text-foreground mb-1">{r.action}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{r.contacts} contacts</span>
                <span>Approved by: {r.approvedBy}</span>
                <span>Outcome: <span className="text-foreground">{r.outcome}</span></span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
