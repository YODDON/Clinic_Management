import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { getDefaultRouteForRole, normalizeRole } from "@/lib/rbac";
import { setSession } from "@/lib/session";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Đăng nhập | DentalPro" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const session = useSession();
  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_LOGIN_EMAIL || "");
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD || "");
  const sessionRole = normalizeRole(session?.user.role);

  useEffect(() => {
    if (session && sessionRole) {
      void navigate({ to: getDefaultRouteForRole(sessionRole) });
    }
  }, [navigate, session, sessionRole]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (payload) => {
      setSession(payload);
      toast.success("Đăng nhập thành công");
      const role = normalizeRole(payload.user.role);
      await navigate({ to: role ? getDefaultRouteForRole(role) : "/login" });
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_34%),linear-gradient(135deg,_#f4fcfc_0%,_#ecfbff_48%,_#f9fdff_100%)] px-6 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,118,110,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(45,212,191,0.18)_0%,_rgba(45,212,191,0)_70%)] blur-3xl" />

      <Card className="relative z-10 w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.32)] backdrop-blur-xl">
        <CardContent className="space-y-8 p-8 sm:p-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 text-white shadow-[0_16px_32px_-18px_rgba(13,148,136,0.85)]">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-slate-950">DentalPro</p>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">Đăng nhập</h1>
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)] transition focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white px-4 text-base shadow-[0_8px_20px_-18px_rgba(15,23,42,0.35)] transition focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-teal-600 text-base font-semibold text-white shadow-[0_18px_36px_-20px_rgba(13,148,136,0.9)] transition hover:bg-teal-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
