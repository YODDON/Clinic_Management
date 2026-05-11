import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Cog,
  LayoutDashboard,
  Package,
  Receipt,
  Stethoscope,
} from "lucide-react";

import { useRoleAccess } from "@/hooks/use-role-access";
import type { AppRoutePath } from "@/lib/rbac";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: AppRoutePath;
  icon: React.ComponentType<{ className?: string }>;
};

type ScheduleSubItem = {
  key: "holidays" | "shifts" | "roster" | "booking" | "tracking" | "patients";
  title: string;
};

type SystemSubItem = {
  key: "users" | "dentists" | "services" | "pricing";
  title: string;
};

const overview: NavItem[] = [{ title: "Tổng quan", url: "/app/", icon: LayoutDashboard }];

const operations: NavItem[] = [{ title: "Hồ sơ điều trị", url: "/app/treatment-records", icon: ClipboardList }];

const clinic: NavItem[] = [
  { title: "Nha sĩ", url: "/app/dentists", icon: Stethoscope },
  { title: "Dịch vụ & Ghế nha", url: "/app/services", icon: Briefcase },
];

const finance: NavItem[] = [
  { title: "Kho vật tư", url: "/app/inventory", icon: Package },
  { title: "Hóa đơn", url: "/app/invoices", icon: Receipt },
];

const scheduleItems: ScheduleSubItem[] = [
  { key: "holidays", title: "Thiết lập ngày nghỉ" },
  { key: "shifts", title: "Thiết lập ca làm việc" },
  { key: "roster", title: "Đăng ký lịch trực bác sĩ" },
  { key: "booking", title: "Đăng ký lịch khám" },
  { key: "tracking", title: "Theo dõi lịch khám" },
  { key: "patients", title: "Quản lý bệnh nhân" },
];

const systemItems: SystemSubItem[] = [
  { key: "users", title: "Người dùng" },
  { key: "dentists", title: "Bác sĩ" },
  { key: "services", title: "Danh mục dịch vụ" },
  { key: "pricing", title: "Bảng giá" },
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

function SystemNavGroup() {
  const location = useLocation();
  const { canAccessRoute } = useRoleAccess();
  const canAccessSystem = canAccessRoute("/app/system");

  if (!canAccessSystem) {
    return null;
  }

  const pathname = location.pathname;
  const currentSearch = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const activeSection = currentSearch.get("section") || "users";
  const isSystemActive = pathname.startsWith("/app/system");

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60 text-[11px] uppercase tracking-wider">
        Hệ thống
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible defaultOpen={isSystemActive} className="group/collapsible">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={isSystemActive}
                  tooltip="Quản lý hệ thống"
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium hover:bg-sidebar-accent"
                >
                  <Cog className="h-4 w-4" />
                  <span>Quản lý hệ thống</span>
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {systemItems.map((item) => (
                    <SidebarMenuSubItem key={item.key}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isSystemActive && activeSection === item.key}
                      >
                        <Link to="/app/system" search={{ section: item.key }}>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ScheduleNavGroup() {
  const location = useLocation();
  const { canAccessRoute } = useRoleAccess();
  const canAccessSchedule = canAccessRoute("/app/schedule-management");

  if (!canAccessSchedule) {
    return null;
  }

  const pathname = location.pathname;
  const currentSearch = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const activeSection = currentSearch.get("section") || "holidays";
  const isScheduleActive = pathname.startsWith("/app/schedule-management");

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/60 text-[11px] uppercase tracking-wider">
        Vận hành
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible defaultOpen={isScheduleActive} className="group/collapsible">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={isScheduleActive}
                  tooltip="Quản lý lịch khám"
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium hover:bg-sidebar-accent"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Quản lý lịch khám</span>
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {scheduleItems.map((item) => (
                    <SidebarMenuSubItem key={item.key}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isScheduleActive && activeSection === item.key}
                      >
                        <Link to="/app/schedule-management" search={{ section: item.key }}>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {operations.map((item) => {
            const active = pathname.startsWith(item.url);

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
        <NavGroup label="Tổng quan" items={overview} />
        <SystemNavGroup />
        <ScheduleNavGroup />
        <NavGroup label="Phòng khám" items={clinic} />
        <NavGroup label="Tài chính & Kho" items={finance} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <div className="text-sidebar-foreground/50 px-2 py-1 text-[11px] group-data-[collapsible=icon]:hidden">
          v1.0 · Staff App
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
