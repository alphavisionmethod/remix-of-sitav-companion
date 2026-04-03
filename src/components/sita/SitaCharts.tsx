import { SitaCard, SitaCardTitle } from "@/components/sita/SitaCard";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── Cash Flow Timeline Chart ───
const cashFlowData = [
  { day: "Mar 28", inflows: 0, outflows: 142, balance: 18212 },
  { day: "Today", inflows: 0, outflows: 0, balance: 18070 },
  { day: "Apr 1", inflows: 0, outflows: 2449, balance: 15621 },
  { day: "Apr 3", inflows: 0, outflows: 340, balance: 15281 },
  { day: "Apr 5", inflows: 3200, outflows: 189, balance: 18292 },
  { day: "Apr 7", inflows: 0, outflows: 0, balance: 18292 },
  { day: "Apr 10", inflows: 0, outflows: 420, balance: 17872 },
  { day: "Apr 12", inflows: 4200, outflows: 0, balance: 22072 },
  { day: "Apr 15", inflows: 0, outflows: 3685, balance: 18387 },
];

export const CashFlowChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Projected balance with inflows and outflows">Cash Flow Timeline</SitaCardTitle>
    <div className="mt-4 h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cashFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "balance" ? "Balance" : name === "inflows" ? "Inflows" : "Outflows"]}
          />
          <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="url(#balanceGrad)" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
          <Bar dataKey="inflows" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={12} opacity={0.7} />
          <Bar dataKey="outflows" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} barSize={12} opacity={0.7} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" />Balance</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-2" />Inflows</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-5" />Outflows</span>
    </div>
  </SitaCard>
);

// ─── Reserve Progress Chart ───
const reserveData = [
  { name: "Emergency", current: 12000, target: 15000, pct: 80 },
  { name: "Tax", current: 8400, target: 12000, pct: 70 },
  { name: "Equipment", current: 2800, target: 5000, pct: 56 },
  { name: "Vacation", current: 1600, target: 4000, pct: 40 },
  { name: "Education", current: 6200, target: 25000, pct: 25 },
];

export const ReserveProgressChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Current vs target for each reserve bucket">Reserve Progress</SitaCardTitle>
    <div className="mt-4 h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reserveData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "current" ? "Current" : "Target"]}
          />
          <Bar dataKey="target" fill="hsl(var(--muted))" radius={[0, 6, 6, 0]} barSize={18} />
          <Bar dataKey="current" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </SitaCard>
);

// ─── Reserve Over Time Chart ───
const reserveTimeData = [
  { month: "Oct", emergency: 8000, tax: 4000, equipment: 1000, vacation: 400 },
  { month: "Nov", emergency: 9000, tax: 5200, equipment: 1400, vacation: 700 },
  { month: "Dec", emergency: 9500, tax: 6400, equipment: 1800, vacation: 1000 },
  { month: "Jan", emergency: 10500, tax: 7200, equipment: 2200, vacation: 1200 },
  { month: "Feb", emergency: 11500, tax: 7800, equipment: 2500, vacation: 1400 },
  { month: "Mar", emergency: 12000, tax: 8400, equipment: 2800, vacation: 1600 },
];

export const ReserveOverTimeChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="6-month growth across all reserve buckets">Reserve Growth</SitaCardTitle>
    <div className="mt-4 h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={reserveTimeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {["primary", "chart-2", "chart-3", "chart-4"].map((color, i) => (
              <linearGradient key={i} id={`reserve${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.2} />
                <stop offset="95%" stopColor={`hsl(var(--${color}))`} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
          <Area type="monotone" dataKey="emergency" stroke="hsl(var(--primary))" fill="url(#reserve0)" strokeWidth={2} />
          <Area type="monotone" dataKey="tax" stroke="hsl(var(--chart-2))" fill="url(#reserve1)" strokeWidth={2} />
          <Area type="monotone" dataKey="equipment" stroke="hsl(var(--chart-3))" fill="url(#reserve2)" strokeWidth={2} />
          <Area type="monotone" dataKey="vacation" stroke="hsl(var(--chart-4))" fill="url(#reserve3)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground flex-wrap">
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" />Emergency</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-2" />Tax</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-3" />Equipment</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-4" />Vacation</span>
    </div>
  </SitaCard>
);

// ─── Subscription Trends Chart ───
const subscriptionTrendData = [
  { month: "Oct", total: 148, waste: 12 },
  { month: "Nov", total: 155, waste: 16 },
  { month: "Dec", total: 160, waste: 20 },
  { month: "Jan", total: 170, waste: 28 },
  { month: "Feb", total: 172, waste: 32 },
  { month: "Mar", total: 180, waste: 28 },
];

export const SubscriptionTrendsChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Monthly spend with estimated waste identified">Subscription Cost Trends</SitaCardTitle>
    <div className="mt-4 h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={subscriptionTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number, name: string) => [`$${v}`, name === "total" ? "Total Spend" : "Est. Waste"]} />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={28} opacity={0.8} />
          <Bar dataKey="waste" fill="hsl(var(--chart-5))" radius={[6, 6, 0, 0]} barSize={28} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" />Total Spend</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-chart-5" />Estimated Waste</span>
    </div>
  </SitaCard>
);

// ─── Subscription Category Breakdown ───
const categoryData = [
  { name: "Communication", value: 28.49, color: "hsl(var(--primary))" },
  { name: "Design", value: 67.98, color: "hsl(var(--chart-2))" },
  { name: "Productivity", value: 10, color: "hsl(var(--chart-3))" },
  { name: "Scheduling", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Storage", value: 11.99, color: "hsl(var(--chart-5))" },
  { name: "Accounting", value: 30, color: "hsl(var(--chart-1))" },
  { name: "CRM", value: 20, color: "hsl(var(--accent))" },
];

export const SubscriptionCategoryChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Monthly spend by category">Category Breakdown</SitaCardTitle>
    <div className="mt-4 h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
            {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`$${v.toFixed(2)}/mo`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
      {categoryData.map((c, i) => (
        <span key={i} className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span>
      ))}
    </div>
  </SitaCard>
);

// ─── Revenue Pipeline Chart ───
const pipelineData = [
  { stage: "Leads", value: 42000, count: 12 },
  { stage: "Qualified", value: 28000, count: 8 },
  { stage: "Proposal", value: 18500, count: 5 },
  { stage: "Negotiation", value: 11200, count: 4 },
  { stage: "Closed Won", value: 8400, count: 3 },
];

export const RevenuePipelineChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Pipeline value by stage">Revenue Pipeline</SitaCardTitle>
    <div className="mt-4 h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pipelineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pipelineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, "Pipeline Value"]} />
          <Bar dataKey="value" fill="url(#pipelineGrad)" radius={[8, 8, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </SitaCard>
);

// ─── Revenue Over Time Chart ───
const revenueTimeData = [
  { month: "Oct", revenue: 12400, target: 15000 },
  { month: "Nov", revenue: 14800, target: 15000 },
  { month: "Dec", revenue: 11200, target: 15000 },
  { month: "Jan", revenue: 16200, target: 16000 },
  { month: "Feb", revenue: 18400, target: 16000 },
  { month: "Mar", revenue: 17600, target: 16000 },
];

export const RevenueOverTimeChart = () => (
  <SitaCard hover={false} className="p-5">
    <SitaCardTitle sub="Monthly revenue vs target">Revenue Trend</SitaCardTitle>
    <div className="mt-4 h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueTimeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`]} />
          <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 flex items-center justify-center gap-6 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" />Revenue</span>
      <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded bg-muted-foreground/40" />Target</span>
    </div>
  </SitaCard>
);
