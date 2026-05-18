import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_DISTRIBUTIONS, type Distribution } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/distribution")({ component: DistributionPage });

function DistributionPage() {
  const [data, setData] = useState<Distribution[]>(MOCK_DISTRIBUTIONS);
  const [q, setQ] = useState("");
  const list = data.filter((d) => !q || d.headName.toLowerCase().includes(q.toLowerCase()) || d.cardId.toLowerCase().includes(q.toLowerCase()));

  const mark = (id: string) => {
    setData((d) => d.map((x) => x.id === id ? { ...x, status: "Distributed", date: new Date().toISOString().slice(0, 10) } : x));
    toast.success("Distribution marked");
  };

  const totals = data.reduce((acc, d) => ({
    wheat: acc.wheat + d.wheatKg, sugar: acc.sugar + d.sugarKg, ghee: acc.ghee + d.gheeKg,
    done: acc.done + (d.status === "Distributed" ? 1 : 0),
  }), { wheat: 0, sugar: 0, ghee: 0, done: 0 });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Distribution Management</h1>
        <p className="text-sm text-muted-foreground">Track and mark monthly ration distribution at Fair Price Shops.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { k: "Distributed", v: `${totals.done}/${data.length}` },
          { k: "Wheat (kg)", v: totals.wheat.toFixed(1) },
          { k: "Sugar (kg)", v: totals.sugar.toFixed(1) },
          { k: "Ghee (kg)", v: totals.ghee.toFixed(2) },
        ].map((s) => (
          <Card key={s.k}><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">{s.k}</div><div className="text-xl font-bold mt-1">{s.v}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or card ID…" />
          </div>
          <div className="mt-4 rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Card ID</th><th className="px-4 py-3 text-left">Beneficiary</th>
                    <th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Wheat</th>
                    <th className="px-4 py-3 text-left">Sugar</th><th className="px-4 py-3 text-left">Ghee</th>
                    <th className="px-4 py-3 text-left">Shop</th><th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-4 py-3 font-mono text-xs">{d.cardId}</td>
                      <td className="px-4 py-3 font-medium">{d.headName}</td>
                      <td className="px-4 py-3">{d.month}</td>
                      <td className="px-4 py-3">{d.wheatKg} kg</td>
                      <td className="px-4 py-3">{d.sugarKg} kg</td>
                      <td className="px-4 py-3">{d.gheeKg} kg</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.shop}</td>
                      <td className="px-4 py-3"><Badge className={d.status === "Distributed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{d.status}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        {d.status === "Pending"
                          ? <Button size="sm" onClick={() => mark(d.id)}><Check className="h-3.5 w-3.5 mr-1" />Mark distributed</Button>
                          : <span className="text-xs text-muted-foreground">{d.date}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
