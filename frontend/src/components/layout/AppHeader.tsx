import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search } from "lucide-react";

import { useSession } from "@/hooks/use-session";
import { clearSession } from "@/lib/session";
import { initials, titleCase } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const session = useSession();
  const navigate = useNavigate();

  const logout = async () => {
    clearSession();
    await navigate({ to: "/login" });
  };

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display truncate text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground truncate text-xs">{subtitle}</p>}
      </div>
      <div className="relative hidden md:block">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Tìm kiếm nhanh..." className="bg-muted/50 h-9 w-64 pl-9" />
      </div>
      <Button variant="ghost" size="icon" aria-label="Thông báo">
        <Bell className="h-5 w-5" />
      </Button>
      {session && (
        <>
          <div className="hidden text-right md:block">
            <div className="text-sm font-medium">{session.user.name}</div>
            <div className="text-xs text-muted-foreground">{titleCase(session.user.role)}</div>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials(session.user.name)}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" aria-label="Đăng xuất" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      )}
    </header>
  );
}
