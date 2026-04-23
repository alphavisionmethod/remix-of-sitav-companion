import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Newspaper, TrendingUp, Clock, ExternalLink, Eye, MapPin, Sunrise, Sunset } from "lucide-react";
import { PageTruthBanner } from "@/components/sita/PageTruthBanner";
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const categoryColors: Record<string, string> = {
  Technology: "bg-blue-500/10 text-blue-500",
  Finance: "bg-emerald-500/10 text-emerald-500",
  Business: "bg-purple-500/10 text-purple-500",
  Security: "bg-red-500/10 text-red-500",
  Policy: "bg-amber-500/10 text-amber-500",
};

export default function WeatherNewsApp() {
  const current = forecast[0];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
<h1 className="sr-only">Weather &amp; News</h1>
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
                {([] as typeof forecast).map((day, i) => (
                  <div key={day.day} className={`flex items-center justify-between py-2 ${i < ([] as typeof forecast).length - 1 ? "border-b border-border" : ""}`}>
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
            {([] as typeof newsArticles).map((article, i) => (
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
