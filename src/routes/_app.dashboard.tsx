import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, IdCard, Wheat, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_BENEFICIARIES, MOCK_DISTRIBUTIONS, MONTHLY_DISTRIBUTION, CATEGORY_BREAKDOWN, calcRation } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

const COLORS = ["hsl(220 90% 56%)", "hsl(145 65% 45%)", "hsl(45 95% 55%)", "hsl(0 75% 55%)"];

function Dashboard() {
  const totalMembers = MOCK_BENEFICIARIES.reduce((s, b) => s + b.members.length, 0);
  const totalWheat = MOCK_BENEFICIARIES.reduce((s, b) => s + calcRation(b.members.length, b.category).wheatKg, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of beneficiaries, distribution and entitlements.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Families" value="4,002" delta="+128 this month" icon={IdCard} tone="primary" delay={0} />
        <StatCard label="Total Members" value="15,840" delta="+412 this month" icon={Users} tone="info" delay={0.05} />
        <StatCard label="Wheat / month (kg)" value={`${totalWheat.toFixed(0)}+`} delta="Stable supply" icon={Wheat} tone="warning" delay={0.1} />
        <StatCard label="Active FPS Shops" value="612" delta="98.7% uptime" icon={Activity} tone="success" delay={0.15} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Distribution Trend</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHLY_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" stroke="currentColor" className="text-xs" />
                <YAxis stroke="currentColor" className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="distributed" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pending" stroke="var(--destructive)" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {CATEGORY_BREAKDOWN.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>District-wise distribution (kg wheat)</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { d: "Pune", v: 4820 }, { d: "Mumbai", v: 6210 }, { d: "Nashik", v: 3110 },
                { d: "Nagpur", v: 2890 }, { d: "Aurangabad", v: 2540 }, { d: "Thane", v: 4015 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="d" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_DISTRIBUTIONS.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">{d.headName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{d.cardId}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={d.status === "Distributed" ? "default" : "secondary"}
                      className={d.status === "Distributed" ? "bg-success text-success-foreground" : ""}>
                      {d.status}
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-1">{d.shop} · {d.month}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
