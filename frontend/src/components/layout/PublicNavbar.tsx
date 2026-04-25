import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, LogOut, Menu, Stethoscope, User as UserIcon, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { initials } from "@/lib/format";
import { getBookingRouteForRole, getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { clearSession } from "@/lib/session";

const navItems = [
  { href: "#hero", label: "Trang chủ" },
  { href: "#services", label: "Dịch vụ" },
  { href: "#dentists", label: "Đội ngũ" },
  { href: "#contact", label: "Liên hệ" },
];

export function PublicNavbar() {
  const session = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = normalizeRole(session?.user.role);
  const bookingHref = role ? getBookingRouteForRole(role) : "/register";

  const logout = async () => {
    clearSession();
    await navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold">DentalPro</p>
            <p className="text-[10px] text-muted-foreground">Phòng khám nha khoa</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="default"
            className="shadow-[0_14px_40px_-18px_rgba(13,148,136,0.45)]"
            onClick={() => void navigate({ to: bookingHref as never })}
          >
            <Calendar className="h-4 w-4" />
            Đặt lịch ngay
          </Button>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {initials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold">{session.user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{session.user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "customer" && (
                  <>
                    <DropdownMenuItem onClick={() => void navigate({ to: "/my/appointments" })}>
                      <Calendar className="h-4 w-4" /> Lịch hẹn của tôi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void navigate({ to: "/my/profile" })}>
                      <User as={UserIcon} />
                      Hồ sơ cá nhân
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {role && role !== "customer" && (
                  <>
                    <DropdownMenuItem onClick={() => void navigate({ to: getDefaultRouteForRole(role) as never })}>
                      <Stethoscope className="h-4 w-4" /> Vào dashboard nội bộ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => void navigate({ to: "/login" })}>
                Đăng nhập
              </Button>
              <Button variant="outline" onClick={() => void navigate({ to: "/register" })}>
                Đăng ký
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className={open ? "border-t border-border bg-background md:hidden" : "hidden"}>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              {item.label}
            </a>
          ))}
          <Button className="mt-2" onClick={() => void navigate({ to: bookingHref as never })}>
            <Calendar className="h-4 w-4" /> Đặt lịch ngay
          </Button>
          {!session && (
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => void navigate({ to: "/login" })}>
                Đăng nhập
              </Button>
              <Button variant="outline" onClick={() => void navigate({ to: "/register" })}>
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function User({ as: Icon }: { as: typeof UserIcon }) {
  return <Icon className="h-4 w-4" />;
}
