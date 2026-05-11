import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CalendarPlus,
  LogOut,
  Menu,
  Receipt,
  Stethoscope,
  User as UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { initials } from "@/lib/format";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { clearSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const items = [
  { to: "/my/appointments", label: "Lịch hẹn của tôi", icon: Calendar },
  { to: "/my/appointments/new", label: "Đặt lịch mới", icon: CalendarPlus },
  { to: "/my/invoices", label: "Hóa đơn của tôi", icon: Receipt },
  { to: "/my/profile", label: "Hồ sơ cá nhân", icon: UserIcon },
];

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const session = useSession();
  const navigate = useNavigate();

  const logout = async () => {
    clearSession();
    await navigate({ to: "/" });
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Stethoscope className="h-5 w-5" />
        </div>
        <p className="text-base font-bold">DentalPro</p>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.to === "/my/appointments"
              ? pathname === "/my/appointments"
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-md bg-sidebar-accent/50 p-2.5">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {initials(session?.user.name || "CU")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{session?.user.name}</p>
            <p className="truncate text-[11px] opacity-70">{session?.user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => void logout()}
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </Button>
      </div>
    </div>
  );
}

type CustomerShellProps = {
  pathname: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function CustomerShell({ pathname, title, actions, children }: CustomerShellProps) {
  const session = useSession();
  const navigate = useNavigate();
  const role = normalizeRole(session?.user.role);

  useEffect(() => {
    if (!session) {
      void navigate({ to: "/login" });
      return;
    }

    if (!role) {
      void navigate({ to: "/login" });
      return;
    }

    if (role !== "customer") {
      void navigate({ to: getDefaultRouteForRole(role) as never });
    }
  }, [navigate, role, session]);

  if (!session || role !== "customer") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64">
          <SidebarContent pathname={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          </div>
          {actions}
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
