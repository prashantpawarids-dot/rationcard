import idsidLogo from "@/assets/idsid-logo.jpeg";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <img src={idsidLogo} alt="IDSID" width={size} height={size}
        className="rounded-lg shadow-sm ring-1 ring-border" style={{ width: size, height: size, objectFit: "cover" }} />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">Smart QR Ration</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Govt. of Maharashtra</div>
      </div>
    </div>
  );
}
