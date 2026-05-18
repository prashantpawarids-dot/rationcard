import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Eye, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_BENEFICIARIES, calcRation, type Beneficiary, type Category } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/beneficiaries")({ component: BeneficiariesPage });

function BeneficiariesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Beneficiary[]>(MOCK_BENEFICIARIES);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => data.filter((b) => {
    const matchQ = !q || [b.headName, b.cardId, b.cnic, b.phone, b.district].some((s) => s.toLowerCase().includes(q.toLowerCase()));
    const matchC = cat === "all" || b.category === cat;
    return matchQ && matchC;
  }), [data, q, cat]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground">Registered families across Maharashtra.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" />Register Family</Button></DialogTrigger>
          <NewBeneficiaryDialog onCreate={(b) => { setData((d) => [b, ...d]); setOpen(false); toast.success("Family registered • Card & QR generated"); }} />
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, card ID, CNIC, phone…" className="pl-9" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="AAY">AAY</SelectItem>
                <SelectItem value="BPL">BPL</SelectItem>
                <SelectItem value="PHH">PHH</SelectItem>
                <SelectItem value="APL">APL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Card ID</th>
                    <th className="px-4 py-3 text-left">Head of Family</th>
                    <th className="px-4 py-3 text-left">District</th>
                    <th className="px-4 py-3 text-left">Members</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{b.cardId}</td>
                      <td className="px-4 py-3 font-medium">{b.headName}</td>
                      <td className="px-4 py-3">{b.district}</td>
                      <td className="px-4 py-3">{b.members.length}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{b.category}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge className={b.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/cards/$id", params: { id: b.id } })}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No beneficiaries match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NewBeneficiaryDialog({ onCreate }: { onCreate: (b: Beneficiary) => void }) {
  const [form, setForm] = useState({
    headName: "", cnic: "", aadhaar: "", phone: "", address: "", district: "Pune",
    category: "BPL" as Category, membersText: "",
  });

  const memberCount = Math.max(1, form.membersText.split("\n").filter((l) => l.trim()).length || 1);
  const r = calcRation(memberCount, form.category);

  const submit = () => {
    if (!form.headName || !form.cnic || !form.aadhaar) { toast.error("Please fill required fields"); return; }
    const id = String(Date.now());
    const cardId = `MH-RC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const members = form.membersText.split("\n").filter((l) => l.trim()).map((line, i) => {
      const [name, relation = "Member", age = "30"] = line.split(",").map((s) => s.trim());
      return { name, relation, age: Number(age) || 30, aadhaar: `XXXX-XXXX-${1000 + i}` };
    });
    const finalMembers = members.length ? members : [{ name: form.headName, relation: "Self", age: 35, aadhaar: form.aadhaar }];
    onCreate({
      id, cardId, headName: form.headName, cnic: form.cnic, aadhaar: form.aadhaar,
      phone: form.phone || "—", address: form.address || "—", district: form.district, category: form.category,
      status: "Active", members: finalMembers, createdAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>Register New Family</DialogTitle></DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Head of Family *"><Input value={form.headName} onChange={(e) => setForm({ ...form, headName: e.target.value })} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="CNIC / Ref *"><Input value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} /></Field>
        <Field label="Aadhaar *"><Input value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} /></Field>
        <Field label="District">
          <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad", "Thane"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{(["AAY", "BPL", "PHH", "APL"] as Category[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2"><Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
        <div className="sm:col-span-2">
          <Field label="Family Members (one per line: Name, Relation, Age)">
            <Textarea rows={4} placeholder="Ramesh Patil, Self, 42&#10;Sunita Patil, Wife, 38&#10;Aarav Patil, Son, 14" value={form.membersText}
              onChange={(e) => setForm({ ...form, membersText: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2 rounded-lg bg-accent/40 p-3 text-xs">
          <div className="font-semibold mb-1">Auto-calculated monthly ration ({memberCount} members · {form.category})</div>
          <div className="grid grid-cols-3 gap-2">
            <Stat k="Wheat" v={`${r.wheatKg} kg`} /><Stat k="Sugar" v={`${r.sugarKg} kg`} /><Stat k="Ghee" v={`${r.gheeKg} kg`} />
          </div>
        </div>
      </div>
      <DialogFooter><Button onClick={submit} className="gap-1.5"><Printer className="h-4 w-4" />Issue Card & Generate QR</Button></DialogFooter>
    </DialogContent>
  );
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>
);
const Stat = ({ k, v }: { k: string; v: string }) => (
  <div className="rounded-md bg-background p-2"><div className="text-[10px] text-muted-foreground uppercase">{k}</div><div className="font-bold">{v}</div></div>
);
