import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Search, CheckCircle2, XCircle, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_BENEFICIARIES, calcRation } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/verify")({ component: VerifyPage });

function VerifyPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<(typeof MOCK_BENEFICIARIES)[number] | null | "notfound">(null);
  const [scanning, setScanning] = useState(false);

  const verify = (value?: string) => {
    const v = (value ?? q).trim().toLowerCase();
    if (!v) return;
    const hit = MOCK_BENEFICIARIES.find((b) =>
      b.cardId.toLowerCase() === v || b.cnic.toLowerCase() === v || b.aadhaar.toLowerCase() === v
    );
    if (hit) { setResult(hit); toast.success("Card verified"); }
    else { setResult("notfound"); toast.error("Card not found"); }
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const pick = MOCK_BENEFICIARIES[Math.floor(Math.random() * MOCK_BENEFICIARIES.length)];
      setScanning(false); setQ(pick.cardId); verify(pick.cardId);
    }, 1400);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Verification</h1>
        <p className="text-sm text-muted-foreground">Scan or enter Card ID, CNIC or Aadhaar to verify the beneficiary instantly.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-4 w-4" />Scanner</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square rounded-xl bg-gradient-to-br from-muted to-accent/40 grid place-items-center overflow-hidden ring-1 ring-border">
              <AnimatePresence>
                {scanning ? (
                  <motion.div key="scan" className="absolute inset-x-6 h-0.5 bg-primary"
                    initial={{ top: "10%", opacity: 0 }} animate={{ top: ["10%", "90%", "10%"], opacity: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity }} />
                ) : null}
              </AnimatePresence>
              <Camera className="h-16 w-16 text-muted-foreground/50" />
              <div className="absolute bottom-3 text-[11px] text-muted-foreground">{scanning ? "Scanning…" : "Camera preview"}</div>
            </div>
            <Button className="w-full" variant="outline" onClick={simulateScan} disabled={scanning}>
              <Camera className="h-4 w-4 mr-2" />{scanning ? "Scanning…" : "Simulate QR scan"}
            </Button>
            <div className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Card ID / CNIC / Aadhaar" onKeyDown={(e) => e.key === "Enter" && verify()} />
              <Button onClick={() => verify()}><Search className="h-4 w-4" /></Button>
            </div>
            <div className="rounded-lg bg-accent/40 p-3 text-[11px] text-muted-foreground">
              Try: <span className="font-mono text-foreground">MH-RC-2025-000123</span>
            </div>
          </CardContent>
        </Card>

        <div>
          <AnimatePresence mode="wait">
            {result === null && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="h-full grid place-items-center min-h-[300px] border-dashed">
                  <CardContent className="text-center text-muted-foreground text-sm">Scan or enter an ID to verify.</CardContent>
                </Card>
              </motion.div>
            )}
            {result === "notfound" && (
              <motion.div key="404" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-destructive/40">
                  <CardContent className="p-6 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-destructive" />
                    <div className="mt-3 font-semibold">No record found</div>
                    <div className="text-sm text-muted-foreground">Please verify the input and try again.</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {result && result !== "notfound" && (
              <motion.div key={result.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="border-success/30 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-saffron via-white to-india-green" />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/15 text-success grid place-items-center"><CheckCircle2 className="h-5 w-5" /></div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-success font-semibold">Verified</div>
                        <div className="text-lg font-bold">{result.headName}</div>
                        <div className="font-mono text-xs text-muted-foreground">{result.cardId}</div>
                      </div>
                      <Badge className={`ml-auto ${result.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>{result.status}</Badge>
                    </div>
                    <div className="mt-5 grid sm:grid-cols-2 gap-3 text-sm">
                      <Detail k="Aadhaar" v={result.aadhaar} mono />
                      <Detail k="Phone" v={result.phone} />
                      <Detail k="District" v={result.district} />
                      <Detail k="Category" v={result.category} />
                      <Detail k="Members" v={String(result.members.length)} />
                      <Detail k="Issued" v={result.createdAt} />
                    </div>
                    {(() => {
                      const r = calcRation(result.members.length, result.category);
                      return (
                        <div className="mt-5">
                          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">This month's entitlement</div>
                          <div className="grid grid-cols-3 gap-2">
                            <Mini k="Wheat" v={`${r.wheatKg} kg`} /><Mini k="Sugar" v={`${r.sugarKg} kg`} /><Mini k="Ghee" v={`${r.gheeKg} kg`} />
                          </div>
                          <Button className="w-full mt-4" onClick={() => toast.success(`Ration marked distributed for ${result.headName}`)}>
                            Mark as Distributed
                          </Button>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const Detail = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div><div className={mono ? "font-mono font-medium" : "font-medium"}>{v}</div></div>
);
const Mini = ({ k, v }: { k: string; v: string }) => (
  <div className="rounded-lg ring-1 ring-border p-2.5 bg-accent/30"><div className="text-[10px] text-muted-foreground uppercase">{k}</div><div className="font-bold">{v}</div></div>
);
