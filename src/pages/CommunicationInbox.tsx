import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, Phone, Clock, ArrowRight, AlertCircle, CheckCircle2, Search } from "lucide-react";

const MOCK_MESSAGES = [
  { id: "1", from: "Sarah Chen", subject: "Q3 proposal revisions", channel: "email", time: "10 min ago", priority: "high", needsFollowUp: true },
  { id: "2", from: "Mike Torres", subject: "Meeting rescheduled to Thursday", channel: "email", time: "1 hr ago", priority: "normal", needsFollowUp: false },
  { id: "3", from: "Family Group", subject: "Weekend plans", channel: "message", time: "2 hrs ago", priority: "normal", needsFollowUp: false },
  { id: "4", from: "Acme Corp", subject: "Invoice #4521 payment confirmation", channel: "email", time: "3 hrs ago", priority: "normal", needsFollowUp: false },
  { id: "5", from: "Dr. Williams", subject: "Appointment reminder", channel: "email", time: "Yesterday", priority: "normal", needsFollowUp: true },
];

const channelIcon = (ch: string) => {
  if (ch === "message") return <MessageSquare className="h-4 w-4 text-blue-500" />;
  if (ch === "phone") return <Phone className="h-4 w-4 text-emerald-500" />;
  return <Mail className="h-4 w-4 text-muted-foreground" />;
};

const CommunicationInbox = () => {
  const followUps = MOCK_MESSAGES.filter(m => m.needsFollowUp);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Communications</h1>
          <p className="text-muted-foreground mt-1">Unified view across all channels</p>
        </div>
        <Badge variant="outline">{followUps.length} need follow-up</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search messages, contacts, or topics..." className="pl-10" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-Up</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 mt-4">
          {MOCK_MESSAGES.map(msg => (
            <Card key={msg.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                {channelIcon(msg.channel)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{msg.from}</p>
                    {msg.priority === "high" && <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                    {msg.needsFollowUp && <Badge variant="outline" className="text-xs flex-shrink-0">Follow-up</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />{msg.time}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="follow-up" className="space-y-2 mt-4">
          {followUps.map(msg => (
            <Card key={msg.id} className="hover:bg-muted/30 transition-colors cursor-pointer border-amber-500/20">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                {channelIcon(msg.channel)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{msg.from}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
                </div>
                <Button variant="outline" size="sm">Reply</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No sent messages to show</CardContent></Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No scheduled messages</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationInbox;
