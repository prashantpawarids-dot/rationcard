import { QRCodeSVG } from "qrcode.react";
import type { Beneficiary } from "@/lib/mock-data";
import { calcRation } from "@/lib/mock-data";
import idsidLogo from "@/assets/idsid-logo.jpeg";

export function RationCardPreview({ b }: { b: Beneficiary }) {
  const ration = calcRation(b.members.length, b.category);
  const qrPayload = JSON.stringify({ cardId: b.cardId, aadhaar: b.aadhaar, name: b.headName, members: b.members.length, category: b.category });

  return (
    <div className="print-area mx-auto w-full max-w-[720px] rounded-2xl overflow-hidden ring-1 ring-border shadow-xl bg-white text-zinc-900">
      {/* Header band - saffron / white / green */}
      <div className="flex">
        <div className="h-2 flex-1 bg-saffron" />
        <div className="h-2 flex-1 bg-white" />
        <div className="h-2 flex-1 bg-india-green" />
      </div>
      <div className="px-6 py-4 flex items-center gap-4 border-b">
        <img src={idsidLogo} alt="" className="h-12 w-12 rounded-md ring-1 ring-zinc-200" />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Government of Maharashtra</div>
          <div className="text-lg font-bold leading-tight">Smart QR Ration Card</div>
          <div className="text-[11px] text-zinc-500">Public Distribution System • Food, Civil Supplies & Consumer Protection</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-zinc-500">Card Category</div>
          <div className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-navy text-white text-xs font-semibold">{b.category}</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
        <div className="space-y-3">
          <Row k="Card ID" v={b.cardId} mono />
          <Row k="Head of Family" v={b.headName} />
          <Row k="CNIC / Ref" v={b.cnic} mono />
          <Row k="Aadhaar (linked)" v={b.aadhaar} mono />
          <Row k="Phone" v={b.phone} />
          <Row k="Address" v={`${b.address}, ${b.district}, Maharashtra`} />
          <Row k="Issued" v={b.createdAt} />
          <Row k="Status" v={b.status} />
        </div>

        <div className="flex flex-col items-center justify-start gap-2">
          <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
            <QRCodeSVG value={qrPayload} size={150} level="H" includeMargin />
          </div>
          <div className="text-[10px] text-zinc-500 text-center max-w-[160px]">
            Scan at FPS to verify & log distribution
          </div>
        </div>
      </div>

      {/* Family members */}
      <div className="px-6 pb-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Family Members ({b.members.length})</div>
        <div className="rounded-lg ring-1 ring-zinc-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Relation</th>
                <th className="text-left px-3 py-2">Age</th>
                <th className="text-left px-3 py-2">Aadhaar</th>
              </tr>
            </thead>
            <tbody>
              {b.members.map((m, i) => (
                <tr key={i} className="border-t border-zinc-100">
                  <td className="px-3 py-1.5 font-medium">{m.name}</td>
                  <td className="px-3 py-1.5">{m.relation}</td>
                  <td className="px-3 py-1.5">{m.age}</td>
                  <td className="px-3 py-1.5 font-mono">{m.aadhaar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ration entitlement */}
      <div className="px-6 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">Monthly Ration Entitlement</div>
        <div className="grid grid-cols-3 gap-2">
          <Entitlement k="Wheat / Rice" v={`${ration.wheatKg} kg`} />
          <Entitlement k="Sugar" v={`${ration.sugarKg} kg`} />
          <Entitlement k="Ghee / Oil" v={`${ration.gheeKg} kg`} />
        </div>
      </div>

      <div className="flex">
        <div className="h-2 flex-1 bg-india-green" />
        <div className="h-2 flex-1 bg-white" />
        <div className="h-2 flex-1 bg-saffron" />
      </div>
      <div className="px-6 py-2 text-[10px] text-zinc-500 flex items-center justify-between">
        <span>Powered by IDSID Pvt Ltd • idsid.com</span>
        <span>This card is property of Govt. of Maharashtra</span>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <div className="text-zinc-500">{k}</div>
      <div className={mono ? "font-mono font-medium" : "font-medium"}>{v}</div>
    </div>
  );
}

function Entitlement({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg ring-1 ring-zinc-200 p-3 bg-gradient-to-br from-zinc-50 to-white">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{k}</div>
      <div className="text-base font-bold">{v}</div>
    </div>
  );
}
