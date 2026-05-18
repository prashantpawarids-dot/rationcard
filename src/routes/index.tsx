import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { login, getSession, type Role } from "@/lib/auth";
import idsidLogo from "@/assets/idsid-logo.jpeg";
import idsidQr from "@/assets/idsid-website-qr.jpeg";

export const Route = createFileRoute("/")({ component: LoginPage });

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "Admin", label: "Administrator", desc: "Full system access" },
  { value: "Distributor", label: "FPS Distributor", desc: "Verify & distribute" },
  { value: "Inspector", label: "Inspector", desc: "Audit & reports" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gov.in");
  const [password, setPassword] = useState("Admin@123");
  const [role, setRole] = useState<Role>("Admin");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (getSession()) navigate({ to: "/dashboard" }); }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const s = login(email, password, role);
      setLoading(false);
      if (s) { toast.success(`Welcome, ${s.role}`); navigate({ to: "/dashboard" }); }
      else toast.error("Invalid credentials");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-accent/30">
      {/* Left hero */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-info to-navy" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <img src={idsidLogo} alt="IDSID" className="h-12 w-12 rounded-lg ring-2 ring-white/40" />
            <div>
              <div className="text-sm uppercase tracking-widest opacity-80">Govt. of Maharashtra</div>
              <div className="font-semibold">Smart QR Ration System</div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur ring-1 ring-white/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Aadhaar-enabled • End-to-end verified
            </div>
            <h1 className="mt-4 text-4xl xl:text-5xl font-bold leading-tight max-w-lg">
              Digital ration delivery for every family.
            </h1>
            <p className="mt-4 text-white/80 max-w-md">
              Issue smart QR cards, verify beneficiaries instantly at any Fair Price Shop, and track monthly distribution — all in one secure dashboard.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {[
                { k: "4,000+", v: "Families" },
                { k: "612 FPS", v: "Shops" },
                { k: "99.4%", v: "Verified" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl bg-white/10 ring-1 ring-white/15 p-3 backdrop-blur">
                  <div className="text-lg font-bold">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-wider opacity-80">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="flex items-end justify-between text-xs opacity-80">
            <div>© {new Date().getFullYear()} IDSID Pvt Ltd — idsid.com</div>
            <img src={idsidQr} alt="QR" className="h-16 w-16 rounded-md bg-white p-1" />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-3">
            <img src={idsidLogo} alt="IDSID" className="h-10 w-10 rounded-lg" />
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Govt. of Maharashtra</div>
              <div className="font-semibold">Smart QR Ration</div>
            </div>
          </div>
          <Card className="p-6 shadow-xl border-border/60">
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground mt-1">Use your official credentials to continue.</p>
            </div>

            <div className="mb-5">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Select role</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${role === r.value ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}>
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Admin ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="pw" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-9" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                {loading ? "Authenticating…" : "Sign in securely"}
              </Button>
              <div className="rounded-lg bg-accent/50 p-3 text-[11px] text-muted-foreground">
                <div className="font-semibold text-foreground">Demo credentials</div>
                <div className="font-mono">admin@gov.in / Admin@123</div>
              </div>
            </form>
          </Card>
          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">IDSID Pvt Ltd</span> · idsid.com
          </div>
        </motion.div>
      </div>
    </div>
  );
}
