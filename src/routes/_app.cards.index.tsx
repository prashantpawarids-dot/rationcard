import { createFileRoute, Link } from "@tanstack/react-router";
import { MOCK_BENEFICIARIES } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdCard } from "lucide-react";

export const Route = createFileRoute("/_app/cards/")({ component: CardsIndex });

function CardsIndex() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ration Cards</h1>
        <p className="text-sm text-muted-foreground">All issued smart QR cards. Click a card to preview & print.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_BENEFICIARIES.map((b) => (
          <Link key={b.id} to="/cards/$id" params={{ id: b.id }}>
            <Card className="hover:shadow-md transition-shadow hover:border-primary/40 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-info text-white grid place-items-center"><IdCard className="h-5 w-5" /></div>
                  <Badge variant="outline">{b.category}</Badge>
                </div>
                <div className="mt-3 font-semibold">{b.headName}</div>
                <div className="text-xs text-muted-foreground font-mono">{b.cardId}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.members.length} members</span>
                  <span>{b.district}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
