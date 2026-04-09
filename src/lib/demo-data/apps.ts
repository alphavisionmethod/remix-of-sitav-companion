// SITA OS — Demo Data: Apps
import { Sun, Cloud, CloudRain } from "lucide-react";

interface Email { id: string; from: string; subject: string; preview: string; time: string; read: boolean; starred: boolean; category: string; hasAttachment: boolean; }
interface Photo { id: string; url: string; title: string; date: string; album: string; tags: string[]; favorite: boolean; }
interface Chat { id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; isAdvisor: boolean; }
interface Message { id: string; sender: string; text: string; time: string; read: boolean; }
interface VaultEntry { id: string; name: string; username: string; url: string; category: string; lastUsed: string; strength: string; breached: boolean; }


export const DEMO_EMAILS: Email[] = [
  { id: "1", from: "Sarah Chen", subject: "Q2 Revenue Projections", preview: "Hi, I've attached the updated revenue projections for Q2. Please review before our meeting tomorrow...", time: "10:32 AM", read: false, starred: true, category: "primary", hasAttachment: true },
  { id: "2", from: "SITA System", subject: "Weekly AI Team Performance Report", preview: "Your AI team processed 1,247 tasks this week with 96.4% accuracy. 3 agents were upgraded to beta status...", time: "9:15 AM", read: false, starred: false, category: "updates", hasAttachment: false },
  { id: "3", from: "Alex Rivera", subject: "Contract Review: Apex Corp", preview: "The legal team has reviewed the contract. A few minor changes needed on clause 4.2 regarding...", time: "Yesterday", read: true, starred: false, category: "primary", hasAttachment: true },
  { id: "4", from: "Money Advisor", subject: "Bill Payment Reminder", preview: "You have 2 bills due this week: AWS ($342) and Figma ($15). Auto-pay is enabled for both...", time: "Yesterday", read: true, starred: false, category: "updates", hasAttachment: false },
  { id: "5", from: "Dev Team", subject: "Sprint 12 Retrospective Notes", preview: "Great sprint everyone! Key wins: launched advisor memory system, deployed personalization engine...", time: "2 days ago", read: true, starred: true, category: "primary", hasAttachment: false },
  { id: "6", from: "LinkedIn", subject: "5 new connections this week", preview: "Your network is growing! You have 5 new connection requests and 12 profile views...", time: "3 days ago", read: true, starred: false, category: "social", hasAttachment: false },
];

export const DEMO_placeholderColors = [
  "from-blue-500/30 to-purple-500/30",
  "from-emerald-500/30 to-teal-500/30",
  "from-amber-500/30 to-orange-500/30",
  "from-pink-500/30 to-red-500/30",
  "from-indigo-500/30 to-blue-500/30",
  "from-cyan-500/30 to-emerald-500/30",
  "from-violet-500/30 to-purple-500/30",
  "from-rose-500/30 to-pink-500/30",
  "from-lime-500/30 to-green-500/30",
  "from-sky-500/30 to-indigo-500/30",
  "from-fuchsia-500/30 to-pink-500/30",
  "from-teal-500/30 to-cyan-500/30",
];

export const DEMO_PHOTOS: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  url: "",
  title: ["Team Offsite", "Product Launch", "Dashboard V3", "Architecture Diagram", "Sunset Walk", "Office Setup", "Whiteboard Session", "Coffee Break", "Code Review", "Sprint Demo", "Celebration", "Morning Run"][i],
  date: ["Today", "Today", "Yesterday", "Yesterday", "3 days ago", "Last week", "Last week", "Last week", "2 weeks ago", "2 weeks ago", "3 weeks ago", "Last month"][i],
  album: ["Work", "Work", "Work", "Work", "Personal", "Work", "Work", "Personal", "Work", "Work", "Personal", "Personal"][i],
  tags: [["team", "event"], ["product"], ["design", "ui"], ["architecture"], ["nature"], ["setup"], ["brainstorm"], ["social"], ["dev"], ["demo"], ["team", "event"], ["fitness"]][i],
  favorite: [true, false, true, false, false, false, true, false, false, true, false, false][i],
}));

export const DEMO_albums = ["All", "Work", "Personal", "Screenshots", "Documents"];

export const DEMO_sleepData = [7.2, 6.8, 8.1, 7.5, 6.5, 9.0, 7.8];

export const DEMO_stepsData = [8200, 6500, 10200, 7800, 5600, 12400, 9100];

export const DEMO_waterData = [6, 8, 5, 7, 8, 4, 7];

