import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Phone, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { DEMO_COMMUNICATIONS, type DemoCommunicationEntry as CommunicationEntry, type ChannelType, type MessageStatus } from "@/lib/demo-data/communications";


const CHANNEL_ICONS: Record<ChannelType, typeof Mail> = { email: Mail, sms: MessageSquare, call: Phone, chat: Send };
const STATUS_STYLES: Record<MessageStatus, { color: string; icon: typeof CheckCircle2 }> = {
  sent: { color: "text-muted-foreground", icon: Clock },
  delivered: { color: "text-primary", icon: CheckCircle2 },
  read: { color: "text-green-400", icon: CheckCircle2 },
  failed: { color: "text-destructive", icon: AlertCircle },
  queued: { color: "text-muted-foreground", icon: Clock },
};

const stats = {
  totalToday: 24,
  sentToday: 12,
  receivedToday: 12,
  failedToday: 1,
};

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all"
    ? DEMO_COMMUNICATIONS
    : DEMO_COMMUNICATIONS.filter(c => c.channel === activeTab);

  return (
    <div className="space-y-6 p-6">
      <DemoModeBadge />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communications</h1>
          <p className="text-sm text-muted-foreground mt-1">Unified view of all cross-channel communications</p>
        </div>
        <Button size="sm"><Send className="h-4 w-4 mr-2" /> Compose</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: stats.totalToday, icon: MessageSquare },
          { label: "Sent", value: stats.sentToday, icon: Send },
          { label: "Received", value: stats.receivedToday, icon: Mail },
          { label: "Failed", value: stats.failedToday, icon: AlertCircle },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="call">Calls</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4 space-y-2">
          {filtered.map((comm, i) => {
            const ChannelIcon = CHANNEL_ICONS[comm.channel];
            const statusInfo = STATUS_STYLES[comm.status];
            const StatusIcon = statusInfo.icon;
            return (
              <motion.div key={comm.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="bg-card border-border hover:bg-accent/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <ChannelIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{comm.contactName}</span>
                        <Badge variant="outline" className="text-[10px]">{comm.direction}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{comm.domain}</Badge>
                      </div>
                      <p className="text-sm text-foreground/80 truncate">{comm.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{comm.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
