import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RationCardPreview } from "@/components/shared/RationCardPreview";
import { MOCK_BENEFICIARIES } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/cards/$id")({ component: CardPreviewPage });

function CardPreviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const b = MOCK_BENEFICIARIES.find((x) => x.id === id) ?? MOCK_BENEFICIARIES[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/cards" })} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={() => window.print()} className="gap-1.5"><Printer className="h-4 w-4" />Print Card</Button>
      </div>
      <RationCardPreview b={b} />
    </div>
  );
}
