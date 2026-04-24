import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Stethoscope } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { setSession } from "@/lib/session";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Đăng ký | DentalPro" }] }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const session = useSession();
  const sessionRole = normalizeRole(session?.user.role);
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (session && sessionRole) {
      void navigate({ to: getDefaultRouteForRole(sessionRole) as never });
    }
  }, [navigate, session, sessionRole]);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (payload) => {
      setSession(payload);
      toast.success("Đăng ký thành công");
      await navigate({ to: "/my/appointments" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    await registerMutation.mutateAsync({
      name,
      email,
      phone,
      password,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent via-background to-background p-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">DentalPro</span>
        </Link>

        <Card className="shadow-[0_18px_60px_-24px_rgba(13,148,136,0.32)]">
          <CardContent className="p-7">
            <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng ký miễn phí để đặt lịch và quản lý hồ sơ răng miệng. Sau khi đăng ký hệ thống sẽ tự tạo luôn patient profile liên kết với user customer.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input id="name" placeholder="Nguyễn Văn A" value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="ban@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" placeholder="0901234567" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Tối thiểu 8 ký tự, có chữ hoa và chữ số.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Đăng ký
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
