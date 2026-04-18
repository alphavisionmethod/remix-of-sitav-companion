// SITA OS — Demo Data: Media Workspace

export interface DemoMediaItem {
  id: string;
  name: string;
  type: "image" | "screenshot" | "scan" | "photo";
  preview: string;
  size: string;
  date: string;
  tags: string[];
  linkedTo?: string;
}

export const DEMO_MEDIA: DemoMediaItem[] = [
  { id: "1", name: "Product mockup v2.png", type: "image", preview: "from-violet-500/30 to-pink-500/30", size: "2.4 MB", date: new Date(Date.now() - 3600000).toISOString(), tags: ["product", "design"] },
  { id: "2", name: "Receipt-grocery-Mar.jpg", type: "scan", preview: "from-amber-500/30 to-orange-500/30", size: "1.1 MB", date: new Date(Date.now() - 86400000).toISOString(), tags: ["receipt", "household"], linkedTo: "Finance" },
  { id: "3", name: "Screenshot 2024-03-15.png", type: "screenshot", preview: "from-blue-500/30 to-cyan-500/30", size: "890 KB", date: new Date(Date.now() - 172800000).toISOString(), tags: ["bug", "admin"] },
  { id: "4", name: "Office renovation plan.jpg", type: "photo", preview: "from-emerald-500/30 to-teal-500/30", size: "3.2 MB", date: new Date(Date.now() - 259200000).toISOString(), tags: ["office", "project"], linkedTo: "Household" },
  { id: "5", name: "Client presentation deck.png", type: "screenshot", preview: "from-primary/30 to-blue-500/30", size: "1.5 MB", date: new Date(Date.now() - 345600000).toISOString(), tags: ["client", "business"], linkedTo: "CRM" },
  { id: "6", name: "Team photo Q1.jpg", type: "photo", preview: "from-rose-500/30 to-pink-500/30", size: "4.1 MB", date: new Date(Date.now() - 432000000).toISOString(), tags: ["team"] },
];
