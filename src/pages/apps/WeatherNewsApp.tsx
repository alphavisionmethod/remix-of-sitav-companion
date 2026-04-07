import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Newspaper, TrendingUp, Clock, ExternalLink, Eye, MapPin, Sunrise, Sunset } from "lucide-react";
import { DemoModeBadge } from "@/components/sita/DemoModeBadge";
import { useDataMode } from "@/contexts/DataModeContext";

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const forecast = [
  { day: "Today", icon: Sun, temp: 24, high: 26, low: 18, condition: "Sunny", rain: 0 },
  { day: "Tue", icon: Cloud, temp: 22, high: 23, low: 17, condition: "Cloudy", rain: 10 },
  { day: "Wed", icon: CloudRain, temp: 19, high: 20, low: 15, condition: "Rain", rain: 70 },
  { day: "Thu", icon: CloudRain, temp: 18, high: 19, low: 14, condition: "Showers", rain: 60 },
  { day: "Fri", icon: Cloud, temp: 21, high: 22, low: 16, condition: "Partly Cloudy", rain: 20 },
  { day: "Sat", icon: Sun, temp: 25, high: 27, low: 19, condition: "Sunny", rain: 5 },
  { day: "Sun", icon: Sun, temp: 27, high: 29, low: 20, condition: "Clear", rain: 0 },
];

const newsArticles = [
  { title: "AI Agents Are Reshaping How Businesses Operate", source: "TechCrunch", time: "2h ago", category: "Technology", preview: "A new wave of autonomous AI agents is transforming enterprise workflows, from customer support to financial planning." },
  { title: "Fed Signals Rate Cut Likely in September", source: "Bloomberg", time: "4h ago", category: "Finance", preview: "Federal Reserve officials indicated that a rate reduction could come as early as September, citing cooling inflation." },
  { title: "Remote Work Productivity Study Reveals Surprising Results", source: "HBR", time: "6h ago", category: "Business", preview: "A comprehensive 3-year study of 10,000 remote workers shows nuanced productivity patterns." },
  { title: "Cybersecurity Threats Surge 300% in Q1 2026", source: "Wired", time: "8h ago", category: "Security", preview: "AI-powered attacks are growing exponentially, with phishing and deepfakes leading the charge." },
  { title: "New EU Regulations for AI Transparency Take Effect", source: "Reuters", time: "12h ago", category: "Policy", preview: "The European Union's AI Act compliance requirements begin today for high-risk systems." },
  { title: "Sustainable Investing Outperforms Traditional Portfolios", source: "FT", time: "1d ago", category: "Finance", preview: "ESG-focused funds have consistently outperformed traditional indices over the past 12 months." },
];

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-500",
  Finance: "bg-emerald-500/10 text-emerald-500",
  Business: "bg-purple-500/10 text-purple-500",
  Security: "bg-red-500/10 text-red-500",
  Policy: "bg-amber-500/10 text-amber-500",
};

export default function WeatherNewsApp() {
  const { isDemoMode } = useDataMode();
  const current = forecast[0];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
      <DemoModeBadge />
      <Tabs defaultValue="weather">
        <TabsList>
          <TabsTrigger value="weather" className="gap-1.5"><Cloud className="h-3.5 w-3.5" /> Weather</TabsTrigger>
          <TabsTrigger value="news" className="gap-1.5"><Newspaper className="h-3.5 w-3.5" /> News Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="mt-4 space-y-4">
          {/* Current Weather */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-sky-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" /> San Francisco, CA
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-foreground">{current.temp}°</span>
                    <span className="text-lg text-muted-foreground mb-1">C</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{current.condition}</p>
                  <p className="text-xs text-muted-foreground">Feels like {current.temp + 1}°</p>
                </div>
                <current.icon className="h-20 w-20 text-amber-500" strokeWidth={1} />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <Wind className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">12 km/h</p>
                  <p className="text-[10px] text-muted-foreground">Wind</p>
                </div>
                <div className="text-center">
                  <Droplets className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">45%</p>
                  <p className="text-[10px] text-muted-foreground">Humidity</p>
                </div>
                <div className="text-center">
                  <Sunrise className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">6:12</p>
                  <p className="text-[10px] text-muted-foreground">Sunrise</p>
                </div>
                <div className="text-center">
                  <Sunset className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">20:34</p>
                  <p className="text-[10px] text-muted-foreground">Sunset</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {forecast.map((day, i) => (
                  <div key={day.day} className={`flex items-center justify-between py-2 ${i < forecast.length - 1 ? "border-b border-border" : ""}`}>
                    <span className={`text-sm w-12 ${i === 0 ? "font-semibold text-foreground" : "text-foreground"}`}>{day.day}</span>
                    <day.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-1 w-16">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-muted-foreground">{day.rain}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{day.high}°</span>
                      <span className="text-muted-foreground">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="mt-4 space-y-3">
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            {newsArticles.map((article, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={categoryColors[article.category]} variant="secondary">{article.category}</Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{article.time}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{article.preview}</p>
                        <p className="text-[10px] text-muted-foreground">{article.source}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
