import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Heart } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";

const HRS01HealthConsentCenter = () => (
  <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <DemoModeBadge />
    <div className="flex items-center gap-3">
      <ShieldCheck className="h-8 w-8 text-primary" />
      <div>
        <h1 className="text-2xl font-bold">Health & Readiness Consent Center</h1>
        <p className="text-muted-foreground">Signal-level consent governance, privacy controls, revoke/erase</p>
      </div>
    </div>
    <Card>
      <CardHeader><CardTitle className="text-sm">Consent Principles</CardTitle></CardHeader>
      <CardContent className="text-xs space-y-1">
        <p>• Every signal type requires explicit opt-in</p>
        <p>• Routing influence requires separate consent from ingestion</p>
        <p>• Boardroom visibility requires explicit signal-level approval</p>
        <p>• Assistant use requires separate consent</p>
        <p>• Revoke & erase available at any time — immediate effect</p>
        <p>• Privacy explanation mandatory before consent grant</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle className="text-sm">Consent Categories</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { cat: "Ingestion", desc: "Allow SITA to read this signal from provider" },
            { cat: "Routing Influence", desc: "Allow signal to influence notification routing" },
            { cat: "Boardroom Visibility", desc: "Allow signal summary in boardroom briefings" },
            { cat: "Assistant Use", desc: "Allow assistant to reference signal-derived state" },
          ].map((c) => (
            <div key={c.cat} className="p-3 rounded border">
              <div className="font-medium flex items-center gap-2"><Heart className="h-3 w-3" />{c.cat}</div>
              <p className="text-muted-foreground mt-1">{c.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default HRS01HealthConsentCenter;
