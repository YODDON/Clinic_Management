import { useEffect, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { authApi } from "@/lib/api";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Đăng nhập | DentalPro" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_LOGIN_EMAIL || "");
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD || "");
  const sessionRole = normalizeRole(session?.user.role);

  useEffect(() => {
    if (session && sessionRole) {
      void navigate({ to: getDefaultRouteForRole(sessionRole) as never });
    }
  }, [navigate, session, sessionRole]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (payload) => {
      setSession(payload);
      toast.success("Đăng nhập thành công");
      const role = normalizeRole(payload.user.role);
      await navigate({ to: role ? (getDefaultRouteForRole(role) as never) : "/login" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent via-background to-background p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">DentalPro</span>
        </Link>

        <Card className="shadow-[0_18px_60px_-24px_rgba(13,148,136,0.32)]">
          <CardContent className="p-7">
            <h1 className="text-2xl font-bold">Đăng nhập</h1>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
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
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
