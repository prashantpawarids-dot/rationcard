import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Users, QrCode, Truck, FileBarChart, IdCard, LogOut, Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { logout, getSession } from "@/lib/auth";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import idsidLogo from "@/assets/idsid-logo.jpeg";
import idsidQr from "@/assets/idsid-website-qr.jpeg";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { to: "/cards", label: "Ration Cards", icon: IdCard },
  { to: "/verify", label: "QR Verify", icon: QrCode },
  { to: "/distribution", label: "Distribution", icon: Truck },
  { to: "/reports", label: "Reports", icon: FileBarChart },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = getSession();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate({ to: "/" }); };

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Logo size={36} />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/40 p-3 text-center">
          <img src={idsidQr} alt="IDSID Website QR" className="mx-auto h-24 w-24 rounded-md ring-1 ring-border bg-white" />
          <div className="mt-2 text-[11px] font-medium">Scan to visit</div>
          <div className="text-[10px] text-muted-foreground">idsid.com</div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/60 p-2">
          <img src={idsidLogo} className="h-8 w-8 rounded-md" alt="IDSID" />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold">IDSID Pvt Ltd</div>
            <div className="text-muted-foreground">© {new Date().getFullYear()} All rights reserved</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-sidebar-border bg-sidebar">
        {SidebarInner}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border lg:hidden">
              {SidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-sm font-medium text-muted-foreground hidden sm:block">
            Maharashtra Smart QR Ration Card System
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
              <span className="text-xs font-semibold">{session?.name ?? "Guest"}</span>
              <span className="text-[10px] text-muted-foreground">{session?.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {(session?.name ?? "A").slice(0, 1)}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
