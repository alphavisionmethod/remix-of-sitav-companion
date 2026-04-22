import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Inbox, Send, Star, Trash2, Archive, Search, Plus, Paperclip, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { DEMO_EMAILS } from "@/data/seed/apps";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  category: "primary" | "social" | "promotions" | "updates";
  hasAttachment: boolean;
}

const categoryColors: Record<string, string> = {
  primary: "bg-blue-500/10 text-blue-500",
  social: "bg-purple-500/10 text-purple-500",
  promotions: "bg-amber-500/10 text-amber-500",
  updates: "bg-emerald-500/10 text-emerald-500",
};

export default function EmailApp() {
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const unread = ([] as typeof DEMO_EMAILS).filter(e => !e.read).length;

  const filtered = ([] as typeof DEMO_EMAILS).filter(e => !search || e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
<div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Email</h1>
          {unread > 0 && <Badge variant="destructive" className="text-[10px] h-5">{unread}</Badge>}
        </div>
        <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" /> Compose</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search emails..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5"><Inbox className="h-3.5 w-3.5" /> Inbox</TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Sent</TabsTrigger>
          <TabsTrigger value="starred" className="gap-1.5"><Star className="h-3.5 w-3.5" /> Starred</TabsTrigger>
          <TabsTrigger value="archive" className="gap-1.5"><Archive className="h-3.5 w-3.5" /> Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-3 space-y-1">
          {filtered.map(email => (
            <Card key={email.id} className={`cursor-pointer transition-all hover:shadow-sm ${!email.read ? "border-l-2 border-l-primary bg-primary/[0.02]" : ""}`} onClick={() => setSelectedEmail(email)}>
              <CardContent className="p-3 flex items-start gap-3">
                <div className="pt-1">
                  <button onClick={e => { e.stopPropagation(); }} className={`${email.starred ? "text-amber-500" : "text-muted-foreground/30"}`}>
                    <Star className="h-4 w-4" fill={email.starred ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${!email.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>{email.from}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{email.time}</span>
                  </div>
                  <p className={`text-xs ${!email.read ? "font-medium text-foreground" : "text-foreground/70"}`}>{email.subject}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{email.preview}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge className={categoryColors[email.category]} variant="secondary">{email.category}</Badge>
                    {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent"><Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No sent emails yet</CardContent></Card></TabsContent>
        <TabsContent value="starred"><Card><CardContent className="p-8 text-center text-muted-foreground text-sm">No starred emails</CardContent></Card></TabsContent>
        <TabsContent value="archive"><Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Archive is empty</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
