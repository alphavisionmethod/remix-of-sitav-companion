import FIPSubNav from "@/platform/admin/components/admin/FIPSubNav";
import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Shield, Zap, Eye, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCapabilities, useCreateCapability } from "@/hooks/use-fip-data";
import { CAPABILITY_CLASSES } from "@/lib/fip/types";
import { PageTruthBanner } from "@/platform/sita/components/sita/PageTruthBanner";



const FIPCapabilityRegistry = () => {
  const { data: caps = [], isLoading } = useCapabilities();
  const createCap = useCreateCapability();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ capability_id: '', name: '', capability_class: 'observe', owner_service: '', risk_tier: 'standard', approval_type: 'none', receipt_requirement: 'none' });

  const handleCreate = () => {
    if (!form.capability_id || !form.name || !form.owner_service) return;
    createCap.mutate(form);
    setShowForm(false);
    setForm({ capability_id: '', name: '', capability_class: 'observe', owner_service: '', risk_tier: 'standard', approval_type: 'none', receipt_requirement: 'none' });
  };

  const classCounts = CAPABILITY_CLASSES.reduce((acc, c) => ({ ...acc, [c]: caps.filter((cap: Record<string, any>) => cap.capability_class === c).length }), {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <FIPSubNav />
<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="h-6 w-6 text-primary" /> FIP04 — Capability Registry</h1>
            <p className="text-muted-foreground mt-1">Register and inspect all platform capabilities with risk, autonomy, and approval semantics</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2"><Plus className="h-4 w-4" /> Register Capability</Button>
        </div>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        {CAPABILITY_CLASSES.map(c => (
          <Badge key={c} variant={classCounts[c] > 0 ? 'default' : 'outline'} className="text-xs">{c}: {classCounts[c] || 0}</Badge>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Register New Capability</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Capability ID</label><Input value={form.capability_id} onChange={e => setForm(p => ({ ...p, capability_id: e.target.value }))} placeholder="e.g., invoice.auto-collect" /></div>
              <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Owner Service</label><Input value={form.owner_service} onChange={e => setForm(p => ({ ...p, owner_service: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className="text-sm font-medium">Class</label><Select value={form.capability_class} onValueChange={v => setForm(p => ({ ...p, capability_class: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CAPABILITY_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Risk Tier</label><Select value={form.risk_tier} onValueChange={v => setForm(p => ({ ...p, risk_tier: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['standard','elevated','critical'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Approval Type</label><Select value={form.approval_type} onValueChange={v => setForm(p => ({ ...p, approval_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['none','single','dual','owner-only'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-sm font-medium">Receipt Req</label><Select value={form.receipt_requirement} onValueChange={v => setForm(p => ({ ...p, receipt_requirement: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['none','proposal','execution','verification','full-chain'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleCreate}>Register</Button></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Capability ID</TableHead><TableHead>Name</TableHead><TableHead>Class</TableHead><TableHead>Owner</TableHead><TableHead>Risk</TableHead><TableHead>Approval</TableHead><TableHead>Receipt</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow> :
                caps.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No capabilities registered</TableCell></TableRow> :
                caps.map((cap: Record<string, any>) => (
                  <TableRow key={cap.id}>
                    <TableCell className="font-mono text-xs">{cap.capability_id}</TableCell>
                    <TableCell>{cap.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{cap.capability_class}</Badge></TableCell>
                    <TableCell className="text-xs">{cap.owner_service}</TableCell>
                    <TableCell><Badge variant={cap.risk_tier === 'critical' ? 'destructive' : 'outline'} className="text-xs">{cap.risk_tier}</Badge></TableCell>
                    <TableCell className="text-xs">{cap.approval_type}</TableCell>
                    <TableCell className="text-xs">{cap.receipt_requirement}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{cap.status}</Badge></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FIPCapabilityRegistry;
