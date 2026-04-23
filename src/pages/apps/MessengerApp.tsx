import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Search, Plus, Paperclip, Smile, Phone, Video, MoreVertical, CheckCheck } from "lucide-react";
import { useState } from "react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isAdvisor: boolean;
}

interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
  read: boolean;
}

export default function MessengerApp() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(CHATS[0]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const filtered = ([] as any[]).filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
<div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Messenger</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Chat List */}
        <Card className="md:col-span-1 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search chats..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(chat => (
              <div key={chat.id} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedChat?.id === chat.id ? "bg-muted/70" : ""}`} onClick={() => setSelectedChat(chat)}>
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {chat.avatar}
                  </div>
                  {chat.online && <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{chat.name}</span>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">{chat.unread}</Badge>}
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">{selectedChat.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedChat.name}</p>
                    <p className="text-[10px] text-emerald-500">{selectedChat.online ? "Online" : "Offline"}</p>
                  </div>
                  {selectedChat.isAdvisor && <Badge variant="secondary" className="text-[9px] h-4">AI Advisor</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {([] as any[]).map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender === "me" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {msg.sender === "me" && <CheckCheck className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Paperclip className="h-4 w-4" /></Button>
                  <Input placeholder="Type a message..." value={message} onChange={e => setMessage(e.target.value)} className="flex-1 h-9" onKeyDown={e => { if (e.key === "Enter") setMessage(""); }} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><Smile className="h-4 w-4" /></Button>
                  <Button size="icon" className="h-8 w-8 shrink-0"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
          )}
        </Card>
      </div>
    </div>
  );
}
