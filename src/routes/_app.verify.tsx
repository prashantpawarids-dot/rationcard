import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, Search, CheckCircle2, XCircle, Camera, CameraOff, Shuffle, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_BENEFICIARIES, calcRation, type Beneficiary } from "@/lib/mock-data";
import jsQR from "jsqr";

export const Route = createFileRoute("/_app/verify")({ component: VerifyPage });

// ─── Lookup helper ────────────────────────────────────────────────────────────

function lookupBeneficiary(value: string): Beneficiary | null {
  const v = value.trim().toLowerCase();
  return (
    MOCK_BENEFICIARIES.find(
      (b) =>
        b.cardId.toLowerCase() === v ||
        b.aadhaar.toLowerCase() === v ||
        b.cnic.toLowerCase() === v
    ) ?? null
  );
}

// ─── QR payload resolver ──────────────────────────────────────────────────────

function resolveQR(raw: string): Beneficiary | null {
  const trimmed = raw.trim();
  try {
    const obj = JSON.parse(trimmed) as { cardId?: string };
    if (obj?.cardId) return lookupBeneficiary(obj.cardId);
  } catch {}
  return lookupBeneficiary(trimmed);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function VerifyPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<Beneficiary | "notfound" | null>(null);
  const [distributed, setDistributed] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  // ── Camera on/off (declared first so scanFrame can reference it) ──────────

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setScanning(false);
  }, []);

  // ── jsQR frame loop ───────────────────────────────────────────────────────

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imgData.data, imgData.width, imgData.height);
    if (code?.data) {
      const found = resolveQR(code.data);
      stopCamera();
      if (found) {
        setResult(found);
        setDistributed(false);
        setQ(found.cardId);
        toast.success("QR code verified");
      } else {
        setResult("notfound");
        toast.error("Card not found in system");
      }
      return;
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // ── Start camera ──────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await new Promise<void>((res) => { video.onloadedmetadata = () => res(); });
      await video.play();
      setCameraActive(true);
      setScanning(true);
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Camera permission denied — use Simulate scan instead."
          : "Camera unavailable on this device/browser.";
      setCameraError(msg);
      toast.error(msg);
    }
  }, [scanFrame]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Manual verify ─────────────────────────────────────────────────────────

  const verify = (value?: string) => {
    const v = (value ?? q).trim();
    if (!v) return;
    const found = lookupBeneficiary(v);
    if (found) {
      setResult(found);
      setDistributed(false);
      toast.success("Card verified");
    } else {
      setResult("notfound");
      toast.error("Card not found");
    }
  };

  // ── Simulate scan ─────────────────────────────────────────────────────────

  const simulateScan = () => {
    const active = MOCK_BENEFICIARIES.filter((b) => b.status === "Active");
    const pick = active[Math.floor(Math.random() * active.length)];
    setQ(pick.cardId);
    setResult(pick);
    setDistributed(false);
    toast.success(`Simulated scan — ${pick.headName}`);
  };

  // ── Upload QR image ───────────────────────────────────────────────────────

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadQR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const imgData = canvas.getContext("2d")!.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code?.data) {
        const found = resolveQR(code.data);
        found
          ? (setResult(found), setDistributed(false), setQ(found.cardId), toast.success("QR verified from image"))
          : (setResult("notfound"), toast.error("Card not found"));
      } else {
        toast.error("No QR code detected in image");
      }
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Verification</h1>
        <p className="text-sm text-muted-foreground">
          Scan or enter Card ID / Aadhaar / CNIC to verify the beneficiary instantly.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* ── Scanner panel ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Camera viewport */}
            <div className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-border bg-muted">
              <canvas ref={canvasRef} className="hidden" />

              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                  <CameraOff className="h-14 w-14" />
                  <span className="text-xs text-center px-4">
                    {cameraError ?? "Camera inactive"}
                  </span>
                </div>
              )}

              <AnimatePresence>
                {scanning && (
                  <>
                    <motion.div
                      key="scan-line"
                      className="absolute inset-x-[8%] h-0.5 bg-primary rounded-full"
                      initial={{ top: "10%" }}
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {(["top-2 left-2 border-t-2 border-l-2",
                       "top-2 right-2 border-t-2 border-r-2",
                       "bottom-2 left-2 border-b-2 border-l-2",
                       "bottom-2 right-2 border-b-2 border-r-2"] as const).map((cls, i) => (
                      <span key={i} className={`absolute w-5 h-5 border-primary ${cls}`} />
                    ))}
                    <div className="absolute bottom-2 inset-x-0 text-center text-[10px] text-white/70">
                      Scanning…
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Camera toggle */}
            <Button
              className="w-full"
              variant={cameraActive ? "destructive" : "outline"}
              onClick={cameraActive ? stopCamera : startCamera}
            >
              <Camera className="h-4 w-4 mr-2" />
              {cameraActive ? "Stop camera" : "Start camera"}
            </Button>

            {/* Simulate scan */}
            <Button className="w-full" variant="outline" onClick={simulateScan}>
              <Shuffle className="h-4 w-4 mr-2" />
              Simulate QR scan
            </Button>

            {/* Upload QR image */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadQR}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload QR image
            </Button>

            {/* Manual entry */}
            <div className="flex gap-2">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Card ID / CNIC / Aadhaar"
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              <Button onClick={() => verify()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-lg bg-accent/40 p-3 text-[11px] text-muted-foreground">
              Try:{" "}
              {MOCK_BENEFICIARIES.map((b) => (
                <button
                  key={b.id}
                  className="font-mono text-foreground underline underline-offset-2 mr-2"
                  onClick={() => { setQ(b.cardId); verify(b.cardId); }}
                >
                  {b.cardId}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Result panel ── */}
        <div>
          <AnimatePresence mode="wait">
            {result === null && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="h-full grid place-items-center min-h-[300px] border-dashed">
                  <CardContent className="text-center text-muted-foreground text-sm">
                    Scan or enter an ID to verify.
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result === "notfound" && (
              <motion.div key="404" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-destructive/40">
                  <CardContent className="p-6 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-destructive" />
                    <div className="mt-3 font-semibold">No record found</div>
                    <div className="text-sm text-muted-foreground">
                      Please verify the input and try again.
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && result !== "notfound" && (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <BeneficiaryCard
                  beneficiary={result}
                  distributed={distributed}
                  onDistribute={() => {
                    setDistributed(true);
                    toast.success(`Ration marked distributed for ${result.headName}`);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Beneficiary result card ──────────────────────────────────────────────────

function BeneficiaryCard({
  beneficiary: b,
  distributed,
  onDistribute,
}: {
  beneficiary: Beneficiary;
  distributed: boolean;
  onDistribute: () => void;
}) {
  const ration = calcRation(b.members.length, b.category);

  return (
    <Card className="border-success/30 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-saffron via-white to-india-green" />
      <CardContent className="p-6 space-y-4">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-success/15 text-success grid place-items-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-success font-semibold">Verified</div>
            <div className="text-lg font-bold truncate">{b.headName}</div>
            <div className="font-mono text-xs text-muted-foreground">{b.cardId}</div>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <Badge className={b.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
              {b.status}
            </Badge>
            <Badge variant="outline">{b.category}</Badge>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Detail k="Aadhaar"  v={b.aadhaar} mono />
          <Detail k="Phone"    v={b.phone} />
          <Detail k="District" v={b.district} />
          <Detail k="Category" v={b.category} />
          <Detail k="Members"  v={String(b.members.length)} />
          <Detail k="Issued"   v={b.createdAt} />
        </div>

        {/* Members table */}
        <div>
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
            Family members
          </div>
          <div className="rounded-lg overflow-hidden ring-1 ring-border text-xs">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {["Name", "Relation", "Age", "Aadhaar"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.members.map((m, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-1.5 font-medium">{m.name}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{m.relation}</td>
                    <td className="px-3 py-1.5">{m.age}</td>
                    <td className="px-3 py-1.5 font-mono text-[10px]">{m.aadhaar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly entitlement */}
        <div>
          <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">
            This month's entitlement
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Mini k="Wheat"    v={`${ration.wheatKg} kg`} />
            <Mini k="Sugar"    v={`${ration.sugarKg} kg`} />
            <Mini k="Ghee/Oil" v={`${ration.gheeKg} kg`} />
          </div>
        </div>

        <Button className="w-full" disabled={distributed} onClick={onDistribute}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {distributed ? "Distributed ✓" : "Mark as distributed"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const Detail = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div>
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
    <div className={mono ? "font-mono font-medium text-sm" : "font-medium"}>{v}</div>
  </div>
);

const Mini = ({ k, v }: { k: string; v: string }) => (
  <div className="rounded-lg ring-1 ring-border p-2.5 bg-accent/30">
    <div className="text-[10px] text-muted-foreground uppercase">{k}</div>
    <div className="font-bold">{v}</div>
  </div>
);