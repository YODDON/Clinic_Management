import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { UserRole } from "@/types/api";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { useSession } from "@/hooks/use-session";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
};

export function AppShell({ title, subtitle, actions, children, allowedRoles }: AppShellProps) {
  const session = useSession();
  const navigate = useNavigate();
  const role = normalizeRole(session?.user.role);
  const isAuthorized = role ? !allowedRoles || allowedRoles.includes(role) : false;

  useEffect(() => {
    if (!session) {
      void navigate({ to: "/login" });
      return;
    }

    if (!role) {
      void navigate({ to: "/login" });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      void navigate({ to: getDefaultRouteForRole(role) });
    }
  }, [allowedRoles, navigate, role, session]);

  if (!session || !role || !isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <AppHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-4 md:p-6">
          {actions && (
            <div className="mb-5 flex flex-wrap items-center justify-end gap-2">{actions}</div>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
