import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getSession()) navigate({ to: "/" });
    else setReady(true);
  }, [navigate]);
  if (!ready) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  return <AppShell><Outlet /></AppShell>;
}
