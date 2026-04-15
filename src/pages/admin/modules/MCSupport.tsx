import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeadphonesIcon, Search, AlertTriangle, CheckCircle, Clock, Users, Shield, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };

const CASES = [
  { id: "sc1", user: "Sarah Chen", issue: "Sync not completing on iPad", priority: "high", status: "open", age: "2h", assignee: "Support AI" },
  { id: "sc2", user: "Marcus Rivera", issue: "Cannot restore workspace after device switch", priority: "medium", status: "investigating", age: "6h", assignee: "Support AI" },
  { id: "sc3", user: "James Wright", issue: "File upload stuck at 99%", priority: "low", status: "pending-user", age: "1d", assignee: "Unassigned" },
  { id: "sc4", user: "Li Wei", issue: "Trust prompt appearing too frequently", priority: "medium", status: "resolved", age: "2d", assignee: "Trust Team" },
];

const MCSupport = () => {
  const { isDemo } = useAuth();
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">Case queue, diagnostics, and safe repair actions</p>
        </div>
        <Badge variant="outline" className="text-xs h-6 px-3">{CASES.filter(c => c.status !== "resolved").length} open cases</Badge>
      </div>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><HeadphonesIcon className="h-4 w-4 text-primary" /> Case Queue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {CASES.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/10 hover:bg-muted/10 transition-colors group">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                    {c.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{c.issue}</span>
                      <Badge variant="outline" className={`text-[9px] h-4 ${c.priority === "high" ? "text-red-400 border-red-500/20" : c.priority === "medium" ? "text-amber-400 border-amber-500/20" : "text-muted-foreground"}`}>{c.priority}</Badge>
                      <Badge variant="outline" className={`text-[9px] h-4 ${c.status === "resolved" ? "text-emerald-400 border-emerald-500/20" : ""}`}>{c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span>{c.user}</span><span>Age: {c.age}</span><span>Assignee: {c.assignee}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {[
                { label: "Run Diagnostic Bundle", icon: Search },
                { label: "Safe Repair: Sync Reset", icon: Zap },
                { label: "Escalate to Engineering", icon: AlertTriangle },
                { label: "View User Health Summary", icon: Users },
              ].map(a => (
                <Button key={a.label} variant="outline" size="sm" className="h-8 text-xs gap-1.5"><a.icon className="h-3 w-3" /> {a.label}</Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default MCSupport;
