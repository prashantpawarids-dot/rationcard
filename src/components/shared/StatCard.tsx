import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
  delay?: number;
}

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  primary: "from-primary/15 to-primary/5 text-primary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-warning-foreground",
  info: "from-info/15 to-info/5 text-info",
};

export function StatCard({ label, value, delta, icon: Icon, tone = "primary", delay = 0 }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
              {delta && <div className="mt-1 text-xs text-success">{delta}</div>}
            </div>
            <div className={cn("h-11 w-11 rounded-xl bg-gradient-to-br grid place-items-center", toneMap[tone])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
