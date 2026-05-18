import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_BENEFICIARIES, MONTHLY_DISTRIBUTION, calcRation } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

function ReportsPage() {
  const totalMembers = MOCK_BENEFICIARIES.reduce((s, b) => s + b.members.length, 0);
  const totalWheat = MOCK_BENEFICIARIES.reduce((s, b) => s + calcRation(b.members.length, b.category).wheatKg, 0);

  const districtData = Object.entries(
    MOCK_BENEFICIARIES.reduce<Record<string, number>>((acc, b) => { acc[b.district] = (acc[b.district] ?? 0) + b.members.length; return acc; }, {})
  ).map(([district, members]) => ({ district, members }));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">Insights across beneficiaries, supply and districts.</p>
        </div>
        <Button onClick={() => toast.success("Export ready (mock)")} className="gap-1.5"><Download className="h-4 w-4" />Export CSV</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { k: "Total Families", v: MOCK_BENEFICIARIES.length },
          { k: "Total Members", v: totalMembers },
          { k: "Wheat per month (kg)", v: totalWheat.toFixed(1) },
        ].map((s) => (
          <Card key={s.k}><CardContent className="p-5"><div className="text-xs uppercase text-muted-foreground">{s.k}</div><div className="mt-1 text-2xl font-bold">{s.v}</div></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Members per District</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="district" className="text-xs" /><YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="members" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Distribution growth</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_DISTRIBUTION}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="month" className="text-xs" /><YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="distributed" stroke="var(--primary)" fill="url(#g)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
