import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  Briefcase,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Cog,
  LayoutDashboard,
  Package,
  Receipt,
  Stethoscope,
  Users,
} from "lucide-react";

import { useRoleAccess } from "@/hooks/use-role-access";
import type { AppRoutePath } from "@/lib/rbac";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: AppRoutePath;
  icon: React.ComponentType<{ className?: string }>;
};

const overview: NavItem[] = [{ title: "Tong quan", url: "/app/", icon: LayoutDashboard }];

const system: NavItem[] = [{ title: "Quan ly he thong", url: "/app/system", icon: Cog }];

const operations: NavItem[] = [
  { title: "Lich hen", url: "/app/appointments", icon: CalendarDays },
  { title: "Benh nhan", url: "/app/patients", icon: Users },
  { title: "Ho so dieu tri", url: "/app/treatment-records", icon: ClipboardList },
];

const clinic: NavItem[] = [
  { title: "Nha si", url: "/app/dentists", icon: Stethoscope },
  { title: "Ca truc", url: "/app/shifts", icon: CalendarClock },
  { title: "Dich vu & Ghe nha", url: "/app/services", icon: Briefcase },
];

const finance: NavItem[] = [
  { title: "Kho vat tu", url: "/app/inventory", icon: Package },
  { title: "Hoa don", url: "/app/invoices", icon: Receipt },
];

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { pathname } = useLocation();
  const { canAccessRoute } = useRoleAccess();
  const visibleItems = items.filter((item) => canAccessRoute(item.url));

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60 text-[11px] uppercase tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const active =
              item.url === "/app/"
                ? pathname === "/app/" || pathname === "/app"
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium hover:bg-sidebar-accent"
                >
                  <Link to={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-sidebar-border border-b">
        <Link to="/app/" className="flex items-center gap-2 px-2 py-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sidebar-foreground font-display text-base font-bold leading-tight">
              DentalPro
            </div>
            <div className="text-sidebar-foreground/60 text-[11px]">Clinic Management</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Tong quan" items={overview} />
        <NavGroup label="He thong" items={system} />
        <NavGroup label="Van hanh" items={operations} />
        <NavGroup label="Phong kham" items={clinic} />
        <NavGroup label="Tai chinh & Kho" items={finance} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <div className="text-sidebar-foreground/50 px-2 py-1 text-[11px] group-data-[collapsible=icon]:hidden">
          v1.0 · Staff App
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