export const DEMO_CHATS: Chat[] = [
  { id: "1", name: "Money Advisor", avatar: "💰", lastMessage: "Your portfolio is up 2.3% this week. I've prepared a summary.", time: "2m ago", unread: 1, online: true, isAdvisor: true },
  { id: "2", name: "Business Advisor", avatar: "📊", lastMessage: "The Apex Corp deal has moved to negotiation stage.", time: "15m ago", unread: 0, online: true, isAdvisor: true },
  { id: "3", name: "Concierge", avatar: "🎯", lastMessage: "Your dentist appointment is confirmed for Thursday 3pm.", time: "1h ago", unread: 0, online: true, isAdvisor: true },
  { id: "4", name: "Sarah Chen", avatar: "SC", lastMessage: "Thanks for the report! Looks great.", time: "3h ago", unread: 0, online: false, isAdvisor: false },
  { id: "5", name: "System Alerts", avatar: "🔔", lastMessage: "Edge function deployed: chat-advisor v3.2", time: "5h ago", unread: 2, online: true, isAdvisor: false },
];

export const DEMO_MESSAGES: Message[] = [
  { id: "1", sender: "other", text: "Good morning! I've analyzed your portfolio performance this week.", time: "9:30 AM", read: true },
  { id: "2", sender: "other", text: "Your portfolio is up 2.3%. The tech sector allocation contributed 1.8% of the gains. I've also noticed your emergency fund could use a top-up.", time: "9:30 AM", read: true },
  { id: "3", sender: "me", text: "Great, what do you recommend for the emergency fund?", time: "9:45 AM", read: true },
  { id: "4", sender: "other", text: "I recommend moving $2,000 from your checking account. This would bring your emergency fund to the recommended 6-month coverage. Want me to prepare the transfer?", time: "9:46 AM", read: true },
  { id: "5", sender: "me", text: "Yes, prepare the transfer but don't execute — I'll approve it first.", time: "10:00 AM", read: true },
  { id: "6", sender: "other", text: "Your portfolio is up 2.3% this week. I've prepared a summary.", time: "10:02 AM", read: false },
];

export const DEMO_ENTRIES: VaultEntry[] = [
  { id: "1", name: "Google Workspace", username: "admin@company.com", url: "google.com", category: "login", lastUsed: "Today", strength: "strong", breached: false },
  { id: "2", name: "AWS Console", username: "devops@company.com", url: "aws.amazon.com", category: "login", lastUsed: "Yesterday", strength: "strong", breached: false },
  { id: "3", name: "Stripe Dashboard", username: "finance@company.com", url: "stripe.com", category: "login", lastUsed: "2 days ago", strength: "medium", breached: false },
  { id: "4", name: "OpenAI API Key", username: "sk-...4f2a", url: "platform.openai.com", category: "api", lastUsed: "Today", strength: "strong", breached: false },
  { id: "5", name: "Company Visa Card", username: "•••• 4242", url: "", category: "card", lastUsed: "Last week", strength: "strong", breached: false },
  { id: "6", name: "Legacy CRM Login", username: "admin", url: "old-crm.com", category: "login", lastUsed: "30 days ago", strength: "weak", breached: true },
];

export const DEMO_forecast = [
  { day: "Today", icon: Sun, temp: 24, high: 26, low: 18, condition: "Sunny", rain: 0 },
  { day: "Tue", icon: Cloud, temp: 22, high: 23, low: 17, condition: "Cloudy", rain: 10 },
  { day: "Wed", icon: CloudRain, temp: 19, high: 20, low: 15, condition: "Rain", rain: 70 },
  { day: "Thu", icon: CloudRain, temp: 18, high: 19, low: 14, condition: "Showers", rain: 60 },
  { day: "Fri", icon: Cloud, temp: 21, high: 22, low: 16, condition: "Partly Cloudy", rain: 20 },
  { day: "Sat", icon: Sun, temp: 25, high: 27, low: 19, condition: "Sunny", rain: 5 },
  { day: "Sun", icon: Sun, temp: 27, high: 29, low: 20, condition: "Clear", rain: 0 },
];

export const DEMO_newsArticles = [
  { title: "AI Agents Are Reshaping How Businesses Operate", source: "TechCrunch", time: "2h ago", category: "Technology", preview: "A new wave of autonomous AI agents is transforming enterprise workflows, from customer support to financial planning." },
  { title: "Fed Signals Rate Cut Likely in September", source: "Bloomberg", time: "4h ago", category: "Finance", preview: "Federal Reserve officials indicated that a rate reduction could come as early as September, citing cooling inflation." },
  { title: "Remote Work Productivity Study Reveals Surprising Results", source: "HBR", time: "6h ago", category: "Business", preview: "A comprehensive 3-year study of 10,000 remote workers shows nuanced productivity patterns." },
  { title: "Cybersecurity Threats Surge 300% in Q1 2026", source: "Wired", time: "8h ago", category: "Security", preview: "AI-powered attacks are growing exponentially, with phishing and deepfakes leading the charge." },
  { title: "New EU Regulations for AI Transparency Take Effect", source: "Reuters", time: "12h ago", category: "Policy", preview: "The European Union's AI Act compliance requirements begin today for high-risk systems." },
  { title: "Sustainable Investing Outperforms Traditional Portfolios", source: "FT", time: "1d ago", category: "Finance", preview: "ESG-focused funds have consistently outperformed traditional indices over the past 12 months." },
];
